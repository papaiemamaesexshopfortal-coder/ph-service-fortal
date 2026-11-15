const origin='https://caixa-autonomo-servico.blithenoodle2.chatgpt.site';
const decode=s=>s.replace(/<[^>]*>/g,'').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,'&');
export default async function handler(req,res){
res.setHeader('Cache-Control','no-store');
if(req.method!=='POST')return res.status(405).json({error:'Método não permitido'});
if(req.headers.origin && req.headers.origin!=='https://ph-service-fortal.vercel.app')return res.status(403).json({error:'Origem não autorizada'});
const message=typeof req.body?.message==='string'?req.body.message.trim():'';
if(!message||message.length>1200)return res.status(400).json({error:'Escreva até 1200 caracteres.'});
try{
const prompt='Atenda como Emily, assistente virtual da PH Service Fortal. A loja se chama PH Service Fortal; Emily é a agente. Pix e cartão de crédito são as opções atuais. Não solicite senha, cartão ou chave. Não confirme pagamento nem consulta de pedido. Responda apenas sobre produtos e serviços. Pergunta do visitante: '+message;
const r=await fetch(origin+'/emily/conversar',{method:'POST',redirect:'manual',signal:AbortSignal.timeout(50000),headers:{'Content-Type':'application/x-www-form-urlencoded','Origin':origin},body:new URLSearchParams({mensagem:prompt})});
const html=await r.text();const parts=[...html.matchAll(/<article>[\s\S]*?<pre>([\s\S]*?)<\/pre>[\s\S]*?<\/article>/g)];
if(!r.ok||!parts.length)return res.status(503).json({error:'Emily está temporariamente indisponível ou o limite gratuito foi atingido. Fale com Paulo pelo WhatsApp.'});
return res.status(200).json({answer:decode(parts[parts.length-1][1])});
}catch{return res.status(503).json({error:'Não consegui responder agora. Tente depois ou fale com Paulo pelo WhatsApp.'});}
}