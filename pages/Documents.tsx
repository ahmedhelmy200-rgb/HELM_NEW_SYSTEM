
import React, { useState, useRef, useMemo } from 'react';
import { useStore } from '../store';
import { Card, Button, Input, Modal, Badge, Select } from '../components/UI';
import { 
  FileText, Plus, ScanLine, File, BookOpen, Wand2, Search, Briefcase, 
  Users, Download, CheckSquare, Square, X, Archive, FileDown, ImageIcon, Camera,
  Settings as SettingsIcon, Trash2, Edit, Tag
} from 'lucide-react';
import { parseDocumentContent, draftLegalDocument, analyzeLegalImage } from '../services/geminiService';
import { Document, Client, Case, LegalTemplate } from '../types';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';

const Documents = () => {
  const { 
    documents, addDocument, clients, legalTemplates, 
    addLegalTemplate, updateLegalTemplate, deleteLegalTemplate, currentUser 
  } = useStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSmartScanOpen, setIsSmartScanOpen] = useState(false);
  const [isImageScanOpen, setIsImageScanOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isManageTemplatesOpen, setIsManageTemplatesOpen] = useState(false);
  const [isEditTemplateModalOpen, setIsEditTemplateModalOpen] = useState(false);
  
  const [newDoc, setNewDoc] = useState<Partial<Document>>({});
  const [scanText, setScanText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isImageAnalyzing, setIsImageAnalyzing] = useState(false);
  
  const [editingTemplate, setEditingTemplate] = useState<Partial<LegalTemplate>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [extraNotes, setExtraNotes] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);

  const filteredDocuments = documents.filter(doc => {
    const term = searchTerm.toLowerCase();
    return doc.title.toLowerCase().includes(term) || doc.tags?.some(tag => tag.toLowerCase().includes(term));
  });

  // Group templates by category for the select menu
  const categorizedTemplates = useMemo(() => {
    const groups: Record<string, LegalTemplate[]> = {};
    legalTemplates.forEach(t => {
      if (!groups[t.category]) groups[t.category] = [];
      groups[t.category].push(t);
    });
    return groups;
  }, [legalTemplates]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImageAnalyzing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      const analysis = await analyzeLegalImage(base64, file.type);
      setIsImageAnalyzing(false);

      if (analysis) {
          setNewDoc({
              title: `تحليل بصري: ${analysis.documentType || 'وثيقة قانونية'}`,
              content: `الملخص المستخرج:\n${analysis.summary}\n\nالاسم المستخرج: ${analysis.extractedName}\nرقم الهوية: ${analysis.idNumber}\nتاريخ الانتهاء: ${analysis.expiryDate}`,
              tags: ['تحليل-بصري', analysis.documentType],
          });
          setIsImageScanOpen(false);
          setIsModalOpen(true);
      } else {
          alert("تعذر تحليل الصورة. يرجى التأكد من وضوحها.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSmartScan = async () => {
      if (!scanText) return;
      setIsScanning(true);
      const result = await parseDocumentContent(scanText);
      setIsScanning(false);
      
      if (result) {
          setNewDoc({
              title: result.documentTitle || 'مستند ممسوح ذكياً',
              tags: result.tags || ['مسح-ذكي'],
              content: scanText,
          });
          setIsSmartScanOpen(false);
          setIsModalOpen(true);
      }
  };

  const handleGenerateTemplate = async () => {
      const template = legalTemplates.find(t => t.id === selectedTemplate);
      const client = clients.find(c => c.id === selectedClientId);
      if (!template || !client) return;

      setIsDrafting(true);
      const content = await draftLegalDocument(template.name, client, extraNotes);
      setIsDrafting(false);

      setNewDoc({
          title: `${template.name} - ${client.fullName}`,
          content: content,
          clientId: client.id,
          tags: ['قالب-ذكي', template.category]
      });
      setIsTemplateModalOpen(false);
      setIsModalOpen(true);
  };

  const handleSave = () => {
      if(!newDoc.title) return;
      addDocument({
          ...newDoc,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          type: 'TEXT',
          tags: newDoc.tags || []
      } as Document);
      setIsModalOpen(false);
      setNewDoc({});
  };

  const handleSaveTemplate = () => {
    if (!editingTemplate.name || !editingTemplate.category) return;
    if (editingTemplate.id) {
        updateLegalTemplate(editingTemplate as LegalTemplate);
    } else {
        addLegalTemplate({
            ...editingTemplate,
            id: crypto.randomUUID()
        } as LegalTemplate);
    }
    setIsEditTemplateModalOpen(false);
    setEditingTemplate({});
  };

  const startEditTemplate = (t: LegalTemplate) => {
    setEditingTemplate(t);
    setIsEditTemplateModalOpen(true);
  };

  const startAddTemplate = () => {
    setEditingTemplate({ category: 'عام' });
    setIsEditTemplateModalOpen(true);
  };

  return (
    <div className="space-y-6 relative min-h-screen pb-24" dir="rtl">
       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">أرشيف المستندات الذكي</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">مكتب المستشار أحمد حلمي للاستشارات القانونية</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <div className="relative flex-1 sm:min-w-[250px]">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input 
                    type="text" 
                    placeholder="بحث في الأرشيف..." 
                    className="pr-10 pl-4 py-2.5 border rounded-xl w-full focus:ring-slate-800 focus:border-slate-800 text-right text-sm shadow-sm transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex gap-2 flex-wrap">
                <Button variant="secondary" icon={Camera} onClick={() => setIsImageScanOpen(true)}>مسح صورة (AI)</Button>
                <Button variant="secondary" icon={ScanLine} onClick={() => setIsSmartScanOpen(true)}>تحليل نص (AI)</Button>
                <Button variant="secondary" icon={BookOpen} onClick={() => setIsTemplateModalOpen(true)}>صياغة ذكية</Button>
                {currentUser?.role === 'ADMIN' && (
                    <Button variant="ghost" icon={SettingsIcon} onClick={() => setIsManageTemplatesOpen(true)}>إدارة القوالب</Button>
                )}
                <Button onClick={() => { setNewDoc({}); setIsModalOpen(true); }} icon={Plus}>رفع يدوي</Button>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map(doc => {
              const client = clients.find(c => c.id === doc.clientId);
              return (
                <Card key={doc.id} className="hover:border-slate-400 transition-all group relative cursor-pointer hover:shadow-xl rounded-2xl border-slate-100">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center">
                            <div className="p-3 rounded-xl bg-slate-50 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                <FileText className="h-6 w-6" />
                            </div>
                            <div className="mr-3">
                                <h3 className="text-sm font-black text-slate-900 line-clamp-1">{doc.title}</h3>
                                <p className="text-[10px] text-gray-400 font-bold">{new Date(doc.createdAt).toLocaleDateString('ar-SA')}</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4">
                        {client && <div className="text-xs text-slate-500 mb-2 flex items-center gap-1 font-bold"><Users className="h-3 w-3" /> {client.fullName}</div>}
                        <div className="flex flex-wrap gap-1">
                            {doc.tags?.map(tag => (
                                <Badge key={tag} color="slate" className="text-[10px]">{tag}</Badge>
                            ))}
                        </div>
                    </div>
                </Card>
              )
          })}
      </div>

      {/* Template Management Modal (Admin Only) */}
      <Modal isOpen={isManageTemplatesOpen} onClose={() => setIsManageTemplatesOpen(false)} title="إدارة قوالب المستندات القانونية">
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-2">
                  <p className="text-xs text-slate-500 font-medium">تحكم في أنواع المستندات التي يولدها النظام بالذكاء الاصطناعي.</p>
                  <Button variant="secondary" icon={Plus} onClick={startAddTemplate} className="text-xs py-1.5 px-3">إضافة قالب</Button>
              </div>
              <div className="space-y-2">
                  {legalTemplates.map(t => (
                      <div key={t.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                          <div className="text-right">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-slate-900">{t.name}</h4>
                                <Badge color="indigo" className="text-[9px]">{t.category}</Badge>
                              </div>
                              <p className="text-[10px] text-slate-500 mt-0.5">{t.description}</p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => startEditTemplate(t)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all"><Edit className="h-4 w-4" /></button>
                              <button onClick={() => { if(confirm('حذف هذا القالب؟')) deleteLegalTemplate(t.id); }} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-all"><Trash2 className="h-4 w-4" /></button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </Modal>

      {/* Edit/Add Template Modal */}
      <Modal isOpen={isEditTemplateModalOpen} onClose={() => setIsEditTemplateModalOpen(false)} title={editingTemplate.id ? "تعديل قالب" : "إضافة قالب جديد"}>
          <div className="space-y-4">
              <Input label="اسم القالب" value={editingTemplate.name || ''} onChange={e => setEditingTemplate({...editingTemplate, name: e.target.value})} placeholder="مثلاً: اتفاقية سرية معلومات" />
              <Input label="التصنيف" value={editingTemplate.category || ''} onChange={e => setEditingTemplate({...editingTemplate, category: e.target.value})} placeholder="مثلاً: عقود، وكالات، مراسلات" />
              <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">وصف القالب (للإرشاد)</label>
                  <textarea 
                    className="w-full border rounded-xl p-3 text-sm bg-slate-50 outline-none focus:ring-slate-800 focus:border-slate-800" 
                    rows={2} 
                    placeholder="صف غرض القالب ليتم استخدامه بشكل صحيح..." 
                    value={editingTemplate.description || ''}
                    onChange={e => setEditingTemplate({...editingTemplate, description: e.target.value})}
                  />
              </div>
              <div className="flex justify-end pt-2">
                  <Button onClick={handleSaveTemplate} className="rounded-xl px-10">حفظ القالب</Button>
              </div>
          </div>
      </Modal>

      {/* Image Scan Modal */}
      <Modal isOpen={isImageScanOpen} onClose={() => setIsImageScanOpen(false)} title="التحليل البصري للوثائق (Vision AI)">
          <div className="space-y-6 py-4">
              <div className="border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <ImageIcon className="h-10 w-10 text-slate-400" />
                  </div>
                  <h4 className="text-slate-900 font-black mb-1">ارفع صورة المستند</h4>
                  <p className="text-xs text-slate-500 font-medium">يدعم تحليل الهويات، الرخص، والوثائق المصورة</p>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>
              {isImageAnalyzing && (
                  <div className="flex flex-col items-center gap-3">
                      <div className="animate-spin h-8 w-8 border-4 border-slate-800 border-t-transparent rounded-full"></div>
                      <p className="text-sm text-slate-900 font-black animate-pulse">جاري تحليل البيانات باستخدام Gemini Vision...</p>
                  </div>
              )}
          </div>
      </Modal>

      {/* Smart Scan Modal */}
      <Modal isOpen={isSmartScanOpen} onClose={() => setIsSmartScanOpen(false)} title="التحليل الذكي للنصوص">
          <textarea
              className="w-full h-48 border rounded-2xl p-4 focus:ring-slate-800 focus:border-slate-800 text-sm mb-4 bg-slate-50 outline-none"
              placeholder="الصق نص المستند القانوني هنا ليقوم النظام بتصنيفه وتلخيصه..."
              value={scanText}
              onChange={e => setScanText(e.target.value)}
          />
          <div className="flex justify-end">
              <Button onClick={handleSmartScan} disabled={isScanning} className="rounded-xl px-8">
                  {isScanning ? 'جاري التحليل...' : 'بدء التحليل'}
              </Button>
          </div>
      </Modal>

      {/* Save Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="مراجعة وحفظ في الأرشيف">
          <div className="space-y-4">
              <Input label="عنوان المستند" value={newDoc.title || ''} onChange={e => setNewDoc({...newDoc, title: e.target.value})} className="rounded-xl" />
              <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">المحتوى المستخرج / المكتوب</label>
                  <textarea 
                    className="w-full h-64 border rounded-2xl p-4 text-sm focus:ring-slate-800 font-mono bg-slate-50 outline-none"
                    value={newDoc.content || ''}
                    onChange={e => setNewDoc({...newDoc, content: e.target.value})}
                  />
              </div>
              <div className="flex justify-end pt-2">
                <Button onClick={handleSave} className="rounded-xl px-10 shadow-lg">حفظ نهائي</Button>
              </div>
          </div>
      </Modal>

      {/* Drafting Modal */}
      <Modal isOpen={isTemplateModalOpen} onClose={() => setIsTemplateModalOpen(false)} title="صياغة من قالب ذكي">
          <div className="space-y-4">
              <Select label="اختر القالب" value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)}>
                  <option value="">-- اختر القالب --</option>
                  {Object.entries(categorizedTemplates).map(([category, templates]) => (
                    <optgroup key={category} label={category}>
                        {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </optgroup>
                  ))}
              </Select>
              <Select label="اختر الموكل" value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)}>
                  <option value="">-- اختر الموكل --</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
              </Select>
              <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">إضافات خاصة للصياغة</label>
                  <textarea 
                    className="w-full border rounded-xl p-3 text-sm bg-slate-50 outline-none focus:ring-slate-800 focus:border-slate-800" 
                    rows={3} 
                    placeholder="مثلاً: تحديد نطاق الوكالة، إضافة شروط سداد معينة..." 
                    value={extraNotes}
                    onChange={e => setExtraNotes(e.target.value)}
                  />
              </div>
              <div className="flex justify-end pt-2">
                  <Button onClick={handleGenerateTemplate} disabled={isDrafting} className="rounded-xl px-8 shadow-md">
                      {isDrafting ? 'جاري الصياغة...' : 'توليد المستند ذكياً'}
                  </Button>
              </div>
          </div>
      </Modal>
    </div>
  );
};

export default Documents;
