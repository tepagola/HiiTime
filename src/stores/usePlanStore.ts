
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Plan, STORAGE_KEY } from '../types/models';

interface SessionState {
    isActive: boolean;
    currentExerciseIndex: number;
    currentRound: number;
    isPaused: boolean;
}

interface PlanStore {
    currentPlan: Plan | null;
    session: SessionState | null;

    // Actions
    savePlan: (plan: Plan) => void;
    clearPlan: () => void;
    startSession: () => void;
    updateSession: (updates: Partial<SessionState>) => void;
    resetSession: () => void;
    endSession: () => void;
}

const initialSession: SessionState = {
    isActive: false,
    currentExerciseIndex: 0,
    currentRound: 1,
    isPaused: true, // Start paused
};

export const usePlanStore = create<PlanStore>()(
    persist(
        (set) => ({
            currentPlan: null,
            session: null,

            savePlan: (plan) => set({ currentPlan: plan, session: null }), // Reset session on new plan

            clearPlan: () => set({ currentPlan: null, session: null }),

            startSession: () => set((state) => {
                if (!state.currentPlan) return {};
                // If session exists, resume it. Else create new.
                if (state.session) return { session: { ...state.session, isPaused: false, isActive: true } };
                return { session: { ...initialSession, isActive: true, isPaused: false } };
            }),

            updateSession: (updates) => set((state) => ({
                session: state.session ? { ...state.session, ...updates } : null
            })),

            resetSession: () => set({ session: initialSession }),

            endSession: () => set({ session: null }),
        }),
        {
            name: STORAGE_KEY,
        }
    )
);
