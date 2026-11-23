import {NextRequest,NextResponse} from 'next/server';
import {timingSafeEqual} from 'crypto';
export const runtime='nodejs';
function authorized(req:NextRequest){const expected=process.env.SARAH_ACCESS_CODE||'';const given=req.headers.get('x-sarah-access')||'';if(!expected||expected.length<12||!given)return false;const a=Buffer.from(expected),b=Buffer.from(given);return a.length===b.length&&timingSafeEqual(a,b)}
export async function POST(req:NextRequest){
if(!authorized(req))return NextResponse.json({error:'ACCESS_REQUIRED'},{status:401});
if(!process.env.OPENAI_API_KEY)return NextResponse.json({error:'API_KEY_NOT_CONFIGURED'},{status:503});
try{
 const body=await req.json();const raw=body.messages;
 if(!Array.isArray(raw)||raw.length>16)return NextResponse.json({error:'INVALID_MESSAGES'},{status:400});
 const messages=raw.map((m:any)=>({role:m.role,content:m.content})).filter((m:any)=>['user','assistant'].includes(m.role)&&typeof m.content==='string'&&m.content.length<=3000);
 if(!messages.length)return NextResponse.json({error:'EMPTY_MESSAGES'},{status:400});
 const res=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.SARAH_TEXT_MODEL||'gpt-4.1-mini',instructions:'You are Sarah, a professional, warm, concise multilingual personal executive assistant. Respond in the language used by the user: Arabic, English, German or Russian. Assist with planning, drafting and organizing. This app has no calendar, WhatsApp, email or task tool connection; never claim that you sent, saved, scheduled, accessed or changed anything. Ask for confirmation for sensitive actions. Do not invent appointments or claim you can act autonomously. Keep replies friendly and to the point.',input:messages,max_output_tokens:650,store:false})});
 const data=await res.json();if(!res.ok)return NextResponse.json({error:'AI_PROVIDER_ERROR',details:data.error?.message||'Provider rejected the request'},{status:502});
 const answer=(data.output||[]).flatMap((x:any)=>x.content||[]).filter((x:any)=>x.type==='output_text').map((x:any)=>x.text).join('\n').trim();return NextResponse.json({answer:answer||'No response returned'});
}catch{return NextResponse.json({error:'SERVER_ERROR'},{status:500})}
}