// Signal brain: multi-indicator scoring + regime filter + self-tuning threshold
const ema=(a,n)=>{const k=2/(n+1);let e=a[0];return a.map((v,i)=>i?(e=v*k+e*(1-k)):e)};
const rsi=(a,n=14)=>{let g=0,l=0;for(let i=a.length-n;i<a.length;i++){const d=a[i]-a[i-1];d>0?g+=d:l-=d}return l?100-100/(1+g/l):100};
const atr=(c,n=14)=>{let s=0;for(let i=c.length-n;i<c.length;i++)s+=Math.max(c[i].h-c[i].l,Math.abs(c[i].h-c[i-1].c),Math.abs(c[i].l-c[i-1].c));return s/n};
export function analyze(c,mult=1){
 const cl=c.map(x=>x.c),n=c.length-1,L=c[n],P=c[n-1],e9=ema(cl,9),e21=ema(cl,21),f=ema(cl,12),s=ema(cl,26),mc=f.map((v,i)=>v-s[i]),sg=ema(mc,9),h=mc.map((v,i)=>v-sg[i]);
 const a=atr(c)||1e-9,r=rsi(cl),w=cl.slice(-20),mu=w.reduce((p,v)=>p+v,0)/20,sd=Math.sqrt(w.reduce((p,v)=>p+(v-mu)**2,0)/20);
 const ts=(e9[n]-e21[n])/a,trend=Math.abs(ts)>.6?Math.sign(ts):0,V=[];
 const add=(v,t,rev)=>{if(rev&&trend&&Math.sign(v)!=trend)v/=2;V.push([v,t])};
 add(Math.sign(ts)*(1+.3*(Math.min(mult,3)-1))*1.5,'EMA9/21 trend');
 const sl=(e21[n]-e21[n-5])/a;if(Math.abs(sl)>.1)add(Math.sign(sl),'EMA21 slope');
 if(r<30)add(2,'RSI oversold',1);if(r>70)add(-2,'RSI overbought',1);
 if(L.c<mu-2*sd)add(1.5,'Below BB',1);if(L.c>mu+2*sd)add(-1.5,'Above BB',1);
 if(h[n]>0&&h[n]>h[n-1])add(1,'MACD up');if(h[n]<0&&h[n]<h[n-1])add(-1,'MACD down');
 const bd=Math.abs(L.c-L.o),wl=Math.min(L.o,L.c)-L.l,wu=L.h-Math.max(L.o,L.c);
 if(P.c<P.o&&L.c>L.o&&L.c>P.o&&L.o<P.c)add(1.5,'Bull engulfing',1);if(P.c>P.o&&L.c<L.o&&L.c<P.o&&L.o>P.c)add(-1.5,'Bear engulfing',1);
 if(wl>2*bd&&wl>wu*2)add(1,'Pin bar low',1);if(wu>2*bd&&wu>wl*2)add(-1,'Pin bar high',1);
 const sc=V.reduce((p,v)=>p+v[0],0),dir=sc>0?'up':'down',ag=V.filter(v=>Math.sign(v[0])==Math.sign(sc)),op=V.filter(v=>Math.sign(v[0])!=Math.sign(sc)).reduce((p,v)=>p+Math.abs(v[0]),0);
 const rg=c.slice(-50).map(x=>x.h-x.l),avg=rg.reduce((p,v)=>p+v,0)/50,rec=(rg[49]+rg[48]+rg[47])/3,ratio=rec/(avg||1e-9);
 return{dir,sc:Math.abs(sc),n:ag.length,op,ok:ratio>.5&&ratio<2.2,conf:Math.min(92,Math.round(50+Math.abs(sc)*5)),why:ag.map(v=>v[1]).join(' · ')};
}
export class Brain{
 constructor(){this.th=4.5;this.res=JSON.parse(localStorage.res||'[]');this.last=0;this.times=[]}
 decide(c,mult,now){
  this.times=this.times.filter(t=>now-t<3600);
  if(now-this.last<150||this.times.length>=8)return null; // not too many signals
  const a=analyze(c,mult);if(!a.ok||a.sc<this.th||a.n<3||a.op>1)return null; // not too few: only strong confluence
  this.last=now;this.times.push(now);return a}
 record(win){this.res.push(win?1:0);this.res=this.res.slice(-50);localStorage.res=JSON.stringify(this.res);
  if(this.res.length>=10){const wr=this.res.reduce((p,v)=>p+v,0)/this.res.length;this.th=Math.max(4,Math.min(7,this.th+(wr<.52?.5:wr>.6?-.25:0)))}}
 stats(){const n=this.res.length,w=this.res.reduce((p,v)=>p+v,0);return n?`Brain: ${w}W/${n-w}L (${Math.round(w/n*100)}%) · strictness ${this.th.toFixed(2)} · breakeven 54%`:'Brain: abhi koi result nahi'}
}
