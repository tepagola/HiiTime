import { useEffect, useState, useRef } from 'react';
import { usePlanStore } from '../stores/usePlanStore';
import { Button } from '../components/ui/button';
import { Play, Pause, SkipForward, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { soundManager } from '../lib/sounds';

export const WorkoutRunner = () => {
    const { currentPlan, session, updateSession } = usePlanStore();
    const [timeLeft, setTimeLeft] = useState(0);

    // Refs for preventing double-fires if strict mode is on
    const timerRef = useRef<number | undefined>(undefined);

    if (!currentPlan || !session) return null;

    const currentExercise = currentPlan.exercises[session.currentExerciseIndex];
    const isLastExercise = session.currentExerciseIndex === currentPlan.exercises.length - 1;
    const isLastRound = session.currentRound === currentPlan.rounds;

    // Initialize timer
    useEffect(() => {
        if (currentExercise.type !== 'reps') {
            setTimeLeft(currentExercise.duration || 0);
        } else {
            setTimeLeft(0);
        }

        // Play start sound if we are auto-advancing and active (not initial load if paused)
        if (session.isActive && !session.isPaused) {
            if (currentExercise.type === 'rest') {
                soundManager.playRest();
            } else {
                soundManager.playStart();
            }
        }
    }, [session.currentExerciseIndex, currentExercise, session.currentRound]);

    // Timer Interval
    useEffect(() => {
        if (session.isActive && !session.isPaused && currentExercise.type !== 'reps' && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    const newValue = prev - 1;

                    // Sound cues
                    if (newValue <= 3 && newValue > 0) {
                        soundManager.playTick();
                    }
                    if (newValue === 0) {
                        handleNext();
                    }
                    return newValue;
                });
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [session.isActive, session.isPaused, currentExercise, timeLeft]);

    const handleNext = () => {
        if (isLastExercise) {
            if (isLastRound) {
                soundManager.playComplete();
                updateSession({ isActive: false, isPaused: true });
                // We don't call endSession() yet, so Summary view picks it up based on indices
            } else {
                // Next Round
                updateSession({
                    currentRound: session.currentRound + 1,
                    currentExerciseIndex: 0,
                });
            }
        } else {
            // Next Exercise
            updateSession({
                currentExerciseIndex: session.currentExerciseIndex + 1,
            });
        }
    };

    const togglePause = () => {
        updateSession({ isPaused: !session.isPaused });
    };

    // Circular Progress Math
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = currentExercise.type === 'reps'
        ? 0
        : circumference - ((timeLeft / (currentExercise.duration || 1)) * circumference);

    return (
        <div className="flex flex-col h-full bg-transparent text-white">

            {/* Header / Info */}
            <div className="flex justify-between items-center py-4 mb-4">
                <div>
                    <span className="text-zinc-500 text-sm font-mono tracking-widest uppercase">Round</span>
                    <div className="text-2xl font-bold font-mono">
                        {session.currentRound} <span className="text-zinc-600">/ {currentPlan.rounds}</span>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-zinc-500 text-sm font-mono tracking-widest uppercase">Next</span>
                    <div className="text-lg font-medium text-zinc-300 truncate max-w-[150px]">
                        {!isLastExercise
                            ? currentPlan.exercises[session.currentExerciseIndex + 1].name
                            : (isLastRound ? 'Finish' : 'Next Round')}
                    </div>
                </div>
            </div>

            {/* Main Visualizer */}
            <div className="flex-1 flex flex-col items-center justify-center relative min-h-[350px]">

                {/* Rings */}
                <div className="relative flex items-center justify-center">
                    {/* Background Ring */}
                    <svg className="transform -rotate-90 w-80 h-80 drop-shadow-2xl">
                        <circle
                            className="text-zinc-800/50"
                            strokeWidth="12"
                            stroke="currentColor"
                            fill="transparent"
                            r={radius}
                            cx="160"
                            cy="160"
                        />
                        {/* Progress Ring */}
                        {currentExercise.type !== 'reps' && (
                            <circle
                                className={cn(
                                    "transition-all duration-1000 ease-linear",
                                    currentExercise.type === 'rest' ? "text-brand-neon" :
                                        currentExercise.type === 'timer' ? "text-brand-accent" : "text-orange-500"
                                )}
                                strokeWidth="12"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r={radius}
                                cx="160"
                                cy="160"
                            />
                        )}
                    </svg>

                    {/* Center Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className={cn(
                            "text-7xl font-black tabular-nums tracking-tighter text-shadow",
                            currentExercise.type === 'rest' ? "text-brand-neon" : "text-white"
                        )}>
                            {currentExercise.type === 'reps' ? (
                                <div className="flex flex-col items-center">
                                    <span>{currentExercise.reps}</span>
                                    <span className="text-2xl text-zinc-500 font-medium -mt-2">REPS</span>
                                </div>
                            ) : (
                                timeLeft
                            )}
                        </div>
                    </div>
                </div>

                {/* Exercise Name */}
                <div className="mt-8 text-center space-y-2 max-w-sm">
                    <h2 className={cn(
                        "text-3xl md:text-4xl font-bold leading-tight",
                        currentExercise.type === 'rest' ? "text-zinc-400" : "text-white"
                    )}>
                        {currentExercise.name}
                    </h2>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                        <span className={cn(
                            "w-2 h-2 rounded-full animate-pulse",
                            currentExercise.type === 'rest' ? "bg-brand-neon" :
                                currentExercise.type === 'timer' ? "bg-brand-accent" : "bg-orange-500"
                        )} />
                        <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                            {currentExercise.type}
                        </span>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="pt-8 pb-4">
                {currentExercise.type === 'reps' ? (
                    <Button
                        variant="giant"
                        onClick={handleNext}
                        className="w-full bg-brand-neon text-black hover:bg-brand-neon/90 hover:scale-[1.02] transition-all shadow-[0_0_30px_-5px_var(--tw-colors-brand-neon)] border-none"
                    >
                        <CheckCircle className="mr-3 h-8 w-8" />
                        <span className="text-2xl font-black tracking-wide">COMPLETE</span>
                    </Button>
                ) : (
                    <div className="grid grid-cols-5 gap-4">
                        <div className="col-span-3">
                            <Button
                                variant="giant"
                                className={cn(
                                    "w-full h-24 border-none transition-all duration-300 shadow-xl",
                                    session.isPaused
                                        ? "bg-brand-neon text-black hover:bg-brand-neon/90"
                                        : "bg-white/10 hover:bg-white/20 text-white backdrop-blur-md"
                                )}
                                onClick={togglePause}
                            >
                                {session.isPaused ? (
                                    <div className="flex items-center gap-3">
                                        <Play className="h-8 w-8 fill-current" />
                                        <span className="text-xl font-bold">RESUME</span>
                                    </div>
                                ) : (
                                    <Pause className="h-10 w-10 fill-current" />
                                )}
                            </Button>
                        </div>

                        <div className="col-span-2">
                            <Button
                                variant="giant"
                                className="w-full h-24 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 border border-zinc-700/50"
                                onClick={handleNext}
                            >
                                <SkipForward className="h-8 w-8" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
