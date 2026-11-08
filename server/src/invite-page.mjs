import {randomBytes} from 'node:crypto';

// Public HTTPS landing, only the fragment contains the one-time invite code.
// URL fragments are NOT sent to the HTTP server, limiting exposure in access logs.
export function inviteLanding(res) {
  const nonce=randomBytes(16).toString('base64');
  const page = '<!doctype html><html lang="mk"><head><meta charset="utf-8">'+
    '<meta name="viewport" content="width=device-width,initial-scale=1">'+
    '<meta name="referrer" content="no-referrer">'+
    '<title>ТРИАЛУМ · Покана</title>'+
    '<style nonce="'+nonce+'">'+
    'body{font-family:system-ui,sans-serif;margin:0;background:#071626;color:#e3fff7;min-height:100vh;display:grid;place-items:center;padding:24px;box-sizing:border-box}'+
    'main{max-width:460px;width:100%;padding:28px;border:1px solid #315f66;border-radius:24px;background:#112c3c;box-shadow:0 20px 80px #030e18}'+
    '[hidden]{display:none!important}h1{font-size:26px}p{line-height:1.5;color:#c2d5dc}a{display:block;text-align:center;background:#55e3ae;color:#07322c;font-weight:bold;padding:16px;border-radius:12px;text-decoration:none;margin:24px 0}'+
    'code{display:block;overflow-wrap:anywhere;background:#06212b;border-radius:10px;padding:12px;font-size:12px}'+
    '</style></head><body><main><h1>🐾 ТРИАЛУМ</h1>'+
    '<p>Пријател те поканува на дружба во TRIALUM. Провери го името пред да прифатиш.</p>'+
    '<a id="open" hidden>Отвори во TRIALUM</a><p id="status"></p><p class="small">Ако копчето не ја отвори играта, копирај го кодот и внеси го во Пријатели.</p><code id="code"></code>'+
    '</main><script nonce="'+nonce+'">'+
    'const c=location.hash.slice(1),ok=/^[A-Za-z0-9_-]{43}$/.test(c),button=document.getElementById("open");'+
    'document.getElementById("status").textContent=ok?"Поканата важи 15 минути.":"Невалидна покана. Побарај нова.";'+
    'document.getElementById("code").textContent=ok?c:"";'+
    'if(ok){button.href="trialum://invite/"+c;button.hidden=false;}'+
    '</script></body></html>';
  res.writeHead(200,{
    'content-type':'text/html; charset=utf-8',
    'cache-control':'no-store','x-content-type-options':'nosniff',
    'referrer-policy':'no-referrer',
    'x-frame-options':'DENY',
    'content-security-policy':"default-src 'none'; style-src 'nonce-"+nonce+"'; script-src 'nonce-"+nonce+"'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"
  });
  res.end(page);
}
