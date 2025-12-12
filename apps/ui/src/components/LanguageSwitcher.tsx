import { useI18n, type Language } from '@/lib/i18n/context'

const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
]

export default function LanguageSwitcher() {
    const { language, setLanguage } = useI18n()

    return (
        <div className="flex items-center gap-2">
            {languages.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${language === lang.code
                            ? 'bg-[#c5f274] text-[#1a3a2e] shadow-sm'
                            : 'bg-transparent text-[#1a3a2e] hover:bg-gray-100'
                        }`}
                    title={lang.label}
                >
                    <span className="text-base">{lang.flag}</span>
                    <span className="hidden sm:inline">{lang.label}</span>
                </button>
            ))}
        </div>
    )
}
