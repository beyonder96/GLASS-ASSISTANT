
import React, { useState, useEffect } from 'react';

export const Greeting: React.FC = () => {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting('Bom dia');
    else if (hour >= 12 && hour < 18) setGreeting('Boa tarde');
    else setGreeting('Boa noite');
  }, []);

  return (
    <div className="mt-12 mb-10 px-4 animate-in fade-in slide-in-from-left duration-1000">
      <h1 className="text-5xl font-extralight text-slate-900 tracking-tighter">
        {greeting}, <span className="font-black">Kenned</span>
      </h1>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mt-6 ml-1">
        Aura está sincronizada
      </p>
    </div>
  );
};
