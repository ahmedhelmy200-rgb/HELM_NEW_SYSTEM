
import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './store';
import { HashRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { 
    LayoutDashboard, Users, Briefcase, FileText, DollarSign, Settings, 
    LogOut, Bell, CheckCircle, LucideIcon, Trash2, Database, Cloud, CloudOff, RefreshCw,
    ExternalLink, Globe, Menu, X
} from 'lucide-react';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientDetails from './pages/ClientDetails';
import Cases from './pages/Cases';
import Finance from './pages/Finance';
import Documents from './pages/Documents';
import RemindersPage from './pages/Reminders';
import SettingsPage from './pages/Settings';
import ImportCenter from './pages/ImportCenter';
import LegalHub from './pages/LegalHub';

const SidebarItem = ({ icon: Icon, label, to, active, onClick }: { icon: LucideIcon, label: string, to: string, active: boolean, onClick?: () => void }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center px-6 py-3 text-sm font-bold transition-all rounded-xl mx-2 my-0.5 ${active ? 'bg-brand-secondary text-brand-primary' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
  >
    <Icon className={`h-5 w-5 ml-3 ${active ? 'text-brand-accent' : ''}`} />
    {label}
  </Link>
);

const NotificationBell = () => {
    const { reminders, markReminderRead, markReminderDone } = useStore();
    const [isOpen, setIsOpen] = useState(false);
    
    const unreadCount = reminders.filter(r => !r.isRead && !r.isDone).length;
    const activeReminders = reminders.filter(r => !r.isDone).slice(0, 5);

    return (
        <div className="relative">
            <button 
                onClick={() => { setIsOpen(!isOpen); }}
                className="p-2 text-gray-400 hover:text-slate-600 focus:outline-none relative transition-transform active:scale-90"
            >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 block h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center font-bold ring-2 ring-white animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute left-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-4 bg-slate-50 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 text-sm">التنبيهات العاجلة</h3>
                            <Link to="/reminders" className="text-xs text-blue-600 hover:underline" onClick={() => setIsOpen(false)}>كل التذكيرات</Link>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {activeReminders.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 text-sm">
                                    لا توجد تنبيهات جديدة حالياً
                                </div>
                            ) : (
                                activeReminders.map(r => (
                                    <div 
                                        key={r.id} 
                                        className={`p-4 border-b border-gray-50 hover:bg-slate-50 transition-colors cursor-pointer ${!r.isRead ? 'bg-blue-50/30' : ''}`}
                                        onClick={() => markReminderRead(r.id)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className={`h-2 w-2 rounded-full mt-1.5 ${r.priority === 'HIGH' ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                                            <div className="flex-1 mr-3 text-right">
                                                <p className="text-sm font-bold text-slate-900">{r.title}</p>
                                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{r.description}</p>
                                                <p className="text-[10px] text-gray-400 mt-1">{new Date(r.date).toLocaleDateString('ar-SA')}</p>
                                            </div>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); markReminderDone(r.id); }}
                                                className="p-1 text-gray-300 hover:text-green-600"
                                            >
                                                <CheckCircle className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const AppLayout: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const { currentUser, logout, settings, isCloudSynced } = useStore();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.branding.themeColor);
  }, [settings.branding.themeColor]);

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  const navItems = [
    { icon: LayoutDashboard, label: "لوحة التحكم", to: "/" },
    { icon: Bell, label: "التذكيرات", to: "/reminders" },
    { icon: Globe, label: "روابط حكومية", to: "/legal-hub" },
    { icon: Users, label: "الموكلين", to: "/clients" },
    { icon: Database, label: "ترحيل البيانات", to: "/import" },
    { icon: Briefcase, label: "القضايا", to: "/cases" },
    { icon: DollarSign, label: "المالية", to: "/finance" },
    { icon: FileText, label: "المستندات", to: "/documents" },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" data-theme={settings.branding.themeColor}>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 right-0 w-64 bg-white border-l border-gray-100 flex flex-col z-50 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-50 flex-shrink-0">
          <span className="text-3xl logo-3d-gold">HELM</span>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-900">
              <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6">
          {navItems.map(item => (
              <SidebarItem 
                key={item.to}
                icon={item.icon} 
                label={item.label} 
                to={item.to} 
                active={item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)} 
                onClick={() => setIsSidebarOpen(false)}
              />
          ))}
          {currentUser.role === 'ADMIN' && (
            <SidebarItem 
                icon={Settings} 
                label="الإعدادات" 
                to="/settings" 
                active={location.pathname.startsWith('/settings')} 
                onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-slate-50/50">
            <div className="flex items-center mb-4 px-2">
                <div className="h-10 w-10 rounded-2xl bg-brand-accent flex items-center justify-center text-white font-black text-lg shadow-lg shadow-brand-secondary">
                    {currentUser.name.charAt(0)}
                </div>
                <div className="mr-3 overflow-hidden">
                    <p className="text-sm font-black text-slate-900 truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">{currentUser.role === 'ADMIN' ? 'المدير العام' : currentUser.role === 'ACCOUNTANT' ? 'المحاسب المعتمد' : 'المساعد الإداري'}</p>
                </div>
            </div>
            <button onClick={logout} className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-xs font-black rounded-xl text-slate-500 bg-white shadow-sm hover:bg-slate-100 transition-all border border-slate-200">
                <LogOut className="h-4 w-4 ml-2" />
                تسجيل الخروج
            </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 h-20 flex items-center justify-between px-4 sm:px-6 md:px-10 sticky top-0 z-30">
            <div className="flex items-center gap-4">
               <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
                   <Menu className="h-6 w-6" />
               </button>
               <div className="lg:hidden">
                    <span className="text-xl sm:text-2xl logo-3d-gold">HELM</span>
               </div>
               <h1 className="text-lg font-black text-slate-800 hidden lg:block tracking-tight truncate max-w-xs xl:max-w-md">
                  {settings.general.officeNameAr}
               </h1>
               <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                   {isCloudSynced ? (
                       <>
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-slate-500">سحابة نشطة</span>
                       </>
                   ) : (
                       <>
                        <CloudOff className="h-3 w-3 text-rose-500" />
                        <span className="text-[10px] font-black text-slate-500">محلي</span>
                       </>
                   )}
               </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
                <div className="hidden xl:flex items-center gap-2 text-slate-300 ml-4">
                    <RefreshCw className="h-3 w-3 animate-spin-slow" />
                    <span className="text-[10px] font-black">AI Safe Update</span>
                </div>
                <NotificationBell />
            </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-10">
          <div className="max-w-7xl mx-auto">
             {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <StoreProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/reminders" element={<AppLayout><RemindersPage /></AppLayout>} />
          <Route path="/legal-hub" element={<AppLayout><LegalHub /></AppLayout>} />
          <Route path="/clients" element={<AppLayout><Clients /></AppLayout>} />
          <Route path="/clients/:id" element={<AppLayout><ClientDetails /></AppLayout>} />
          <Route path="/import" element={<AppLayout><ImportCenter /></AppLayout>} />
          <Route path="/cases/*" element={<AppLayout><Cases /></AppLayout>} />
          <Route path="/finance/*" element={<AppLayout><Finance /></AppLayout>} />
          <Route path="/documents" element={<AppLayout><Documents /></AppLayout>} />
          <Route path="/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </StoreProvider>
  );
};

export default App;
