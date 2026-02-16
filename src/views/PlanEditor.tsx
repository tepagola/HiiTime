import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Trash2, GripVertical, Clock, Hash, Coffee, FolderOpen, FolderHeart } from 'lucide-react';
import { SavedPlansModal } from '../components/SavedPlansModal';
import { usePlanStore } from '../stores/usePlanStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ExerciseType, Plan } from '../types/models';
import { cn } from '../lib/utils';
import { useTranslation } from '../lib/i18n';

type FormValues = {
    planName: string;
    rounds: number;
    exercises: {
        id: string;
        name: string;
        type: ExerciseType;
        duration: number; // in seconds
        reps: number;
    }[];
};

export const PlanEditor = () => {
    const { currentPlan, savePlan, isNew, savePlanToLibrary } = usePlanStore();
    const { t } = useTranslation();

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [modalMode, setModalMode] = React.useState<'load' | 'overwrite'>('load');
    const [pendingPlan, setPendingPlan] = React.useState<Plan | undefined>(undefined);
    const [showSavedNotification, setShowSavedNotification] = React.useState(false);

    const { register, control, handleSubmit, getValues, formState: { errors } } = useForm<FormValues>({
        defaultValues: isNew ? {
            planName: '',
            rounds: 3,
            exercises: []
        } : (currentPlan ? {
            planName: currentPlan.name,
            rounds: currentPlan.rounds,
            exercises: currentPlan.exercises.map(ex => ({
                id: ex.id,
                name: ex.name,
                type: ex.type,
                duration: ex.duration || 45,
                reps: ex.reps || 10
            }))
        } : {
            planName: '',
            rounds: 3,
            exercises: [
                { id: (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9)), name: t('editor.placeholders.exerciseName'), type: 'timer', duration: 45, reps: 0 },
            ]
        })
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "exercises"
    });

    // Helper to construct plan from form values
    const createPlanFromForm = (data: FormValues): Plan => ({
        id: currentPlan?.id || (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9)),
        name: data.planName,
        rounds: data.rounds,
        createdAt: currentPlan?.createdAt || Date.now(),
        updatedAt: Date.now(),
        exercises: data.exercises.map(ex => ({
            id: ex.id,
            name: ex.name,
            type: ex.type as ExerciseType,
            duration: ex.type === 'reps' ? undefined : Number(ex.duration),
            reps: ex.type === 'reps' ? Number(ex.reps) : undefined,
        }))
    });

    const onSubmit = (data: FormValues) => {
        const plan = createPlanFromForm(data);
        savePlan(plan);
    };

    const handleSaveToLibrary = () => {
        const data = getValues();
        if (!data.planName) {
            // Trigger validation somehow or just alert? 
            // Since we are bypassing handleSubmit for this aux button, let's just check.
            alert(t('editor.missionNamePlaceholder')); // Simple fallback
            return;
        }
        const plan = createPlanFromForm(data);

        const saved = savePlanToLibrary(plan);
        if (!saved) {
            setPendingPlan(plan);
            setModalMode('overwrite');
            setIsModalOpen(true);
        } else {
            setShowSavedNotification(true);
            setTimeout(() => setShowSavedNotification(false), 3000);
        }
    };

    const handleLoadClick = () => {
        setModalMode('load');
        setPendingPlan(undefined);
        setIsModalOpen(true);
    };

    const addExercise = (type: ExerciseType) => {
        append({
            id: (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9)),
            name: type === 'rest' ? t('editor.types.rest') : '',
            type,
            duration: type === 'rest' ? 30 : 45,
            reps: 10
        });
    };

    return (
        <div className="pb-32 relative">
            <SavedPlansModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mode={modalMode}
                planToSave={pendingPlan}
            />

            <div className="flex justify-end gap-2 mb-4 items-center mt-12">
                {showSavedNotification && (
                    <span className="text-brand-neon text-sm font-bold uppercase tracking-widest animate-in fade-in slide-in-from-right-4 mr-2">
                        {t('app.saved')}
                    </span>
                )}
                <Button type="button" variant="outline" onClick={handleLoadClick} size="icon" className="bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white" title={t('app.load')}>
                    <FolderOpen className="h-4 w-4" />
                </Button>
                <Button type="button" variant="outline" onClick={handleSaveToLibrary} size="icon" className="bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-brand-neon hover:border-brand-neon/50" title={t('app.save')}>
                    <FolderHeart className="h-4 w-4" />
                </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Header Section */}
                <div className="space-y-6 bg-zinc-900/30 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2 block">{t('editor.missionName')}</label>
                            <Input
                                {...register("planName", { required: true })}
                                placeholder={t('editor.missionNamePlaceholder')}
                                className="text-3xl font-bold bg-transparent border-none placeholder:text-zinc-700 p-0 h-auto focus-visible:ring-0 text-white"
                            />
                            {errors.planName && <span className="text-red-500 text-xs mt-1 block">A name is required for your mission.</span>}
                            <div className="h-px w-full bg-zinc-800 mt-2" />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="text-xs font-mono uppercase tracking-widest text-zinc-500">{t('editor.rounds')}</label>
                            <div className="flex items-center bg-zinc-800/50 rounded-lg p-1 border border-zinc-700">
                                <Input
                                    type="number"
                                    {...register("rounds", { valueAsNumber: true, min: 1, max: 20 })}
                                    className="w-16 text-center text-xl font-bold bg-transparent border-none h-10 p-0 text-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Exercises List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-4">
                            <label className="text-xs font-mono uppercase tracking-widest text-zinc-500">Sequence</label>
                            {fields.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => remove()}
                                    className="text-[10px] font-mono uppercase tracking-tighter text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-1"
                                >
                                    <Trash2 size={12} />
                                    {t('editor.clearAll')}
                                </button>
                            )}
                        </div>
                        <span className="text-xs text-zinc-600 font-mono">{fields.length} {t('editor.stations')}</span>
                    </div>

                    {fields.map((field, index) => (
                        <div key={field.id} className="group relative overflow-hidden rounded-xl bg-zinc-900/40 border border-white/5 hover:border-white/10 transition-all hover:bg-zinc-900/60">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-zinc-800 group-hover:bg-zinc-600 transition-colors" />

                            <div className="p-4 pl-5 flex gap-4 items-center">
                                <div className="text-zinc-700 group-hover:text-zinc-500 transition-colors cursor-move">
                                    <GripVertical size={20} />
                                </div>

                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center justify-between gap-3">
                                        <Input
                                            {...register(`exercises.${index}.name` as const, { required: true })}
                                            placeholder={t('editor.placeholders.exerciseName')}
                                            className="flex-1 bg-transparent border-none p-0 h-auto text-lg font-medium text-zinc-200 focus-visible:ring-0 placeholder:text-zinc-700"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => remove(index)}
                                            className="text-zinc-600 hover:text-red-500 hover:bg-transparent -mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                            aria-label="Remove exercise"
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border",
                                            field.type === 'rest' ? "bg-brand-neon/10 text-brand-neon border-brand-neon/20" :
                                                field.type === 'timer' ? "bg-brand-accent/10 text-brand-accent border-brand-accent/20" :
                                                    "bg-orange-900/20 text-orange-400 border-orange-500/20"
                                        )}>
                                            {field.type === 'rest' ? <Coffee size={10} /> :
                                                field.type === 'timer' ? <Clock size={10} /> : <Hash size={10} />}
                                            {t(`editor.types.${field.type}`)}
                                        </div>

                                        <div className="h-4 w-px bg-zinc-800" />

                                        {field.type !== 'reps' ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    className="bg-transparent w-12 text-right font-mono font-medium text-zinc-300 focus:outline-none border-b border-transparent focus:border-zinc-500 transition-colors"
                                                    {...register(`exercises.${index}.duration` as const, { valueAsNumber: true })}
                                                />
                                                <span className="text-xs text-zinc-600 font-mono">SEC</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    className="bg-transparent w-12 text-right font-mono font-medium text-zinc-300 focus:outline-none border-b border-transparent focus:border-zinc-500 transition-colors"
                                                    {...register(`exercises.${index}.reps` as const, { valueAsNumber: true })}
                                                />
                                                <span className="text-xs text-zinc-600 font-mono">REPS</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Add Bar */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-brand-dark via-brand-dark/95 to-transparent pt-12 z-10">
                    <div className="max-w-lg mx-auto space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                            <Button type="button" variant="outline" onClick={() => addExercise('timer')} className="bg-zinc-900/80 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-600 text-zinc-300">
                                <Clock size={16} className="mr-2" /> {t('editor.types.timer')}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => addExercise('reps')} className="bg-zinc-900/80 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-600 text-zinc-300">
                                <Hash size={16} className="mr-2" /> {t('editor.types.reps')}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => addExercise('rest')} className="bg-zinc-900/80 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-600 text-emerald-400/80 hover:text-emerald-400">
                                <Coffee size={16} className="mr-2" /> {t('editor.types.rest')}
                            </Button>
                        </div>
                        <Button type="submit" variant="giant" className="w-full bg-white text-black hover:bg-zinc-200 shadow-xl shadow-white/5">
                            {t('editor.saveMission')}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};
