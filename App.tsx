
import React, { useState, useEffect, useRef } from 'react';
import { StoreProvider, useStore } from './store';
import { HashRouter, Routes, Route, Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, Users, Briefcase, FileText, DollarSign, Settings, 
    LogOut, Bell, Menu, X, Database, Globe, Zap, Search, ChevronLeft, Gavel
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

const SidebarItem = ({ icon: Icon, label, to, active, onClick }: { icon: any, label: string, to: string, active: boolean, onClick?: () => void }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center px-7 py-5 text-sm font-black transition-all rounded-[22px] mx-5 my-2 ${active ? 'bg-slate-900 text-white shadow-3d-md translate-x-[-12px]' : 'text-slate-500 hover:bg-white hover:shadow-3d-sm hover:text-slate-900'}`}
  >
    <Icon className={`h-6 w-6 ml-4 ${active ? 'text-white' : 'text-slate-400'}`} />
    {label}
  </Link>
);

const GlobalSearch = () => {
    const store = useStore();
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredClients = query ? store.clients.filter(c => c.fullName.toLowerCase().includes(query.toLowerCase())) : [];
    const filteredCases = query ? store.cases.filter(c => c.title.toLowerCase().includes(query.toLowerCase())) : [];
    const hasResults = filteredClients.length > 0 || filteredCases.length > 0;

    const handleSelect = (to: string) => {
        setQuery('');
        setIsOpen(false);
        navigate(to);
    };

    return (
        <div ref={searchRef} className="relative flex-1 max-w-2xl mx-10 hidden md:block z-50">
            <div className={`relative flex items-center bg-white rounded-[20px] border-2 transition-all duration-300 ${isOpen ? 'shadow-3d-lg border-slate-900' : 'border-slate-50 shadow-3d-sm'}`}>
                <Search className={`absolute right-5 h-6 w-6 ${isOpen ? 'text-slate-900' : 'text-slate-400'}`} />
                <input
                    type="text"
                    placeholder="ابحث في قاعدة بيانات المكتب..."
                    className="w-full pr-14 pl-5 py-4 bg-transparent outline-none font-bold text-sm"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
                    onFocus={() => setIsOpen(true)}
                />
            </div>

            {isOpen && query && (
                <div className="absolute top-full left-0 right-0 mt-4 bg-white/95 backdrop-blur-2xl rounded-[32px] border-2 border-white shadow-3d-lg max-h-[60vh] overflow-y-auto p-6 animate-in fade-in zoom-in duration-200">
                    {!hasResults ? (
                        <div className="p-10 text-center font-black text-slate-400 italic">لا توجد سجلات مطابقة...</div>
                    ) : (
                        <div className="space-y-6 text-right">
                            {filteredClients.length > 0 && (
                                <div>
                                    <h4 className="px-4 text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">الموكلين</h4>
                                    {filteredClients.map(c => (
                                        <button key={c.id} onClick={() => handleSelect(`/clients/${c.id}`)} className="w-full flex items-center p-4 hover:bg-slate-50 rounded-2xl transition-all group">
                                            <div className="h-12 w-12 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-sm ml-4">
                                                <Users className="h-6 w-6" />
                                            </div>
                                            <div className="flex-1 text-right">
                                                <p className="text-sm font-black text-slate-900">{c.fullName}</p>
                                                <p className="text-[10px] text-slate-400 font-bold">{c.phone}</p>
                                            </div>
                                            <ChevronLeft className="h-5 w-5 text-slate-300" />
                                        </button>
                                    ))}
                                </div>
                            )}
                            {filteredCases.length > 0 && (
                                <div>
                                    <h4 className="px-4 text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">القضايا</h4>
                                    {filteredCases.map(c => (
                                        <button key={c.id} onClick={() => handleSelect(`/cases`)} className="w-full flex items-center p-4 hover:bg-slate-50 rounded-2xl transition-all group">
                                            <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-sm ml-4">
                                                <Gavel className="h-6 w-6" />
                                            </div>
                                            <div className="flex-1 text-right">
                                                <p className="text-sm font-black text-slate-900">{c.title}</p>
                                                <p className="text-[10px] text-slate-400 font-bold">رقم: {c.caseNumber}</p>
                                            </div>
                                            <ChevronLeft className="h-5 w-5 text-slate-300" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const AppLayout: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const { currentUser, logout, settings } = useStore();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!currentUser) return <Navigate to="/login" />;

  const navItems = [
    { icon: LayoutDashboard, label: "لوحة التحكم", to: "/" },
    { icon: Bell, label: "التنبيهات", to: "/reminders" },
    { icon: Users, label: "الموكلين", to: "/clients" },
    { icon: Briefcase, label: "القضايا", to: "/cases" },
    { icon: FileText, label: "المستندات", to: "/documents" },
    { icon: DollarSign, label: "المالية", to: "/finance" },
    { icon: Globe, label: "خدمات حكومية", to: "/legal-hub" },
    { icon: Database, label: "ترحيل البيانات", to: "/import" },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <div className={`fixed inset-y-0 right-0 w-80 glass-3d flex flex-col z-50 transition-all duration-500 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <div className="h-32 flex items-center justify-between px-10">
          <span className="text-5xl logo-3d">HELM</span>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-3 bg-white rounded-2xl shadow-3d-sm"><X className="h-7 w-7" /></button>
        </div>
        <div className="flex-1 overflow-y-auto py-5">
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
            <SidebarItem icon={Settings} label="الإعدادات" to="/settings" active={location.pathname.startsWith('/settings')} onClick={() => setIsSidebarOpen(false)} />
          )}
        </div>
        <div className="p-10">
            <button onClick={logout} className="w-full flex items-center justify-center py-5 text-sm font-black rounded-[24px] text-rose-500 bg-rose-50 hover:bg-rose-100 transition-all card-3d border-rose-100">
                <LogOut className="h-6 w-6 ml-4" /> خروج آمن
            </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-32 flex items-center justify-between px-12 z-30">
            <div className="flex items-center gap-8">
               <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-5 bg-white shadow-3d-md rounded-[22px]"><Menu className="h-8 w-8" /></button>
               <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">{settings.general.officeNameAr}</h1>
                  <div className="flex items-center gap-2 mt-2"><span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></span><span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Platinum Edition v3.0</span></div>
               </div>
            </div>
            <GlobalSearch />
            <div className="flex items-center gap-6">
                <div className="hidden sm:flex bg-white/50 border-2 border-white px-7 py-3 rounded-[22px] shadow-3d-sm items-center gap-4">
                    <Zap className="h-5 w-5 text-amber-500 fill-amber-500" /><span className="text-xs font-black text-slate-700">HELM AI Core Active</span>
                </div>
                <div className="h-16 w-16 rounded-[22px] bg-slate-900 shadow-3d-md flex items-center justify-center text-white font-black text-2xl border-4 border-white">{currentUser.name.charAt(0)}</div>
            </div>
        </header>
        <main className="flex-1 overflow-auto p-12 lg:p-16"><div className="max-w-7xl mx-auto space-y-16">{children}</div></main>
      </div>
    </div>
  );
};

const App = () => (
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

export default App;
