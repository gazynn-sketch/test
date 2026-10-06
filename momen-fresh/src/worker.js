/* Worker serves only this owner-private Site. R2 is never exposed publicly. */
const json=(x,status=200)=>Response.json(x,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
export default {async fetch(request,env,ctx){const u=new URL(request.url);try{
 if(u.pathname.startsWith('/api/')){
  if(!request.headers.get('oai-authenticated-user-id'))return json({error:'sign_in_required'},401);
  if(!env.BUCKET)return json({error:'storage_unavailable'},503);
  const key='accounts/current.json';
  if(request.method==='GET'&&u.pathname==='/api/state'){const o=await env.BUCKET.get(key);return json({etag:o?.etag||null,state:o?await o.json():null});}
  if(request.method==='GET'&&u.pathname==='/api/history'){const objects=await env.BUCKET.list({prefix:'snapshots/',limit:30});return json({items:objects.objects.map(o=>({key:o.key,uploaded:o.uploaded}))});}
  if(request.method==='GET'&&u.pathname==='/api/snapshot'){const k=u.searchParams.get('key');if(!k||!/^snapshots\/[0-9]{13}-[a-f0-9-]{36}\.json$/.test(k))return json({error:'invalid_key'},400);const o=await env.BUCKET.get(k);if(!o)return json({error:'not_found'},404);const current=await env.BUCKET.head(key);return json({state:await o.json(),etag:current?.etag||null});}
  if(request.method==='PUT'&&u.pathname==='/api/state'){
   if(request.headers.get('origin')!==u.origin)return json({error:'invalid_origin'},403);
   if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'invalid_type'},415);
   const limit=8000000;if(Number(request.headers.get('content-length'))>limit)return json({error:'too_large'},413);
   const reader=request.body?.getReader();if(!reader)return json({error:'missing_body'},400);let size=0;const chunks=[];while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>limit){await reader.cancel();return json({error:'too_large'},413);}chunks.push(value);}const raw=new Uint8Array(size);let offset=0;for(const c of chunks){raw.set(c,offset);offset+=c.length;}const body=JSON.parse(new TextDecoder().decode(raw));MF.validate(body.state);if(body.etag!==null&&(typeof body.etag!=='string'||!/^\w{1,128}$/.test(body.etag)))return json({error:'invalid_etag'},400);
   const data=JSON.stringify(body.state);const conditions=new Headers();conditions.set(body.etag?'If-Match':'If-None-Match',body.etag?'"'+body.etag+'"':'*');
   const saved=await env.BUCKET.put(key,data,{onlyIf:conditions,httpMetadata:{contentType:'application/json'}});if(!saved)return json({error:'conflict'},409);
   const snapshotKey='snapshots/'+String(9999999999999-Date.now())+'-'+crypto.randomUUID()+'.json';
   try{await env.BUCKET.put(snapshotKey,data,{httpMetadata:{contentType:'application/json'}});}catch(e){console.error('Snapshot storage failed');return json({etag:saved.etag,archive:false});}
   return json({etag:saved.etag,archive:true});
  }
  return json({error:'not_found'},404);
 }
 if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
 let content,type;if(u.pathname==='/'||u.pathname==='/index.html'||u.pathname==='/offline.html'){content=HTML;type='text/html;charset=utf-8';}else if(u.pathname==='/sw.js'){content=SW;type='text/javascript;charset=utf-8';}else if(u.pathname==='/manifest.json'){content=MANIFEST;type='application/manifest+json';}else return new Response('Not found',{status:404});
 return new Response(request.method==='HEAD'?null:content,{headers:{'Content-Type':type,'Cache-Control':'private, no-cache','X-Momen-App':'1','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self' https://chatgpt.com"}});
 }catch(e){console.error('Momen Fresh request failed',e.message);return json({error:'invalid_request_or_storage_failure'},400);}}};
