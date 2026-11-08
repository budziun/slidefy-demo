import React from 'react';
import './AnimatedBackground.css';

const AnimatedBackgroundWrapper = ({ children, hideBackground = false }) => {
    return (
        <>
            {!hideBackground && (
                <div 
                    className="animated-bg-layer"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        width: '100%',
                        height: '100%',
                        minHeight: '100dvh',
                        zIndex: 0,
                        background: `
                            radial-gradient(at 20% 80%, #3d29ff 0px, transparent 50%),
                             radial-gradient(at 80% 20%, #7f31ff 0px, transparent 50%),
                            radial-gradient(at 40% 40%, #8dff92 0px, transparent 50%),
                            radial-gradient(at 96% 10%, rgb(30, 58, 138) 0px, transparent 50%),
                            radial-gradient(at 42% 20%, rgb(91, 33, 182) 0px, transparent 50%),
                            radial-gradient(at 0% 50%, #5c7cfa 0px, transparent 50%),

                            #1e1b4b
                        `,
                        backgroundSize: '200% 200%',
                        backgroundPosition: '0% 0%, 100% 100%, 50% 50%, 0% 50%, 42% 20%, 4% 49%',
                        animation: 'gradientShift 15s ease-in-out infinite alternate',
                        pointerEvents: 'none'
                    }}
                />
            )}
            {children}
        </>
    );
};

export default AnimatedBackgroundWrapper;
