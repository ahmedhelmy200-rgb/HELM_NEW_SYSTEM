
import React from 'react';
import { LucideIcon, X } from 'lucide-react';
import { playSound } from '../services/audioSystem';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost', icon?: LucideIcon }> = ({ className = '', variant = 'primary', icon: Icon, children, onClick, ...props }) => {
  const base = "inline-flex items-center justify-center px-6 py-3 border text-sm font-black rounded-2xl transition-all active:scale-95 touch-manipulation transform card-depth";
  const variants = {
    primary: "bg-slate-900 text-white border-slate-950 hover:bg-slate-800 shadow-3d",
    secondary: "bg-white text-slate-700 border-slate-100 hover:bg-slate-50 shadow-3d",
    danger: "bg-rose-600 text-white border-rose-700 hover:bg-rose-700 shadow-3d",
    ghost: "bg-transparent text-slate-500 border-transparent hover:bg-slate-100 hover:text-slate-900 shadow-none border-b-0 border-r-0 transform-none"
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      playSound('click');
      if (onClick) onClick(e);
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} onClick={handleClick} {...props}>
      {Icon && <Icon className="ml-2 h-4 w-4" />}
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode, className?: string, title?: string, action?: React.ReactNode, onClick?: () => void }> = ({ children, className = '', title, action, onClick }) => (
  <div 
    className={`bg-white/80 backdrop-blur-md overflow-hidden rounded-[32px] border border-white/50 card-depth shadow-3d ${className}`}
    onClick={onClick}
  >
    {(title || action) && (
      <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
        {title && <h3 className="text-base font-black text-slate-900 tracking-tight">{title}</h3>}
        {action && <div className="text-slate-400">{action}</div>}
      </div>
    )}
    <div className="px-8 py-8">{children}</div>
  </div>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string, error?: string }> = ({ label, className = '', error, ...props }) => (
  <div className="mb-6">
    {label && <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest mr-1">{label}</label>}
    <input
      className={`block w-full text-base sm:text-sm border-slate-200 rounded-2xl p-4 transition-all placeholder-slate-300 font-bold ${error ? 'border-rose-300 ring-rose-50 ring-4' : ''} ${className}`}
      {...props}
    />
    {error && <p className="mt-2 text-xs text-rose-600 font-bold mr-1">{error}</p>}
  </div>
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }> = ({ label, children, className = '', ...props }) => (
  <div className="mb-6">
    {label && <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest mr-1">{label}</label>}
    <select
      className={`block w-full text-base sm:text-sm border-slate-200 rounded-2xl p-4 transition-all font-bold appearance-none bg-no-repeat bg-[left_1rem_center] ${className}`}
      style={{backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundSize: '1rem'}}
      {...props}
    >
      {children}
    </select>
  </div>
);

export const Switch: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void }> = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between py-4 px-2">
    <span className="text-sm font-black text-slate-700">{label}</span>
    <button
      type="button"
      className={`${checked ? 'bg-slate-900' : 'bg-slate-200'} relative inline-flex h-7 w-12 border-2 border-transparent rounded-full cursor-pointer transition-colors duration-300 shadow-inner`}
      onClick={() => { playSound('click'); onChange(!checked); }}
    >
      <span className={`${checked ? 'translate-x-5' : 'translate-x-0'} inline-block h-6 w-6 rounded-full bg-white shadow-lg transform transition duration-300`} />
    </button>
  </div>
);

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed z-[100] inset-0 overflow-y-auto px-4 py-6" dir="rtl">
      <div className="flex items-center justify-center min-h-screen">
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={onClose}></div>
        <div className="relative bg-white/95 rounded-[40px] shadow-3xl transform transition-all max-w-2xl w-full p-10 card-depth border border-white/50 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-slate-900">{title}</h3>
                <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                    <X className="h-6 w-6" />
                </button>
            </div>
            <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

export const Badge: React.FC<{ color: string; children: React.ReactNode; className?: string }> = ({ color, children, className = '' }) => {
    let classes = "bg-slate-100 text-slate-700";
    if (color === 'green') classes = "bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm";
    if (color === 'red') classes = "bg-rose-50 text-rose-700 border border-rose-100 shadow-sm";
    if (color === 'blue') classes = "bg-sky-50 text-sky-700 border border-sky-100 shadow-sm";
    if (color === 'yellow') classes = "bg-amber-50 text-amber-700 border border-amber-100 shadow-sm";
    if (color === 'indigo') classes = "bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm";
  
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${classes} ${className}`}>
        {children}
      </span>
    );
  };
