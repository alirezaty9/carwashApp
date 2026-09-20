import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';

// ErrorBoundary بیرونی‌ترین لایه است تا هر خطای غیرمنتظره‌ای در هر جای برنامه
// به‌جای «پنجره‌ی سفید» یک پیامِ فارسی با دکمه‌ی «شروعِ دوباره» نشان دهد.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
