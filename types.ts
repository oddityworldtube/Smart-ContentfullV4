export interface ContentInputs {
  inputType: 'topic' | 'url';
  inputValue: string;
  persona: string;
  tone: string;
  style: string;
  format: string;
  audience: string;
  cta: string;
  wordCount: number;
  language: string;
  includeMainScript: boolean;
  includeMetadata: boolean;
  includeShortsScript: boolean;
  includeShortsMetadata: boolean;
  includeTiktokDesc: boolean;
}

export interface ContentOutputs {
  mainScript: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  shortsScript: string;
  shortsTitle: string;
  shortsDescription: string;
  shortsKeywords: string[];
  tiktokDescription: string;
}

export interface ContentSession {
  id: string;
  timestamp: number;
  title: string;
  inputs: ContentInputs;
  outputs: ContentOutputs;
}

export interface AppSettings {
  apiKeys: string[];
  currentKeyIndex: number;
  activePoolIndex: number; // تم إضافته لدعم نظام حزم المفاتيح (Smart Pools)
  defaultTextModel: string;
  defaultImageModel: string;
  customModels: string[];
  magicTitleLanguage?: string;
  modelMapping: {
    heavyTasks: string[]; // السكربت الرئيسي، الميتاداتا
    lightTasks: string[]; // التشكيل، أوصاف المشاهد، الشورتس
  };
}

export interface SmartProfile {
  id: string;
  name: string;
  icon: string;
  settings: Partial<ContentInputs>;
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  variables: string[];
  template: string;
}