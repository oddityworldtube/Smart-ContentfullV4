import { GoogleGenAI } from "@google/genai";
import { AppSettings, ContentInputs, ContentOutputs } from "../types";
import { DEFAULT_PROMPTS } from '../data/defaultPrompts';
import { smartProfiles } from '../data/contentOptions';

let currentSettings: AppSettings | null = null;
let stopRequested = false; // متغير للتحكم في إيقاف الطوارئ

const POOL_SIZE = 10; // حجم حزمة المفاتيح

// --- إدارة الإعدادات والإيقاف ---

export const updateServiceSettings = (settings: AppSettings) => {
  currentSettings = settings;
};

export const stopAllOperations = () => {
  stopRequested = true;
  console.log("🛑 [System] Emergency stop requested by user.");
};

export const resetStopFlag = () => {
  stopRequested = false;
};

// #========================
// [إضافة] دالة تنظيف وتحليل JSON الآمنة لمعالجة أخطاء الردود
const cleanAndParseJSON = (text: string, defaultValue: any = {}) => {
  try {
    if (!text) return defaultValue;

    // 1. إزالة علامات الماركداون الشائعة التي يضيفها النموذج
    let clean = text.replace(/```json/g, '').replace(/```/g, '').trim();

    // 2. محاولة استخلاص كتلة JSON فقط من النص، وتجاهل أي مقدمات أو خواتم
    const firstOpen = clean.search(/[\{\[]/); // البحث عن أول قوس لكائن أو مصفوفة
    const lastCloseBracket = clean.lastIndexOf(']');
    const lastCloseBrace = clean.lastIndexOf('}');
    const lastClose = Math.max(lastCloseBracket, lastCloseBrace);

    if (firstOpen !== -1 && lastClose > firstOpen) {
       clean = clean.substring(firstOpen, lastClose + 1);
    }

    // 3. محاولة التحليل النهائية
    return JSON.parse(clean);

  } catch (e) {
    console.warn("⚠️ JSON Parse Warning (Recovered): حدث خطأ أثناء تحليل رد النموذج ولكن تم التعامل معه بأمان.", e);
    console.log("Faulty Text Received:", text); // طباعة النص الخاطئ للمساعدة في تصحيح الأخطاء
    return defaultValue; // إرجاع القيمة الافتراضية لمنع انهيار التطبيق
  }
};
// #========================
// #========================
// [إضافة] دالة تصحيح ذكية لضمان تطابق النص غير العربي
const correctNonArabicTashkeel = (
  processedSegments: any[], 
  originalTexts: string[]
): any[] => {
  // تعبير نمطي بسيط للتحقق من وجود أي حرف عربي
  const arabicRegex = /[\u0600-\u06FF]/;

  // إذا لم يتطابق عدد المخرجات مع المدخلات، أعد المخرجات كما هي لتجنب الأخطاء
  if (processedSegments.length !== originalTexts.length) {
    console.warn("Mismatch between input and output length. Skipping correction.");
    return processedSegments;
  }

  return processedSegments.map((segment, index) => {
    const originalText = originalTexts[index];

    // التحقق: هل النص الأصلي لا يحتوي على حروف عربية؟
    if (originalText && !arabicRegex.test(originalText)) {
      // إذا كان الشرط صحيحاً (النص ليس عربياً)، نفرض أن النص المشكل هو نسخة طبق الأصل من النص الأصلي
      // هذا يحل المشكلة بشكل كامل ويمنع أي ترجمة أو تشكيل خاطئ
      return {
        ...segment,
        tashkeel: originalText 
      };
    }

    // إذا كان النص عربياً، أعده كما هو من النموذج (مع التشكيل)
    return segment;
  });
};
// #========================
// --- دوال مساعدة للحزم ---

const getKeysInPool = (poolIndex: number, allKeys: string[]): string[] => {
    const start = poolIndex * POOL_SIZE;
    // التأكد من عدم تجاوز حدود المصفوفة
    return allKeys.slice(start, start + POOL_SIZE);
};

// --- المحرك الذكي (Smart Execution Engine) ---

export const smartExecute = async (
  taskType: 'heavy' | 'light', 
  fn: (client: { ai: GoogleGenAI, model: string }) => Promise<any>,
  onLog?: (msg: string) => void
): Promise<any> => {
  // 1. فحص طلب الإيقاف
  if (stopRequested) throw new Error("Stopped");
  
  // 2. التحقق من المفاتيح
  if (!currentSettings || currentSettings.apiKeys.length === 0) {
     // Fallback للمفتاح في البيئة (للتطوير)
     const envKey = process.env.API_KEY || "";
     if (!envKey) throw new Error("لا توجد مفاتيح API محفوظة.");
     const model = taskType === 'heavy' ? 'gemini-1.5-pro' : 'gemini-2.0-flash';
     return await fn({ ai: new GoogleGenAI({ apiKey: envKey }), model });
  }

  const allKeys = currentSettings.apiKeys;
  const totalPools = Math.ceil(allKeys.length / POOL_SIZE);
  let currentPoolIdx = currentSettings.activePoolIndex || 0;

  // تحديد النماذج المناسبة للمهمة
  const models = taskType === 'heavy' ? currentSettings.modelMapping.heavyTasks : currentSettings.modelMapping.lightTasks;

  // 3. حلقة الحزم (Pool Loop)
  // سنحاول عبر الحزم المتاحة بدءاً من الحزمة النشطة
  for (let poolAttempt = 0; poolAttempt < totalPools; poolAttempt++) {
      
      // معادلة التدوير لضمان البدء من حيث توقفنا ثم العودة للبداية
      const actualPoolIdx = (currentPoolIdx + poolAttempt) % totalPools;
      const poolKeys = getKeysInPool(actualPoolIdx, allKeys);
      
      if (poolKeys.length === 0) continue;

      if (onLog) onLog(`🛡️ استخدام الحزمة رقم ${actualPoolIdx + 1} (تحتوي على ${poolKeys.length} مفتاح)...`);

  // 4. حلقة النماذج والمفاتيح داخل الحزمة (منطق التبديل الذكي)
      for (const model of models) {
          if (onLog) onLog(`🔄 محاولة المعالجة باستخدام الموديل: ${model}...`);
          
          for (let i = 0; i < poolKeys.length; i++) {
              if (stopRequested) throw new Error("Stopped");
              
              const key = poolKeys[i];
              try {
                  const ai = new GoogleGenAI({ apiKey: key });
                  const result = await fn({ ai, model });
                  
                  // نجاح! نحفظ مؤشر الحزمة ونرجع النتيجة
                  if (currentSettings) currentSettings.activePoolIndex = actualPoolIdx;
                  return result;

              } catch (error: any) {
                  const msg = error.message?.toLowerCase() || "";
                  
                  // الحالة الأولى: خطأ في الموديل نفسه (ضغط زائد أو غير متاح)
                  const isModelOverloaded = 
                      msg.includes("503") || 
                      msg.includes("overloaded") || 
                      msg.includes("unavailable");

                  // الحالة الثانية: خطأ في المفتاح (استنفاد الحصة/الكوتا)
                  const isRateLimit = 
                      msg.includes("429") || 
                      msg.includes("quota") || 
                      msg.includes("limit") || 
                      msg.includes("resource exhausted");

                  if (isModelOverloaded) {
                      if (onLog) onLog(`📡 الموديل ${model} يعاني من ضغط زائد (503). جاري التبديل للموديل التالي في القائمة...`);
                      break; // يخرج من حلقة المفاتيح وينتقل للموديل (Model) التالي في الحلقة الخارجية
                  }

                  if (isRateLimit) {
                      if (onLog) onLog(`⚠️ المفتاح ${i+1} في الحزمة ${actualPoolIdx+1} استنفذ حصته. تجربة المفتاح التالي...`);
                      continue; // يجرب المفتاح (Key) التالي لنفس الموديل
                  }

                  // لو الخطأ ليس ضغطاً أو كوتا (خطأ في المحتوى مثلاً)، توقف وأظهر السبب
                  throw error; 
              }
          }
          
          // إذا انتهت حلقة المفاتيح ولم ننجح (بسبب Rate Limit لكل المفاتيح لهذا الموديل)
          // الحلقة الخارجية ستنتقل تلقائياً للموديل التالي كخطة بديلة
      }

      // 5. التوقف الإجباري (Hard Pause)
      // إذا وصلنا هنا، فهذا يعني أن كل مفاتيح الحزمة الحالية فشلت مع كل النماذج!
      // لا ننتقل للحزمة التالية إلا بعد فترة تبريد لحماية الـ IP العام
      if (poolAttempt < totalPools - 1) { // لو لسه فيه حزم تانية
          if (onLog) onLog(`⏳ الحزمة ${actualPoolIdx + 1} استنفذت بالكامل! تبريد إجباري 30 ثانية...`);
          await new Promise(resolve => setTimeout(resolve, 30000)); 
      }
  }

  throw new Error("❌ فشلت جميع حزم المفاتيح في إتمام الطلب. يرجى الانتظار قليلاً والمحاولة لاحقاً.");
};

// --- دوال المساعدة ---

const getPrompt = (id: string, variables: Record<string, any>): string => {
  const tmpl = DEFAULT_PROMPTS.find(p => p.id === id);
  if (!tmpl) return "";
  let text = tmpl.template;
  for (const [key, val] of Object.entries(variables)) {
     text = text.replace(new RegExp(`{${key}}`, 'g'), String(val));
  }
  return text;
};

// --- الوظائف الرئيسية (Core Functions) ---

// 1. مصنع النصوص (Text Factory) - استراتيجية الدمج (The Creator + The Marketer)
export const generateFullContent = async (inputs: ContentInputs): Promise<ContentOutputs> => {
    resetStopFlag(); // التأكد من تصفير علم الإيقاف عند بدء عملية جديدة
    
    // المرحلة الأولى: The Creator (توليد السكربت فقط)
    const mainScript = await smartExecute('heavy', async ({ ai, model }) => {
        const prompt = getPrompt('generate_full_script', {
            title: inputs.inputValue, wordCount: inputs.wordCount, language: inputs.language,
            tone: inputs.tone, audience: inputs.audience, format: inputs.format,
            persona: inputs.persona, style: inputs.style, cta: inputs.cta
        });
        const res = await ai.models.generateContent({ model, contents: prompt });
        return res.text || "";
    });

    if (stopRequested) throw new Error("Stopped");

    // المرحلة الثانية: The Marketer (توليد كل الميتاداتا والشورتس دفعة واحدة)
    let marketingPkg: any = {};
    if (inputs.includeMetadata || inputs.includeShortsScript || inputs.includeTiktokDesc) {
        marketingPkg = await smartExecute('heavy', async ({ ai, model }) => {
             const prompt = getPrompt('generate_marketing_package', {
                 script: mainScript, language: inputs.language
             });
             const res = await ai.models.generateContent({ 
                model, contents: prompt, config: { responseMimeType: "application/json" } 
             });
             // استخدام الدالة الآمنة بدلاً من JSON.parse المباشر
             return cleanAndParseJSON(res.text || "{}", {});
        });
    }

    // تجميع النتائج
    return {
        mainScript,
        metaTitle: marketingPkg.metaTitle || inputs.inputValue,
        metaDescription: marketingPkg.metaDescription || "",
        metaKeywords: marketingPkg.metaKeywords || [],
        shortsScript: marketingPkg.shortsScript || "",
        shortsTitle: marketingPkg.shortsTitle || "",
        shortsDescription: marketingPkg.shortsDescription || "", 
        shortsKeywords: marketingPkg.shortsKeywords || [],
        tiktokDescription: marketingPkg.tiktokDescription || ""
    };
};

// 2. المصنع المرئي (Visual Factory) - استراتيجية الدمج (Unified Processing)
export const processScenesUnified = async (batchTexts: string[], style: string, onLog?: (m: string) => void): Promise<{tashkeel: string, visual_prompt: string, sfx: string}[]> => {
    return await smartExecute('light', async ({ ai, model }) => {
      const prompt = getPrompt('process_scenes_unified', { 
          segmentsJson: JSON.stringify(batchTexts),
          style 
      });
  
      const response = await ai.models.generateContent({
        model, contents: prompt, config: { responseMimeType: "application/json" }
      });
  
      // الخطوة 1: تحليل الـ JSON بشكل آمن
      const parsedResult = cleanAndParseJSON(response.text || "[]", []);

      // الخطوة 2: تطبيق دالة التصحيح لضمان سلامة البيانات
      const correctedResult = correctNonArabicTashkeel(parsedResult, batchTexts);

      // الخطوة 3: إرجاع النتيجة المصححة والموثوقة
      return correctedResult;

    }, onLog);
};
// --- الوظائف المساعدة والقديمة (للحفاظ على التوافق) ---

export const detectLanguage = async (text: string): Promise<string> => {
    return await smartExecute('light', async ({ ai, model }) => {
        const prompt = getPrompt('detect_language', { text: text.substring(0, 500) });
        const res = await ai.models.generateContent({ model, contents: prompt });
        return res.text?.trim() || "Arabic";
    });
};

export const detectBestProfile = async (topic: string): Promise<string> => {
    return await smartExecute('light', async ({ ai, model }) => {
        const profilesJson = JSON.stringify(smartProfiles.map(p => ({ id: p.id, name: p.name })));
        const prompt = getPrompt('detect_smart_profile', { topic, profilesJson });
        const res = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: "application/json" } });
        // استخدام الدالة الآمنة
        return cleanAndParseJSON(res.text || "{}", {id: "docu"}).id || "docu";
    });
};

