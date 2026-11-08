// useAnimatedBackground.js
import { useEffect } from 'react';

export const useAnimatedBackground = (isActive = true) => {
    useEffect(() => {
        const body = document.body;
        
        if (isActive) {
            body.classList.add('has-animated-background');
        } else {
            body.classList.remove('has-animated-background');
        }
        
        return () => {
            body.classList.remove('has-animated-background');
        };
    }, [isActive]);
};
