import React, { useState, useEffect } from 'react';
import { 
  Menu, Settings, Sparkles, Youtube, Wand2, Link, FileType, 
  Loader2, RotateCw, BrainCircuit, Layout, LayoutDashboard,
  CheckSquare, ListChecks, User, ToggleLeft, ToggleRight, Key, Save, ShieldCheck,
  FileText, Hash, Video, Music, Shield, StopCircle, History, Timer // [إضافة] تم استيراد Timer
} from 'lucide-react';
import { 
  ContentInputs, ContentOutputs, ContentSession, AppSettings
} from './types';
import * as options from './data/contentOptions';
import { generateFullContent, generateMagicTitle, detectBestProfile, detectLanguage, updateServiceSettings, stopAllOperations, resetStopFlag } from './services/geminiService';
import ContentResults from './components/ContentResults';
import HistorySidebar from './components/HistorySidebar';
import SettingsModal from './components/SettingsModal';
import VisualScripting from './components/VisualScripting';

const DEFAULT_SETTINGS: AppSettings = {
  apiKeys: [],
  currentKeyIndex: 0,
  activePoolIndex: 0, 
  defaultTextModel: 'gemini-3-flash-preview',
  defaultImageModel: 'gemini-2.5-flash-image',
  customModels: [
    'gemini-3-flash-preview',
    'gemini-2.5-flash',
    'gemini-flash-latest',
    'gemini-robotics-er-1.5-preview',
    'models/gemini-flash-lite-latest',
    'gemini-2.5-flash-lite-preview-09-2025',
    'gemini-2.0-flash-lite-preview-02-05'
  ],
  magicTitleLanguage: 'Arabic',
  modelMapping: {
    heavyTasks: [
      'gemini-3-flash-preview',
      'gemini-2.5-pro',
      'gemini-2.5-flash',
      'gemini-robotics-er-1.5-preview',
      'gemini-flash-latest',
      'gemini-2.5-flash-lite-preview-09-2025',
      'gemini-2.0-flash-lite-preview-02-05'      
    ],
    lightTasks: [
      'models/gemini-flash-lite-latest', 
      'gemini-robotics-er-1.5-preview',      
      'gemini-2.5-flash-lite-preview-09-2025',
      'gemini-2.0-flash-lite-preview-02-05',
      'gemini-2.5-flash',
      'gemini-3-flash-preview'
    ]
  }
};

const LANGUAGES_MAP: Record<string, string> = {
  'Arabic': 'العربية',
  'English': 'English',
  'German': 'Deutsch',
  'French': 'Français',
  'Italian': 'Italiano'
};

const LANGUAGES = ['العربية', 'English', 'Deutsch', 'Français', 'Italiano'];

const DEFAULT_INPUTS: ContentInputs = {
  inputType: 'topic',
  inputValue: '',
  persona: options.personas[0],
  tone: options.tones[0],
  style: options.styles[0],
  format: options.formats[0],
  audience: options.audiences[0],
  cta: options.ctas[0],
  wordCount: 2000,
  language: 'العربية',
  includeMainScript: true,
  includeMetadata: true,
  includeShortsScript: true,
  includeShortsMetadata: true,
  includeTiktokDesc: true
};

