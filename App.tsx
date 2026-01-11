
import React, { useState, useEffect } from 'react';
import { BusinessConfig, ViewState } from './types';
import { INITIAL_BUSINESS_CONFIG } from './constants';
import Dashboard from './components/Dashboard';
import BookingPage from './components/BookingPage';

const App: React.FC = () => {
  const [config, setConfig] = useState<BusinessConfig>(() => {
    const saved = localStorage.getItem('bookme_config');
    return saved ? JSON.parse(saved) : INITIAL_BUSINESS_CONFIG;
  });

  const [view, setView] = useState<ViewState>('CUSTOMER_VIEW');

  useEffect(() => {
    localStorage.setItem('bookme_config', JSON.stringify(config));
  }, [config]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Toggle */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <button
          onClick={() => setView(v => v === 'CUSTOMER_VIEW' ? 'BUSINESS_DASHBOARD' : 'CUSTOMER_VIEW')}
          className="bg-slate-900 text-white px-4 py-3 rounded-full shadow-2xl hover:scale-105 transition-transform flex items-center gap-2 font-medium"
        >
          {view === 'CUSTOMER_VIEW' ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
              Admin Mode
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              Preview Booking
            </>
          )}
        </button>
      </div>

      {view === 'CUSTOMER_VIEW' ? (
        <BookingPage config={config} />
      ) : (
        <Dashboard config={config} onConfigChange={setConfig} />
      )}
    </div>
  );
};

export default App;
