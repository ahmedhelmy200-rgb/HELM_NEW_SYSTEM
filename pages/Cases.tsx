
import React, { useState } from 'react';
import { useStore } from '../store';
import { Card, Button, Input, Select, Badge, Modal } from '../components/UI';
import { 
  Plus, Search, Filter, Wand2, ChevronDown, ChevronUp, 
  Gavel, FileText, CalendarClock, Briefcase, User, Edit, Trash2
} from 'lucide-react';
import { Case, CaseStatus } from '../types';
import { generateCaseSummary } from '../services/geminiService';

const Cases = () => {
  const { cases, clients, addCase, updateCase, deleteCase, currentUser } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCase, setNewCase] = useState<Partial<Case>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<CaseStatus | 'ALL'>('ALL');
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);
  
  // Gemini Integration State
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const filteredCases = cases.filter(c => {
      const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.caseNumber.includes(searchTerm);
      const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
      return matchesSearch && matchesStatus;
  });

  const handleSave = () => {
      if (!newCase.title || !newCase.clientId) return;
      if (newCase.id) {
          updateCase(newCase as Case);
      } else {
          addCase({
              ...newCase,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              status: newCase.status || 'PREPARING',
              description: newCase.description || ''
          } as Case);
      }
      setIsModalOpen(false);
      setNewCase({});
  };

  const handleAiSummary = async (e: React.MouseEvent, caseId: string) => {
      e.stopPropagation();
      const c = cases.find(x => x.id === caseId);
      if (!c) return;
      setIsGeneratingSummary(true);
      const summary = await generateCaseSummary(c.description, [c.court, c.status]);
      alert(`ملخص الذكاء الاصطناعي للقضية ${c.caseNumber}:\n\n${summary}`);
      setIsGeneratingSummary(false);
  };

  const handleEdit = (e: React.MouseEvent, c: Case) => {
      e.stopPropagation();
      setNewCase(c);
      setIsModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (confirm('هل أنت متأكد من حذف هذه القضية نهائياً؟')) {
          deleteCase(id);
      }
  };

  const toggleExpand = (id: string) => {
      setExpandedCaseId(expandedCaseId === id ? null : id);
  };

  const getStatusColor = (status: CaseStatus) => {
      switch(status) {
          case 'WINNING': return 'green';
          case 'PREPARING': return 'blue';
          case 'ONGOING': return 'yellow';
          case 'LOST': return 'red';
          default: return 'gray';
      }
  };

  const translateStatus = (status: CaseStatus) => {
    switch(status) {
      case 'WINNING': return 'رابحة';
      case 'PREPARING': return 'قيد الإعداد';
      case 'ONGOING': return 'جارية';
      case 'LOST': return 'خاسرة';
      default: return status;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">إدارة القضايا القانونية</h1>
          <p className="text-sm text-slate-500 mt-1">عرض وتتبع كافة ملفات التقاضي والخصوم</p>
        </div>
        <div className="flex gap-2 w-full lg:w-auto flex-wrap sm:flex-nowrap">
             <div className="relative flex-1 sm:min-w-[240px]">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input 
                    type="text" 
                    placeholder="بحث برقم القضية أو العنوان..." 
                    className="pr-10 pl-4 py-2.5 border border-slate-200 rounded-xl w-full focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-all text-sm outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <select 
                className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-slate-800 focus:border-slate-800 bg-white outline-none"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
            >
                <option value="ALL">جميع الحالات</option>
                <option value="PREPARING">قيد الإعداد</option>
                <option value="ONGOING">جارية</option>
                <option value="WINNING">رابحة</option>
                <option value="LOST">خاسرة</option>
            </select>
            {currentUser?.role !== 'ACCOUNTANT' && (
                <Button onClick={() => { setNewCase({}); setIsModalOpen(true); }} icon={Plus} className="rounded-xl px-6">فتح ملف قضية</Button>
            )}
        </div>
      </div>

      <div className="space-y-4">
          {filteredCases.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                  <Briefcase className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium">لا توجد قضايا تطابق معايير البحث</p>
              </div>
          ) : (
              filteredCases.map((c) => {
                  const client = clients.find(cl => cl.id === c.clientId);
                  const isExpanded = expandedCaseId === c.id;
                  
                  return (
                      <div 
                        key={c.id} 
                        className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden cursor-pointer ${isExpanded ? 'border-slate-800 ring-4 ring-slate-100' : 'border-slate-100 hover:border-slate-300 shadow-sm'}`}
                        onClick={() => toggleExpand(c.id)}
                      >
                          <div className="p-5 sm:px-6">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                  <div className="flex-1 space-y-1">
                                      <div className="flex items-center gap-2">
                                          <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-widest">{c.caseNumber}</span>
                                          {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                                      </div>
                                      <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-slate-800">
                                          {c.title}
                                      </h3>
                                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 mt-2">
                                          <span className="flex items-center gap-1.5 font-medium">
                                              <User className="h-4 w-4 text-slate-400" />
                                              {client?.fullName || 'غير محدد'}
                                          </span>
                                          <span className="flex items-center gap-1.5">
                                              <Gavel className="h-4 w-4 text-slate-400" />
                                              {c.court}
                                          </span>
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                      <Badge color={getStatusColor(c.status)} className="px-4 py-1.5 text-xs font-bold uppercase rounded-lg">
                                          {translateStatus(c.status)}
                                      </Badge>
                                  </div>
                              </div>
                          </div>

                          {/* Quick View Expanded Section */}
                          <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[500px] border-t border-slate-50 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                              <div className="p-6 bg-slate-50/50 space-y-6">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div className="space-y-3">
                                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                              <FileText className="h-3 w-3" /> تفاصيل وملاحظات الملف
                                          </h4>
                                          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                              {c.description || 'لا توجد تفاصيل إضافية مسجلة لهذه القضية.'}
                                          </p>
                                      </div>
                                      <div className="space-y-4">
                                          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3">
                                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                                  <CalendarClock className="h-3 w-3" /> الجلسة القادمة
                                              </h4>
                                              <div className="flex items-center justify-between">
                                                  <span className="text-sm font-bold text-slate-900">
                                                      {c.nextHearingDate ? new Date(c.nextHearingDate).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'غير محددة بعد'}
                                                  </span>
                                                  {c.nextHearingDate && (
                                                       <Badge color="yellow">قريباً</Badge>
                                                  )}
                                              </div>
                                          </div>
                                          <div className="flex flex-wrap gap-2">
                                              <Button 
                                                variant="secondary" 
                                                icon={Edit} 
                                                onClick={(e) => handleEdit(e, c)}
                                                className="text-xs py-2 rounded-lg bg-white"
                                              >
                                                  تعديل البيانات
                                              </Button>
                                              <Button 
                                                variant="secondary" 
                                                icon={Wand2} 
                                                onClick={(e) => handleAiSummary(e, c.id)}
                                                disabled={isGeneratingSummary}
                                                className="text-xs py-2 rounded-lg bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100"
                                              >
                                                  {isGeneratingSummary ? 'جاري التحليل...' : 'تحليل ذكي (AI)'}
                                              </Button>
                                              {currentUser?.role === 'ADMIN' && (
                                                <Button 
                                                    variant="ghost" 
                                                    icon={Trash2} 
                                                    onClick={(e) => handleDelete(e, c.id)}
                                                    className="text-xs py-2 rounded-lg text-rose-500 hover:bg-rose-50"
                                                >
                                                    حذف القضية
                                                </Button>
                                              )}
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  )
              })
          )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={newCase.id ? "تعديل بيانات ملف القضية" : "فتح ملف قضية جديد"}>
        <div className="space-y-4">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="رقم القضية" value={newCase.caseNumber || ''} onChange={e => setNewCase({...newCase, caseNumber: e.target.value})} placeholder="مثال: 2024/123/د" />
                <Select label="حالة القضية" value={newCase.status || 'PREPARING'} onChange={e => setNewCase({...newCase, status: e.target.value as CaseStatus})}>
                    <option value="PREPARING">قيد الإعداد (مسودة)</option>
                    <option value="ONGOING">جارية (في المحكمة)</option>
                    <option value="WINNING">رابحة (حكم نهائي)</option>
                    <option value="LOST">خاسرة (حكم نهائي)</option>
                </Select>
             </div>
             <Input label="عنوان الدعوى" value={newCase.title || ''} onChange={e => setNewCase({...newCase, title: e.target.value})} placeholder="مثال: دعوى مطالبة بمستحقات عمالية" />
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select label="الموكل المرتبط" value={newCase.clientId || ''} onChange={e => setNewCase({...newCase, clientId: e.target.value})}>
                    <option value="">اختر الموكل</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
                </Select>
                <Input label="المحكمة المختصة" value={newCase.court || ''} onChange={e => setNewCase({...newCase, court: e.target.value})} placeholder="مثال: محكمة دبي التجارية" />
             </div>
             <Input label="تاريخ الجلسة القادمة" type="date" value={newCase.nextHearingDate || ''} onChange={e => setNewCase({...newCase, nextHearingDate: e.target.value})} />
             <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">تفاصيل ووقائع الدعوى</label>
                <textarea 
                    className="shadow-sm focus:ring-2 focus:ring-slate-800 focus:border-slate-800 block w-full sm:text-sm border-slate-200 rounded-xl p-3 border min-h-[120px] outline-none transition-all" 
                    placeholder="اكتب هنا وقائع الدعوى، الطلبات، أو أي ملاحظات هامة..."
                    value={newCase.description || ''} 
                    onChange={e => setNewCase({...newCase, description: e.target.value})} 
                />
            </div>
             <div className="flex justify-end pt-2">
                <Button onClick={handleSave} className="px-8 rounded-xl shadow-lg">حفظ التغييرات</Button>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default Cases;
