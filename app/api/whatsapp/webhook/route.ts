import {NextRequest,NextResponse} from 'next/server';
import {createHmac,timingSafeEqual} from 'crypto';
export const runtime='nodejs';
export async function GET(request:NextRequest){
 const verifyToken=process.env.WHATSAPP_VERIFY_TOKEN;
 if(!verifyToken)return new NextResponse('Not configured',{status:503});
 const query=request.nextUrl.searchParams;
 const mode=query.get('hub.mode')||'', token=query.get('hub.verify_token')||'', challenge=query.get('hub.challenge')||'';
 const a=Buffer.from(token),b=Buffer.from(verifyToken);
 if(mode!=='subscribe'||a.length!==b.length||!timingSafeEqual(a,b)||!challenge)return new NextResponse('Forbidden',{status:403});
 return new NextResponse(challenge,{status:200,headers:{'Content-Type':'text/plain'}});
}
export async function POST(request:NextRequest){
 const secret=process.env.META_APP_SECRET;
 if(!secret)return new NextResponse('Not configured',{status:503});
 const raw=await request.text();
 if(raw.length>200000)return new NextResponse('Too large',{status:413});
 const sig=request.headers.get('x-hub-signature-256')||'';
 const expected='sha256='+createHmac('sha256',secret).update(raw).digest('hex');
 const a=Buffer.from(sig),b=Buffer.from(expected);
 if(a.length!==b.length||!timingSafeEqual(a,b))return new NextResponse('Unauthorized',{status:401});
 // Webhook verification is ready. No message automation is enabled.
 // A future authenticated queue and opt-in reply policy are required before replies.
 return NextResponse.json({received:true});
}
