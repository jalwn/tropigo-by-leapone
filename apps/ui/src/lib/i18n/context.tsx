import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, type Language, type Translations } from './translations'

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

const LANGUAGE_STORAGE_KEY = 'tropigo-language'

function getInitialLanguage(): Language {
  // Check localStorage first
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (stored === 'en' || stored === 'zh') {
      return stored as Language
    }
    
    // Fallback to browser language
    const browserLang = navigator.language?.split('-')[0]?.toLowerCase()
    if (browserLang === 'zh') {
      return 'zh'
    }
  }
  
  return 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage)

  useEffect(() => {
    // Save to localStorage when language changes
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  }, [language])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
  }

  const value: I18nContextType = {
    language,
    setLanguage,
    t: translations[language],
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

