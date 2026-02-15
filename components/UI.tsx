
import React from 'react';
import { LucideIcon, X } from 'lucide-react';
import { playSound } from '../services/audioSystem';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost', icon?: LucideIcon }> = ({ className = '', variant = 'primary', icon: Icon, children, onClick, ...props }) => {
  const base = "inline-flex items-center justify-center px-8 py-4 border-2 text-sm font-black rounded-[20px] transition-all active:scale-95 transform shadow-3d-md hover:shadow-3d-lg";
  const variants = {
    primary: "bg-slate-900 text-white border-slate-950 hover:bg-slate-800",
    secondary: "bg-white text-slate-700 border-slate-100 hover:bg-slate-50",
    danger: "bg-rose-600 text-white border-rose-700 hover:bg-rose-700",
    ghost: "bg-transparent text-slate-500 border-transparent hover:bg-slate-100 shadow-none"
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} onClick={(e) => { playSound('click'); onClick?.(e); }} {...props}>
      {Icon && <Icon className="ml-2 h-5 w-5" />}
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode, className?: string, title?: string, action?: React.ReactNode, onClick?: () => void }> = ({ children, className = '', title, action, onClick }) => (
  <div 
    className={`bg-white/90 backdrop-blur-md rounded-[38px] card-3d overflow-hidden ${className}`}
    onClick={onClick}
  >
    {(title || action) && (
      <div className="px-10 py-7 border-b-2 border-slate-50 flex justify-between items-center bg-slate-50/20">
        {title && <h3 className="text-lg font-black text-slate-900 tracking-tight">{title}</h3>}
        {action && <div className="text-slate-400">{action}</div>}
      </div>
    )}
    <div className="px-10 py-10">{children}</div>
  </div>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string, error?: string }> = ({ label, className = '', error, ...props }) => (
  <div className="mb-6">
    {label && <label className="block text-xs font-black text-slate-500 mb-3 uppercase tracking-widest mr-2">{label}</label>}
    <input
      className={`block w-full text-base sm:text-sm p-4 font-bold transition-all outline-none ${error ? 'border-rose-400' : ''} ${className}`}
      {...props}
    />
    {error && <p className="mt-2 text-xs text-rose-600 font-bold mr-2">{error}</p>}
  </div>
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }> = ({ label, children, className = '', ...props }) => (
  <div className="mb-6">
    {label && <label className="block text-xs font-black text-slate-500 mb-3 uppercase tracking-widest mr-2">{label}</label>}
    <select
      className={`block w-full text-base sm:text-sm p-4 font-bold transition-all appearance-none cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </select>
  </div>
);

export const Switch: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void }> = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between py-5 px-3 bg-white/50 rounded-2xl border border-slate-50 shadow-sm mb-4">
    <span className="text-sm font-black text-slate-700">{label}</span>
    <button
      type="button"
      className={`${checked ? 'bg-slate-900' : 'bg-slate-200'} relative inline-flex h-8 w-14 border-2 border-transparent rounded-full cursor-pointer transition-colors duration-300 shadow-inner`}
      onClick={() => { playSound('click'); onChange(!checked); }}
    >
      <span className={`${checked ? 'translate-x-6' : 'translate-x-0'} inline-block h-7 w-7 rounded-full bg-white shadow-lg transform transition duration-300`} />
    </button>
  </div>
);

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed z-[100] inset-0 overflow-y-auto px-4 py-10" dir="rtl">
      <div className="flex items-center justify-center min-h-screen">
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" onClick={onClose}></div>
        <div className="relative bg-white rounded-[45px] shadow-3xl transform transition-all max-w-3xl w-full p-12 card-3d border-2 border-white/80 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-black text-slate-900 leading-none">{title}</h3>
                <button onClick={onClose} className="p-4 hover:bg-slate-100 rounded-full text-slate-400 transition-all active:scale-90">
                    <X className="h-8 w-8" />
                </button>
            </div>
            <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

export const Badge: React.FC<{ color: string; children: React.ReactNode; className?: string }> = ({ color, children, className = '' }) => {
    let classes = "bg-slate-100 text-slate-800";
    if (color === 'green') classes = "bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm";
    if (color === 'red') classes = "bg-rose-100 text-rose-800 border border-rose-200 shadow-sm";
    if (color === 'blue') classes = "bg-sky-100 text-sky-800 border border-sky-200 shadow-sm";
    if (color === 'yellow') classes = "bg-amber-100 text-amber-800 border border-amber-200 shadow-sm";
  
    return (
      <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider ${classes} ${className}`}>
        {children}
      </span>
    );
};
