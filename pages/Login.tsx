
import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Briefcase, FileDigit, Lock, Scale, Sparkles, Link as LinkIcon, ShieldCheck } from 'lucide-react';
import { Role } from '../types';
import { playSound } from '../services/audioSystem';

const GlassLogoAnimation = () => {
    const [animationPhase, setPhase] = useState<'SHATTERED' | 'CHAINS' | 'HELM' | 'SCALES'>('SHATTERED');
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer1 = setTimeout(() => setPhase('CHAINS'), 800);
        const timer2 = setTimeout(() => setPhase('HELM'), 3000);
        const timer3 = setTimeout(() => setPhase('SCALES'), 6000);
        
        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const x = (e.clientX - (rect.left + rect.width / 2)) / 25;
                const y = (e.clientY - (rect.top + rect.height / 2)) / 25;
                setMousePos({ x, y });
            }
        };

        window.addEventListener('mousemove', handleGlobalMouseMove);
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
            window.removeEventListener('mousemove', handleGlobalMouseMove);
        };
    }, []);

    return (
        <div ref={containerRef} className="relative h-64 sm:h-80 w-full flex items-center justify-center cursor-none">
            {/* Ice Shards - Parallax Effect */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(12)].map((_, i) => (
                    <div 
                        key={i}
                        className="absolute glass-shard opacity-40"
                        style={{
                            width: `${20 + (i * 5)}px`,
                            height: `${20 + (i * 5)}px`,
                            top: `${10 + (i * 7)}%`,
                            left: `${10 + (i * 7)}%`,
                            transform: `translate(${mousePos.x * (i * 0.2)}px, ${mousePos.y * (i * 0.2)}px) rotate(${i * 45}deg)`,
                            transition: 'transform 0.1s ease-out'
                        }}
                    />
                ))}
            </div>

            {/* Phase 1: Shattered Initial */}
            {animationPhase === 'SHATTERED' && (
                <div className="animate-ping bg-blue-100/30 w-32 h-32 rounded-full blur-xl"></div>
            )}

            {/* Phase 2: Chains Being Broken */}
            <div className={`absolute transition-all duration-700 flex flex-col items-center ${animationPhase === 'CHAINS' ? 'opacity-100 scale-100' : 'opacity-0 scale-150'}`}>
                <div className="flex items-center gap-0 relative">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 border-8 border-slate-300 rounded-full shadow-inner animate-pulse"></div>
                    <div className={`flex gap-1 transition-all duration-500 ${animationPhase === 'CHAINS' ? 'w-24 sm:w-32' : 'w-48 opacity-0'}`}>
                         <LinkIcon className={`h-6 w-6 sm:h-8 sm:w-8 text-slate-400 rotate-90 ${animationPhase === 'CHAINS' ? 'animate-shake' : ''}`} />
                         <LinkIcon className={`h-6 w-6 sm:h-8 sm:w-8 text-slate-400 rotate-90 scale-x-[-1] ${animationPhase === 'CHAINS' ? 'animate-shake' : ''}`} />
                    </div>
                    <div className="h-16 w-16 sm:h-20 sm:w-20 border-8 border-slate-300 rounded-full shadow-inner animate-pulse"></div>
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-1 h-32 bg-amber-400/80 blur-md animate-bounce"></div>
                    </div>
                </div>
                <p className="text-[10px] font-black text-slate-400 mt-4 tracking-[0.3em] uppercase">Breaking Injustice</p>
            </div>

            {/* Phase 3: HELM Text */}
            <div 
                className={`absolute transition-all duration-1000 flex items-center justify-center ${animationPhase === 'HELM' ? 'opacity-100 scale-110' : 'opacity-0 scale-50'}`}
                style={{ transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)` }}
            >
                <span className="text-6xl sm:text-8xl font-black logo-3d-gold drop-shadow-2xl">HELM</span>
                <div className="absolute inset-0 shimmer-text text-6xl sm:text-8xl font-black tracking-tighter opacity-30">HELM</div>
            </div>

            {/* Phase 4: Scales of Justice */}
            <div 
                className={`absolute transition-all duration-1000 ${animationPhase === 'SCALES' ? 'opacity-100 scale-125' : 'opacity-0 scale-50 rotate-45'}`}
                style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
            >
                <div className="relative group">
                    <Scale className="h-32 w-32 sm:h-44 sm:w-44 text-amber-500 drop-shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-transform group-hover:rotate-12" strokeWidth={1.5} />
                    <div className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-xl">
                        <Sparkles className="h-6 w-6 text-amber-400 animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Central Glow */}
            <div className="absolute h-64 w-64 bg-blue-400/10 rounded-full blur-[100px] -z-10"></div>
        </div>
    );
};

const Login = () => {
  const { login, currentUser, settings } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleLogin = (role: Role) => {
    login(role);
    navigate('/');
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden" dir="rtl">
      {/* Background Mist and Particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-200/20 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-amber-100/20 blur-[120px] rounded-full"></div>
          
          {[...Array(20)].map((_, i) => (
              <div 
                key={i}
                className="absolute bg-white/40 rounded-full blur-[1px] animate-float"
                style={{
                    width: Math.random() * 4 + 2 + 'px',
                    height: Math.random() * 4 + 2 + 'px',
                    top: Math.random() * 100 + '%',
                    left: Math.random() * 100 + '%',
                    animationDelay: Math.random() * 5 + 's',
                    animationDuration: Math.random() * 10 + 5 + 's'
                }}
              />
          ))}
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl z-10 relative px-4">
        <div className="flex justify-center mb-6">
            <GlassLogoAnimation />
        </div>
        <h2 className="text-center text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter drop-shadow-sm">
          {settings.general.officeNameAr}
        </h2>
        <div className="max-w-md mx-auto">
            <p className="text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-bold leading-relaxed mb-10">
                HELM Legal Office Manager is an all-in-one case, client, and accounting system built for modern law practices that demand efficiency, precision, and the cutting edge of AI-driven management.
            </p>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 relative">
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl p-6 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[40px] sm:rounded-[50px] border border-white/60 dark:border-slate-800 space-y-4">
          
          <div className="text-center mb-6 sm:mb-8">
              <span className="bg-blue-100/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-blue-200 dark:border-blue-800">
                Secure Access Gateway
              </span>
          </div>
          
          <button 
            onClick={() => handleLogin('ADMIN')} 
            onMouseEnter={() => playSound('hover')}
            className="w-full flex items-center p-4 sm:p-5 rounded-3xl transition-all icy-button dark:bg-slate-800/80 group active:scale-95"
          >
            <div className="h-12 w-12 sm:h-14 sm:w-14 bg-amber-100 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center group-hover:bg-amber-500 transition-all duration-500">
                <UserCheck className="h-6 w-6 sm:h-7 sm:w-7 text-amber-600 dark:text-amber-400 group-hover:text-white" />
            </div>
            <div className="mr-4 sm:mr-6 text-right">
                <h3 className="text-md sm:text-lg font-black text-slate-800 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400">المستشار أحمد حلمي</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Executive Director</p>
            </div>
          </button>

          <button 
            onClick={() => handleLogin('ASSISTANT')} 
            onMouseEnter={() => playSound('hover')}
            className="w-full flex items-center p-4 sm:p-5 rounded-3xl transition-all icy-button dark:bg-slate-800/80 group active:scale-95"
          >
            <div className="h-12 w-12 sm:h-14 sm:w-14 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center group-hover:bg-blue-500 transition-all duration-500">
                <Briefcase className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600 dark:text-blue-400 group-hover:text-white" />
            </div>
            <div className="mr-4 sm:mr-6 text-right">
                <h3 className="text-md sm:text-lg font-black text-slate-800 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400">الفريق الإداري</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Operations Team</p>
            </div>
          </button>

          <button 
            onClick={() => handleLogin('ACCOUNTANT')} 
            onMouseEnter={() => playSound('hover')}
            className="w-full flex items-center p-4 sm:p-5 rounded-3xl transition-all icy-button dark:bg-slate-800/80 group active:scale-95"
          >
            <div className="h-12 w-12 sm:h-14 sm:w-14 bg-emerald-100 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500 transition-all duration-500">
                <FileDigit className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-600 dark:text-emerald-400 group-hover:text-white" />
            </div>
            <div className="mr-4 sm:mr-6 text-right">
                <h3 className="text-md sm:text-lg font-black text-slate-800 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400">المحاسبة المالية</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Financial Audit</p>
            </div>
          </button>

          <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-800 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-500" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">AES-256 Cloud Encryption Enabled</span>
              </div>
              <p className="text-[9px] text-slate-300 dark:text-slate-600 font-medium">Powered by HELM Legal AI v2.5</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
