
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
    isEditing: boolean;
    isNew: boolean;

    // Actions
    savePlan: (plan: Plan) => void;
    editPlan: () => void;
    clearPlan: () => void;
    startSession: () => void;
    updateSession: (updates: Partial<SessionState>) => void;
    resetSession: () => void;
    endSession: () => void;

    // Saved Plans
    savedPlans: Plan[];
    savePlanToLibrary: (plan: Plan) => boolean; // Returns true if saved, false if full (needs overwrite)
    overwritePlanInLibrary: (oldPlanId: string, newPlan: Plan) => void;
    deletePlanFromLibrary: (planId: string) => void;
    loadPlanFromLibrary: (planId: string) => void;
}

const initialSession: SessionState = {
    isActive: false,
    currentExerciseIndex: 0,
    currentRound: 1,
    isPaused: true, // Start paused
};

export const usePlanStore = create<PlanStore>()(
    persist(
        (set, get) => ({
            currentPlan: null,
            session: null,
            isEditing: false,
            isNew: false,
            savedPlans: [],

            savePlan: (plan: Plan) => set({
                currentPlan: plan,
                session: null,
                isEditing: false,
                isNew: false
            }),

            editPlan: () => set({ isEditing: true }),

            clearPlan: () => set({
                currentPlan: null,
                session: null,
                isEditing: true,
                isNew: true
            }),

            startSession: () => set((state) => {
                if (!state.currentPlan) return {};
                if (state.session) return {
                    session: { ...state.session, isPaused: false, isActive: true },
                    isEditing: false
                };
                return {
                    session: { ...initialSession, isActive: true, isPaused: false },
                    isEditing: false
                };
            }),

            updateSession: (updates: Partial<SessionState>) => set((state) => ({
                session: state.session ? { ...state.session, ...updates } : null
            })),

            resetSession: () => set({ session: initialSession }),

            endSession: () => set({ session: null }),

            // --- Saved Plans Actions ---

            savePlanToLibrary: (plan) => {
                const { savedPlans } = get();
                const existingIndex = savedPlans.findIndex(p => p.id === plan.id);

                if (existingIndex !== -1) {
                    // Plan exists, update it
                    const newSavedPlans = [...savedPlans];
                    newSavedPlans[existingIndex] = plan;
                    set({ savedPlans: newSavedPlans });
                    return true;
                }

                if (savedPlans.length >= 10) {
                    return false; // Storage full
                }

                set({ savedPlans: [...savedPlans, plan] });
                return true;
            },

            overwritePlanInLibrary: (oldPlanId, newPlan) => set((state) => ({
                savedPlans: state.savedPlans.map(p => p.id === oldPlanId ? newPlan : p)
            })),

            deletePlanFromLibrary: (planId) => set((state) => ({
                savedPlans: state.savedPlans.filter(p => p.id !== planId)
            })),

            loadPlanFromLibrary: (planId) => {
                const { savedPlans } = get();
                const planToLoad = savedPlans.find(p => p.id === planId);
                if (planToLoad) {
                    set({
                        currentPlan: { ...planToLoad }, // Copy to avoid ref issues
                        session: null, // Reset session
                        isEditing: false,
                        isNew: false
                    });
                }
            },
        }),
        {
            name: STORAGE_KEY,
            partialize: (state) => ({
                currentPlan: state.currentPlan,
                session: state.session,
                savedPlans: state.savedPlans, // Persist saved plans
            }),
        }
    )
);
