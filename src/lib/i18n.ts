
import { useSettingsStore } from '../stores/useSettingsStore';
import en from '../locales/en.json';
import es from '../locales/es.json';

const translations: Record<string, any> = { en, es };

/**
 * Simple translation helper
 * Usage: t('app.readyToStart')
 */
export const t = (path: string): string => {
    const { language } = useSettingsStore.getState();
    const dictionary = translations[language] || en;

    return path.split('.').reduce((obj, key) => obj?.[key], dictionary) || path;
};

/**
 * Hook version for reactive updates
 */
export const useTranslation = () => {
    const language = useSettingsStore((state) => state.language);
    const dictionary = translations[language] || en;

    const translate = (path: string): string => {
        return path.split('.').reduce((obj, key) => obj?.[key], dictionary) || path;
    };

    return { t: translate, language };
};
