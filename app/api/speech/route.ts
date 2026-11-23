import {NextRequest,NextResponse} from 'next/server';
import {timingSafeEqual} from 'crypto';
export const runtime='nodejs';
function authorized(req:NextRequest){const expected=process.env.SARAH_ACCESS_CODE||'';const given=req.headers.get('x-sarah-access')||'';if(!expected||expected.length<12||!given)return false;const a=Buffer.from(expected),b=Buffer.from(given);return a.length===b.length&&timingSafeEqual(a,b)}
export async function POST(req:NextRequest){
 if(!authorized(req))return NextResponse.json({error:'ACCESS_REQUIRED'},{status:401});
 if(!process.env.OPENAI_API_KEY)return NextResponse.json({error:'API_KEY_NOT_CONFIGURED'},{status:503});
 try{const body=await req.json();const input=body.text;if(typeof input!=='string'||!input.trim()||input.length>1800)return NextResponse.json({error:'INVALID_TEXT'},{status:400});
 const res=await fetch('https://api.openai.com/v1/audio/speech',{method:'POST',headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-4o-mini-tts',voice:'nova',input,format:'mp3',instructions:'Speak naturally in the input language with a calm, warm, welcoming professional feminine voice.'})});
 if(!res.ok)return NextResponse.json({error:'SPEECH_PROVIDER_ERROR'},{status:502});
 return new Response(await res.arrayBuffer(),{headers:{'Content-Type':'audio/mpeg','Cache-Control':'no-store'}});
 }catch{return NextResponse.json({error:'SERVER_ERROR'},{status:500})}
}