function App() {
  const [activeTab, setActiveTab] = useState<'factory' | 'visual'>('factory');
  const [inputs, setInputs] = useState<ContentInputs>(DEFAULT_INPUTS);
  const [outputs, setOutputs] = useState<ContentOutputs | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingState, setLoadingState] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // [إضافة] حالة التايمر
  const [timer, setTimer] = useState(0);

  // Settings & Keys State
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [apiKeysInput, setApiKeysInput] = useState(''); 
  const [storedKeysCount, setStoredKeysCount] = useState(0); 

  const [history, setHistory] = useState<ContentSession[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [magicLoading, setMagicLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [scriptToTransfer, setScriptToTransfer] = useState<string>('');
  const [autoStartVisual, setAutoStartVisual] = useState(false);

  // [إضافة] دالة تنسيق الوقت
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // [إضافة] UseEffect للتحكم في عداد الوقت
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else if (!isLoading && timer !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    const savedSettings = localStorage.getItem('scf_settings_v4');
    if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          const merged = { ...DEFAULT_SETTINGS, ...parsed };
          setSettings(merged);
          setStoredKeysCount(merged.apiKeys.length); 
          updateServiceSettings(merged);
        } catch (e) {
          console.error("Error parsing settings:", e);
        }
    } else {
        updateServiceSettings(DEFAULT_SETTINGS);
    }

    const savedHistory = localStorage.getItem('scf_history_v1');
    if (savedHistory) {
        try {
            setHistory(JSON.parse(savedHistory));
        } catch (e) { console.error("Error history", e); }
    }
  }, []);

  const handleSaveKeys = () => {
    setSaveStatus('saving');
    const keys = apiKeysInput.split(/[,\n]/).map(k => k.trim()).filter(k => k.length > 0);
    
    const newSettings = { ...settings, apiKeys: keys, activePoolIndex: 0, currentKeyIndex: 0 };
    
    setSettings(newSettings);
    setStoredKeysCount(keys.length);
    setApiKeysInput(""); 
    updateServiceSettings(newSettings);
    
    localStorage.setItem('scf_settings_v4', JSON.stringify(newSettings));
    
    setTimeout(() => {
      setSaveStatus('saved');
      setErrorMsg(null);
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    setStoredKeysCount(newSettings.apiKeys.length);
    updateServiceSettings(newSettings);
    localStorage.setItem('scf_settings_v4', JSON.stringify(newSettings));
  };

  const handleStopAll = () => {
      stopAllOperations();
      setIsLoading(false);
      setLoadingState('تم الإيقاف يدويًا 🛑');
      setErrorMsg("تم إيقاف العمليات بواسطة المستخدم.");
  };

  const handleGenerate = async () => {
    if (!inputs.inputValue.trim()) {
        setErrorMsg("يرجى إدخال فكرة أو موضوع أولاً");
        return;
    }
    if (storedKeysCount === 0 && !process.env.API_KEY) {
        setErrorMsg("يرجى إضافة مفاتيح API أولاً في الخزنة");
        return;
    }
    
    setErrorMsg(null);
    setIsLoading(true);
    setTimer(0); // [إضافة] تصفير التايمر عند بدء عملية جديدة
    setOutputs(null);
    resetStopFlag(); 
    
    try {
      setLoadingState('جاري اكتشاف لغة العنوان...');
      const detectedRawLang = await detectLanguage(inputs.inputValue);
      const matchedLang = LANGUAGES_MAP[detectedRawLang] || 'العربية';
      
      setLoadingState(`اكتشاف النيتش (اللغة: ${matchedLang})...`);
      const profileId = await detectBestProfile(inputs.inputValue);
      const matchedProfile = options.smartProfiles.find(p => p.id === profileId);
      
      let generationInputs = { 
        ...inputs, 
        language: matchedLang
      };

      if (matchedProfile) {
         generationInputs = { ...generationInputs, ...matchedProfile.settings };
         setInputs(generationInputs);
      }

      setLoadingState('جاري التوليد (The Creator & Marketer)...');
      const result = await generateFullContent(generationInputs);
      
      setOutputs(result);
      
      const newSession: ContentSession = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        title: result.metaTitle || generationInputs.inputValue,
        inputs: { ...generationInputs },
        outputs: result
      };
      
      const updatedHistory = [newSession, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('scf_history_v1', JSON.stringify(updatedHistory));

      if (isAutoMode && result.mainScript) {
          setScriptToTransfer(result.mainScript);
          setAutoStartVisual(true);
          setActiveTab('visual');
      }
    } catch (err: any) {
      if (err.message === "Stopped") {
          setErrorMsg("تم إيقاف العملية.");
      } else {
          setErrorMsg(err.message || "فشل التوليد. يرجى التحقق من المفاتيح أو المحاولة لاحقاً.");
      }
    } finally {
      setIsLoading(false);
      setLoadingState('');
    }
  };

  const handleMagicTitle = async () => {
    setMagicLoading(true);
    try {
        const title = await generateMagicTitle(inputs.inputValue, settings.magicTitleLanguage || 'Arabic');
        setInputs(prev => ({ ...prev, inputValue: title }));
    } catch (e) { console.error(e); } finally { setMagicLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-100 font-sans flex flex-col">
      <header className="sticky top-0 z-30 bg-dark/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-purple-600 p-2 rounded-lg shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              مصنع المحتوى الذكي v4
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            
            {/* [إضافة] عرض التايمر يظهر إذا كان هناك تحميل أو وقت مسجل */}
            {(isLoading || timer > 0) && (
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-mono font-bold text-sm border transition ${isLoading ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
                    <Timer className={`w-4 h-4 ${isLoading ? 'animate-pulse' : ''}`} />
                    <span>{formatTime(timer)}</span>
                </div>
            )}

            {/* زر إيقاف الطوارئ */}
            {isLoading && (
                 <button onClick={handleStopAll} className="bg-red-500/20 hover:bg-red-500/40 text-red-200 border border-red-500/50 px-4 py-1.5 rounded-full flex items-center gap-2 animate-pulse font-bold transition shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                     <StopCircle className="w-5 h-5" /> إيقاف الطوارئ
                 </button>
            )}

            <nav className="hidden md:flex items-center gap-1 bg-gray-800/50 p-1 rounded-xl border border-gray-700">
                <button onClick={() => setActiveTab('factory')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'factory' ? 'bg-primary text-white' : 'text-gray-400'}`}>
                    <LayoutDashboard className="w-4 h-4" /> مصنع النصوص
                </button>
                <button onClick={() => setActiveTab('visual')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'visual' ? 'bg-primary text-white' : 'text-gray-400'}`}>
                    <Layout className="w-4 h-4" /> السيناريو المرئي
                </button>
            </nav>

            <button onClick={() => setIsAutoMode(!isAutoMode)} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition ${isAutoMode ? 'bg-secondary/10 border-secondary text-secondary' : 'bg-gray-800 border-gray-700 text-gray-400'}`}>
              {isAutoMode ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
              <span className="text-[10px] font-bold hidden sm:inline">وضع الأتمتة</span>
            </button>
            <button onClick={() => setIsSettingsOpen(true)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition">
              <Settings className="w-6 h-6" />
            </button>
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition">
              <History className="w-6 h-6" />
            </button>
            <button className="md:hidden p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 pb-20">
        {/* مصنع النصوص */}
        <div style={{ display: activeTab === 'factory' ? 'block' : 'none' }}>
            {errorMsg && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-200 rounded-xl flex items-center gap-3 animate-pulse">
                    <span className="text-xl">⚠️</span> {errorMsg}
                </div>
            )}

            {!outputs ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-card p-5 rounded-2xl border border-indigo-500/30 shadow-lg group">
                        <button onClick={handleGenerate} disabled={isLoading} className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:from-indigo-500 hover:to-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg text-lg flex items-center justify-center gap-3 transition transform active:scale-[0.99] disabled:opacity-70 group-hover:shadow-primary/20">
                            {isLoading ? (
                                <><Loader2 className="w-6 h-6 animate-spin" /> {loadingState}</>
                            ) : (
                                <><BrainCircuit className="w-6 h-6" /> بدء التوليد الذكي (Auto Match)</>
                            )}
                        </button>

                        <div className="mt-6 pt-6 border-t border-gray-700/50">
                            <div className="flex items-center justify-between mb-3 text-gray-400">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                                    <ShieldCheck className="w-4 h-4 text-primary" /> خزنة المفاتيح الآمنة
                                </div>
                                {storedKeysCount > 0 && (
                                    <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                                        <Shield className="w-3 h-3" /> تم تأمين {storedKeysCount} مفتاح
                                    </span>
                                )}
                            </div>
                            <div className="relative">
                                <textarea 
                                    value={apiKeysInput} 
                                    onChange={(e) => setApiKeysInput(e.target.value)} 
                                    placeholder={storedKeysCount > 0 ? "✅ المفاتيح مخزنة بأمان. لتحديثها، ألصق القائمة الجديدة هنا..." : "ألصق مفاتيح API هنا (كل مفتاح في سطر)..."} 
                                    className="w-full h-20 bg-[#0a0f1d] border border-primary/30 rounded-xl p-4 text-xs font-mono outline-none focus:border-primary transition" 
                                />
                            </div>
                            <button onClick={handleSaveKeys} className="w-full mt-3 bg-gray-800/80 border border-gray-700 py-3 rounded-xl text-xs font-bold text-gray-300 hover:bg-gray-700 transition">
                              {saveStatus === 'saving' ? 'جاري التشفير والحفظ...' : saveStatus === 'saved' ? 'تم الحفظ في الخزنة!' : 'حفظ المفاتيح في الخزنة'}
                            </button>
                        </div>
                    </div>

                    <div className="bg-card p-6 rounded-2xl border border-gray-700 shadow-xl">
                        <div className="flex gap-4 mb-4 p-1 bg-gray-800 rounded-lg w-fit">
                            <button className={`px-4 py-2 rounded-md text-sm font-medium ${inputs.inputType === 'topic' ? 'bg-primary text-white' : 'text-gray-400'}`} onClick={() => setInputs({...inputs, inputType: 'topic'})}>فكرة جديدة</button>
                            <button className={`px-4 py-2 rounded-md text-sm font-medium ${inputs.inputType === 'url' ? 'bg-primary text-white' : 'text-gray-400'}`} onClick={() => setInputs({...inputs, inputType: 'url'})}>رابط مقال</button>
                        </div>
                        <div className="relative">
                            <textarea value={inputs.inputValue} onChange={(e) => setInputs({...inputs, inputValue: e.target.value})} placeholder="اكتب فكرتك هنا..." className="w-full h-32 bg-dark border border-gray-600 rounded-xl p-4 text-lg outline-none focus:border-primary transition" />
                            <button onClick={handleMagicTitle} disabled={magicLoading} className="absolute bottom-3 left-3 text-xs bg-purple-600/20 text-purple-300 px-3 py-1.5 rounded-full flex items-center gap-1">
                              {magicLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />} عنوان سحري
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-card p-5 rounded-xl border border-gray-700">
                            <h3 className="text-gray-400 font-semibold text-xs uppercase mb-3 flex items-center gap-2"><User className="w-4 h-4" /> الشخصية واللغة</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <select className="bg-dark border border-gray-600 text-xs rounded-lg p-2.5 outline-none focus:border-primary transition" value={inputs.persona} onChange={(e) => setInputs({...inputs, persona: e.target.value})}>{options.personas.map(o => <option key={o} value={o}>{o}</option>)}</select>
                                <select className="bg-dark border border-gray-600 text-xs rounded-lg p-2.5 outline-none focus:border-primary transition" value={inputs.language} onChange={(e) => setInputs({...inputs, language: e.target.value})}>
                                  {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="bg-card p-5 rounded-xl border border-gray-700">
                            <h3 className="text-gray-400 font-semibold text-xs uppercase mb-3 flex items-center gap-2"><FileType className="w-4 h-4" /> الطول والجمهور</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <input type="number" className="w-full bg-dark border border-gray-600 text-xs rounded-lg p-2.5 outline-none focus:border-primary transition" value={inputs.wordCount} onChange={(e) => setInputs({...inputs, wordCount: parseInt(e.target.value)})} />
                                <select className="bg-dark border border-gray-600 text-xs rounded-lg p-2.5 outline-none focus:border-primary transition" value={inputs.audience} onChange={(e) => setInputs({...inputs, audience: e.target.value})}>{options.audiences.map(o => <option key={o} value={o}>{o}</option>)}</select>
                            </div>
                        </div>
                    </div>

                      <div className="bg-card p-5 rounded-xl border border-gray-700">
                          <h3 className="text-gray-400 font-semibold text-xs uppercase mb-4 flex items-center gap-2">
                              <ListChecks className="w-4 h-4" /> خيارات التوليد (المخرجات)
                          </h3>
                          
                          {/* تم تعديل الشبكة لتكون 4 أعمدة للشاشات المتوسطة وما فوق لتناسب 4 أزرار بشكل أنيق */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2"> 
                              
                              {/* زر السكربت */}
                              <button 
                                  onClick={() => setInputs({...inputs, includeMainScript: !inputs.includeMainScript})} 
                                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-semibold transition-all duration-200 ${
                                      inputs.includeMainScript 
                                      ? 'bg-primary/10 border-primary text-primary shadow-sm shadow-primary/10' 
                                      : 'bg-gray-900/50 border-gray-800 text-gray-500 hover:bg-gray-800 hover:text-gray-400'
                                  }`}
                              >
                                  <FileText className="w-3.5 h-3.5" /> 
                                  <span>السكربت</span>
                              </button>

                              {/* زر الميتاداتا */}
                              <button 
                                  onClick={() => setInputs({...inputs, includeMetadata: !inputs.includeMetadata})} 
                                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-semibold transition-all duration-200 ${
                                      inputs.includeMetadata 
                                      ? 'bg-primary/10 border-primary text-primary shadow-sm shadow-primary/10' 
                                      : 'bg-gray-900/50 border-gray-800 text-gray-500 hover:bg-gray-800 hover:text-gray-400'
                                  }`}
                              >
                                  <Hash className="w-3.5 h-3.5" /> 
                                  <span>الميتاداتا</span>
                              </button>

                              {/* زر الشورتس */}
                              <button 
                                  onClick={() => setInputs({...inputs, includeShortsScript: !inputs.includeShortsScript})} 
                                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-semibold transition-all duration-200 ${
                                      inputs.includeShortsScript 
                                      ? 'bg-primary/10 border-primary text-primary shadow-sm shadow-primary/10' 
                                      : 'bg-gray-900/50 border-gray-800 text-gray-500 hover:bg-gray-800 hover:text-gray-400'
                                  }`}
                              >
                                  <Video className="w-3.5 h-3.5" /> 
                                  <span>الشورتس</span>
                              </button>

                              {/* زر تيك توك */}
                              <button 
                                  onClick={() => setInputs({...inputs, includeTiktokDesc: !inputs.includeTiktokDesc})} 
                                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-semibold transition-all duration-200 ${
                                      inputs.includeTiktokDesc 
                                      ? 'bg-primary/10 border-primary text-primary shadow-sm shadow-primary/10' 
                                      : 'bg-gray-900/50 border-gray-800 text-gray-500 hover:bg-gray-800 hover:text-gray-400'
                                  }`}
                              >
                                  <Music className="w-3.5 h-3.5" /> 
                                  <span>تيك توك</span>
                              </button>
                          </div>
                      </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-card p-5 rounded-2xl border border-gray-700 shadow-lg">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Youtube className="w-5 h-5 text-red-500" /> بروفايلات سريعة</h3>
                        <div className="space-y-3">
                            {options.smartProfiles.map(profile => (
                                <button key={profile.id} onClick={() => setInputs(prev => ({...prev, ...profile.settings}))} className="w-full bg-dark/50 hover:bg-gray-700 border border-gray-700 p-3 rounded-xl flex items-center gap-3 transition text-right group">
                                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1"><h4 className="font-semibold text-gray-200 text-sm">{profile.name}</h4></div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            ) : (
            <div className="space-y-6">
                <button onClick={() => setOutputs(null)} className="text-gray-400 hover:text-white flex items-center gap-2 mb-4 transition"><RotateCw className="w-4 h-4" /> العودة للمصنع</button>
                <ContentResults outputs={outputs} inputs={inputs} onTransferToVisual={(s) => { setScriptToTransfer(s); setActiveTab('visual'); }} />
            </div>
            )}
        </div>

        {/* السيناريو المرئي */}
        <div style={{ display: activeTab === 'visual' ? 'block' : 'none' }}>
            <VisualScripting 
                initialScript={scriptToTransfer} 
                onScriptHandled={() => { setScriptToTransfer(''); setAutoStartVisual(false); }} 
                autoStart={autoStartVisual}
                factoryOutputs={outputs}
            />
        </div>
      </main>

      <HistorySidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        sessions={history} 
        onLoadSession={(s) => {setInputs(s.inputs); setOutputs(s.outputs); setActiveTab('factory');}} 
        onClearHistory={() => {setHistory([]); localStorage.removeItem('scf_history_v1'); }} 
      />
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        initialSettings={settings} 
        onSave={handleSaveSettings} 
      />
    </div>
  );
}

export default App;
