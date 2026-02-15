
import React, { useState, useEffect, useRef } from 'react';
import { StoreProvider, useStore } from './store';
import { HashRouter, Routes, Route, Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, Users, Briefcase, FileText, DollarSign, Settings, 
    LogOut, Bell, Menu, X, Database, Globe, Zap, Search, ArrowLeft,
    ChevronLeft, FileDigit, Gavel
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
    className={`flex items-center px-6 py-4 text-sm font-black transition-all rounded-2xl mx-4 my-1.5 ${active ? 'bg-slate-900 text-white shadow-3d translate-x-[-8px]' : 'text-slate-500 hover:bg-white hover:shadow-sm hover:text-slate-900'}`}
  >
    <Icon className={`h-5 w-5 ml-4 ${active ? 'text-white animate-pulse' : 'text-slate-400'}`} />
    {label}
  </Link>
);

const GlobalSearch = () => {
    const { clients, cases, documents, transactions } = useStore();
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

    const filteredClients = query ? clients.filter(c => c.fullName.toLowerCase().includes(query.toLowerCase()) || c.phone?.includes(query)) : [];
    const filteredCases = query ? cases.filter(c => c.title.toLowerCase().includes(query.toLowerCase()) || c.caseNumber.includes(query)) : [];
    const filteredDocs = query ? documents.filter(d => d.title.toLowerCase().includes(query.toLowerCase())) : [];
    const filteredTx = query ? transactions.filter(t => t.description.toLowerCase().includes(query.toLowerCase())) : [];

    const hasResults = filteredClients.length > 0 || filteredCases.length > 0 || filteredDocs.length > 0 || filteredTx.length > 0;

    const handleSelect = (to: string) => {
        setQuery('');
        setIsOpen(false);
        navigate(to);
    };

    return (
        <div ref={searchRef} className="relative flex-1 max-w-xl mx-8 hidden md:block z-50">
            <div className={`relative flex items-center bg-white rounded-2xl border transition-all duration-300 ${isOpen ? 'shadow-3d border-slate-900' : 'border-slate-100 shadow-sm'}`}>
                <Search className={`absolute right-4 h-5 w-5 transition-colors ${isOpen ? 'text-slate-900' : 'text-slate-400'}`} />
                <input
                    type="text"
                    placeholder="ابحث عن موكل، رقم قضية، أو مستند..."
                    className="w-full pr-12 pl-4 py-3.5 bg-transparent outline-none font-bold text-sm"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                />
                {query && (
                    <button onClick={() => setQuery('')} className="absolute left-4 p-1 hover:bg-slate-100 rounded-full">
                        <X className="h-4 w-4 text-slate-400" />
                    </button>
                )}
            </div>

            {isOpen && query && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-xl rounded-3xl border border-white/50 shadow-3xl max-h-[70vh] overflow-y-auto animate-in fade-in zoom-in duration-200 card-depth">
                    {!hasResults ? (
                        <div className="p-10 text-center">
                            <Search className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                            <p className="text-sm font-black text-slate-400">لم يتم العثور على أي نتائج تطابق "{query}"</p>
                        </div>
                    ) : (
                        <div className="p-4 space-y-6">
                            {filteredClients.length > 0 && (
                                <div>
                                    <h4 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">الموكلين</h4>
                                    {filteredClients.map(c => (
                                        <button key={c.id} onClick={() => handleSelect(`/clients/${c.id}`)} className="w-full flex items-center p-3 hover:bg-slate-50 rounded-xl transition-all group text-right">
                                            <div className="h-10 w-10 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-xs ml-3 group-hover:scale-110 transition-transform">
                                                <Users className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-black text-slate-900">{c.fullName}</p>
                                                <p className="text-[10px] text-slate-400 font-bold">{c.phone || 'بدون هاتف'}</p>
                                            </div>
                                            <ChevronLeft className="h-4 w-4 text-slate-300" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {filteredCases.length > 0 && (
                                <div>
                                    <h4 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">القضايا</h4>
                                    {filteredCases.map(c => (
                                        <button key={c.id} onClick={() => handleSelect(`/cases`)} className="w-full flex items-center p-3 hover:bg-slate-50 rounded-xl transition-all group text-right">
                                            <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xs ml-3 group-hover:scale-110 transition-transform">
                                                <Gavel className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-black text-slate-900">{c.title}</p>
                                                <p className="text-[10px] text-slate-400 font-bold">رقم: {c.caseNumber}</p>
                                            </div>
                                            <ChevronLeft className="h-4 w-4 text-slate-300" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {filteredDocs.length > 0 && (
                                <div>
                                    <h4 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">المستندات</h4>
                                    {filteredDocs.map(d => (
                                        <button key={d.id} onClick={() => handleSelect(`/documents`)} className="w-full flex items-center p-3 hover:bg-slate-50 rounded-xl transition-all group text-right">
                                            <div className="h-10 w-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-black text-xs ml-3 group-hover:scale-110 transition-transform">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-black text-slate-900">{d.title}</p>
                                                <p className="text-[10px] text-slate-400 font-bold">{new Date(d.createdAt).toLocaleDateString('ar-SA')}</p>
                                            </div>
                                            <ChevronLeft className="h-4 w-4 text-slate-300" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {filteredTx.length > 0 && (
                                <div>
                                    <h4 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">المعاملات المالية</h4>
                                    {filteredTx.map(t => (
                                        <button key={t.id} onClick={() => handleSelect(`/finance`)} className="w-full flex items-center p-3 hover:bg-slate-50 rounded-xl transition-all group text-right">
                                            <div className="h-10 w-10 bg-amber-500 rounded-lg flex items-center justify-center text-white font-black text-xs ml-3 group-hover:scale-110 transition-transform">
                                                <DollarSign className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-black text-slate-900">{t.description}</p>
                                                <p className="text-[10px] text-slate-400 font-bold">{t.amount.toLocaleString()} د.إ</p>
                                            </div>
                                            <ChevronLeft className="h-4 w-4 text-slate-300" />
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

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  const navItems = [
    { icon: LayoutDashboard, label: "لوحة التحكم", to: "/" },
    { icon: Bell, label: "مركز التنبيهات", to: "/reminders" },
    { icon: Users, label: "قاعدة الموكلين", to: "/clients" },
    { icon: Briefcase, label: "إدارة القضايا", to: "/cases" },
    { icon: FileText, label: "أرشيف المستندات", to: "/documents" },
    { icon: DollarSign, label: "المالية والمحاسبة", to: "/finance" },
    { icon: Globe, label: "روابط حكومية", to: "/legal-hub" },
    { icon: Database, label: "ترحيل البيانات", to: "/import" },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Platinum 3D Style */}
      <div className={`
        fixed inset-y-0 right-0 w-80 sidebar-blur border-l border-white/50 flex flex-col z-50 transition-all duration-500
        ${isSidebarOpen ? 'translate-x-0 shadow-3xl' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-28 flex items-center justify-between px-10">
          <span className="text-4xl logo-3d">HELM</span>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 p-2 hover:bg-white rounded-full">
              <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
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
                label="إعدادات النظام" 
                to="/settings" 
                active={location.pathname.startsWith('/settings')} 
                onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </div>

        <div className="p-8">
            <button onClick={logout} className="w-full flex items-center justify-center px-6 py-4 text-sm font-black rounded-2xl text-rose-500 bg-rose-50 hover:bg-rose-100 transition-all card-depth border-rose-100">
                <LogOut className="h-5 w-5 ml-3" />
                خروج آمن
            </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Modern Header */}
        <header className="h-28 flex items-center justify-between px-8 lg:px-12 z-30">
            <div className="flex items-center gap-6">
               <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-4 bg-white shadow-3d rounded-2xl text-slate-600">
                   <Menu className="h-7 w-7" />
               </button>
               <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">
                    {settings.general.officeNameAr}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                      <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Platinum Session</span>
                  </div>
               </div>
            </div>
            
            <GlobalSearch />
            
            <div className="flex items-center gap-4">
                <div className="hidden sm:flex bg-white/50 border border-white p-1 rounded-2xl shadow-3d overflow-hidden">
                    <div className="px-6 py-2.5 flex items-center gap-3">
                        <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-black text-slate-700">HELM AI v3.0</span>
                    </div>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-slate-900 shadow-3d flex items-center justify-center text-white font-black text-xl border-4 border-white">
                    {currentUser.name.charAt(0)}
                </div>
            </div>
        </header>

        <main className="flex-1 overflow-auto p-6 sm:p-10 lg:p-14">
          <div className="max-w-7xl mx-auto space-y-12">
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
