
import React, { useState, useRef } from 'react';
import { useStore } from '../store';
import { Card, Button, Input, Switch, Select, Badge, Modal } from '../components/UI';
import { 
    Save, User, FileText, Settings as SettingsIcon, Shield, Database, Download, 
    Upload, RefreshCw, DollarSign, Image as ImageIcon, Trash2, PenTool, 
    ClipboardList, Trash, ShieldCheck, Cpu, HardDrive, BellRing, Zap, Link as LinkIcon, Cloud,
    Layout, FileCheck, Type, Pen, Snowflake, Info, History, RotateCcw
} from 'lucide-react';
import { AppSettings } from '../types';

const SettingsPage = () => {
  const { settings, updateSettings, currentUser, exportBackup, importBackup, auditLogs, clearAuditLogs, resetSystem, setCloudSync, isCloudSynced } = useStore();
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [activeTab, setActiveTab] = useState<'general' | 'branding' | 'workflow' | 'finance' | 'system' | 'ai' | 'cloud'>('general');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  if (currentUser?.role !== 'ADMIN') {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
            <Shield className="h-16 w-16 text-rose-200 mb-4" />
            <h2 className="text-2xl font-black text-slate-900">منطقة محظورة</h2>
            <p className="text-slate-500 mt-2">عذراً، هذه الصفحة مخصصة للمدير العام فقط.</p>
        </div>
      );
  }

  const handleSave = () => {
      updateSettings(localSettings);
      alert('تم حفظ الإعدادات بنجاح.');
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const content = event.target?.result as string;
            if (confirm('هل أنت متأكد من رغبتك في استعادة هذه النسخة؟ سيتم استبدال البيانات الحالية بالكامل.')) {
                importBackup(content);
            }
        } catch (err) {
            alert("حدث خطأ أثناء قراءة ملف النسخة الاحتياطية.");
        }
    };
    reader.readAsText(file);
  };

  const tabs = [
      { id: 'general', label: 'المعلومات القانونية', icon: User },
      { id: 'branding', label: 'الهوية وقوالب PDF', icon: ImageIcon },
      { id: 'cloud', label: 'الربط السحابي', icon: Cloud },
      { id: 'finance', label: 'المالية والضرائب', icon: DollarSign },
      { id: 'ai', label: 'الذكاء الاصطناعي', icon: Zap },
      { id: 'system', label: 'الأمان والنظام', icon: Shield },
  ];

  const renderContent = () => {
      switch (activeTab) {
          case 'cloud':
              return (
                  <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="border-b pb-4">
                        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2"><Cloud className="h-5 w-5 text-blue-500" /> إدارة الربط السحابي والمحلي</h2>
                        <p className="text-xs text-slate-500 mt-1">التحكم في مزامنة البيانات والعمل عبر الإنترنت.</p>
                      </div>
                      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                          <Switch 
                            label="تفعيل المزامنة التلقائية (Real-time Cloud Sync)" 
                            checked={isCloudSynced} 
                            onChange={setCloudSync} 
                          />
                          <p className="text-[10px] text-blue-600 mt-2 font-bold leading-relaxed">
                            عند تفعيل هذا الخيار، سيتم حفظ نسخة من كافة بيانات المكتب في خوادم HELM المشفرة لضمان الوصول من أي مكان ومنع فقدان البيانات.
                          </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="bg-white border-slate-100">
                              <h4 className="text-sm font-bold flex items-center gap-2"><LinkIcon className="h-4 w-4" /> ربط API خارجي</h4>
                              <p className="text-[10px] text-slate-500 mt-1 mb-4">ربط النظام ببرامج المحاسبة الأخرى أو بوابة القضاء.</p>
                              <Button variant="secondary" className="w-full text-xs">إعداد الربط التقني</Button>
                          </Card>
                          <Card className="bg-white border-slate-100">
                              <h4 className="text-sm font-bold flex items-center gap-2"><RefreshCw className="h-4 w-4" /> فحص التوافق</h4>
                              <p className="text-[10px] text-slate-500 mt-1 mb-4">التحقق من سلامة البيانات في السحابة ومقارنتها بالمحلي.</p>
                              <Button variant="secondary" className="w-full text-xs">بدء الفحص</Button>
                          </Card>
                      </div>
                  </div>
              );
          case 'general':
              return (
                  <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="border-b pb-4">
                        <h2 className="text-xl font-black text-slate-900">الهوية القانونية للمكتب</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input label="اسم المكتب (عربي)" value={localSettings.general.officeNameAr} onChange={e => setLocalSettings({...localSettings, general: {...localSettings.general, officeNameAr: e.target.value}})} />
                          <Input label="البريد الإلكتروني" value={localSettings.general.email} onChange={e => setLocalSettings({...localSettings, general: {...localSettings.general, email: e.target.value}})} />
                          <Input label="الهاتف" value={localSettings.general.phone} onChange={e => setLocalSettings({...localSettings, general: {...localSettings.general, phone: e.target.value}})} />
                          <Input label="العنوان" value={localSettings.general.address} onChange={e => setLocalSettings({...localSettings, general: {...localSettings.general, address: e.target.value}})} />
                      </div>
                  </div>
              );
          case 'branding':
              return (
                <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="border-b pb-4 flex justify-between items-end">
                        <div>
                            <h2 className="text-xl font-black text-slate-900">الهوية وقوالب الطباعة</h2>
                            <p className="text-xs text-slate-500 mt-1">تخصيص مظهر النظام وشكل المستندات الصادرة.</p>
                        </div>
                    </div>

                    <section className="space-y-4">
                        <h3 className="text-sm font-black text-slate-700 flex items-center gap-2"><Layout className="h-4 w-4" /> لون النظام الرئيسي</h3>
                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                             <div className="flex gap-4">
                                {['slate', 'blue', 'indigo', 'rose', 'emerald'].map(c => (
                                    <button 
                                        key={c} 
                                        onClick={() => setLocalSettings({...localSettings, branding: {...localSettings.branding, themeColor: c as any}})}
                                        className={`w-12 h-12 rounded-2xl border-4 transition-all ${localSettings.branding.themeColor === c ? 'border-white scale-110 shadow-xl ring-2 ring-slate-900' : 'border-white hover:scale-105'}`}
                                        style={{backgroundColor: c === 'slate' ? '#1e293b' : c === 'blue' ? '#2563eb' : c === 'indigo' ? '#4f46e5' : c === 'rose' ? '#e11d48' : '#059669'}}
                                    />
                                ))}
                             </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-sm font-black text-slate-700 flex items-center gap-2"><FileCheck className="h-4 w-4" /> اختيار قالب التصدير (PDF)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button 
                                onClick={() => setLocalSettings({...localSettings, branding: {...localSettings.branding, pdfTemplate: 'classic'}})}
                                className={`p-6 rounded-3xl border-2 transition-all text-right group relative overflow-hidden ${localSettings.branding.pdfTemplate === 'classic' ? 'border-slate-800 bg-slate-50 ring-4 ring-slate-100' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                            >
                                <div className="h-32 bg-white rounded-xl mb-4 border border-slate-100 overflow-hidden relative p-4 shadow-sm group-hover:shadow-md transition-shadow">
                                    <div className="w-12 h-2 bg-slate-200 mb-2"></div>
                                    <div className="w-20 h-2 bg-slate-100 mb-6"></div>
                                    <div className="space-y-1">
                                        <div className="w-full h-1 bg-slate-50"></div>
                                        <div className="w-full h-1 bg-slate-50"></div>
                                        <div className="w-3/4 h-1 bg-slate-50"></div>
                                    </div>
                                    <div className="absolute bottom-4 left-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                        <div className="w-4 h-4 bg-slate-200 rounded-full"></div>
                                    </div>
                                </div>
                                <h4 className="text-sm font-black text-slate-900">النمط الكلاسيكي (Classic)</h4>
                                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">تنسيق رسمي بلمسات تقليدية، مناسب للمخاطبات القضائية والوكالات الرسمية التي تتطلب وقاراً معهوداً.</p>
                            </button>

                            <button 
                                onClick={() => setLocalSettings({...localSettings, branding: {...localSettings.branding, pdfTemplate: 'modern'}})}
                                className={`p-6 rounded-3xl border-2 transition-all text-right group relative overflow-hidden ${localSettings.branding.pdfTemplate === 'modern' ? 'border-slate-800 bg-slate-50 ring-4 ring-slate-100' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                            >
                                <div className="h-32 bg-white rounded-xl mb-4 border border-slate-100 overflow-hidden relative flex flex-col items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                                    {localSettings.branding.pdfTemplate === 'modern' && localSettings.branding.enableIceTheme && (
                                        <div className="absolute inset-0 bg-blue-50/20 backdrop-blur-[1px]"></div>
                                    )}
                                    <div className="absolute top-0 right-0 w-full h-1 bg-slate-800"></div>
                                    <div className="w-10 h-10 bg-slate-100 rounded-lg mb-2 relative z-10"></div>
                                    <div className="w-24 h-2 bg-slate-100 relative z-10"></div>
                                    <div className="mt-4 flex gap-1 relative z-10">
                                        <div className="w-8 h-1 bg-slate-50"></div>
                                        <div className="w-8 h-1 bg-slate-50"></div>
                                        <div className="w-8 h-1 bg-slate-50"></div>
                                    </div>
                                </div>
                                <h4 className="text-sm font-black text-slate-900">النمط العصري (Modern)</h4>
                                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">تصميم حديث بخطوط واضحة ومساحات بيضاء مريحة، مثالي للفواتير والمذكرات الاستشارية والتقارير المالية.</p>
                            </button>
                        </div>

                        {/* Ice Theme Option - Only for Modern Template */}
                        {localSettings.branding.pdfTemplate === 'modern' && (
                            <div className="mt-6 p-6 rounded-3xl border-2 border-blue-100 bg-blue-50/50 flex items-center justify-between animate-in slide-in-from-top-2">
                                <div className="flex items-start gap-4">
                                    <div className="h-12 w-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                                        <Snowflake className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-blue-900 flex items-center gap-2">تفعيل السمة الثلجية (Ice Theme)</h4>
                                        <p className="text-[10px] text-blue-600 mt-1 leading-relaxed">يضيف لمسات كريستالية وتدرجات زرقاء باردة على الهوامش وتنسيقات الجداول في ملفات الـ PDF.</p>
                                    </div>
                                </div>
                                <Switch 
                                    label="" 
                                    checked={localSettings.branding.enableIceTheme} 
                                    onChange={(val) => setLocalSettings({...localSettings, branding: {...localSettings.branding, enableIceTheme: val}})} 
                                />
                            </div>
                        )}
                    </section>

                    <section className="space-y-4">
                        <h3 className="text-sm font-black text-slate-700 flex items-center gap-2"><Type className="h-4 w-4" /> تذييل الصفحات والمرفقات</h3>
                        <div className="bg-white border border-slate-100 p-6 rounded-3xl space-y-4 shadow-sm">
                            <Input 
                                label="نص التذييل الثابت (Footer Text)" 
                                value={localSettings.branding.footerText} 
                                onChange={e => setLocalSettings({...localSettings, branding: {...localSettings.branding, footerText: e.target.value}})} 
                                placeholder="مثلاً: سري للغاية - جميع الحقوق محفوظة..."
                            />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 flex items-center gap-2"><ImageIcon className="h-3 w-3" /> رابط الشعار (Logo URL)</label>
                                    <Input 
                                        value={localSettings.branding.logoUrl || ''} 
                                        onChange={e => setLocalSettings({...localSettings, branding: {...localSettings.branding, logoUrl: e.target.value}})}
                                        placeholder="https://example.com/logo.png"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 flex items-center gap-2"><Pen className="h-3 w-3" /> رابط الختم الرقمي (Stamp URL)</label>
                                    <Input 
                                        value={localSettings.branding.stampUrl || ''} 
                                        onChange={e => setLocalSettings({...localSettings, branding: {...localSettings.branding, stampUrl: e.target.value}})}
                                        placeholder="https://example.com/stamp.png"
                                    />
                                </div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-3">
                                <Info className="h-4 w-4 text-slate-400" />
                                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">تأكد من استخدام روابط صور مباشرة (Direct Links) تنتهي بامتداد .png أو .jpg لضمان ظهورها بشكل صحيح في المستندات المطبوعة.</p>
                            </div>
                        </div>
                    </section>
                </div>
              );
          case 'system':
            return (
                <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="bg-slate-50 border-0 flex flex-col items-center p-6 text-center hover:bg-slate-100 transition-colors">
                            <Download className="h-10 w-10 text-slate-400 mb-3" />
                            <h4 className="text-sm font-bold">تصدير نسخة</h4>
                            <p className="text-[9px] text-slate-400 mt-1">حفظ كافة البيانات في ملف خارجي</p>
                            <Button variant="secondary" className="mt-4 w-full text-xs" onClick={exportBackup}>تصدير JSON</Button>
                        </Card>
                        <Card className="bg-blue-50 border-0 flex flex-col items-center p-6 text-center hover:bg-blue-100 transition-colors cursor-pointer" onClick={handleImportClick}>
                            <History className="h-10 w-10 text-blue-400 mb-3" />
                            <h4 className="text-sm font-bold text-blue-900">استعادة نسخة</h4>
                            <p className="text-[9px] text-blue-400 mt-1">رفع ملف احتياطي محفوظ سابقاً</p>
                            <Button variant="secondary" className="mt-4 w-full text-xs bg-white border-blue-100 text-blue-700">رفع واستعادة</Button>
                            <input type="file" ref={importInputRef} className="hidden" accept=".json" onChange={handleFileImport} />
                        </Card>
                        <Card className="bg-amber-50 border-0 flex flex-col items-center p-6 text-center hover:bg-amber-100 transition-colors">
                            <RotateCcw className="h-10 w-10 text-amber-500 mb-3" />
                            <h4 className="text-sm font-bold text-amber-900">تحديث الكاش</h4>
                            <p className="text-[9px] text-amber-500 mt-1">إعادة تهيئة الذاكرة المؤقتة</p>
                            <Button variant="secondary" className="mt-4 w-full text-xs bg-white border-amber-100 text-amber-700" onClick={() => window.location.reload()}>تحديث المتصفح</Button>
                        </Card>
                        <Card className="bg-rose-50 border-0 flex flex-col items-center p-6 text-center hover:bg-rose-100 transition-colors">
                            <Trash2 className="h-10 w-10 text-rose-400 mb-3" />
                            <h4 className="text-sm font-bold text-rose-900">ضبط المصنع</h4>
                            <p className="text-[9px] text-rose-400 mt-1">مسح شامل ونهائي لكافة السجلات</p>
                            <Button variant="danger" className="mt-4 w-full text-xs" onClick={resetSystem}>حذف الكل</Button>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-slate-700 flex items-center gap-2"><History className="h-4 w-4" /> سجل النشاطات (Audit Logs)</h3>
                            <Button variant="ghost" className="text-[10px] text-rose-500" onClick={clearAuditLogs}>مسح السجل</Button>
                        </div>
                        <div className="bg-white border rounded-[32px] overflow-hidden shadow-sm">
                            <div className="max-h-80 overflow-y-auto">
                                <table className="min-w-full divide-y divide-slate-100">
                                    <thead className="bg-slate-50 sticky top-0">
                                        <tr>
                                            <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-400">الوقت والتاريخ</th>
                                            <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-400">المستخدم</th>
                                            <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-400">الإجراء المتخذ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {auditLogs.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-10 text-center text-xs text-slate-400">لا توجد سجلات نشاط حالياً</td>
                                            </tr>
                                        ) : (
                                            auditLogs.map(log => (
                                                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-3 text-[10px] text-slate-400">
                                                        {new Date(log.timestamp).toLocaleDateString('ar-SA')} - {new Date(log.timestamp).toLocaleTimeString('ar-SA')}
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <Badge color="slate" className="text-[9px]">{log.userId}</Badge>
                                                    </td>
                                                    <td className="px-6 py-3 text-[11px] text-slate-700 font-bold">{log.details}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )
          default: return null;
      }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-140px)]" dir="rtl">
       <div className="w-full lg:w-72 flex-shrink-0">
           <nav className="flex flex-col gap-1">
               {tabs.map(tab => (
                   <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center px-4 py-4 text-sm font-bold transition-all rounded-xl ${activeTab === tab.id ? 'bg-white shadow-md text-slate-900' : 'text-slate-500 hover:bg-white/50'}`}
                   >
                       <tab.icon className={`h-5 w-5 ml-4 ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-400'}`} />
                       {tab.label}
                   </button>
               ))}
           </nav>
       </div>

       <div className="flex-1 bg-white shadow-2xl rounded-3xl overflow-hidden flex flex-col border border-slate-100">
           <div className="flex-1 overflow-y-auto p-8">
               {renderContent()}
           </div>
           <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
               <Button icon={Save} onClick={handleSave} className="px-10 rounded-2xl shadow-lg shadow-slate-200">حفظ التغييرات</Button>
           </div>
       </div>
    </div>
  );
};

export default SettingsPage;
