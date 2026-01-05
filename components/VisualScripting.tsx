import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
    Split, Wand2, Download, Image as ImageIcon, 
    Settings, RefreshCw, FileText, Check, Play,
    AlignRight, Sparkles, Layout, Send, ChevronDown, ChevronRight, Loader2,
    Package, BarChart3, AlertCircle, Bell, History, Info
} from 'lucide-react';
import JSZip from 'jszip';
// --- 1. استيراد الدالة الجديدة الموحدة ---
import { processScenesUnified, suggestArtStyle, resetBlacklist } from '../services/geminiService';
import { ContentOutputs } from '../types';

interface Segment {
    id: string;
    original_text: string;
    engineered_text: string;
    visual_prompt: string;
    sfx_keyword: string;
    isProcessed: boolean;
    error: boolean;
}

interface VisualScriptingProps {
    initialScript?: string;
    onScriptHandled?: () => void;
    autoStart?: boolean;
    factoryOutputs?: ContentOutputs | null;
}

const VisualScripting: React.FC<VisualScriptingProps> = ({ initialScript, onScriptHandled, autoStart, factoryOutputs }) => {
    const [rawText, setRawText] = useState(initialScript || '');
    const [segments, setSegments] = useState<Segment[]>([]);
    const [artStyle, setArtStyle] = useState('Cinematic, Realistic, 8k, Dramatic Lighting');
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [retryTimer, setRetryTimer] = useState<number | null>(null);
    const logEndRef = useRef<HTMLDivElement>(null);

    const isAllProcessed = useMemo(() => {
        return segments.length > 0 && segments.every(s => s.isProcessed);
    }, [segments]);
    
    // --- متغير لمعرفة هل هناك مشاهد فاشلة ---
    const hasFailedSegments = useMemo(() => {
        return segments.some(s => s.error);
    }, [segments]);

    const processingPercentage = useMemo(() => {
        if (progress.total === 0) return 0;
        return Math.round((progress.current / progress.total) * 100);
    }, [progress]);

    const addLog = (msg: string) => {
        setLogs(prev => [...prev.slice(-49), `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    useEffect(() => {
        if (logEndRef.current) {
            logEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    useEffect(() => {
        if (retryTimer !== null) {
            if (retryTimer > 0) {
                const timer = setTimeout(() => setRetryTimer(retryTimer - 1), 1000);
                return () => clearTimeout(timer);
            } else {
                setRetryTimer(null);
                addLog("🔄 مؤقت التعافي انتهى. يمكنك الآن إعادة المحاولة يدوياً.");
            }
        }
    }, [retryTimer]);

    useEffect(() => {
        if (initialScript && initialScript !== rawText) {
            setRawText(initialScript);
            startUnifiedProcess(initialScript);
            if (onScriptHandled) onScriptHandled();
        }
    }, [initialScript, onScriptHandled, rawText]);

    const startUnifiedProcess = async (text: string) => {
        if (!text || !text.trim()) {
            addLog("⚠️ تم إيقاف العملية. لا يوجد سكربت للمعالجة.");
            return;
        }
        
        resetBlacklist(); // إعادة تعيين الحظر عند كل بداية جديدة
        addLog("🚀 بدء دورة الإنتاج المتكاملة (النسخة الموحدة)...");
        addLog("🎨 جاري تحليل الستايل الفني المناسب...");
        
        try {
            const style = await suggestArtStyle(text);
            setArtStyle(style);
            addLog(`✨ الستايل المختار: ${style}`);
            
            if (autoStart) {
                await autoProcess(text, style);
            }
        } catch (err: any) {
            addLog(`❌ فشل في بدء العملية: ${err.message}`);
            setIsProcessing(false);
        }
    };

    const autoProcess = async (text: string, style: string) => {
        addLog("📏 جاري تقسيم السكربت بذكاء...");
        const sentenceRegex = /(?<=[.!?؟،])\s+/;
        const sentences = text.split(sentenceRegex).filter(s => s.trim().length > 0);

        const newSegments: Segment[] = [];
        let currentChunk: string[] = [];
        
        const LONG_SENTENCE_THRESHOLD = 140; 
        const MAX_SCENE_LENGTH = 180;        
        const MAX_SENTENCES_PER_SCENE = 2;   

        const createAndPushSegment = (text: string) => {
            if (text.trim().length === 0) return;
            newSegments.push({ id: `seg_${newSegments.length + 1}`, original_text: text, engineered_text: '', visual_prompt: '', sfx_keyword: '', isProcessed: false, error: false });
        };

        sentences.forEach((sentence) => {
            const trimmedSentence = sentence.trim();
            if (trimmedSentence.length > LONG_SENTENCE_THRESHOLD) {
                if (currentChunk.length > 0) createAndPushSegment(currentChunk.join(' '));
                createAndPushSegment(trimmedSentence);
                currentChunk = [];
                return;
            }
            if (currentChunk.length >= MAX_SENTENCES_PER_SCENE || (currentChunk.length > 0 && currentChunk.join(' ').length + trimmedSentence.length > MAX_SCENE_LENGTH)) {
                createAndPushSegment(currentChunk.join(' '));
                currentChunk = [trimmedSentence];
                return;
            }
            currentChunk.push(trimmedSentence);
        });

        if (currentChunk.length > 0) createAndPushSegment(currentChunk.join(' '));

        setSegments(newSegments);
        addLog(`✅ تم إنشاء ${newSegments.length} مشهد.`);
        await processSegments(newSegments, style);
    };

    const processSegments = async (targetSegments: Segment[], style: string) => {
        setIsProcessing(true);
        addLog("🛠️ بدء معالجة المشاهد (نظام الدفعات الكبيرة الموحد)...");
        
        const updated = [...targetSegments];
        setProgress({ current: updated.filter(s => s.isProcessed).length, total: updated.length });
        
        // --- تعديل: زيادة حجم الدفعة للاستفادة من الطلب الموحد ---
        const BATCH_SIZE = 10; 

        for (let i = 0; i < updated.length; i += BATCH_SIZE) {
            const end = Math.min(i + BATCH_SIZE, updated.length);
            const batchIndices = [];
            
            for (let j = i; j < end; j++) {
                // سنعالج فقط المشاهد التي لم تتم معالجتها بعد
                if (!updated[j].isProcessed) batchIndices.push(j);
            }

            if (batchIndices.length === 0) continue;

            const batchTexts = batchIndices.map(idx => updated[idx].original_text);

            try {
                addLog(`📦 معالجة دفعة موحدة من ${i + 1} إلى ${end} (تشكيل + صور)...`);
                
                // --- استخدام الدالة الموحدة الجديدة ---
                const batchResults = await processScenesUnified(batchTexts, style, (m) => addLog(m));

                batchIndices.forEach((globalIdx, localIdx) => {
                    // استخراج النتيجة أو وضع قيمة افتراضية في حالة نقص البيانات
                    const res = batchResults[localIdx] || { tashkeel: batchTexts[localIdx], visual_prompt: `${style} (Failed)`, sfx: 'silence' };
                    
                    updated[globalIdx] = { 
                        ...updated[globalIdx], 
                        engineered_text: res.tashkeel, 
                        visual_prompt: res.visual_prompt, // البرومبت يأتي جاهزاً من الدالة الموحدة
                        sfx_keyword: res.sfx, 
                        isProcessed: true, 
                        error: false 
                    };
                });
                
                setSegments([...updated]);
                setProgress(p => ({ ...p, current: updated.filter(s => s.isProcessed).length }));
            } catch (e: any) {
                if (e.message === "Stopped") {
                    addLog("🛑 تم إيقاف العملية بناءً على طلب المستخدم.");
                    setIsProcessing(false);
                    return;
                }
                
                if (e.message.includes("RATE_LIMIT") || e.message.includes("exhausted")) {
                     addLog("🚨 ضغط شديد على الشبكة! سيتم محاولة الاستئناف لاحقاً.");
                }

                addLog(`❌ خطأ في الدفعة: ${e.message}`);
                batchIndices.forEach(idx => { updated[idx].error = true; });
                setSegments([...updated]);
            }
        }
        
        setIsProcessing(false);
        if (updated.every(s => s.isProcessed)) {
            addLog("🎊 اكتملت العملية بنجاح!");
        } else {
            addLog("⚠️ انتهت المعالجة مع وجود مشاهد فاشلة. يمكنك إعادة المحاولة.");
        }
    };
    
    // --- دالة إعادة المحاولة ---
    const handleRetryFailed = async () => {
        addLog("🔄 إعادة تعيين قائمة الحظر وبدء محاولة جديدة للمشاهد الفاشلة...");
        resetBlacklist(); // الخطوة الأهم: مسح قائمة الحظر

        // سنقوم بمعالجة نفس قائمة المشاهد الحالية
        const segmentsToRetry = segments.map(s => s.error ? { ...s, error: false } : s);
        setSegments(segmentsToRetry);

        setTimeout(() => {
            processSegments(segmentsToRetry, artStyle);
        }, 100);
    };

    const handleUnifiedDownload = async () => {
        const zip = new JSZip();
        const root = zip.folder("OUTPUT");
        if (!root) return;

        const tashkeelFolder = root.folder("Pro Out tashkeel");
        tashkeelFolder?.file("audio_script.json", JSON.stringify(segments.map((s, i) => ({ file_name: `sentence_${i + 1}.txt`, original_text: s.original_text, engineered_text: s.engineered_text, sfx: [{ keyword: s.sfx_keyword, timing: "start" }] })), null, 2));

        const promptsRoot = root.folder("Pro Output Prompts");
        const nestedP = promptsRoot?.folder("Pro Output Prompts");
        const nestedT = promptsRoot?.folder("Pro Output Text To Prompts");
        segments.forEach((s, i) => {
            nestedT?.file(`sentence_${i+1}.txt`, s.original_text);
            nestedP?.file(`prompt_${i+1}.txt`, s.visual_prompt);
        });

        if (factoryOutputs) {
            const textOutput = root.folder("Pro Output Text");
            textOutput?.file("cleaned_text.txt", factoryOutputs.mainScript);
            textOutput?.file("seo_keywords.txt", factoryOutputs.metaKeywords.join(', '));
            textOutput?.file("video_title.txt", factoryOutputs.metaTitle);
            textOutput?.file("video_description.txt", factoryOutputs.metaDescription);
            textOutput?.file("Tiktok_description.txt", factoryOutputs.tiktokDescription);

            const shortFolder = textOutput?.folder("Short_1");
            shortFolder?.file("short_script.txt", factoryOutputs.shortsScript);
            shortFolder?.file("short_title.txt", factoryOutputs.shortsTitle);
            shortFolder?.file("short_description.txt", factoryOutputs.shortsDescription);
            shortFolder?.file("short_keywords.txt", factoryOutputs.shortsKeywords.join(', '));
        }

        const content = await zip.generateAsync({ type: "blob" });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(content);
        a.download = `OUTPUT.zip`;
        a.click();
    };

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] overflow-hidden border border-gray-800 rounded-2xl bg-dark shadow-2xl relative">
            {retryTimer !== null && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in">
                    <div className="bg-red-500/10 border border-red-500/50 p-8 rounded-3xl text-center max-w-sm">
                        <Loader2 className="w-16 h-16 text-red-500 animate-spin mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-white mb-2">حد الطلبات ممتلئ!</h2>
                        <p className="text-gray-400 mb-6">سنعيد المحاولة تلقائياً خلال:</p>
                        <div className="text-6xl font-black text-red-500 mb-4">{retryTimer}s</div>
                        <p className="text-xs text-red-400/60 uppercase tracking-widest">Auto Recovery Mode Active</p>
                    </div>
                </div>
            )}

            <div className="bg-gray-900 border-b border-gray-800 p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/20 p-2 rounded-lg"><Layout className="w-5 h-5 text-primary" /></div>
                    <div>
                        <h2 className="text-lg font-bold">السيناريو المرئي والتشكيل الذكي</h2>
                        <div className="flex items-center gap-2">
                           <div className="w-32 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                               <div className="h-full bg-primary transition-all duration-500" style={{ width: `${processingPercentage}%` }} />
                           </div>
                           <span className="text-[10px] text-gray-500 font-bold">{processingPercentage}% مكتمل</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    {/* إضافة زر إعادة المحاولة بشكل شرطي */}
                    {hasFailedSegments && !isProcessing && (
                         <button 
                           onClick={handleRetryFailed} 
                           className="px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition shadow-lg bg-orange-600 hover:bg-orange-700 text-white"
                         >
                             <RefreshCw className="w-4 h-4" /> إعادة محاولة المشاهد الفاشلة
                         </button>
                    )}
                    <button 
                      onClick={handleUnifiedDownload} 
                      disabled={!isAllProcessed || isProcessing} 
                      className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition shadow-lg ${isAllProcessed ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                    >
                        <Package className="w-4 h-4" /> تحميل حزمة الإنتاج
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                <aside className="w-80 border-l border-gray-800 flex flex-col bg-card/20 backdrop-blur-md">
                    <div className="p-4 bg-black/40 border-b border-gray-800 flex flex-col h-48">
                        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase mb-2">
                            <Bell className="w-3 h-3" /> سجل المحرك الذكي
                        </div>
                        <div className="flex-1 overflow-y-auto text-[10px] font-mono space-y-1 custom-scrollbar scroll-smooth">
                            {logs.map((log, i) => (<div key={i} className="text-gray-400 border-r-2 border-primary/20 pr-2">{log}</div>))}
                            <div ref={logEndRef} />
                        </div>
                    </div>

                    <div className="p-4 border-b border-gray-800 space-y-4">
                        <textarea value={rawText} onChange={(e) => setRawText(e.target.value)} className="w-full h-24 p-3 bg-dark text-xs border border-gray-700 rounded-lg outline-none" placeholder="الصق السكربت هنا..." />
                        <button onClick={() => startUnifiedProcess(rawText)} disabled={isProcessing} className="w-full bg-primary/20 hover:bg-primary/30 border border-primary/40 py-2 rounded-lg text-xs font-bold transition flex justify-center items-center gap-2">
                            {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />} تشغيل المحرك الكامل
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2">
                        {segments.map((s, idx) => (
                            <button key={s.id} onClick={() => setSelectedSegmentId(s.id)} className={`w-full text-right p-3 rounded-xl text-[11px] mb-1 border flex items-center gap-3 transition ${selectedSegmentId === s.id ? 'bg-primary/10 border-primary text-white' : 'border-transparent text-gray-400 hover:bg-gray-800'}`}>
                                {s.isProcessed ? <Check className="w-3 h-3 text-green-500" /> : s.error ? <AlertCircle className="w-3 h-3 text-red-500" /> : <div className="w-3 h-3 border border-gray-600 rounded-full" />}
                                <span className="truncate flex-1">مشهد {idx + 1}: {s.original_text}</span>
                            </button>
                        ))}
                    </div>
                </aside>

                <div className="flex-1 flex flex-col bg-dark/40 p-6 overflow-y-auto">
                    {selectedSegmentId && segments.find(s => s.id === selectedSegmentId) ? (
                        <div className="max-w-4xl mx-auto w-full space-y-6 animate-fade-in-up">
                            <div className="bg-card p-5 rounded-2xl border border-gray-800 shadow-xl">
                                <h3 className="font-bold text-sm mb-3 text-primary flex items-center gap-2"><AlignRight className="w-4 h-4" /> النص المُشكل</h3>
                                <textarea value={segments.find(s => s.id === selectedSegmentId)?.engineered_text} onChange={(e) => setSegments(prev => prev.map(seg => seg.id === selectedSegmentId ? {...seg, engineered_text: e.target.value} : seg))} className="w-full h-32 p-4 bg-dark border border-gray-700 rounded-xl outline-none text-lg leading-relaxed resize-none font-sans" dir="rtl" />
                            </div>
                            <div className="bg-card p-5 rounded-2xl border border-gray-800 shadow-xl">
                                <h3 className="font-bold text-sm mb-3 text-secondary flex items-center gap-2"><Sparkles className="w-4 h-4" /> برومبت المشهد</h3>
                                <textarea value={segments.find(s => s.id === selectedSegmentId)?.visual_prompt} onChange={(e) => setSegments(prev => prev.map(seg => seg.id === selectedSegmentId ? {...seg, visual_prompt: e.target.value} : seg))} className="w-full h-32 p-4 bg-dark border border-gray-700 rounded-xl outline-none font-mono text-xs resize-none" dir="ltr" />
                            </div>
                        </div>
                    ) : (
// #========================
// [تعديل] تحديث واجهة الانتظار لتشمل حالة الاكتمال
<div className="flex flex-col items-center justify-center h-full text-center px-4">
    {isProcessing ? (
        <>
            <Loader2 className="w-12 h-12 mb-4 animate-spin text-primary" />
            <p className="font-bold text-xl text-gray-300">جاري معالجة المشاهد...</p>
            <p className="text-sm text-gray-500 mt-2">قد تستغرق هذه العملية بعض الوقت حسب عدد المشاهد.</p>
        </>
    ) : isAllProcessed ? (
        <>
            <div className="w-16 h-16 mb-4 rounded-full bg-green-500/10 flex items-center justify-center border-2 border-green-500/20">
                <Check className="w-10 h-10 text-green-400" />
            </div>
            <p className="font-bold text-2xl text-green-400">اكتملت المهمة بنجاح!</p>
            <p className="text-sm text-gray-400 mt-2">جميع المشاهد جاهزة. يمكنك الآن تحميل الحزمة.</p>
        </>
    ) : (
        <>
            <BarChart3 className="w-16 h-16 mb-4 text-gray-600" />
            <p className="font-bold text-xl text-gray-500">بانتظار بدء المحرك</p>
            <p className="text-sm text-gray-600 mt-2">ألصق السكربت في الشريط الجانبي واضغط على "تشغيل المحرك الكامل".</p>
        </>
    )}
</div>
// #========================
                    )}
                </div>
            </div>
        </div>
    );
};

export default VisualScripting;
