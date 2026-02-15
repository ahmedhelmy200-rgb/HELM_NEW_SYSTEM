
import React from 'react';
import { Card, Button } from '../components/UI';
import { Globe, ExternalLink, Shield, Gavel, Building2, Landmark, FileCheck, ShieldAlert } from 'lucide-react';

const LegalHub = () => {
    const categories = [
        {
            title: "المحاكم والدوائر القضائية",
            icon: Gavel,
            links: [
                { name: "وزارة العدل - الإمارات", url: "https://www.moj.gov.ae/" },
                { name: "محاكم دبي - البوابة الإلكترونية", url: "https://www.dc.gov.ae/" },
                { name: "دائرة القضاء - أبوظبي", url: "https://www.adjd.gov.ae/" },
                { name: "محاكم رأس الخيمة", url: "https://www.rak.ae/wps/portal/rak/rak-courts" },
            ]
        },
        {
            title: "النيابة العامة والتحقيق",
            icon: ShieldAlert,
            links: [
                { name: "النيابة العامة الاتحادية", url: "https://www.pp.gov.ae/" },
                { name: "نيابة دبي", url: "https://www.dxbpp.gov.ae/" },
            ]
        },
        {
            title: "وزارة الداخلية والشرطة",
            icon: Shield,
            links: [
                { name: "وزارة الداخلية - الخدمات الذكية", url: "https://www.moi.gov.ae/" },
                { name: "شرطة دبي - الاستعلام الجنائي", url: "https://www.dubaipolice.gov.ae/" },
                { name: "شرطة أبوظبي", url: "https://www.adpolice.gov.ae/" },
            ]
        },
        {
            title: "الهيئات والوزارات الخدمية",
            icon: Building2,
            links: [
                { name: "وزارة الموارد البشرية (MOHRE)", url: "https://www.mohre.gov.ae/" },
                { name: "دائرة الأراضي والأملاك - دبي", url: "https://dubailand.gov.ae/" },
                { name: "الهيئة الاتحادية للهوية والجنسية", url: "https://icp.gov.ae/" },
            ]
        },
        {
            title: "التشريعات والجريدة الرسمية",
            icon: FileCheck,
            links: [
                { name: "بوابة التشريعات لدولة الإمارات", url: "https://uaelegislation.gov.ae/" },
                { name: "الجريدة الرسمية - وزارة العدل", url: "https://www.moj.gov.ae/ar/services/e-library/official-gazette.aspx" },
            ]
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500" dir="rtl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">مركز الخدمات القانونية</h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">دليل الروابط الحكومية والقضائية الموحد لمكتب المستشار أحمد حلمي</p>
                </div>
                <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-2xl flex items-center gap-2 border border-blue-100 shadow-sm">
                    <Globe className="h-4 w-4" />
                    <span className="text-xs font-black uppercase">UAE Gov Cloud Directory</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat, idx) => (
                    <Card key={idx} className="hover:border-slate-300 transition-all group overflow-hidden border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-slate-900 text-white rounded-2xl group-hover:scale-110 transition-transform shadow-lg">
                                <cat.icon className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900">{cat.title}</h3>
                        </div>
                        <div className="space-y-2">
                            {cat.links.map((link, lIdx) => (
                                <a 
                                    key={lIdx} 
                                    href={link.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-3 bg-slate-50 hover:bg-white hover:shadow-md rounded-xl border border-transparent hover:border-slate-200 transition-all text-sm font-bold text-slate-700 group/link"
                                >
                                    <span>{link.name}</span>
                                    <ExternalLink className="h-4 w-4 text-slate-300 group-hover/link:text-slate-900 transition-colors" />
                                </a>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>

            <div className="bg-amber-50 border-2 border-dashed border-amber-200 p-8 rounded-[40px] flex flex-col items-center text-center">
                <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                    <Shield className="h-8 w-8 text-amber-500" />
                </div>
                <h4 className="text-lg font-black text-amber-900">تنبيه أمني هام</h4>
                <p className="max-w-2xl text-sm text-amber-700 font-medium leading-relaxed mt-2">
                    يرجى دائماً التأكد من تسجيل الخروج من البوابات الحكومية عند انتهاء العمل، وعدم مشاركة كلمات المرور الخاصة بالمنصات القضائية (مثل منصة التقاضي عن بُعد) مع أي أطراف غير مصرح لها.
                </p>
            </div>
        </div>
    );
};

export default LegalHub;
