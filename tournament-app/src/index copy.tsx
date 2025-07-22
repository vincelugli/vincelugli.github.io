import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 1. Find the root element in your public/index.html
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

// 2. Create a React root to render the application
const root = ReactDOM.createRoot(rootElement);

// 3. Render the main App component
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
