
import { useEffect, useState } from 'react';
import { Layout } from './components/Layout';
import { PlanEditor } from './views/PlanEditor';
import { WorkoutRunner } from './views/WorkoutRunner';
import { Summary } from './views/Summary';
import { usePlanStore } from './stores/usePlanStore';
import { Button } from './components/ui/button';
import { Play } from 'lucide-react';

function App() {
    const { currentPlan, session, startSession, isEditing, editPlan } = usePlanStore();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null; // Hydration fix

    // Helper to determine view
    const renderView = () => {
        if (!currentPlan || isEditing) {
            return <PlanEditor />;
        }

        if (!session) {
            // Plan exists but session not started. Show "Ready" screen or reuse Editor in read-only?
            // MVP: Show "Ready to Start" with big button.
            return (
                <div className="flex flex-col items-center justify-center h-full space-y-8 py-12 animate-fade-in">
                    <div className="text-center space-y-2">
                        <span className="text-sm font-mono uppercase tracking-widest text-brand-accent">Ready to Start</span>
                        <h2 className="text-4xl font-bold text-white tracking-tight">{currentPlan.name}</h2>
                    </div>

                    <div className="space-y-4 w-full">
                        <div className="glass p-6 rounded-2xl flex justify-between items-center border border-white/5 bg-zinc-900/40">
                            <span className="text-zinc-400 font-medium">Rounds</span>
                            <span className="text-2xl font-bold font-mono">{currentPlan.rounds}</span>
                        </div>
                        <div className="glass p-6 rounded-2xl flex justify-between items-center border border-white/5 bg-zinc-900/40">
                            <span className="text-zinc-400 font-medium">Stations</span>
                            <span className="text-2xl font-bold font-mono">{currentPlan.exercises.length}</span>
                        </div>
                        <div className="bg-brand-neon/5 border border-brand-neon/20 p-4 rounded-xl text-center">
                            <span className="text-brand-neon text-sm font-bold uppercase tracking-widest">Get Ready!</span>
                        </div>
                    </div>

                    <div className="w-full flex flex-col gap-3">
                        <Button variant="giant" onClick={startSession} className="w-full bg-white text-black hover:bg-zinc-200 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
                            <Play className="mr-3 h-8 w-8 fill-current" /> <span className="text-xl font-bold tracking-wide">START MISSION</span>
                        </Button>
                        <Button variant="outline" onClick={editPlan} className="w-full border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 py-4 h-auto">
                            Edit Routine
                        </Button>
                    </div>
                </div>
            );
        }

        // Check for completion
        // This logic in WorkoutRunner was: 
        // if (isLastRound) { updateSession({ isActive: false, isPaused: true }); }
        // So if inactive but plan exists and we were runnning... 

        // Actually, checking "currentRound > rounds" is cleaner. 
        // Let's rely on WorkoutRunner logic. 
        // If I hit finish in WorkoutRunner, I should probably set a distinct flag in session or store.

        // Let's modify logic: if session is !isActive but has progress, it might be paused OR finished.
        // Ideally store should have 'isFinished'.
        // For now: I'll use a local check. If round == rounds and index == lastIndex and !isActive... it's likely finished. 
        // BUT what if I just paused at the end? 
        // Let's add 'isFinished' to session interface in store or just deduce it better.
        // I entered 'updateSession({ isActive: false })' on finish.
        // The initial session has 'isActive: false, isPaused: true'.
        // So 'isActive' false usually means "not running".

        // To distinguish "Ready to Start" from "Finished", we can look at indices.
        if (session.currentRound === currentPlan.rounds &&
            session.currentExerciseIndex === currentPlan.exercises.length - 1 &&
            !session.isActive) {
            return <Summary />;
        }

        // Default: Run workout
        return <WorkoutRunner />;
    };

    return (
        <Layout>
            {renderView()}
        </Layout>
    );
}

export default App;
