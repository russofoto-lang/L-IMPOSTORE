
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import DashboardView from './components/DashboardView';

const rootElement = document.getElementById('root');
if (rootElement) {
  const isDashboard = new URLSearchParams(window.location.search).has('dashboard');
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      {isDashboard ? <DashboardView /> : <App />}
    </StrictMode>
  );
}
