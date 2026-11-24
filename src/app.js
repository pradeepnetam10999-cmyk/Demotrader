import {ASSETS,history,price,Live,K,testTD,testFH} from './data.js';
import {Chart} from './chart.js';
import {Brain} from './brain.js';
const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s),fmt=n=>'$'+n.toFixed(2);
const chart=new Chart($('#cv')),brain=new Brain(),live=new Live();
let asset=ASSETS[0],C1=[],C=[],tf=60,bal=+localStorage.bal||10000,T=[],exp=60,amt=100,px=0,lastSig=0,lastTick=0,snd=1,auto=0,sigOn=0,AC,ac;
const agg=(a,s)=>{if(s==60)return a;const o=[];a.forEach(c=>{const t=Math.floor(c.t/s)*s,l=o[o.length-1];if(l&&l.t==t){l.h=Math.max(l.h,c.h);l.l=Math.min(l.l,c.l);l.c=c.c}else o.push({...c,t})});return o};
const beep=(f=880,d=.12)=>{if(!snd)return;try{AC=window.AudioContext||window.webkitAudioContext;ac=ac||new AC();const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=f;g.gain.value=.1;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+d)}catch{}};
const tg=(id,fn)=>$(id).onclick=e=>{e.target.classList.toggle('on');fn(e.target.classList.contains('on'))};
const setAmt=v=>{amt=Math.max(1,Math.round(v));$('#amt').value=amt};
$('#as').innerHTML=ASSETS.map((a,i)=>`<option value=${i}>${a.n}</option>`).join('');
$('#as').onchange=e=>{if(T.length){e.target.value=ASSETS.indexOf(asset);return alert('Pehle open trade khatam hone do')}asset=ASSETS[e.target.value];chart.marks=[];load()};
$$('[data-e]').forEach(b=>b.onclick=()=>{exp=+b.dataset.e;$$('[data-e]').forEach(x=>x.classList.toggle('on',x===b))});
$$('[data-tf]').forEach(b=>b.onclick=()=>{tf=+b.dataset.tf;$$('[data-tf]').forEach(x=>x.classList.toggle('on',x===b));C=agg(C1,tf);chart.d=C;chart.draw()});
tg('#ty',o=>{chart.type=o?'l':'c';chart.draw()});tg('#ie',o=>{chart.ind.e=o;chart.draw()});tg('#ib',o=>{chart.ind.b=o;chart.draw()});tg('#snd',o=>snd=o);tg('#auto',o=>auto=o);
$('#fs').onclick=()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen();
$('#amt').oninput=e=>amt=Math.max(1,+e.target.value||1);$('#half').onclick=()=>setAmt(amt/2);$('#dbl').onclick=()=>setAmt(amt*2);
$('#up').onclick=()=>trade('up');$('#dn').onclick=()=>trade('down');$('#rs').onclick=()=>{bal=10000;upd()};
$('#cfg').onclick=()=>{$('#k1').value=K('td');$('#k2').value=K('fh');$('#msg').textContent='';$('#md').hidden=false};$('#cl').onclick=()=>$('#md').hidden=true;
$('#sv').onclick=async()=>{localStorage.td=$('#k1').value.trim();localStorage.fh=$('#k2').value.trim();const o=[];$('#msg').textContent='Testing…';
 try{await testTD();o.push('✅ Twelve Data OK')}catch(e){o.push('❌ Twelve: '+e.message)}
 try{await testFH();o.push('✅ Finnhub OK')}catch(e){o.push('❌ Finnhub: '+e.message)}
 $('#msg').innerHTML=o.join('<br>');if(o.every(x=>x[0]=='✅'))setTimeout(()=>{$('#md').hidden=true;load()},900)};
