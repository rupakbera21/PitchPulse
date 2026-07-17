"use client";

import { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ControlRoomLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/control-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (res.ok) {
        router.push('/control-room');
      } else {
        setError('Incorrect password');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden z-0">
      <div className="fixed inset-0 -z-10 moving-gradient-bg" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-danger/20 via-transparent to-transparent pointer-events-none" />
      
      <form onSubmit={handleLogin} className="relative z-10 w-full max-w-md bg-secondary/80 backdrop-blur border border-primary/20 p-8 rounded-2xl shadow-2xl">
        <div className="flex justify-center mb-6 text-primary">
          <ShieldAlert size={48} />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-widest text-center mb-2">Control Room</h1>
        <p className="text-foreground/50 text-center mb-6 uppercase tracking-widest text-xs">Authorized Personnel Only</p>
        
        <div className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-lg text-center shadow-[inset_0_0_15px_rgba(0,210,106,0.1)]">
          <p className="text-[10px] text-primary/80 font-mono uppercase tracking-widest mb-1">Prototype Access Code</p>
          <p className="text-lg font-bold font-mono tracking-[0.2em] text-primary select-all">admin2026</p>
        </div>

        <input 
          type="password"
          placeholder="ACCESS CODE"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-background border border-primary/30 rounded px-4 py-3 mb-4 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary font-mono"
        />
        
        {error && <p className="text-danger text-xs font-mono uppercase text-center mb-4">{error}</p>}
        
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/80 text-background font-bold uppercase tracking-widest py-3 rounded transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Authenticating...' : 'Initialize'}
        </button>
      </form>
    </div>
  );
}
