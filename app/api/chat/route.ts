import {NextRequest,NextResponse} from 'next/server';
import {timingSafeEqual} from 'crypto';
export const runtime='nodejs';
function authorized(req:NextRequest){const expected=process.env.SARAH_ACCESS_CODE||'';const given=req.headers.get('x-sarah-access')||'';if(!expected||expected.length<12||!given)return false;const a=Buffer.from(expected),b=Buffer.from(given);return a.length===b.length&&timingSafeEqual(a,b)}
export async function POST(req:NextRequest){
 if(!authorized(req))return NextResponse.json({error:'ACCESS_REQUIRED'},{status:401});
 const key=process.env.GEMINI_API_KEY;
 if(!key)return NextResponse.json({error:'FREE_AI_NOT_CONFIGURED'},{status:503});
 try{
 const body=await req.json();const raw=body.messages;
 if(!Array.isArray(raw)||raw.length>16)return NextResponse.json({error:'INVALID_MESSAGES'},{status:400});
 const messages=raw.filter((m:any)=>['user','assistant'].includes(m.role)&&typeof m.content==='string'&&m.content.length<=3000);
 if(!messages.length||messages[messages.length-1].role!=='user')return NextResponse.json({error:'INVALID_MESSAGES'},{status:400});
 const contents=messages.map((m:any)=>({role:m.role==='assistant'?'model':'user',parts:[{text:m.content}]}));
 const model=process.env.SARAH_GEMINI_MODEL||'gemini-2.5-flash-lite';
 const res=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(model)+':generateContent',{method:'POST',headers:{'x-goog-api-key':key,'Content-Type':'application/json'},body:JSON.stringify({systemInstruction:{parts:[{text:'You are Sarah, a professional, warm multilingual personal assistant. Reply in the user language (Arabic, English, German, Russian). Help plan, draft and organize, but never claim you accessed, saved, scheduled, sent or changed any external system: this app has no external integrations. Do not invent business data.'}]},contents,generationConfig:{maxOutputTokens:800,temperature:0.6}})});
 const data=await res.json();if(!res.ok)return NextResponse.json({error:'FREE_AI_PROVIDER_ERROR',details:res.status===429?'Free-tier usage limit reached':data.error?.message||'Provider rejected request'},{status:502});
 const answer=(data.candidates?.[0]?.content?.parts||[]).map((p:any)=>p.text||'').join('\n').trim();
 return NextResponse.json({answer:answer||'No response returned'});
 }catch{return NextResponse.json({error:'SERVER_ERROR'},{status:500})}
}