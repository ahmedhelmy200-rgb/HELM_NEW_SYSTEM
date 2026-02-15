
import React from 'react';
import { useStore } from '../store';
import { Card, Badge } from '../components/UI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Users, Briefcase, Scale, Percent, Sparkles, Gavel, LayoutGrid } from 'lucide-react';

const Dashboard = () => {
  const { clients, cases, transactions, settings, currentUser } = useStore();

  const totalRevenue = transactions.filter(t => t.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0);
  
  const activeCases = cases.filter(c => c.status === 'ONGOING' || c.status === 'PREPARING').length;
  const winningCases = cases.filter(c => c.status === 'WINNING').length;

  const totalCommissions = clients.reduce((acc, c) => acc + (c.commissionAmount || 0), 0);

  const data = [
    { name: 'الإيرادات', value: totalRevenue },
    { name: 'المصروفات', value: totalExpense },
  ];
  
  const caseStatusData = [
    { name: 'رابحة', value: winningCases, color: '#10b981' },
    { name: 'جارية', value: cases.filter(c => c.status === 'ONGOING').length, color: '#f59e0b' },
    { name: 'خاسرة', value: cases.filter(c => c.status === 'LOST').length, color: '#ef4444' },
    { name: 'قيد الإعداد', value: cases.filter(c => c.status === 'PREPARING').length, color: '#6366f1' },
  ];

  return (
    <div className="space-y-12 pb-20 animate-in fade-in duration-700">
      {/* Welcome Command Center */}
      <div className="relative p-10 sm:p-14 rounded-[48px] bg-slate-900 shadow-3xl overflow-hidden card-depth border-slate-950">
          <div className="absolute top-[-10%] right-[-10%] opacity-10">
              <Gavel className="h-96 w-96 text-white rotate-12" />
          </div>
          <div className="absolute bottom-[-10%] left-[-10%] opacity-10">
              <LayoutGrid className="h-96 w-96 text-white -rotate-12" />
          </div>
          <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Premium Management Intelligence</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">مرحباً بك، سيادة المستشار</h1>
              <p className="text-sm sm:text-lg text-slate-400 max-w-2xl font-medium leading-relaxed">
                 أنت الآن في مركز التحكم الموحد لمكتبك. كافة القضايا، الموكلين، والعمليات المالية تحت إشرافك المباشر بدعم من تقنيات الذكاء الاصطناعي الأكثر تطوراً.
              </p>
          </div>
      </div>

      {/* Main Stats 3D Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <Card className="bg-white group">
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 bg-slate-900 rounded-2xl shadow-lg shadow-slate-200 group-hover:scale-110 transition-transform">
              <ArrowUpRight className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="text-left">
                <Badge color="green">الدخل</Badge>
            </div>
          </div>
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">إجمالي الإيرادات</p>
          <h2 className="text-3xl font-black text-slate-900" dir="ltr">{totalRevenue.toLocaleString()} {settings.finance.currency}</h2>
          <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase">الصافي الفعلي</span>
              <span className="text-sm font-black text-emerald-600" dir="ltr">{(totalRevenue - totalExpense).toLocaleString()}</span>
          </div>
        </Card>

        <Card className="bg-white group">
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 bg-amber-500 rounded-2xl shadow-lg shadow-amber-200 group-hover:scale-110 transition-transform">
              <Percent className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
                <Badge color="yellow">الأرباح</Badge>
            </div>
          </div>
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">إجمالي العمولات</p>
          <h2 className="text-3xl font-black text-slate-900" dir="ltr">{totalCommissions.toLocaleString()} {settings.finance.currency}</h2>
          <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase">إدارة الصندوق</span>
              <span className="text-sm font-black text-amber-600 uppercase">Admin Hub</span>
          </div>
        </Card>

        <Card className="bg-white group">
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
              <Scale className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
                <Badge color="blue">القضايا</Badge>
            </div>
          </div>
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">الملفات النشطة</p>
          <h2 className="text-3xl font-black text-slate-900">{activeCases}</h2>
          <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase">نسبة النجاح</span>
              <span className="text-sm font-black text-indigo-600">88% (AI Est.)</span>
          </div>
        </Card>

        <Card className="bg-white group">
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 bg-slate-100 rounded-2xl shadow-lg shadow-slate-200 group-hover:scale-110 transition-transform">
              <Users className="h-6 w-6 text-slate-900" />
            </div>
            <div className="text-left">
                <Badge color="slate">الموكلين</Badge>
            </div>
          </div>
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">قاعدة البيانات</p>
          <h2 className="text-3xl font-black text-slate-900">{clients.length}</h2>
          <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase">سجلات موثقة</span>
              <span className="text-sm font-black text-slate-500 uppercase">Verified</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Card title="مؤشرات السيولة والنمو" className="h-full">
          <div className="h-80 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
              <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900, fill: '#64748b' }} />
                <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', fontSize: '13px', padding: '15px' }}
                />
                <Bar dataKey="value" fill="#0f172a" radius={[12, 12, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="تحليل المواقف القانونية" className="h-full">
          <div className="h-80 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
              <PieChart>
                <Pie
                  data={caseStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={10}
                  dataKey="value"
                >
                  {caseStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-6 mt-4">
                {caseStatusData.map(d => (
                    <div key={d.name} className="flex items-center text-[11px] font-black text-slate-500 uppercase tracking-wider">
                        <span className="w-3 h-3 rounded-full ml-2 shadow-sm" style={{backgroundColor: d.color}}></span>
                        {d.name}
                    </div>
                ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <Card title="أحدث التحركات القانونية">
          <div className="overflow-x-auto">
              <table className="min-w-full">
                  <thead>
                      <tr className="border-b border-slate-50">
                          <th className="px-6 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-widest">القضية</th>
                          <th className="px-6 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-widest">الموكل</th>
                          <th className="px-6 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-widest">الموقف الحالي</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                      {cases.slice(0, 5).map((c) => {
                          const client = clients.find(cl => cl.id === c.clientId);
                          let statusColor = 'slate';
                          if (c.status === 'WINNING') statusColor = 'green';
                          if (c.status === 'ONGOING') statusColor = 'yellow';
                          if (c.status === 'LOST') statusColor = 'red';
                          if (c.status === 'PREPARING') statusColor = 'blue';

                          return (
                            <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-md group-hover:scale-110 transition-transform">
                                            {c.caseNumber.slice(-2)}
                                        </div>
                                        <span className="text-sm font-black text-slate-900">{c.title}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-sm text-slate-500 font-bold">{client?.fullName || '-'}</td>
                                <td className="px-6 py-5 text-left">
                                    <Badge color={statusColor}>{c.status}</Badge>
                                </td>
                            </tr>
                          )
                      })}
                  </tbody>
              </table>
          </div>
      </Card>
    </div>
  );
};

export default Dashboard;
