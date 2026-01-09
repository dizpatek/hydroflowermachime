import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log('Application starting...');

const container = document.getElementById('root');
if (container) {
  console.log('Root container found, creating React root...');
  const root = createRoot(container);

  try {
    console.log('Rendering App component...');
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('App rendered successfully');
  } catch (error) {
    console.error('Error rendering app:', error);
    container.innerHTML = `
      <div style="color: white; padding: 20px; font-family: monospace;">
        <h1>Application Error</h1>
        <pre>${error}</pre>
      </div>
    `;
  }
} else {
  console.error('Root container not found!');
}