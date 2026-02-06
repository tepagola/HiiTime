
import { useSettingsStore } from '../stores/useSettingsStore';
import { Button } from './ui/button';
import { Globe } from 'lucide-react';
import { cn } from '../lib/utils';

export const LanguageSelector = () => {
    const { language, setLanguage } = useSettingsStore();

    return (
        <div className="flex items-center gap-1 bg-zinc-900/50 p-1 rounded-lg border border-white/5 backdrop-blur-sm">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage('en')}
                className={cn(
                    "h-7 px-2 text-[10px] font-bold transition-all",
                    language === 'en' ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
                )}
            >
                EN
            </Button>
            <div className="w-px h-3 bg-zinc-800" />
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage('es')}
                className={cn(
                    "h-7 px-2 text-[10px] font-bold transition-all",
                    language === 'es' ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
                )}
            >
                ES
            </Button>
            <Globe size={12} className="ml-1 mr-1 text-zinc-600" />
        </div>
    );
};
