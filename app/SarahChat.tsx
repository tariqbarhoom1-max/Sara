'use client';
import {useState,useRef} from 'react';
type Msg={role:'user'|'assistant';content:string};
export default function SarahChat(){const [geminiKey,setGeminiKey]=useState('');const [entry,setEntry]=useState('');const [messages,setMessages]=useState<Msg[]>([]);const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [speaking,setSpeaking]=useState(false);const [voiceStatus,setVoiceStatus]=useState('');const utteranceRef=useRef<SpeechSynthesisUtterance|null>(null);
async function send(){if(!entry.trim()||busy)return;const next=[...messages,{role:'user' as const,content:entry.trim()}].slice(-16);setBusy(true);setError('');try{const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json','x-gemini-key':geminiKey.trim().replace(/\s+/g,'')},body:JSON.stringify({messages:next})});const data=await r.json();if(!r.ok)throw new Error(data.error==='GEMINI_KEY_REQUIRED'?'لم يصل المفتاح كاملاً. انسخه مجدداً من Google AI Studio ثم الصقه هنا':data.details||data.error);setMessages([...next,{role:'assistant',content:data.answer}]);setEntry('')}catch(e){setError(e instanceof Error?e.message:'تعذر الاتصال')}finally{setBusy(false)}}
function speak(text:string){
 const synth=window.speechSynthesis;
 if(!synth||typeof SpeechSynthesisUtterance==='undefined'){setVoiceStatus('المتصفح لا يدعم القراءة الصوتية. جرّب فتح سارة في Safari.');return}
 if(speaking){synth.cancel();setSpeaking(false);setVoiceStatus('تم إيقاف الصوت');return}
 const cleaned=text.replace(/[*#_`]/g,' ').replace(/\s+/g,' ').trim();
 if(!cleaned){setVoiceStatus('لا يوجد نص لقراءته');return}
 const lang=/[\u0400-\u04FF]/.test(cleaned)?'ru-RU':/[\u0600-\u06FF]/.test(cleaned)?'ar-SA':/\b(und|ich|sie|nicht|hallo|danke)\b/i.test(cleaned)?'de-DE':'en-US';
 const voices=synth.getVoices();
 const chosen=voices.find(v=>v.lang.toLowerCase()===lang.toLowerCase())||voices.find(v=>v.lang.toLowerCase().startsWith(lang.slice(0,2).toLowerCase()));
 const u=new SpeechSynthesisUtterance(cleaned.slice(0,900));u.lang=chosen?.lang||lang;if(chosen)u.voice=chosen;
 u.rate=0.88;u.pitch=1;u.volume=1;
 u.onstart=()=>{setSpeaking(true);setVoiceStatus('سارة تتحدث الآن...')};
 u.onend=()=>{setSpeaking(false);setVoiceStatus('انتهت القراءة الصوتية');utteranceRef.current=null};
 u.onerror=(e)=>{setSpeaking(false);setVoiceStatus('تعذّر تشغيل الصوت ('+e.error+'). تأكد من رفع صوت الجهاز، ثم جرّب Safari.');utteranceRef.current=null};
 utteranceRef.current=u;setError('');setVoiceStatus('جاري تشغيل الصوت...');
 synth.cancel();synth.speak(u);
}
return <section className="panel sarah-chat" dir="rtl"><h2>💬 تحدث مع سارة — Sarah AI</h2><p style={{color:'#b9ccdb'}}>العربية · English · Deutsch · Русский</p><p style={{fontSize:13,color:'#dfc08a'}}>الصق مفتاح Gemini داخل التطبيق فقط. سيُرسل عبر HTTPS من تطبيقك إلى Google لتشغيل المحادثة، ولن نخزنه في المتصفح. الصوت من جهازك مجاناً. الرسائل لا تُرسل إلى واتساب أو التقويم.</p><label>مفتاح Gemini الخاص بك (لا ترسله في المحادثة)</label><input style={{display:'block',width:'100%',margin:'8px 0 15px'}} type="password" autoComplete="off" value={geminiKey} onChange={e=>{setGeminiKey(e.target.value);setError('')}} placeholder="الصق مفتاح Gemini من Google AI Studio"/><div style={{maxHeight:320,overflowY:'auto',display:'grid',gap:10}}>{messages.map((m,i)=><div key={i} style={{background:m.role==='assistant'?'#1c4058':'#152b3d',padding:12,borderRadius:12,whiteSpace:'pre-wrap'}}><strong>{m.role==='assistant'?'سارة':'أنت'}</strong><p>{m.content}</p>{m.role==='assistant'&&<button onClick={()=>speak(m.content)} disabled={busy} aria-label="Read reply aloud">{speaking?'⏹ إيقاف الصوت':'🔊 استمع إلى رد سارة'}</button>}</div>)}</div><p role="status" style={{color:'#d6b676',fontSize:13}}>{voiceStatus}</p><div className="entry" style={{marginTop:16}}><input style={{flex:1}} value={entry} onChange={e=>setEntry(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="اكتب رسالتك لسارة هنا"/><button onClick={send} disabled={busy||!entry.trim()}>{busy?'...':'إرسال'}</button></div>{error&&<p role="alert" style={{color:'#f4a8a8'}}>{error}</p>}</section>}
