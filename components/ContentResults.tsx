import React from 'react';
import { ContentOutputs, ContentInputs } from '../types';
import { Copy, Download, Video, FileText, Hash, Check, Sparkles, User, Target, Zap, Music, Layout, Bot } from 'lucide-react'; // [إضافة] تم استيراد Bot
import JSZip from 'jszip';
import { smartProfiles } from '../data/contentOptions';

interface ContentResultsProps {
  outputs: ContentOutputs;
  inputs: ContentInputs;
  onTransferToVisual?: (script: string) => void;
  usedModel?: string; // [إضافة] خاصية اختيارية لاستقبال اسم النموذج
}

const ContentResults: React.FC<ContentResultsProps> = ({ outputs, inputs, onTransferToVisual, usedModel }) => { // [إضافة] استقبال usedModel
  const [copied, setCopied] = React.useState<string | null>(null);

  const activeProfile = smartProfiles.find(p => 
      p.settings.persona === inputs.persona &&
      p.settings.tone === inputs.tone &&
      p.settings.style === inputs.style
  );

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownloadZip = async () => {
    const zip = new JSZip();
    const proFolder = zip.folder("Pro Output Text");
    if (proFolder) {
        if (inputs.includeMainScript) proFolder.file("cleaned_text.txt", outputs.mainScript);
        if (inputs.includeMetadata) {
            proFolder.file("video_title.txt", outputs.metaTitle);
            proFolder.file("video_description.txt", outputs.metaDescription);
            proFolder.file("seo_keywords.txt", outputs.metaKeywords.join(', '));
        }
        if (inputs.includeTiktokDesc) proFolder.file("Tiktok_description.txt", outputs.tiktokDescription);

        if (inputs.includeShortsScript) {
            const shortsFolder = proFolder.folder("Short_1");
            if (shortsFolder) {
                shortsFolder.file("short_script.txt", outputs.shortsScript);
                shortsFolder.file("short_title.txt", outputs.shortsTitle);
                shortsFolder.file("short_description.txt", outputs.shortsDescription);
                shortsFolder.file("short_keywords.txt", outputs.shortsKeywords.join(', '));
            }
        }
    }
    const content = await zip.generateAsync({ type: "blob" });
    const url = window.URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Pro Output Package.zip`;
    a.click();
  };

  const SectionCard = ({ title, icon: Icon, children, id, textToCopy }: any) => (
    <div className="bg-card border border-gray-700 rounded-xl overflow-hidden mb-6 shadow-lg">
      <div className="bg-gray-800/80 p-3 flex justify-between items-center border-b border-gray-700">
        <h3 className="font-bold text-gray-200 flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary" /> {title}
        </h3>
        {textToCopy && (
          <button 
            onClick={() => handleCopy(textToCopy, id)}
            className="text-gray-400 hover:text-white p-1.5 hover:bg-gray-700 rounded-lg transition"
          >
            {copied === id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
        )}
      </div>
      <div className="p-4 text-gray-300 leading-relaxed whitespace-pre-wrap">{children}</div>
    </div>
  );

  return (
    <div className="animate-fade-in space-y-6">
      <div className="bg-gradient-to-r from-gray-800 to-slate-900 border border-indigo-500/30 rounded-xl p-5 shadow-lg">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
             <div>
                 <h3 className="text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1">استراتيجية المحتوى</h3>
                 <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-white tracking-tight">{activeProfile ? activeProfile.name : 'إعدادات مخصصة'}</span>
                    
                    {/* [إضافة] عرض اسم النموذج المستخدم إن وجد */}
                    {usedModel && (
                        <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/30 px-2 py-1 rounded-full">
                            <Bot className="w-3 h-3 text-indigo-400" />
                            <span className="text-[10px] font-mono font-bold text-indigo-300">{usedModel}</span>
                        </div>
                    )}
                 </div>
             </div>
             <div className="flex flex-wrap gap-2">
                {[inputs.persona, inputs.style, inputs.tone].map((t, i) => (
                    <span key={i} className="text-xs bg-black/30 text-gray-300 px-3 py-1.5 rounded-lg border border-white/5">{t}</span>
                ))}
             </div>
         </div>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-white">النتائج المولدة</h2>
        <div className="flex gap-2">
            {onTransferToVisual && outputs.mainScript && (
                <button 
                  onClick={() => onTransferToVisual(outputs.mainScript)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 shadow-lg transition transform hover:-translate-y-1"
                >
                  <Layout className="w-5 h-5" /> السيناريو المرئي
                </button>
            )}
            <button 
              onClick={handleDownloadZip}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 shadow-lg transition transform hover:-translate-y-1"
            >
              <Download className="w-5 h-5" /> تحميل الحزمة (ZIP)
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {inputs.includeMainScript && (
            <SectionCard title="السكربت الرئيسي" icon={FileText} id="mainScript" textToCopy={outputs.mainScript}>
                {outputs.mainScript}
            </SectionCard>
          )}
          {inputs.includeMetadata && (
            <SectionCard title="الوصف (YouTube)" icon={FileText} id="desc" textToCopy={outputs.metaDescription}>{outputs.metaDescription}</SectionCard>
          )}
        </div>
        <div className="space-y-6">
          {inputs.includeMetadata && (
            <>
                <SectionCard title="العنوان المقترح" icon={Hash} id="title" textToCopy={outputs.metaTitle}><p className="text-lg font-bold text-white">{outputs.metaTitle}</p></SectionCard>
                <SectionCard title="الكلمات المفتاحية" icon={Hash} id="tags" textToCopy={outputs.metaKeywords.join(', ')}>
                    <div className="flex flex-wrap gap-2">{outputs.metaKeywords.map((k, i) => <span key={i} className="bg-primary/20 text-primary px-2 py-1 rounded text-xs">{k}</span>)}</div>
                </SectionCard>
            </>
          )}
          {inputs.includeShortsScript && (
            <SectionCard title="سكربت الشورتس" icon={Video} id="shortsScript" textToCopy={outputs.shortsScript}>
                <p className="font-bold text-sm text-indigo-400 mb-2">{outputs.shortsTitle}</p>
                {outputs.shortsScript}
                <div className="mt-4 pt-4 border-t border-gray-700 text-[10px] text-gray-500">
                    <p className="font-bold mb-1">الكلمات الدلالية:</p>
                    {outputs.shortsKeywords.join(', ')}
                </div>
            </SectionCard>
          )}
          {inputs.includeTiktokDesc && (
            <SectionCard title="وصف تيك توك" icon={Music} id="tiktokDesc" textToCopy={outputs.tiktokDescription}>{outputs.tiktokDescription}</SectionCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentResults;
