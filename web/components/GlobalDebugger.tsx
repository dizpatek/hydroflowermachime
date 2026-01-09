import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GlobalDebugger: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const location = useLocation();
    const [token, setToken] = useState<string | null>(null);
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

    useEffect(() => {
        const updateToken = () => {
            setToken(localStorage.getItem('token'));
        };

        // Initial check
        updateToken();

        // Listen for storage events (if updated in another tab)
        window.addEventListener('storage', updateToken);

        // Custom event listener if you emit one on login
        window.addEventListener('auth-change', updateToken);

        // Resize listener
        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener('resize', handleResize);

        // Poll for token changes slightly more aggressively for debugging
        const interval = setInterval(updateToken, 1000);

        return () => {
            window.removeEventListener('storage', updateToken);
            window.removeEventListener('auth-change', updateToken);
            window.removeEventListener('resize', handleResize);
            clearInterval(interval);
        };
    }, []);

    if (process.env.NODE_ENV === 'production' && !isVisible) {
        // In production, keep it hidden by default but allow toggling via a secret sequence or small trigger if needed.
        // For now, we'll just show a small toggle button.
    }

    const toggleVisibility = () => setIsVisible(!isVisible);

    return (
        <div style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            zIndex: 9999,
            fontFamily: 'monospace',
            fontSize: '12px',
        }}>
            {!isVisible ? (
                <button
                    onClick={toggleVisibility}
                    style={{
                        background: 'rgba(0,0,0,0.7)',
                        color: '#0f0',
                        border: '1px solid #0f0',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    🐞 Debug
                </button>
            ) : (
                <div style={{
                    background: 'rgba(0,0,0,0.85)',
                    color: '#0f0',
                    border: '1px solid #0f0',
                    padding: '15px',
                    borderRadius: '8px',
                    width: '300px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #333', paddingBottom: '5px' }}>
                        <strong>System Debugger</strong>
                        <button onClick={toggleVisibility} style={{ background: 'transparent', border: 'none', color: '#ff5555', cursor: 'pointer' }}>✕</button>
                    </div>

                    <div style={{ marginBottom: '5px' }}>
                        <span style={{ color: '#888' }}>Path:</span> {location.pathname}
                    </div>

                    <div style={{ marginBottom: '5px' }}>
                        <span style={{ color: '#888' }}>Window:</span> {windowSize.width}x{windowSize.height}
                    </div>

                    <div style={{ marginBottom: '5px' }}>
                        <span style={{ color: '#888' }}>Env:</span> {import.meta.env.MODE || process.env.NODE_ENV}
                    </div>

                    <div style={{ marginBottom: '5px' }}>
                        <span style={{ color: '#888' }}>API Url:</span> {import.meta.env.VITE_API_URL || 'Not Set'}
                    </div>

                    <div style={{ marginBottom: '5px' }}>
                        <span style={{ color: '#888' }}>Auth Token:</span>
                        {token ? (
                            <span style={{ color: '#4caf50' }}> Present ({token.substring(0, 8)}...)</span>
                        ) : (
                            <span style={{ color: '#ff5555' }}> Missing</span>
                        )}
                    </div>

                    <div style={{ marginTop: '10px', borderTop: '1px solid #333', paddingTop: '5px' }}>
                        <button
                            onClick={() => { localStorage.clear(); window.location.reload(); }}
                            style={{
                                background: '#aa0000',
                                color: 'white',
                                border: 'none',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '10px'
                            }}
                        >
                            Clear Storage & Reload
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GlobalDebugger;
