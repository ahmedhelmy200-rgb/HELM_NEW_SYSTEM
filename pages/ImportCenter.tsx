
import React, { useState, useRef } from 'react';
import { useStore } from '../store';
import { Card, Button, Input, Modal, Badge } from '../components/UI';
import { 
    Upload, FileJson, Table, Wand2, Database, AlertTriangle, 
    CheckCircle2, Trash2, ArrowRight, Save, Link as LinkIcon
} from 'lucide-react';
import { smartDataMapper } from '../services/geminiService';
import { Client } from '../types';

const ImportCenter = () => {
  const { addClientsBatch } = useStore();
  const [activeMode, setActiveMode] = useState<'FILE' | 'SMART' | 'DIRECT'>('SMART');
  const [legacyText, setLegacyText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mappedClients, setMappedClients] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSmartImport = async () => {
    if (!legacyText.trim()) return;
    setIsProcessing(true);
    const result = await smartDataMapper(legacyText);
    setIsProcessing(false);
    if (result && result.length > 0) {
        setMappedClients(result);
    } else {
        alert("لم يتم العثور على بيانات واضحة. حاول نسخ النص بشكل أدق.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const content = event.target?.result as string;
              if (file.name.endsWith('.json')) {
                  const data = JSON.parse(content);
                  setMappedClients(Array.isArray(data) ? data : [data]);
              } else {
                  // Basic CSV simulation for demo
                  const lines = content.split('\n');
                  const rows = lines.slice(1).map(line => {
                      const cols = line.split(',');
                      return { fullName: cols[0], phone: cols[1], email: cols[2] };
                  });
                  setMappedClients(rows.filter(r => r.fullName));
              }
          } catch (err) { alert("فشل قراءة الملف."); }
      };
      reader.readAsText(file);
  };

  const confirmImport = () => {
      const clientsToSave: Client[] = mappedClients.map(c => ({
          ...c,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          category: 'موكل',
          notes: c.notes || 'مستورد من نظام قديم'
      }));
      addClientsBatch(clientsToSave);
      setMappedClients([]);
      setLegacyText('');
      alert(`تم استيراد ${clientsToSave.length} موكل بنجاح.`);
  };

  return (
    <div className="space-y-6" dir="rtl">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">مركز ترحيل البيانات القانونية</h1>
                <p className="text-sm text-slate-500 mt-1">Migration Hub: استيراد ملفاتك القديمة وربطها بالذكاء الاصطناعي</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl">
                <button onClick={() => setActiveMode('SMART')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeMode === 'SMART' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>المحول الذكي AI</button>
                <button onClick={() => setActiveMode('FILE')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeMode === 'FILE' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>رفع ملفات</button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
                <Card className="bg-slate-900 text-white border-0 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10"><Database className="h-20 w-20" /></div>
                    <h3 className="text-lg font-black mb-2 flex items-center gap-2">الصيغ المدعومة</h3>
                    <ul className="text-xs space-y-2 text-slate-400 font-medium">
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> ملفات Excel / CSV المباشرة</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> نسخ نصوص من Microsoft Word</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> قواعد بيانات JSON</li>
                        <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> قصاصات نصوص غير مرتبة (عبر AI)</li>
                    </ul>
                </Card>

                <Card className="border-amber-100 bg-amber-50">
                    <h4 className="text-sm font-black text-amber-900 flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4" /> نصيحة تقنية
                    </h4>
                    <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                        عند استخدام **المحول الذكي**، لا تقلق بشأن ترتيب البيانات. الصق النص كما هو وسيتولى Gemini 3 Pro فرز الأسماء وأرقام الهواتف بدقة 98%.
                    </p>
                </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
                {activeMode === 'SMART' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
                        <div className="bg-white border rounded-2xl p-6 shadow-sm">
                            <label className="block text-sm font-black text-slate-700 mb-3">الصق بياناتك القديمة هنا (أي صيغة)</label>
                            <textarea 
                                className="w-full h-48 border-2 border-slate-100 rounded-xl p-4 text-sm font-mono focus:ring-slate-800 focus:border-slate-800 outline-none transition-all bg-slate-50"
                                placeholder="مثلاً: الموكل محمد علي - هاتف 0501234567 - يسكن في دبي..."
                                value={legacyText}
                                onChange={e => setLegacyText(e.target.value)}
                            />
                            <div className="mt-4 flex justify-end">
                                <Button 
                                    icon={Wand2} 
                                    onClick={handleSmartImport} 
                                    disabled={isProcessing}
                                    className="px-8 rounded-xl shadow-lg shadow-indigo-100 bg-indigo-600 hover:bg-indigo-700"
                                >
                                    {isProcessing ? 'جاري التحويل الذكي...' : 'بدء التحويل باستخدام AI'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {activeMode === 'FILE' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
                        <div 
                            className="border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center bg-white hover:bg-slate-50 transition-colors cursor-pointer group"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <Upload className="h-10 w-10 text-slate-400" />
                            </div>
                            <h4 className="text-slate-900 font-black text-lg">ارفع ملف البيانات</h4>
                            <p className="text-xs text-slate-500 font-medium">CSV, JSON, XLSX</p>
                            <input type="file" ref={fileInputRef} className="hidden" accept=".json,.csv,.xlsx" onChange={handleFileUpload} />
                        </div>
                    </div>
                )}

                {mappedClients.length > 0 && (
                    <div className="space-y-4 animate-in slide-in-from-bottom-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter">نتائج الترحيل المقترحة ({mappedClients.length} موكل)</h3>
                            <div className="flex gap-2">
                                <Button variant="secondary" icon={Trash2} onClick={() => setMappedClients([])} className="text-xs py-1.5">إلغاء</Button>
                                <Button icon={Save} onClick={confirmImport} className="text-xs py-1.5">حفظ في النظام</Button>
                            </div>
                        </div>
                        <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-400">الاسم المستنتج</th>
                                        <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-400">الهاتف</th>
                                        <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-400">العنوان</th>
                                        <th className="px-6 py-3 text-right text-[10px] font-bold text-slate-400">البيانات الإضافية</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {mappedClients.map((c, i) => (
                                        <tr key={i} className="hover:bg-slate-50">
                                            <td className="px-6 py-3 text-sm font-bold text-slate-900">{c.fullName}</td>
                                            <td className="px-6 py-3 text-xs text-slate-600" dir="ltr">{c.phone || '-'}</td>
                                            <td className="px-6 py-3 text-xs text-slate-600">{c.address || '-'}</td>
                                            <td className="px-6 py-3">
                                                <div className="flex gap-1">
                                                    {c.idNumber && <Badge color="indigo">هوية</Badge>}
                                                    {c.email && <Badge color="slate">إيميل</Badge>}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default ImportCenter;
