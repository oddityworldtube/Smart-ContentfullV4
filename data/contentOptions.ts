import { SmartProfile } from '../types';
// إضافة أيقونات إضافية للتنوع
import { 
  Video, BookOpen, Smile, Zap, Skull, Scroll, Briefcase, 
  Fingerprint, HeartPulse, Newspaper, Rocket, Lightbulb, 
  Mic, Share2, Target, Brain 
} from 'lucide-react';

export const personas = [
  "خبير تقني", "راوي قصص محترف", "معلم صبور", "صديق مقرب", "مدرب تحفيزي", 
  "محلل اقتصادي", "ناقد ساخر", "باحث تاريخي", "خبير لغة جسد", "رائد أعمال",
  "مذيع أخبار", "فيلسوف معاصر", "محقق جنائي", "طبيب مختص"
];

export const tones = [
  "رسمي", "ودي", "حماسي", "غامض", "فكاهي", "جاد", "عاطفي", 
  "مرعب/سوداوي", "ملحمي", "تحليلي عميق", "تحفيزي ملهم", "ساخر", "عاجل ومباشر"
];

export const styles = [
  "سردي قصصي", "تعليمي (How-to)", "قائمة (Top 10)", "تحليلي", "نقاشي", 
  "وثائقي", "تحقيق جنائي", "نفسي عميق", "سرد سينمائي", "مبني على البيانات", "تبسيط العلوم"
];

export const formats = [
  "فيديو يوتيوب طويل", "ثريد (Thread) تويتر", "مقال مدونة SEO", "نص إعلاني بيعي", 
  "سكربت بودكاست", "ريلز/شورتس/تيك توك", "نشرة بريدية (Newsletter)", "منشور لينكد إن"
];

export const audiences = [
  "مبتدئين", "خبراء", "أطفال", "رواد أعمال", "محبي التقنية", 
  "عامة الناس", "محبي الغموض", "طلاب العلم", "صناع المحتوى", "جيل زد (Gen Z)"
];

// تحويل CTAs إلى توجيه "ماستر" موحد لدمج الدعوة للفعل بذكاء
export const ctas = [
  "Briefly ask the user to Subscribe and Comment. Keep it under 10 words and very energetic."
];

export const smartProfiles: SmartProfile[] = [
  {
    id: 'docu',
    name: 'وثائقي عميق',
    icon: 'BookOpen',
    settings: {
      persona: 'راوي قصص محترف',
      tone: 'غامض',
      style: 'وثائقي',
      format: 'فيديو يوتيوب طويل',
      audience: 'عامة الناس',
      cta: ctas[0]
    }
  },
  {
    id: 'tech',
    name: 'مراجعة تقنية',
    icon: 'Zap',
    settings: {
      persona: 'خبير تقني',
      tone: 'حماسي',
      style: 'تحليلي',
      format: 'فيديو يوتيوب طويل',
      audience: 'محبي التقنية',
      cta: ctas[0]
    }
  },
  {
    id: 'viral_shorts',
    name: 'شورتس فيرال',
    icon: 'Rocket',
    settings: {
      persona: 'مدرب تحفيزي',
      tone: 'حماسي',
      style: 'قائمة (Top 10)',
      format: 'ريلز/شورتس/تيك توك',
      audience: 'جيل زد (Gen Z)',
      cta: ctas[0]
    }
  },
  {
    id: 'dark_psych',
    name: 'علم النفس المظلم',
    icon: 'Skull',
    settings: {
      persona: 'خبير لغة جسد وتلاعب',
      tone: 'مرعب/سوداوي',
      style: 'نفسي عميق',
      format: 'فيديو يوتيوب طويل',
      audience: 'محبي الغموض',
      cta: ctas[0]
    }
  },
  {
    id: 'history',
    name: 'شخصيات تاريخية',
    icon: 'Scroll',
    settings: {
      persona: 'باحث تاريخي',
      tone: 'ملحمي',
      style: 'سردي قصصي',
      format: 'فيديو يوتيوب طويل',
      audience: 'عامة الناس',
      cta: ctas[0]
    }
  },
  {
    id: 'business',
    name: 'مال وأعمال',
    icon: 'Briefcase',
    settings: {
      persona: 'رائد أعمال',
      tone: 'جاد',
      style: 'تحليلي',
      format: 'منشور لينكد إن',
      audience: 'رواد أعمال',
      cta: ctas[0]
    }
  },
  {
    id: 'news_fast',
    name: 'أخبار عاجلة',
    icon: 'Newspaper',
    settings: {
      persona: 'مذيع أخبار',
      tone: 'عاجل ومباشر',
      style: 'تبسيط العلوم',
      format: 'ريلز/شورتس/تيك توك',
      audience: 'عامة الناس',
      cta: ctas[0]
    }
  },
  {
    id: 'philosophy',
    name: 'فكر وفلسفة',
    icon: 'Brain',
    settings: {
      persona: 'فيلسوف معاصر',
      tone: 'تحليلي عميق',
      style: 'نقاشي',
      format: 'بودكاست',
      audience: 'طلاب العلم',
      cta: ctas[0]
    }
  }
];