export const generateMagicTitle = async (topic: string, language: string): Promise<string> => {
    return await smartExecute('light', async ({ ai, model }) => {
        const prompt = getPrompt('generate_titles_only', { currentTitle: topic, language });
        const res = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: "application/json" } });
        // استخدام الدالة الآمنة
        return cleanAndParseJSON(res.text || "{}", {}).titles?.[0]?.title || topic;
    });
};

export const suggestArtStyle = async (text: string): Promise<string> => {
    return await smartExecute('light', async ({ ai, model }) => {
        const prompt = getPrompt('suggest_art_style', { text: text.substring(0, 1000) });
        const res = await ai.models.generateContent({ model, contents: prompt });
        return res.text?.trim() || "Cinematic, realistic, 8k";
    });
};

// هذه الدوال تم الاحتفاظ بها للتوافق، لكن يُفضل استخدام processScenesUnified بدلاً منها
export const addTashkeel = async (text: string, onLog?: (m: string) => void): Promise<string> => {
  return await smartExecute('light', async ({ ai, model }) => {
    const prompt = getPrompt('add_tashkeel', { text });
    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text?.trim() || text;
  }, onLog);
};

export const generateBatchScenePrompts = async (batchTexts: string[], style: string, onLog?: (m: string) => void): Promise<{prompt: string, sfx: string}[]> => {
  return await smartExecute('light', async ({ ai, model }) => {
    const prompt = getPrompt('generate_batch_scene_prompts', { 
        segmentsJson: JSON.stringify(batchTexts),
        style 
    });
    const response = await ai.models.generateContent({
      model, contents: prompt, config: { responseMimeType: "application/json" }
    });
    // استخدام الدالة الآمنة
    const results = cleanAndParseJSON(response.text || "[]", []);
    return results.map((p: string) => ({ prompt: p, sfx: "cinematic_ambience" }));
  }, onLog);
};

// دالة فحص الصحة القديمة (يمكن تركها أو استخدامها كأداة مساعدة)
export const runHealthCheck = async (model: string, onProgress: (msg: string) => void): Promise<number> => {
    // تم تعطيلها مؤقتاً لأننا نستخدم استراتيجية الحزم (Pools) التي تدير الفشل تلقائياً
    // يمكن إعادة تفعيلها إذا أردنا فحص مسبق
    return 0; 
};

// دالة إعادة تعيين القائمة السوداء (لم تعد مستخدمة بنفس الطريقة ولكن نحتفظ بها)
export const resetBlacklist = () => {
    console.log("Pools reset.");
};
