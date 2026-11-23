'use client';
import {useState,useRef,useEffect} from 'react';
type Msg={role:'user'|'assistant';content:string};
export default function SarahChat(){const [geminiKey,setGeminiKey]=useState('');const [entry,setEntry]=useState('');const [messages,setMessages]=useState<Msg[]>([]);const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [speaking,setSpeaking]=useState(false);const [voiceStatus,setVoiceStatus]=useState('');const utteranceRef=useRef<SpeechSynthesisUtterance|null>(null);const [availableVoices,setAvailableVoices]=useState<SpeechSynthesisVoice[]>([]);const [preferredVoice,setPreferredVoice]=useState('');
useEffect(()=>{if(!('speechSynthesis' in window))return;const sync=()=>setAvailableVoices(window.speechSynthesis.getVoices());sync();window.speechSynthesis.addEventListener?.('voiceschanged',sync);try{setPreferredVoice(localStorage.getItem('sarah.voice')||'')}catch{}return()=>{window.speechSynthesis.removeEventListener?.('voiceschanged',sync)}},[]);
const women=['laila','layla','leila','samantha','karen','moira','tessa','ava','allison','victoria','serena','susan','zira','anna','helena','katja','milena','irina','olga','female','woman','zahra','amira','mariam','nora','lucia','mónica','monica','fiona','alice','joana','martha'];
function rankVoice(v:SpeechSynthesisVoice,lang:string){const name=v.name.toLowerCase();return (v.lang.toLowerCase().startsWith(lang.slice(0,2).toLowerCase())?100:0)+(women.some(n=>name.includes(n))?25:0)+(v.localService?3:0)}
function selectedFor(lang:string){const voices=window.speechSynthesis.getVoices();const selected=voices.find(v=>v.voiceURI===preferredVoice);if(selected&&selected.lang.slice(0,2).toLowerCase()===lang.slice(0,2).toLowerCase())return selected;return [...voices].filter(v=>v.lang.slice(0,2).toLowerCase()===lang.slice(0,2).toLowerCase()).sort((a,b)=>rankVoice(b,lang)-rankVoice(a,lang))[0]}
function chooseVoice(uri:string){setPreferredVoice(uri);try{localStorage.setItem('sarah.voice',uri)}catch{}setVoiceStatus(uri?'تم اختيار الصوت. اضغط «تجربة الصوت» للاستماع.':'سيتم اختيار أفضل صوت متاح تلقائياً.')}
function previewVoice(){speak('مرحباً، أنا سارة، مساعدتك الشخصية. سعيدة بالتحدث معك.')}
async function send(){if(!entry.trim()||busy)return;const next=[...messages,{role:'user' as const,content:entry.trim()}].slice(-16);setBusy(true);setError('');try{const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json','x-gemini-key':geminiKey.trim().replace(/\s+/g,'')},body:JSON.stringify({messages:next})});const data=await r.json();if(!r.ok)throw new Error(data.error==='GEMINI_KEY_REQUIRED'?'لم يصل المفتاح كاملاً. انسخه مجدداً من Google AI Studio ثم الصقه هنا':data.details||data.error);setMessages([...next,{role:'assistant',content:data.answer}]);setEntry('')}catch(e){setError(e instanceof Error?e.message:'تعذر الاتصال')}finally{setBusy(false)}}
function speak(text:string){
 const synth=window.speechSynthesis;
 if(!synth||typeof SpeechSynthesisUtterance==='undefined'){setVoiceStatus('المتصفح لا يدعم القراءة الصوتية. جرّب فتح سارة في Safari.');return}
 if(speaking){synth.cancel();setSpeaking(false);setVoiceStatus('تم إيقاف الصوت');return}
 const cleaned=text.replace(/[*#_`]/g,' ').replace(/\s+/g,' ').trim();
 if(!cleaned){setVoiceStatus('لا يوجد نص لقراءته');return}
 const lang=/[\u0400-\u04FF]/.test(cleaned)?'ru-RU':/[\u0600-\u06FF]/.test(cleaned)?'ar-SA':/\b(und|ich|sie|nicht|hallo|danke)\b/i.test(cleaned)?'de-DE':'en-US';
 const chosen=selectedFor(lang);
 const u=new SpeechSynthesisUtterance(cleaned.slice(0,900));u.lang=chosen?.lang||lang;if(chosen)u.voice=chosen;
 u.rate=0.88;u.pitch=1;u.volume=1;
 u.onstart=()=>{setSpeaking(true);setVoiceStatus('سارة تتحدث الآن...')};
 u.onend=()=>{setSpeaking(false);setVoiceStatus('انتهت القراءة الصوتية');utteranceRef.current=null};
 u.onerror=(e)=>{setSpeaking(false);setVoiceStatus('تعذّر تشغيل الصوت ('+e.error+'). تأكد من رفع صوت الجهاز، ثم جرّب Safari.');utteranceRef.current=null};
 utteranceRef.current=u;setError('');setVoiceStatus('جاري تشغيل الصوت...');
 synth.cancel();synth.speak(u);
}
return <section className="panel sarah-chat" dir="rtl"><h2>💬 تحدث مع سارة — Sarah AI</h2><p style={{color:'#b9ccdb'}}>العربية · English · Deutsch · Русский</p><p style={{fontSize:13,color:'#dfc08a'}}>الصق مفتاح Gemini داخل التطبيق فقط. سيُرسل عبر HTTPS من تطبيقك إلى Google لتشغيل المحادثة، ولن نخزنه في المتصفح. الصوت من جهازك مجاناً. الرسائل لا تُرسل إلى واتساب أو التقويم.</p><label>مفتاح Gemini الخاص بك (لا ترسله في المحادثة)</label><input style={{display:'block',width:'100%',margin:'8px 0 15px'}} type="password" autoComplete="off" value={geminiKey} onChange={e=>{setGeminiKey(e.target.value);setError('')}} placeholder="الصق مفتاح Gemini من Google AI Studio"/><div style={{margin:'12px 0',padding:12,border:'1px solid #31506a',borderRadius:12}}>
<label htmlFor="sarah-voice">🎙️ صوت سارة (اختر صوتاً أنثوياً)</label>
<div className="entry" style={{marginTop:8,flexWrap:'wrap'}}>
<select id="sarah-voice" value={availableVoices.some(v=>v.voiceURI===preferredVoice)?preferredVoice:''} onChange={e=>chooseVoice(e.target.value)} style={{flex:1,maxWidth:'none',minWidth:180}}>
<option value="">اختيار تلقائي (يفضّل صوتاً أنثوياً)</option>
{availableVoices.filter(v=>['ar','en','de','ru'].includes(v.lang.slice(0,2).toLowerCase())).sort((a,b)=>a.lang.localeCompare(b.lang)||rankVoice(b,b.lang)-rankVoice(a,a.lang)).map(v=><option value={v.voiceURI} key={v.voiceURI}>{v.name} — {v.lang}{women.some(n=>v.name.toLowerCase().includes(n))?' ♀':''}</option>)}
</select>
<button type="button" onClick={previewVoice}>🔊 تجربة الصوت</button>
</div>
<p style={{fontSize:12,color:'#aec4d3'}}>تختلف الأصوات حسب جهازك. اختر اسماً بعلامة ♀ إن توفر. إذا لم يتوفر صوت أنثوي باللغة المطلوبة، يمكن إضافة صوت عبر إعدادات الجهاز.</p>
</div><div style={{maxHeight:320,overflowY:'auto',display:'grid',gap:10}}>{messages.map((m,i)=><div key={i} style={{background:m.role==='assistant'?'#1c4058':'#152b3d',padding:12,borderRadius:12,whiteSpace:'pre-wrap'}}><strong>{m.role==='assistant'?'سارة':'أنت'}</strong><p>{m.content}</p>{m.role==='assistant'&&<button onClick={()=>speak(m.content)} disabled={busy} aria-label="Read reply aloud">{speaking?'⏹ إيقاف الصوت':'🔊 استمع إلى رد سارة'}</button>}</div>)}</div><p role="status" style={{color:'#d6b676',fontSize:13}}>{voiceStatus}</p><div className="entry" style={{marginTop:16}}><input style={{flex:1}} value={entry} onChange={e=>setEntry(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="اكتب رسالتك لسارة هنا"/><button onClick={send} disabled={busy||!entry.trim()}>{busy?'...':'إرسال'}</button></div>{error&&<p role="alert" style={{color:'#f4a8a8'}}>{error}</p>}</section>}
