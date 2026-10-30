import { env } from 'cloudflare:workers';
const reply=(body:object,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(request:Request) {
  if(request.headers.get('origin')!==new URL(request.url).origin) return reply({error:'Please submit from the studio website.'},403);
  if(!request.headers.get('content-type')?.includes('application/json')) return reply({error:'Invalid request format.'},415);
  if(Number(request.headers.get('content-length')||0)>12000) return reply({error:'Application is too large.'},413);
  try {
    const raw=await request.text();
    if(raw.length>12000) return reply({error:'Application is too large.'},413);
    const body=JSON.parse(raw);
    const str=(key:string)=>typeof body[key]==='string'?body[key].trim():'';
    const id=str('id'),fullName=str('fullName'),phone=str('phone').replace(/[\s()-]/g,''),email=str('email'),experience=str('experience'),course=str('course'),schedule=str('schedule'),message=str('message');
    if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)||fullName.length<2||fullName.length>100||!/^(?:\+251|0)[79]\d{8}$/.test(phone)||email.length>254||(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))||!['Beginner','Some experience','Practicing photographer'].includes(experience)||!['Photography fundamentals','Portrait and newborn photography','Studio lighting','Editing and retouching'].includes(course)||!['Weekdays','Weekends','Flexible'].includes(schedule)||message.length>1500||body.consent!==true||str('website')) return reply({error:'Please check your name, Ethiopian phone number, course, schedule, and consent.'},400);
    const normalized=phone.startsWith('0')?'+251'+phone.slice(1):phone;
    const db=env.DB;
    if(!db) return reply({error:'Registration is temporarily unavailable. Please call the studio.'},503);
    const existing=await db.prepare('SELECT id FROM training_applications WHERE id=? AND phone=?').bind(id,normalized).first();
    if(existing) return reply({reference:id});
    const result=await db.prepare('INSERT INTO training_applications (id,full_name,phone,email,experience,course,schedule,message,status,consent_version,created_at) SELECT ?,?,?,?,?,?,?,?,\'Requested\',\'2026-10-v1\',? WHERE (SELECT COUNT(*) FROM training_applications WHERE phone=? AND created_at>?) < 3 ON CONFLICT(id) DO NOTHING').bind(id,fullName,normalized,email,experience,course,schedule,message,Date.now(),normalized,Date.now()-86400000).run();
    if(!result.meta.changes) return reply({error:'Too many applications today. Please call the studio for help.'},429);
    return reply({reference:id},201);
  } catch { return reply({error:'We could not save your application. Please try again or call the studio.'},500); }
}
