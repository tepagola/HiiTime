
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'en' | 'es';

interface SettingsState {
    language: Language;
    setLanguage: (lang: Language) => void;
}

const getBrowserLanguage = (): Language => {
    const lang = navigator.language || (navigator as any).userLanguage || 'en';
    return lang.toLowerCase().startsWith('es') ? 'es' : 'en';
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            language: getBrowserLanguage(),
            setLanguage: (lang) => set({ language: lang }),
        }),
        {
            name: 'hiitime_settings',
        }
    )
);
