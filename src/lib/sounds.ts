export class SoundManager {
    private ctx: AudioContext | null = null;
    private isMuted: boolean = false;

    constructor() {
        // Initialize AudioContext only on user interaction if possible, 
        // but we can set it up lazily.
        try {
            // @ts-ignore
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        } catch (e) {
            console.error("Web Audio API not supported", e);
        }
    }

    private getContext(): AudioContext | null {
        if (!this.ctx) return null;
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        return this.ctx;
    }

    private playTone(frequency: number, type: OscillatorType, duration: number, startTime: number = 0) {
        const ctx = this.getContext();
        if (!ctx || this.isMuted) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, ctx.currentTime + startTime);

        gain.gain.setValueAtTime(0.1, ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + duration);
    }

    playTick() {
        this.playTone(880, 'sine', 0.1); // High beep
    }

    playStart() {
        // Rising tone
        this.playTone(440, 'triangle', 0.1, 0);
        this.playTone(880, 'triangle', 0.4, 0.1);
    }

    playRest() {
        // Falling tone
        this.playTone(440, 'sine', 0.3, 0);
        this.playTone(220, 'sine', 0.4, 0.2);
    }

    playComplete() {
        // Victory fanfare-ish
        const now = 0;
        this.playTone(523.25, 'triangle', 0.2, now);       // C5
        this.playTone(659.25, 'triangle', 0.2, now + 0.2); // E5
        this.playTone(783.99, 'triangle', 0.2, now + 0.4); // G5
        this.playTone(1046.50, 'triangle', 0.6, now + 0.6); // C6
    }
}

export const soundManager = new SoundManager();
