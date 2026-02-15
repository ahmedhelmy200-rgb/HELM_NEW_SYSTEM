
import React from 'react';
import { useStore } from '../store';
import { Card, Badge } from '../components/UI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Users, Briefcase, Scale, Percent } from 'lucide-react';

const Dashboard = () => {
  const { clients, cases, transactions, settings, currentUser } = useStore();

  const totalRevenue = transactions.filter(t => t.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0);
  
  const activeCases = cases.filter(c => c.status === 'ONGOING' || c.status === 'PREPARING').length;
  const winningCases = cases.filter(c => c.status === 'WINNING').length;

  // إحصائيات العمولة (خاصة بالمدير فقط)
  const totalCommissions = clients.reduce((acc, c) => acc + (c.commissionAmount || 0), 0);

  const data = [
    { name: 'الدخل', value: totalRevenue },
    { name: 'المصروفات', value: totalExpense },
  ];
  
  const caseStatusData = [
    { name: 'رابحة', value: winningCases, color: '#22c55e' },
    { name: 'جارية', value: cases.filter(c => c.status === 'ONGOING').length, color: '#eab308' },
    { name: 'خاسرة', value: cases.filter(c => c.status === 'LOST').length, color: '#ef4444' },
    { name: 'قيد الإعداد', value: cases.filter(c => c.status === 'PREPARING').length, color: '#3b82f6' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm font-medium uppercase">إجمالي الدخل</p>
              <h2 className="text-3xl font-bold mt-1" dir="ltr">{totalRevenue.toLocaleString()} {settings.finance.currency}</h2>
            </div>
            <div className="p-3 bg-slate-700 rounded-full">
              <ArrowUpRight className="h-6 w-6 text-green-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-slate-300">
            <span dir="ltr">الصافي: {(totalRevenue - totalExpense).toLocaleString()} {settings.finance.currency}</span>
          </div>
        </Card>

        {currentUser?.role === 'ADMIN' && (
          <Card className="bg-amber-50 border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-800 text-sm font-medium uppercase">إجمالي العمولات</p>
                <h2 className="text-3xl font-bold text-amber-900 mt-1" dir="ltr">{totalCommissions.toLocaleString()} {settings.finance.currency}</h2>
              </div>
              <div className="p-3 bg-amber-100 rounded-full">
                <Percent className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-amber-700">
               خاص بالإدارة العامة
            </div>
          </Card>
        )}

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase">القضايا النشطة</p>
              <h2 className="text-3xl font-bold text-gray-900 mt-1">{activeCases}</h2>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <Scale className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
             <span className="text-green-600 font-medium ml-2">{winningCases}</span> قضية رابحة
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase">إجمالي الموكلين</p>
              <h2 className="text-3xl font-bold text-gray-900 mt-1">{clients.length}</h2>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
             قاعدة البيانات النشطة
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="النظرة المالية العامة">
          <div className="h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#475569" radius={[4, 4, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="توزيع حالات القضايا">
          <div className="h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={caseStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {caseStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-2">
                {caseStatusData.map(d => (
                    <div key={d.name} className="flex items-center text-xs text-gray-600">
                        <span className="w-3 h-3 rounded-full mr-1" style={{backgroundColor: d.color}}></span>
                        {d.name}
                    </div>
                ))}
            </div>
          </div>
        </Card>
      </div>

      <Card title="أحدث القضايا">
          <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                      <tr>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العنوان</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الموكل</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                      </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                      {cases.slice(0, 5).map((c) => {
                          const client = clients.find(cl => cl.id === c.clientId);
                          let badgeColor = 'gray';
                          if (c.status === 'WINNING') badgeColor = 'green';
                          if (c.status === 'LOST') badgeColor = 'red';
                          if (c.status === 'PREPARING') badgeColor = 'blue';
                          if (c.status === 'ONGOING') badgeColor = 'yellow';
                          
                          // Mapping status to Arabic
                          let statusAr = c.status;
                          if (c.status === 'WINNING') statusAr = 'رابحة';
                          if (c.status === 'LOST') statusAr = 'خاسرة';
                          if (c.status === 'PREPARING') statusAr = 'قيد الإعداد';
                          if (c.status === 'ONGOING') statusAr = 'جارية';

                          return (
                            <tr key={c.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client?.fullName || 'غير معروف'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Badge color={badgeColor}>{statusAr}</Badge>
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
