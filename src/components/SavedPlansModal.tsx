
import React from 'react';
import { usePlanStore } from '../stores/usePlanStore';
import { Plan } from '../types/models';
import { Button } from './ui/button';
import { Trash2, Play, Save, X, Clock } from 'lucide-react';
import { useTranslation } from '../lib/i18n';

interface SavedPlansModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'load' | 'overwrite';
    planToSave?: Plan; // Required if mode is 'overwrite'
}

export const SavedPlansModal: React.FC<SavedPlansModalProps> = ({ isOpen, onClose, mode, planToSave }) => {
    const { savedPlans, loadPlanFromLibrary, deletePlanFromLibrary, overwritePlanInLibrary } = usePlanStore();
    const { t } = useTranslation();

    if (!isOpen) return null;

    const handleAction = (plan: Plan) => {
        if (mode === 'load') {
            loadPlanFromLibrary(plan.id);
            onClose();
        } else if (mode === 'overwrite' && planToSave) {
            // Confirm overwrite? Maybe too many clicks. Let's just do it or show a mini confirm.
            // For MVP, direct overwrite.
            overwritePlanInLibrary(plan.id, planToSave);
            onClose();
        }
    };

    const handleDelete = (e: React.MouseEvent, planId: string) => {
        e.stopPropagation();
        if (confirm(t('app.confirmDelete'))) {
            deletePlanFromLibrary(planId);
            // If we are in overwrite mode and we delete so we have space, we could potentially just save new one?
            // But simplest is: delete -> space opens up -> user closes modal -> clicks save again.
            // OR: we can auto-save if space opens up? 
            // Let's keep it simple: Delete just deletes. If user deletes enough, they can close and save normally.

            // Actually, if I delete one, I have 9. Then I can just save. 
            // So if I am in 'overwrite' mode, and I delete one, should I immediately save the new one?
            // Maybe not, let user decide.
        }
    };

    // Helper to format time (sum of durations * rounds)
    const getDurationLabel = (plan: Plan) => {
        // Simple calc: (sum of exercises durations) * rounds
        // Note: reps exercises might have 0 duration, so it's an estimate
        const roundDuration = plan.exercises.reduce((acc, ex) => acc + (ex.duration || 0), 0);
        const totalSeconds = roundDuration * plan.rounds;
        const mins = Math.floor(totalSeconds / 60);
        return `${mins}m`;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in p-4">
            <div className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                    <h2 className="text-xl font-bold text-white">
                        {mode === 'load' ? t('app.myMissions') : t('app.storageFull')}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Body */}
                <div className="p-4 overflow-y-auto space-y-3 flex-1">
                    {mode === 'overwrite' && (
                        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-200 p-3 rounded-lg text-sm mb-4">
                            {t('app.storageFullDesc')}
                        </div>
                    )}

                    {savedPlans.length === 0 && (
                        <div className="text-center py-8 text-zinc-500">
                            {t('app.noSavedPlans')}
                        </div>
                    )}

                    {savedPlans.map((plan) => (
                        <div
                            key={plan.id}
                            onClick={() => handleAction(plan)}
                            className="group relative flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer active:scale-[0.98]"
                        >
                            <div className="flex-1 min-w-0 pr-4">
                                <h3 className="font-bold text-white truncate">{plan.name}</h3>
                                <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {getDurationLabel(plan)}
                                    </span>
                                    <span>•</span>
                                    <span>{plan.rounds} {t('app.rounds')}</span>
                                    <span>•</span>
                                    <span>{plan.exercises.length} {t('app.exercises')}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {mode === 'load' && <Play className="w-5 h-5 text-brand-neon opacity-0 group-hover:opacity-100 transition-opacity" />}
                                {mode === 'overwrite' && <Save className="w-5 h-5 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />}

                                <button
                                    onClick={(e) => handleDelete(e, plan.id)}
                                    className="p-2 hover:bg-white/10 rounded-full text-zinc-500 hover:text-red-400 transition-colors z-10"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/5 bg-zinc-900/50 rounded-b-2xl">
                    <div className="flex justify-between items-center text-xs text-zinc-500 uppercase tracking-widest font-mono">
                        <span>{savedPlans.length} / 10 {t('app.slots')}</span>
                        {mode === 'overwrite' && <span>{t('app.selectToReplace')}</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};
