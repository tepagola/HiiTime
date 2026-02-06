import React from 'react';
import { usePlanStore } from '../stores/usePlanStore';

export const Layout = ({ children }: { children: React.ReactNode }) => {
    const { currentPlan, clearPlan } = usePlanStore();

    return (
        <div className="flex flex-col min-h-screen bg-transparent text-foreground font-sans selection:bg-brand-neon selection:text-black">
            <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-xl">
                <div className="flex items-center gap-2">
                    <img src="/icon.svg" alt="HiiTime Logo" className="w-8 h-8 rounded shadow-lg shadow-brand-neon/20" />
                    <h1 className="text-xl font-bold tracking-tight text-white uppercase italic">HiiTime</h1>
                </div>
                {currentPlan && (
                    <button
                        onClick={() => {
                            if (window.confirm('Are you sure you want to delete this plan?')) {
                                clearPlan();
                            }
                        }}
                        className="text-xs font-mono uppercase tracking-widest text-zinc-500 hover:text-red-400 transition-colors"
                    >
                        New Mission
                    </button>
                )}
            </header>
            <main className="flex-1 flex flex-col p-4 md:p-6 max-w-lg mx-auto w-full pt-24">
                {children}
            </main>
        </div>
    );
};
