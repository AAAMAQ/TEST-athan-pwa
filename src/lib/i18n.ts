export type AppLanguage = 'en' | 'ar' | 'ur' | 'hi'

export const LANGUAGE_LABELS: Record<AppLanguage, string> = {
  en: 'English',
  ar: 'العربية',
  ur: 'اردو',
  hi: 'हिन्दी'
}

const LANGUAGE_KEY = 'athan.language.v1'

const translations: Record<AppLanguage, Record<string, string>> = {
  en: {
    home: 'Home',
    prayer: 'Prayer',
    prayerTimes: 'Prayer Times',
    qibla: 'Qibla',
    quran: 'Quran',
    settings: 'Settings',
    credits: 'Credits',
    needHelp: 'Need Help',
    advancedAthan: 'Advanced Athan',
    iqama: 'Iqama',
    download: 'Download',
    save: 'Save',
    reset: 'Reset',
    update: 'Update',
    fajr: 'Fajr',
    sunrise: 'Sunrise',
    dhuhr: 'Dhuhr',
    asr: 'Asr',
    maghrib: 'Maghrib',
    isha: 'Isha',
    jumuah: 'Jumu’ah'
  },
  ar: {
    home: 'الرئيسية',
    prayer: 'الصلاة',
    prayerTimes: 'مواقيت الصلاة',
    qibla: 'القبلة',
    quran: 'القرآن',
    settings: 'الإعدادات',
    credits: 'الشكر',
    needHelp: 'المساعدة',
    advancedAthan: 'الأذان المتقدم',
    iqama: 'الإقامة',
    download: 'تنزيل',
    save: 'حفظ',
    reset: 'إعادة ضبط',
    update: 'تحديث',
    fajr: 'الفجر',
    sunrise: 'الشروق',
    dhuhr: 'الظهر',
    asr: 'العصر',
    maghrib: 'المغرب',
    isha: 'العشاء',
    jumuah: 'الجمعة'
  },
  ur: {
    home: 'ہوم',
    prayer: 'نماز',
    prayerTimes: 'نماز کے اوقات',
    qibla: 'قبلہ',
    quran: 'قرآن',
    settings: 'ترتیبات',
    credits: 'کریڈٹس',
    needHelp: 'مدد',
    advancedAthan: 'اعلی اذان',
    iqama: 'اقامت',
    download: 'ڈاؤن لوڈ',
    save: 'محفوظ کریں',
    reset: 'ری سیٹ',
    update: 'اپ ڈیٹ',
    fajr: 'فجر',
    sunrise: 'طلوع آفتاب',
    dhuhr: 'ظہر',
    asr: 'عصر',
    maghrib: 'مغرب',
    isha: 'عشاء',
    jumuah: 'جمعہ'
  },
  hi: {
    home: 'होम',
    prayer: 'नमाज़',
    prayerTimes: 'नमाज़ का समय',
    qibla: 'क़िबला',
    quran: 'क़ुरआन',
    settings: 'सेटिंग्स',
    credits: 'क्रेडिट्स',
    needHelp: 'मदद चाहिए',
    advancedAthan: 'एडवांस अज़ान',
    iqama: 'इक़ामा',
    download: 'डाउनलोड',
    save: 'सेव',
    reset: 'रीसेट',
    update: 'अपडेट',
    fajr: 'फ़ज्र',
    sunrise: 'सूर्योदय',
    dhuhr: 'ज़ुहर',
    asr: 'अस्र',
    maghrib: 'मग़रिब',
    isha: 'ईशा',
    jumuah: 'जुमुआ'
  }
}

export function isAppLanguage(value: string | null): value is AppLanguage {
  return value === 'en' || value === 'ar' || value === 'ur' || value === 'hi'
}

export function loadLanguage(): AppLanguage {
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY)
    return isAppLanguage(saved) ? saved : 'en'
  } catch {
    return 'en'
  }
}

export function saveLanguage(language: AppLanguage): void {
  try {
    localStorage.setItem(LANGUAGE_KEY, language)
    window.dispatchEvent(new CustomEvent('athan-language-change', { detail: language }))
  } catch {
    // Keep the app usable if localStorage is unavailable.
  }
}

export function t(key: string, language: AppLanguage = loadLanguage()): string {
  return translations[language]?.[key] ?? translations.en[key] ?? key
}
