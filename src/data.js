// Twelve Data = history + price fallback, Finnhub = live WebSocket
export const ASSETS=[{n:'EUR/USD',td:'EUR/USD',fh:'OANDA:EUR_USD',p:85},{n:'GBP/USD',td:'GBP/USD',fh:'OANDA:GBP_USD',p:84},{n:'USD/JPY',td:'USD/JPY',fh:'OANDA:USD_JPY',p:83},{n:'AUD/USD',td:'AUD/USD',fh:'OANDA:AUD_USD',p:82},{n:'BTC/USD',td:'BTC/USD',fh:'BINANCE:BTCUSDT',p:87},{n:'ETH/USD',td:'ETH/USD',fh:'BINANCE:ETHUSDT',p:86}];
export const K=k=>(localStorage[k]||'').trim();
const J=async u=>{let r;try{r=await fetch(u)}catch{throw new Error('Network error (internet/adblock check karo)')}return r.json()};
const TD='https://api.twelvedata.com/';
export async function testTD(){const d=await J(`${TD}time_series?symbol=EUR/USD&interval=1min&outputsize=1&apikey=${K('td')}`);if(d.status=='error'||!d.values)throw new Error(d.message||'invalid');return 1}
export async function testFH(){let r;try{r=await fetch('https://finnhub.io/api/v1/quote?symbol=AAPL&token='+K('fh'))}catch{throw new Error('Network error')}if(r.status==401||r.status==403)throw new Error('key galat hai');if(!r.ok)throw new Error('HTTP '+r.status);return 1}
export async function history(a){
 const j=await J(`${TD}time_series?symbol=${encodeURIComponent(a.td)}&interval=1min&outputsize=1500&timezone=UTC&apikey=${K('td')}`);
 if(j.status=='error'||!j.values)throw new Error(j.message||'Twelve Data error');
 return j.values.reverse().map(v=>({t:Date.parse(v.datetime.replace(' ','T')+'Z')/1000,o:+v.open,h:+v.high,l:+v.low,c:+v.close}));
}
export async function price(a){const j=await J(`${TD}price?symbol=${encodeURIComponent(a.td)}&apikey=${K('td')}`);if(!j.price)throw new Error(j.message||'price error');return +j.price}
export class Live{
 connect(sym,cb,st){this.close();if(!K('fh'))return;const w=this.ws=new WebSocket('wss://ws.finnhub.io?token='+K('fh'));
  w.onopen=()=>w.send(JSON.stringify({type:'subscribe',symbol:sym}));
  w.onmessage=e=>{try{const m=JSON.parse(e.data);if(m.type=='trade'&&m.data)m.data.forEach(x=>cb(x.p,x.t,'ws'))}catch{}};
  w.onclose=()=>{if(this.ws===w){st('down');setTimeout(()=>this.ws===w&&this.connect(sym,cb,st),5000)}}}
 close(){const w=this.ws;this.ws=null;w&&w.close()}
}