const lines=()=>T.map(t=>({p:t.e,c:t.d=='up'?'#26c281':'#ef4b5b',l:(t.d=='up'?'▲ ':'▼ ')+t.amt}));
function log(m,c){const d=document.createElement('div');d.className=c;d.textContent=new Date().toLocaleTimeString()+' '+m;$('#log').prepend(d);while($('#log').children.length>30)$('#log').lastChild.remove()}
function upd(){$('#bal').textContent=fmt(bal);localStorage.bal=bal;$('#pay').textContent='Payout '+asset.p+'%';chart.lines=lines();chart.draw()}
function trade(d){if(!px||amt>bal)return;bal-=amt;T.push({d,amt,e:px,p:asset.p/100,end:Date.now()+exp*1000,a:asset.n});beep(660,.08);upd()}
function settle(){const n=Date.now();if(!T.some(t=>t.end<=n))return;
 T=T.filter(t=>{if(t.end>n)return true;const tie=px==t.e,w=t.d=='up'?px>t.e:px<t.e;bal+=tie?t.amt:w?t.amt*(1+t.p):0;
  log(`${t.a} ${t.d=='up'?'CALL':'PUT'} ${tie?'TIE':w?'WIN +'+fmt(t.amt*t.p):'LOSS -'+fmt(t.amt)}`,w?'w':tie?'':'l');beep(w?1100:300,.25);return false});upd()}
function ren(){const n=Date.now();$('#ot').innerHTML=T.map(t=>{const d=t.d=='up'?px-t.e:t.e-px;return `<div class="${d>0?'w':d<0?'l':''}">${t.d=='up'?'▲':'▼'} ${fmt(t.amt)} · ${Math.max(0,Math.ceil((t.end-n)/1000))}s · ${d>0?'+'+fmt(t.amt*t.p):d<0?'-'+fmt(t.amt):'±0'}</div>`}).join('')||'<small>Koi open trade nahi</small>'}
function tick(p,ts,src){if(!C1.length)return;px=p;lastTick=Date.now();const m=Math.floor(ts/60000)*60,l=C1[C1.length-1];
 if(l.t===m){l.c=p;l.h=Math.max(l.h,p);l.l=Math.min(l.l,p)}else if(m>l.t)C1.push({t:m,o:p,h:p,l:p,c:p});
 C=agg(C1,tf);chart.d=C;chart.draw();$('#st').textContent=src=='ws'?'● LIVE (Finnhub)':'● LIVE (12s poll)'}
async function load(){live.close();$('#st').textContent='Loading history…';
 try{C1=await history(asset);C=agg(C1,tf);px=C1[C1.length-1].c;chart.d=C;chart.draw();upd();lastTick=0;
  $('#st').textContent=Date.now()/1000-C1[C1.length-1].t>900?'⚠ Market band (weekend?) — BTC/ETH try karo':'History OK';
  live.connect(asset.fh,tick,s=>$('#st').textContent='Live reconnecting…')}
 catch(e){$('#st').textContent='❌ '+e.message;if(!K('td'))$('#cfg').click()}}
setInterval(async()=>{if(!px||!K('td')||Date.now()-lastTick<10000)return;try{tick(await price(asset),Date.now(),'poll')}catch{}},12000); // fallback if WebSocket silent
function show(t,cls,why=''){$('#sig').className=cls;$('#sg').textContent=t;$('#rsn').textContent=why}
function fire(g,nx){const lb=(g.dir=='up'?'▲ CALL ':'▼ PUT ')+g.conf+'%';sigOn=1;show(lb,g.dir,g.why);beep(990,.2);
 setTimeout(()=>{const e=px;chart.marks.push({t:nx,d:g.dir});show(lb+' — ENTER NOW',g.dir,g.why);beep(1320,.3);if(auto)trade(g.dir);
  setTimeout(()=>{brain.record(g.dir=='up'?px>e:px<e);$('#stat').textContent=brain.stats()},exp*1000);
  setTimeout(()=>{sigOn=0;show('Scanning…','idle')},5000)},Math.max(0,nx*1000-Date.now()))}
setInterval(()=>{const now=Date.now()/1000,nx=Math.ceil(now/tf)*tf,rem=nx-now;$('#clk').textContent=new Date().toLocaleTimeString();$('#nc').textContent='next '+Math.ceil(rem)+'s';settle();ren();
 if(rem<=3&&lastSig!==nx&&C.length>55){lastSig=nx;const g=brain.decide(C,exp/60,now);g?fire(g,nx):show('No clear setup — wait','idle')}
 $('#cd').textContent=sigOn&&rem<=3?Math.ceil(rem)+'s':''},200);
$('#stat').textContent=brain.stats();upd();load();
