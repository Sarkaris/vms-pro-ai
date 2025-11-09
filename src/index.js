import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Add React Router future flags
window.__reactRouterFutureFlags = {
  v7_startTransition: true,
  v7_relativeSplatPath: true
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
