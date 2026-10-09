module.exports=async function handler(req,res){
  try{
    const proto=req.headers['x-forwarded-proto']||'https';
    const host=req.headers.host;
    const r=await fetch(proto+'://'+host+'/index.html',{headers:{'Cache-Control':'no-cache'}});
    if(!r.ok)throw new Error('index source '+r.status);
    let html=await r.text();
    if(!html.includes('/demo-help.js'))html=html.replace('</body>','<script src="/demo-help.js" defer></script>\n</body>');
    res.setHeader('Content-Type','text/html; charset=utf-8');
    res.setHeader('Cache-Control','no-cache, no-store, must-revalidate');
    res.status(200).send(html);
  }catch(e){console.error(e);res.status(500).send('WhatCoin is temporarily unavailable.')}
};