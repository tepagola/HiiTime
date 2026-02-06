import { usePlanStore } from '../stores/usePlanStore';
import { Button } from '../components/ui/button';
import { Trophy, RotateCcw, Calendar, Activity } from 'lucide-react';
import { useTranslation } from '../lib/i18n';

export const Summary = () => {
    const { clearPlan, currentPlan } = usePlanStore();
    const { t } = useTranslation();

    const handleNewPlan = () => {
        clearPlan();
    };

    if (!currentPlan) return null;

    return (
        <div className="flex flex-col min-h-full items-center justify-center space-y-10 text-center py-12 animate-fade-in relative z-10">

            <div className="relative mt-8">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-brand-neon/30 blur-[80px] rounded-full animate-pulse-slow pointer-events-none"></div>
                <div className="p-10 rounded-full bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border border-yellow-400/30 text-yellow-400 shadow-[0_0_50px_-10px_rgba(250,204,21,0.3)] animate-scale-up relative z-10 backdrop-blur-sm">
                    <Trophy size={80} strokeWidth={1.5} />
                </div>
            </div>

            <div className="space-y-6 max-w-lg animate-[fadeIn_0.5s_ease-out_0.2s_forwards] opacity-0" style={{ animationFillMode: 'forwards' }}>
                <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase italic drop-shadow-lg">
                    {t('summary.title').split(' ').map((word, i) => (
                        <span key={i}>{word}{i === 0 ? <br /> : ''}</span>
                    ))}
                </h1>
                <div className="text-zinc-400 text-xl font-medium">
                    {t('runner.finish')}
                    <div className="mt-2 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-neon to-brand-accent truncate max-w-xs mx-auto px-4 py-1">
                        {currentPlan.name}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-sm animate-[fadeIn_0.5s_ease-out_0.4s_forwards] opacity-0" style={{ animationFillMode: 'forwards' }}>
                <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 backdrop-blur-sm">
                    <Activity size={20} className="text-brand-accent mb-1" />
                    <span className="text-2xl font-bold font-mono">{currentPlan.rounds}</span>
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500">{t('app.rounds')}</span>
                </div>
                <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 backdrop-blur-sm">
                    <Calendar size={20} className="text-brand-neon mb-1" />
                    <span className="text-2xl font-bold font-mono">{currentPlan.exercises.length}</span>
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500">{t('app.stations')}</span>
                </div>
            </div>

            <div className="w-full max-w-md pt-8 animate-[fadeIn_0.5s_ease-out_0.6s_forwards] opacity-0" style={{ animationFillMode: 'forwards' }}>
                <Button variant="giant" onClick={handleNewPlan} className="w-full bg-white text-black hover:bg-zinc-200">
                    <RotateCcw className="mr-2 h-6 w-6" /> {t('summary.backToHQ')}
                </Button>
            </div>
        </div>
    );
};
