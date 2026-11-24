const ema=(a,n)=>{const k=2/(n+1);let e=a[0];return a.map((v,i)=>i?(e=v*k+e*(1-k)):e)};
export class Chart{
 constructor(c){this.c=c;this.x=c.getContext('2d');this.d=[];this.n=80;this.type='c';this.ind={e:0,b:0};this.lines=[];this.marks=[];
  new ResizeObserver(()=>this.rs()).observe(c.parentElement);
  c.addEventListener('wheel',e=>{e.preventDefault();this.n=Math.max(20,Math.min(200,this.n+(e.deltaY>0?8:-8)));this.draw()},{passive:false})}
 rs(){const p=this.c.parentElement,r=devicePixelRatio||1;this.w=p.clientWidth;this.h=p.clientHeight;this.c.width=this.w*r;this.c.height=this.h*r;this.x.setTransform(r,0,0,r,0,0);this.draw()}
 draw(){const x=this.x,W=this.w,H=this.h,v=this.d.slice(-this.n);if(!W||!v.length)return;x.clearRect(0,0,W,H);
  const R=64,B=22,ph=H-B;let hi=Math.max(...v.map(c=>c.h)),lo=Math.min(...v.map(c=>c.l));const pd=(hi-lo)*.12||hi*1e-4;hi+=pd;lo-=pd;
  const y=p=>ph*(1-(p-lo)/(hi-lo)),bw=(W-R)/this.n,off=(this.n-v.length)*bw,dc=hi>1000?2:hi>50?3:5;
  x.font='11px system-ui';x.lineWidth=1;
  for(let i=0;i<=5;i++){const p=lo+(hi-lo)*i/5,Y=y(p);x.strokeStyle='#1b2335';x.beginPath();x.moveTo(0,Y);x.lineTo(W-R,Y);x.stroke();x.fillStyle='#6b7690';x.fillText(p.toFixed(dc),W-R+6,Y+4)}
  v.forEach((c,i)=>{const X=off+i*bw+bw/2;if((c.t/60)%10==0){x.fillStyle='#6b7690';x.fillText(new Date(c.t*1000).toTimeString().slice(0,5),X-14,H-6)}
   if(this.type=='l')return;x.fillStyle=x.strokeStyle=c.c>=c.o?'#26c281':'#ef4b5b';x.beginPath();x.moveTo(X,y(c.h));x.lineTo(X,y(c.l));x.stroke();
   x.fillRect(X-bw*.35,y(Math.max(c.o,c.c)),Math.max(1,bw*.7),Math.max(1,Math.abs(y(c.o)-y(c.c))))});
  const XX=i=>off+i*bw+bw/2,pl=(a,col)=>{x.strokeStyle=col;x.beginPath();a.forEach((p,i)=>i?x.lineTo(XX(i),y(p)):x.moveTo(XX(i),y(p)));x.stroke()},al=this.d.map(c=>c.c);
  if(this.type=='l')pl(v.map(c=>c.c),'#4a6cf7');
  if(this.ind.e){pl(ema(al,9).slice(-v.length),'#f5a623');pl(ema(al,21).slice(-v.length),'#b36bff')}
  if(this.ind.b){const u=[],m=[],lw=[];al.forEach((_,i)=>{const w=al.slice(Math.max(0,i-19),i+1),mu=w.reduce((p,q)=>p+q,0)/w.length,sd=Math.sqrt(w.reduce((p,q)=>p+(q-mu)**2,0)/w.length);u.push(mu+2*sd);m.push(mu);lw.push(mu-2*sd)});[u,m,lw].forEach(a=>pl(a.slice(-v.length),'#4aa3b8'))}
  const dr=(p,col,lb)=>{if(p<lo||p>hi)return;const Y=y(p);x.strokeStyle=col;x.setLineDash([4,4]);x.beginPath();x.moveTo(0,Y);x.lineTo(W-R,Y);x.stroke();x.setLineDash([]);x.fillStyle=col;x.fillRect(W-R,Y-9,R,18);x.fillStyle='#fff';x.fillText(lb,W-R+4,Y+4)};
  const last=v[v.length-1].c;dr(last,'#4a6cf7',last.toFixed(dc));this.lines.forEach(l=>dr(l.p,l.c,l.l));
  this.marks.forEach(m=>{const i=v.findIndex(c=>c.t===m.t);if(i<0)return;const up=m.d=='up';x.fillStyle=up?'#26c281':'#ef4b5b';x.fillText(up?'▲':'▼',off+i*bw+bw/2-5,up?y(v[i].l)+16:y(v[i].h)-8)})}
}
