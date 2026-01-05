import React, { useState, useEffect } from 'react';
import { X, Save, Globe, Cpu, Key, Plus, Trash2, ShieldCheck, Settings, PlusCircle, LayoutPanelTop, Layers } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: AppSettings) => void;
  initialSettings: AppSettings;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, initialSettings }) => {
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [newKey, setNewKey] = useState('');
  const [newModelName, setNewModelName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSettings(initialSettings);
    }
  }, [isOpen, initialSettings]);

  const addKey = () => {
    if (newKey.trim() && !settings.apiKeys.includes(newKey.trim())) {
      setSettings({ ...settings, apiKeys: [...settings.apiKeys, newKey.trim()] });
      setNewKey('');
    }
  };

  const removeKey = (index: number) => {
    const updated = settings.apiKeys.filter((_, i) => i !== index);
    setSettings({ ...settings, apiKeys: updated, currentKeyIndex: 0 });
  };

  const addCustomModel = () => {
    if (newModelName.trim() && !settings.customModels.includes(newModelName.trim())) {
      setSettings({ 
        ...settings, 
        customModels: [...settings.customModels, newModelName.trim()] 
      });
      setNewModelName('');
    }
  };

  const removeModel = (model: string) => {
    if (settings.customModels.length <= 1) return;
    const updated = settings.customModels.filter(m => m !== model);
    setSettings({ 
      ...settings, 
      customModels: updated,
      defaultTextModel: settings.defaultTextModel === model ? updated[0] : settings.defaultTextModel
    });
  };
  
  // --- دالة جديدة لمعالجة تغيير النموذج الأساسي ---
  const handlePrimaryModelChange = (taskType: 'heavyTasks' | 'lightTasks', newModel: string) => {
    const currentList = settings.modelMapping[taskType];
    const newList = [newModel, ...currentList.filter(m => m !== newModel)];
    setSettings({
      ...settings,
      modelMapping: {
        ...settings.modelMapping,
        [taskType]: newList
      }
    });
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-2xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-dark/50">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" /> مركز إدارة النماذج والذكاء الاصطناعي
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">
          {/* قسم إدارة المفاتيح */}
          <section>
            <h3 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
              <Key className="w-4 h-4" /> توزيع الأحمال (Load Balancing)
            </h3>
            <div className="flex gap-2 mb-4">
                <input 
                  type="password" 
                  value={newKey} 
                  onChange={(e) => setNewKey(e.target.value)} 
                  placeholder="أدخل مفتاح Gemini جديد..." 
                  className="flex-1 bg-dark border border-gray-700 rounded-lg px-4 py-2 text-sm outline-none focus:border-primary transition" 
                />
                <button onClick={addKey} className="bg-primary hover:bg-indigo-600 px-4 py-2 rounded-lg text-white transition">
                  <Plus className="w-5 h-5" />
                </button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {settings.apiKeys.map((key, i) => (
                    <div key={i} className={`flex items-center justify-between p-3 rounded-xl border transition ${i === settings.currentKeyIndex ? 'bg-primary/10 border-primary shadow-[0_0_10px_rgba(99,102,241,0.2)]' : 'bg-dark/50 border-gray-800'}`}>
                        <div className="flex items-center gap-3">
                            <ShieldCheck className={`w-4 h-4 ${i === settings.currentKeyIndex ? 'text-primary' : 'text-gray-600'}`} />
                            <span className="text-[10px] font-mono text-gray-400">••••••••{key.slice(-6)}</span>
                        </div>
                        <button onClick={() => removeKey(i)} className="text-red-500 hover:bg-red-500/10 p-1.5 rounded transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
          </section>

          {/* تخصيص المهام - التحديث الجوهري */}
          <section className="bg-dark/30 p-4 rounded-xl border border-gray-800">
            <h3 className="text-sm font-bold text-secondary mb-4 flex items-center gap-2">
              <LayoutPanelTop className="w-4 h-4" /> تعيين النماذج للمهام (Model Mapping)
            </h3>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        {/* --- تم تعديل هذا الجزء --- */}
                        <label className="block text-[10px] text-gray-500 mb-1 font-bold uppercase">المهام الكبيرة (الخطة أ)</label>
                        <select 
                          value={settings.modelMapping.heavyTasks[0] || ''}
                          onChange={(e) => handlePrimaryModelChange('heavyTasks', e.target.value)}
                          className="w-full bg-dark border border-gray-700 rounded-lg p-2.5 text-xs text-white focus:border-primary outline-none transition"
                        >
                          {settings.customModels.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                    <div>
                        {/* --- وتم تعديل هذا الجزء --- */}
                        <label className="block text-[10px] text-gray-500 mb-1 font-bold uppercase">المهام الخفيفة (الخطة أ)</label>
                        <select 
                          value={settings.modelMapping.lightTasks[0] || ''}
                          onChange={(e) => handlePrimaryModelChange('lightTasks', e.target.value)}
                          className="w-full bg-dark border border-gray-700 rounded-lg p-2.5 text-xs text-white focus:border-secondary outline-none transition"
                        >
                          {settings.customModels.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                </div>
                <p className="text-[10px] text-gray-600 italic">ملاحظة: يمكنك تغيير النموذج الأساسي (الخطة أ). سيلجأ النظام للنماذج البديلة بالترتيب عند فشل النموذج الأساسي.</p>
            </div>
          </section>

          {/* قسم إدارة النماذج المخصصة */}
          <section>
            <h3 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4" /> إدارة النماذج المتاحة
            </h3>
            <div className="flex gap-2 mb-4">
                <input 
                  type="text" 
                  value={newModelName} 
                  onChange={(e) => setNewModelName(e.target.value)} 
                  placeholder="مثال: gemini-3-pro-preview" 
                  className="flex-1 bg-dark border border-gray-700 rounded-lg px-4 py-2 text-sm outline-none focus:border-primary transition" 
                />
                <button onClick={addCustomModel} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-white transition">
                  <PlusCircle className="w-5 h-5" />
                </button>
            </div>
            <div className="flex flex-wrap gap-2">
                {settings.customModels.map(model => (
                  <div key={model} className="flex items-center gap-2 bg-dark/50 px-3 py-1.5 rounded-full border border-gray-800 text-[10px]">
                    <span className="text-gray-300 font-mono">{model}</span>
                    <button onClick={() => removeModel(model)} className="text-red-400 hover:text-red-300"><X className="w-3 h-3" /></button>
                  </div>
                ))}
            </div>
          </section>
        </div>

        <div className="p-4 border-t border-gray-700 bg-dark/50 flex justify-end gap-3">
            <button onClick={onClose} className="px-6 py-2 text-xs font-bold text-gray-400 hover:text-white transition">إلغاء</button>
            <button 
              onClick={() => { onSave(settings); onClose(); }} 
              className="px-8 py-2 bg-primary hover:bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20 transition transform active:scale-95"
            >
              حفظ وتفعيل الأتمتة
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
