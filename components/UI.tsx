
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { playSound } from '../services/audioSystem';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost', icon?: LucideIcon }> = ({ className = '', variant = 'primary', icon: Icon, children, onClick, ...props }) => {
  const base = "inline-flex items-center justify-center px-4 py-3 sm:py-2 border text-sm font-bold rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all active:scale-95 touch-manipulation";
  const variants = {
    primary: "border-transparent text-white bg-brand-accent hover:opacity-90 focus:ring-brand-primary",
    secondary: "border-gray-200 text-slate-700 bg-white hover:bg-gray-50 focus:ring-slate-400",
    danger: "border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500",
    ghost: "border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900 shadow-none"
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      playSound('click');
      if (onClick) onClick(e);
  };

  return (
    <button 
        className={`${base} ${variants[variant]} ${className}`} 
        onClick={handleClick}
        {...props}
    >
      {Icon && <Icon className="ml-2 -mr-1 h-4 w-4" />}
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode, className?: string, title?: string, action?: React.ReactNode, onClick?: () => void }> = ({ children, className = '', title, action, onClick }) => (
  <div 
    className={`bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100 ${className}`}
    onClick={onClick}
  >
    {(title || action) && (
      <div className="px-5 py-4 sm:px-6 border-b border-gray-50 flex justify-between items-center">
        {title && <h3 className="text-md font-black text-slate-800 tracking-tight">{title}</h3>}
        {action && <div className="text-slate-400 hover:text-slate-600 transition-colors">{action}</div>}
      </div>
    )}
    <div className="px-5 py-5 sm:p-6">{children}</div>
  </div>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string, error?: string }> = ({ label, className = '', error, ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">{label}</label>}
    <input
      className={`shadow-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent block w-full text-base sm:text-sm border-gray-200 rounded-xl p-3 border transition-all ${error ? 'border-red-300 ring-red-100 ring-2' : ''} ${className}`}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-600 font-bold">{error}</p>}
  </div>
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }> = ({ label, children, className = '', ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">{label}</label>}
    <select
      className={`shadow-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent block w-full text-base sm:text-sm border-gray-200 rounded-xl p-3 border transition-all bg-white appearance-none ${className}`}
      {...props}
    >
      {children}
    </select>
  </div>
);

export const Switch: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void }> = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between py-3">
    <span className="flex-grow flex flex-col">
      <span className="text-sm font-bold text-slate-800">{label}</span>
    </span>
    <button
      type="button"
      className={`${
        checked ? 'bg-brand-accent' : 'bg-gray-200'
      } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent`}
      role="switch"
      aria-checked={checked}
      onClick={() => { playSound('click'); onChange(!checked); }}
    >
      <span
        aria-hidden="true"
        className={`${
          checked ? 'translate-x-5' : 'translate-x-0'
        } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
      />
    </button>
  </div>
);

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed z-[100] inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end sm:items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom sm:align-middle bg-white rounded-t-[32px] sm:rounded-[32px] text-right overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:max-w-xl sm:w-full w-full animate-in fade-in slide-in-from-bottom sm:zoom-in duration-300">
          <div className="bg-white px-6 pt-6 pb-6 sm:px-8 sm:pt-8 sm:pb-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg sm:text-xl font-black text-slate-900" id="modal-title">{title}</h3>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                    <X className="h-5 w-5" />
                </button>
            </div>
            <div className="mt-2 text-right">{children}</div>
          </div>
          <div className="bg-slate-50 px-6 py-4 sm:px-8 sm:flex sm:flex-row-reverse border-t border-slate-100">
            <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto">إلغاء</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
import { X } from 'lucide-react';

export const Badge: React.FC<{ color: string; children: React.ReactNode; className?: string }> = ({ color, children, className = '' }) => {
    let classes = "bg-slate-100 text-slate-700";
    if (color === 'green') classes = "bg-emerald-50 text-emerald-700 border border-emerald-100";
    if (color === 'red') classes = "bg-rose-50 text-rose-700 border border-rose-100";
    if (color === 'blue') classes = "bg-blue-50 text-blue-700 border border-blue-100";
    if (color === 'yellow') classes = "bg-amber-50 text-amber-700 border border-amber-100";
    if (color === 'indigo') classes = "bg-indigo-50 text-indigo-700 border border-indigo-100";
  
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${classes} ${className}`}>
        {children}
      </span>
    );
  };
