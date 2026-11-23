'use client';
import {CalendarDays,MessageCircle,ExternalLink,ShieldCheck} from 'lucide-react';
export default function CalendarWhatsAppPanel(){
return <div className="integrations">
<section className="panel" dir="rtl" aria-label="Google Calendar">
<h2><CalendarDays/> التقويم | Google Calendar</h2>
<p className="integration-status">الحالة: لم يُربط داخل التطبيق بعد</p>
<p className="integration-text">يمكنك الآن فتح تقويمك وإضافة المواعيد. عرض مواعيدك مباشرة داخل سارة يحتاج موافقة Google وربطاً مستقلاً.</p>
<div className="entry" style={{flexWrap:'wrap'}}>
<a className="integration-link" href="https://calendar.google.com/calendar/u/0/r" target="_blank" rel="noopener noreferrer"><ExternalLink size={16}/> فتح التقويم</a>
<a className="integration-link" href="https://calendar.google.com/calendar/u/0/r/eventedit" target="_blank" rel="noopener noreferrer"><CalendarDays size={16}/> إضافة موعد</a>
</div>
</section>
<section className="panel" dir="rtl" aria-label="WhatsApp Business">
<h2><MessageCircle/> واتساب | WhatsApp Business</h2>
<p className="integration-status">الحالة: بانتظار إنشاء رقم أعمال وربطه رسمياً</p>
<p className="integration-text">جهزنا نقطة استقبال آمنة لرسائل واتساب في الخادم. لا يستقبل التطبيق أو يرد على الرسائل حتى يتم توثيق رقم سارة وإعداد WhatsApp Cloud API.</p>
<a className="integration-link" href="https://business.facebook.com/" target="_blank" rel="noopener noreferrer"><ExternalLink size={16}/> إعداد حساب Meta Business</a>
<p className="integration-text"><ShieldCheck size={14} style={{display:'inline',verticalAlign:'middle'}}/> لن تُرسل ردود آلية دون تفعيلك لها. قد توجد رسوم لدى Meta بحسب الاستخدام.</p>
</section>
</div>
}