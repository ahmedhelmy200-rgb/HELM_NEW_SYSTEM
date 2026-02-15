
import React, { useState, useRef } from 'react';
import { useStore } from '../store';
import { Card, Button, Input, Switch, Select, Badge } from '../components/UI';
import { 
    Save, User, Shield, DollarSign, Zap, Layout, Type, 
    Smartphone, Database, Download, Upload, Trash2, 
    RefreshCcw, ShieldCheck, HardDrive, Cpu
} from 'lucide-react';
import { AppSettings } from '../types';

const SettingsPage = () => {
  const { settings, updateSettings, currentUser, exportBackup, importBackup, resetSystem } = useStore();
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [activeTab, setActiveTab] = useState<'general' | 'branding' | 'system'>('system');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (currentUser?.role !== 'ADMIN') return <div className="p-20 text-center font-black text-slate-400">الدخول مقتصر على مدير المكتب فقط.</div>;

  const handleSave = () => {
      updateSettings(localSettings);
      alert('تم تحديث إعدادات النظام وتثبيت الهوية الجديدة.');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
          importBackup(event.target?.result as string);
      };
      reader.readAsText(file);
  };

  const tabs = [
      { id: 'system', label: 'صيانة وتأمين البيانات', icon: ShieldCheck },
      { id: 'branding', label: 'الهوية البصرية والخطوط', icon: Layout },
      { id: 'general', label: 'معلومات المكتب الرسمية', icon: User },
  ];

  const renderContent = () => {
      switch (activeTab) {
          case 'system':
              return (
                  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
                      <div className="p-8 rounded-[40px] bg-slate-900 text-white shadow-3xl relative overflow-hidden card-depth border-slate-950">
                          <div className="absolute top-0 left-0 p-10 opacity-5"><Cpu className="h-40 w-40" /></div>
                          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                              <div className="max-w-xl">
                                  <h3 className="text-2xl font-black mb-2">النسخ الاحتياطي السحابي/المحلي</h3>
                                  <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                      هذا هو عصب النظام. نوصي بتصدير نسخة احتياطية يومياً. هذه النسخة تحتوي على كافة الموكلين، القضايا، المعاملات المالية، والمستندات في ملف واحد مشفر.
                                  </p>
                              </div>
                              <div className="flex flex-wrap gap-4">
                                  <Button onClick={exportBackup} icon={Download} className="bg-white text-slate-900 border-white hover:bg-slate-100">تصدير الآن (JSON)</Button>
                                  <Button variant="ghost" onClick={() => fileInputRef.current?.click()} icon={Upload} className="text-white hover:bg-white/10">استيراد نسخة سابقة</Button>
                                  <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImportFile} />
                              </div>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="p-8 rounded-[32px] bg-white border border-slate-100 shadow-3d card-depth">
                              <div className="flex items-center gap-4 mb-6">
                                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><HardDrive className="h-5 w-5" /></div>
                                  <h4 className="font-black text-slate-900">إدارة الذاكرة والتخزين</h4>
                              </div>
                              <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">يستخدم النظام تقنية IndexedDB للتخزين المحلي فائق السرعة. يمكنك تصفير النظام للبدء من جديد في حالة تصفية أعمال المكتب.</p>
                              <Button variant="danger" onClick={resetSystem} icon={RefreshCcw} className="w-full">تصفير كافة بيانات النظام</Button>
                          </div>
                          <div className="p-8 rounded-[32px] bg-white border border-slate-100 shadow-3d card-depth">
                              <div className="flex items-center gap-4 mb-6">
                                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Shield className="h-5 w-5" /></div>
                                  <h4 className="font-black text-slate-900">بروتوكولات الأمان</h4>
                              </div>
                              <div className="space-y-4">
                                  <Switch label="تفعيل سجل العمليات (Audit Log)" checked={localSettings.features.enableAuditLog} onChange={v => setLocalSettings({...localSettings, features: {...localSettings.features, enableAuditLog: v}})} />
                                  <Switch label="تفعيل المزامنة التلقائية" checked={localSettings.features.enableCloudSync} onChange={v => setLocalSettings({...localSettings, features: {...localSettings.features, enableCloudSync: v}})} />
                              </div>
                          </div>
                      </div>
                  </div>
              );
          case 'branding':
              return (
                  <div className="space-y-10 animate-in fade-in">
                      <section className="space-y-6">
                          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                              <Type className="h-4 w-4" /> تخصيص الخطوط الفاخرة
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {[
                                  { id: 'Tajawal', name: 'تجوال (عصري)', desc: 'خط قانوني واضح واحترافي' },
                                  { id: 'Cairo', name: 'كايو (رسمي)', desc: 'خط هندسي فخم للمخاطبات' },
                                  { id: 'Almarai', name: 'المراعي (ناعم)', desc: 'خط مريح جداً للقراءة الطويلة' },
                              ].map(font => (
                                  <button
                                      key={font.id}
                                      onClick={() => setLocalSettings({...localSettings, branding: {...localSettings.branding, fontFamily: font.id as any}})}
                                      className={`p-6 rounded-[24px] border-2 transition-all text-right card-depth ${localSettings.branding.fontFamily === font.id ? 'border-slate-900 bg-slate-50 shadow-inner' : 'border-slate-100 bg-white hover:bg-slate-50'}`}
                                      style={{ fontFamily: font.id }}
                                  >
                                      <h4 className="font-black text-slate-900 text-sm">{font.name}</h4>
                                      <p className="text-[10px] text-slate-400 mt-2 font-medium">{font.desc}</p>
                                  </button>
                              ))}
                          </div>
                      </section>

                      <section className="space-y-6">
                          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                              <Layout className="h-4 w-4" /> سمات الواجهة الكريستالية
                          </h3>
                          <div className="p-8 rounded-[32px] bg-slate-50 border border-slate-100 space-y-4">
                              <Switch label="تفعيل تأثيرات العمق والظل (3D)" checked={localSettings.branding.enableIceTheme} onChange={v => setLocalSettings({...localSettings, branding: {...localSettings.branding, enableIceTheme: v}})} />
                              <div className="h-px bg-slate-200 my-2"></div>
                              <div className="flex items-center justify-between">
                                  <span className="text-sm font-black text-slate-700">نسق الألوان الموحد</span>
                                  <Badge color="indigo">Platinum White (Default)</Badge>
                              </div>
                          </div>
                      </section>
                  </div>
              );
          case 'general':
            return (
                <div className="space-y-6 animate-in fade-in">
                    <Input label="اسم المكتب (بالعربي)" value={localSettings.general.officeNameAr} onChange={e => setLocalSettings({...localSettings, general: {...localSettings.general, officeNameAr: e.target.value}})} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="البريد الإلكتروني" value={localSettings.general.email} onChange={e => setLocalSettings({...localSettings, general: {...localSettings.general, email: e.target.value}})} />
                        <Input label="رقم الهاتف" value={localSettings.general.phone} onChange={e => setLocalSettings({...localSettings, general: {...localSettings.general, phone: e.target.value}})} />
                    </div>
                    <Input label="عنوان المقر الرئيسي" value={localSettings.general.address} onChange={e => setLocalSettings({...localSettings, general: {...localSettings.general, address: e.target.value}})} />
                </div>
            );
          default: return null;
      }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-12" dir="rtl">
       {/* High-End Sidebar Tabs */}
       <div className="w-full lg:w-80 flex flex-col gap-2">
           {tabs.map(tab => (
               <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center px-8 py-6 text-sm font-black transition-all rounded-[24px] card-depth ${activeTab === tab.id ? 'bg-slate-900 text-white border-slate-950 shadow-3xl translate-x-[-10px]' : 'bg-white text-slate-500 border-slate-50 hover:bg-slate-50'}`}
               >
                   <tab.icon className="h-5 w-5 ml-4" />
                   {tab.label}
               </button>
           ))}
       </div>

       {/* Platinum Content Area */}
       <div className="flex-1 min-h-[700px] flex flex-col">
           <div className="flex-1 bg-white/95 backdrop-blur-xl border border-white rounded-[48px] p-10 sm:p-14 shadow-3xl card-depth">
               {renderContent()}
               <div className="mt-14 pt-10 border-t border-slate-50 flex justify-end">
                   <Button icon={Save} onClick={handleSave} className="px-16 py-4 rounded-[24px] shadow-3xl text-base">تثبيت الإعدادات</Button>
               </div>
           </div>
       </div>
    </div>
  );
};

export default SettingsPage;
