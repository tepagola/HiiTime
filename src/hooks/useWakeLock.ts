import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Hook to manage Screen Wake Lock API
 * Keeps the screen awake when active.
 */
export const useWakeLock = () => {
    const [isLocked, setIsLocked] = useState(false);
    const wakeLockRef = useRef<WakeLockSentinel | null>(null);

    const requestWakeLock = useCallback(async () => {
        if ('wakeLock' in navigator) {
            try {
                const wakeLock = await navigator.wakeLock.request('screen');
                wakeLockRef.current = wakeLock;
                setIsLocked(true);

                wakeLock.addEventListener('release', () => {
                    setIsLocked(false);
                    wakeLockRef.current = null;
                });
            } catch (err: any) {
                console.error(`${err.name}, ${err.message}`);
                setIsLocked(false);
            }
        }
    }, []);

    const releaseWakeLock = useCallback(async () => {
        if (wakeLockRef.current) {
            try {
                await wakeLockRef.current.release();
                wakeLockRef.current = null;
                setIsLocked(false);
            } catch (err: any) {
                console.error(`${err.name}, ${err.message}`);
            }
        }
    }, []);

    // Re-acquire lock when visibility changes
    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (wakeLockRef.current !== null && document.visibilityState === 'visible') {
                await requestWakeLock();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [requestWakeLock]);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (wakeLockRef.current) {
                releaseWakeLock();
            }
        };
    }, [releaseWakeLock]);

    return {
        isLocked,
        request: requestWakeLock,
        release: releaseWakeLock,
    };
};
