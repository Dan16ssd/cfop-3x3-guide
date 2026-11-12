/* ---------- cube model ---------- */
const MOVES={
 R:[0,-1,p=>p[0]===1], L:[0,1,p=>p[0]===-1], U:[1,-1,p=>p[1]===1], D:[1,1,p=>p[1]===-1], F:[2,-1,p=>p[2]===1], B:[2,1,p=>p[2]===-1],
 r:[0,-1,p=>p[0]>=0], l:[0,1,p=>p[0]<=0], u:[1,-1,p=>p[1]>=0], d:[1,1,p=>p[1]<=0], f:[2,-1,p=>p[2]>=0], b:[2,1,p=>p[2]<=0],
 M:[0,1,p=>p[0]===0], E:[1,1,p=>p[1]===0], S:[2,-1,p=>p[2]===0],
 x:[0,-1,()=>true], y:[1,-1,()=>true], z:[2,-1,()=>true]
};
function rot(v,a,q){q=((q%4)+4)%4;let[x,y,z]=v;for(let i=0;i<q;i++){if(a===0)[y,z]=[-z,y];else if(a===1)[x,z]=[z,-x];else[x,y]=[-y,x];}return[x,y,z];}
const FACE_N={U:[0,1,0],D:[0,-1,0],R:[1,0,0],L:[-1,0,0],F:[0,0,1],B:[0,0,-1]};
const FACE_COLOR={U:'Y',D:'W',F:'G',B:'B',R:'O',L:'R'};
const HEX={Y:'#ffd500',W:'#ffffff',G:'#009b48',B:'#0046ad',O:'#ff6a00',R:'#c8102e'};
const eq=(a,b)=>a[0]===b[0]&&a[1]===b[1]&&a[2]===b[2];
function faceOf(n){for(const k in FACE_N)if(eq(FACE_N[k],n))return k;}
function solved(){const s=[];for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++){const p=[x,y,z];if(!x&&!y&&!z)continue;for(let a=0;a<3;a++)if(p[a]){const n=[0,0,0];n[a]=p[a];s.push({p:p.slice(),n,h:p.slice(),hn:n.slice(),c:FACE_COLOR[faceOf(n)]});}}return s;}
function parse(alg){return alg.replace(/[()\[\]]/g,' ').trim().split(/\s+/).filter(Boolean).map(t=>{let m=t.match(/^([RLUDFB])w(.*)$/);if(m)t=m[1].toLowerCase()+m[2];m=t.match(/^([RLUDFBrludfbMESxyz])(2'|'2|2|')?$/);if(!m)throw new Error('Unknown move "'+t+'"');const k=m[2]?(m[2]==="'"?-1:2):1;return{face:m[1],k,text:t};});}
function applyMove(s,mv){const[a,dir,sel]=MOVES[mv.face];const q=dir*mv.k;for(const st of s)if(sel(st.p)){st.p=rot(st.p,a,q);st.n=rot(st.n,a,q);}}
function applyAlg(s,alg){for(const m of(typeof alg==='string'?parse(alg):alg))applyMove(s,m);return s;}
function invert(ms){return ms.slice().reverse().map(m=>({...m,k:m.k===2?2:-m.k}));}
function caseOf(alg,pre){const s=solved();applyAlg(s,invert(parse(alg)));if(pre)applyAlg(s,pre);return s;}
function find(s,p,n){return s.find(st=>eq(st.p,p)&&eq(st.n,n));}
const nz=p=>p.filter(v=>v!==0).length;

/* ---------- drawing ---------- */
const NS='http://www.w3.org/2000/svg';
function svg(vb,cls){const e=document.createElementNS(NS,'svg');e.setAttribute('viewBox',vb);if(cls)e.setAttribute('class',cls);e.setAttribute('role','img');return e;}
function el(tag,attrs,parent){const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e;}
const MASK='var(--mask)';

/* last-layer top view. mode: olle | oll | pllc | pll */
function llDiagram(s,mode,arrows){
  const S=svg('0 0 118 118');const o=14,c=30;
  el('rect',{x:o-2,y:o-2,width:94,height:94,rx:5,style:'fill:var(--body)'},S);
  const colorFor=st=>{
    const piece=nz(st.p);
    if(mode==='olle'){return (piece<=2&&st.c==='Y')?HEX.Y:MASK;}
    if(mode==='oll'){return st.c==='Y'?HEX.Y:MASK;}
    if(mode==='coll'){if(piece===3)return st.c==='Y'?HEX.Y:(st.n[1]===1?MASK:HEX[st.c]);return st.n[1]===1?HEX.Y:MASK;}
    if(mode==='pllc'){return (piece===3||st.n[1]===1)?HEX[st.c]:MASK;}
    return HEX[st.c];
  };
  for(let x=-1;x<=1;x++)for(let z=-1;z<=1;z++){const st=find(s,[x,1,z],[0,1,0]);
    el('rect',{x:o+(x+1)*c+2,y:o+(z+1)*c+2,width:c-4,height:c-4,rx:3,style:'fill:'+colorFor(st)},S);}
  for(let i=-1;i<=1;i++){
    const strips=[[[i,1,-1],[0,0,-1],o+(i+1)*c+2,3,c-4,9],[[i,1,1],[0,0,1],o+(i+1)*c+2,106,c-4,9],[[-1,1,i],[-1,0,0],3,o+(i+1)*c+2,9,c-4],[[1,1,i],[1,0,0],106,o+(i+1)*c+2,9,c-4]];
    for(const[p,n,x,y,w,h]of strips){const st=find(s,p,n);el('rect',{x,y,width:w,height:h,rx:2,style:'fill:'+colorFor(st)},S);}
  }
  if(arrows){
    const id='ah'+Math.random().toString(36).slice(2,8);
    const defs=el('defs',{},S);const mk=el('marker',{id,viewBox:'0 0 10 10',refX:'8',refY:'5',markerWidth:'5',markerHeight:'5',orient:'auto-start-reverse'},defs);
    el('path',{d:'M0,0 L10,5 L0,10 z',style:'fill:#111'},mk);
    const cen=p=>[o+(p[0]+1)*c+c/2,o+(p[2]+1)*c+c/2];
    const seen=new Set();
    for(let x=-1;x<=1;x++)for(let z=-1;z<=1;z++){
      if(!x&&!z)continue;const p=[x,1,z];
      if(arrows==='corners'&&nz(p)!==3)continue;
      const st=s.find(t=>eq(t.p,p));if(eq(st.h,p))continue;
      const key=[p,st.h].map(String).sort().join('|');
      const back=s.find(t=>eq(t.p,st.h));const two=eq(back.h,p);
      if(two&&seen.has(key))continue;seen.add(key);
      let[a1,b1]=cen(p),[a2,b2]=cen(st.h);const dx=a2-a1,dy=b2-b1,L=Math.hypot(dx,dy);const sh=9;
      a1+=dx/L*sh;b1+=dy/L*sh;a2-=dx/L*sh;b2-=dy/L*sh;
      const attrs={x1:a1,y1:b1,x2:a2,y2:b2,style:'stroke:#111;stroke-width:2.6;stroke-linecap:round','marker-end':'url(#'+id+')'};
      if(two)attrs['marker-start']='url(#'+id+')';
      el('line',attrs,S);
    }
  }
  return S;
}

/* isometric U/F/R view */
function isoDiagram(s,maskFn,cls){
  const k=20,P=v=>[((v[0]-v[2])*0.866*k).toFixed(2),(((v[0]+v[2])*0.5-v[1])*k).toFixed(2)];
  const S=svg('-56 -64 112 128',cls);
  const faces=[{n:[0,1,0],u:[1,0,0],v:[0,0,1]},{n:[0,0,1],u:[1,0,0],v:[0,1,0]},{n:[1,0,0],u:[0,0,1],v:[0,1,0]}];
  const quad=(c,u,v,r)=>[[1,1],[1,-1],[-1,-1],[-1,1]].map(([a,b])=>P([c[0]+u[0]*r*a+v[0]*r*b,c[1]+u[1]*r*a+v[1]*r*b,c[2]+u[2]*r*a+v[2]*r*b]).join(',')).join(' ');
  for(const f of faces){el('polygon',{points:quad(f.n.map(x=>x*1.5),f.u,f.v,1.5),style:'fill:var(--body);stroke:var(--body);stroke-width:1.5;stroke-linejoin:round'},S);}
  for(const f of faces)for(const st of s){if(!eq(st.n,f.n))continue;
    const c=st.p.map((x,i)=>x+f.n[i]*0.5);
    const col=maskFn&&!maskFn(st)?MASK:HEX[st.c];
    el('polygon',{points:quad(c,f.u,f.v,0.43),style:'fill:'+col},S);}
  return S;
}
const f2lMask=st=>{const h=st.h;if(nz(h)===1)return true;if(h[1]===-1&&nz(h)===2)return true;if(eq(h,[1,-1,1])||eq(h,[1,0,1]))return true;return false;};

/* flat net */
function netDiagram(s){
  const c=14,S=svg('0 0 '+(12*c)+' '+(9*c),'net');
  const pos={U:[3,0],L:[0,3],F:[3,3],R:[6,3],B:[9,3],D:[3,6]};
  const gridOf=(f,p)=>{const[x,y,z]=p;switch(f){case'U':return[x+1,z+1];case'F':return[x+1,1-y];case'R':return[1-z,1-y];case'B':return[1-x,1-y];case'L':return[z+1,1-y];case'D':return[x+1,1-z];}};
  for(const f in pos){el('rect',{x:pos[f][0]*c,y:pos[f][1]*c,width:3*c,height:3*c,rx:2,style:'fill:var(--body)'},S);}
  for(const st of s){const f=faceOf(st.n);const[cx,cy]=gridOf(f,st.p);
    el('rect',{x:(pos[f][0]+cx)*c+1.2,y:(pos[f][1]+cy)*c+1.2,width:c-2.4,height:c-2.4,rx:1.5,style:'fill:'+HEX[st.c]},S);}
  return S;
}

/* ---------- data ---------- */
const F2L=[
 {g:'Ready to insert',alg:"R U R'"},{g:'Ready to insert',alg:"F' U' F"},{g:'Ready to insert',alg:"U R U' R'"},{g:'Ready to insert',alg:"U' F' U F"},
 {g:'Split pair: set up, then insert',alg:"U' R U R' U2 R U' R'"},{g:'Split pair: set up, then insert',alg:"U F' U' F U2 F' U F"},
 {g:'Split pair: set up, then insert',alg:"U' R U2 R' U2 R U' R'"},{g:'Split pair: set up, then insert',alg:"U F' U2 F U2 F' U F"},
 {g:'Split pair: set up, then insert',alg:"U' R U' R' U R U R'"},{g:'Split pair: set up, then insert',alg:"U F' U F U' F' U' F"},
 {g:'White sticker facing up',alg:"R U2 R' U' R U R'"},{g:'White sticker facing up',alg:"F' U2 F U F' U' F"}
];
const OLLE=[{name:'Line',alg:"F R U R' U' F'",tip:'Hold the line horizontally.'},{name:'L-shape',alg:"f R U R' U' f'",tip:'Hold the L at the back-left.'},{name:'Dot',alg:"F R U R' U' F' f R U R' U' f'",tip:'Line alg, then L alg.'}];
const OLLC=[
 {name:'Sune',alg:"R U R' U R U2 R'",tip:'One yellow corner on top: hold it front-left.'},
 {name:'Antisune',alg:"R U2 R' U' R U' R'",tip:'Mirror image of Sune: one yellow corner, other way round.'},
 {name:'H · Double headlights',alg:"R U R' U R U' R' U R U2 R'",tip:'No yellow corners on top. Match the picture.'},
 {name:'Pi',alg:"R U2 R2 U' R2 U' R2 U2 R",tip:'No yellow corners on top. Turn U until it matches the picture.'},
 {name:'Headlights',alg:"R2 D R' U2 R D' R' U2 R'",tip:'Two yellow corners on top, side by side. Match the picture.'},
 {name:'Chameleon',alg:"r U R' U' r' F R F'",tip:'Two adjacent yellow corners on top. Match the picture.'},
 {name:'Bowtie',alg:"F' r U R' U' r' F R",tip:'Two yellow corners on top, diagonal from each other.'}
];
const PLLC=[
 {name:'Adjacent swap · T-perm',alg:"R U R' U' R' F R2 U' R' U' R U R' F'",tip:'Headlights on one side only: hold them on the left.'},
 {name:'Diagonal swap · Y-perm',alg:"F R U' R' U' R U R' F' R U R' U' R' F R F'",tip:'No headlights anywhere. Any angle works.'}
];
const PLLE=[
 {name:'Ua-perm',alg:"R U' R U R U R U' R' U' R2",tip:'Solved side at the back. Three edges cycle.'},
 {name:'Ub-perm',alg:"R2 U R U R' U' R' U' R' U R'",tip:'Solved side at the back, cycle the other way.'},
 {name:'H-perm',alg:"M2 U M2 U2 M2 U M2",tip:'Opposite edges swap on both axes.'},
 {name:'Z-perm',alg:"M2 U M2 U M' U2 M2 U2 M' U2",tip:'Neighbouring edges swap in two pairs.'}
];
/* ---------- learned state ---------- */
const allIds=new Set();
let learned=new Set();
try{learned=new Set(JSON.parse(localStorage.getItem('cfop-learned')||'[]'));}catch(e){}
function saveLearned(){try{localStorage.setItem('cfop-learned',JSON.stringify([...learned]));}catch(e){}updateProgress();}
function updateProgress(){const all=allIds.size||1;const n=[...learned].filter(id=>allIds.has(id)).length;document.getElementById('progText').textContent=n+' of '+all+' cases learned';document.getElementById('progFill').style.width=(n/all*100)+'%';}

const posName=p=>({'1,1,0':'top-right','0,1,1':'top-front','-1,1,0':'top-left','0,1,-1':'top-back'})[p.join(',')]||'in the slot';
const dirName={U:'up',F:'front',R:'right',L:'left',B:'back',D:'down'};

function card(item,diagram,id){
  allIds.add(id);const d=document.createElement('div');d.className='card'+(learned.has(id)?' learned':'');
  const dia=document.createElement('div');dia.className='dia';dia.appendChild(diagram);d.appendChild(dia);
  d.insertAdjacentHTML('beforeend',`<div class="nm"><b>${item.name}</b>${item.sub?`<span>${item.sub}</span>`:''}</div><div class="alg">${item.alg}</div>${item.tip?`<div class="hint">${item.tip}</div>`:''}`);
  const row=document.createElement('div');row.className='row';
  row.innerHTML=`<label class="chk"><input type="checkbox" id="lr-${id}" ${learned.has(id)?'checked':''}> Learned</label>`;
  const b=document.createElement('button');b.className='sm';b.textContent='Try it';b.onclick=()=>loadCase(item.alg,item.name);row.appendChild(b);
  row.querySelector('input').onchange=e=>{e.target.checked?learned.add(id):learned.delete(id);d.classList.toggle('learned',e.target.checked);saveLearned();};
  d.appendChild(row);return d;
}

function renderF2L(){
  const host=document.getElementById('f2lCards');let g=null,grid;
  F2L.forEach((it,i)=>{
    if(it.g!==g){g=it.g;host.insertAdjacentHTML('beforeend',`<div class="group-title">${g}</div>`);grid=document.createElement('div');grid.className='cards';host.appendChild(grid);}
    const s=caseOf(it.alg);
    const cw=s.find(st=>eq(st.h,[1,-1,1])&&st.c==='W');const eg=s.find(st=>eq(st.h,[1,0,1])&&st.c==='G');
    const item={name:'Case '+(i+1),sub:(it.alg.split(' ').length)+' moves',alg:it.alg,tip:`Corner above the slot, white facing ${dirName[faceOf(cw.n)]}. Edge ${posName(eg.p)}, green facing ${dirName[faceOf(eg.n)]}.`};
    grid.appendChild(card(item,isoDiagram(s,f2lMask),'f2l'+i));
  });
}
function renderLL(list,host,mode,prefix,arrows){
  const h=document.getElementById(host);
  list.forEach((it,i)=>{const s=caseOf(it.alg);h.appendChild(card({...it,sub:it.alg.split(' ').length+' moves'},mode.startsWith('pll')?pllDia(s,mode,arrows):llDiagram(s,mode,arrows),prefix+i));});
}
/* 3D (isometric) view of a last-layer case, with a turn button and a switch to the top view */
function pllDia(s,mode,arrows){
  const box=document.createElement('div');box.className='dual';
  box.innerHTML='<div class="view"></div><div class="dual-ctl"><button class="sm rb" type="button" title="Turn the cube to see the other sides" aria-label="Turn the cube">↻ Turn</button><button class="sm tg" type="button"></button></div>';
  const view=box.querySelector('.view'),rb=box.querySelector('.rb'),tg=box.querySelector('.tg');
  const mask=mode==='pllc'?(st=>!(st.h[1]===1&&nz(st.h)===2&&st.n[1]!==1)):null;
  let rotY=0,top=false;
  const draw=()=>{let v;if(top)v=llDiagram(s,mode,arrows);else{const t=s.map(x=>({...x,p:x.p.slice(),n:x.n.slice()}));for(let i=0;i<rotY;i++)applyAlg(t,'y');v=isoDiagram(t,mask);}
    view.replaceChildren(v);tg.textContent=top?'3D view':'Top view';rb.hidden=top;};
  rb.onclick=()=>{rotY=(rotY+1)%4;draw();};tg.onclick=()=>{top=!top;draw();};
  draw();return box;
}

/* ---------- playground ---------- */
let pg=solved(),queue=[],qi=0;
let cube3d=null;
function pgMove(m){applyMove(pg,m);if(cube3d)cube3d.enqueue(m);}
function drawPg(animated){document.getElementById('pgNet').replaceChildren(netDiagram(pg));
  if(cube3d){cube3d.model=pg;if(!animated){cube3d.clear();cube3d.sync(pg);}}
  else document.getElementById('pgIso').replaceChildren(isoDiagram(pg,null,'iso'));}
function drawSteps(){const h=document.getElementById('pgSteps');h.replaceChildren();queue.forEach((m,i)=>{const sp=document.createElement('span');sp.textContent=m.text;if(i<qi)sp.className='done';else if(i===qi)sp.className='next';h.appendChild(sp);});document.getElementById('pgStep').disabled=qi>=queue.length;}
function status(t,err){const s=document.getElementById('pgStatus');s.textContent=t;s.classList.toggle('err',!!err);}
function loadCase(alg,name){pg=solved();applyAlg(pg,invert(parse(alg)));queue=parse(alg);qi=0;drawPg();drawSteps();status(name+' loaded. Press Next move to step through, or Apply to run it all.');document.getElementById('algIn').value=alg;document.getElementById('playground').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}
function initPg(){
  const pad=document.getElementById('movepad');
  ["R","R'","L","L'","U","U'","D","D'","F","F'","B","B'","M","M'","R2","U2","x","y"].forEach(m=>{const b=document.createElement('button');b.textContent=m;b.onclick=()=>{parse(m).forEach(pgMove);queue=[];qi=0;drawPg(true);drawSteps();status('Did '+m+'.');};pad.appendChild(b);});
  document.getElementById('algApply').onclick=()=>{try{const ms=parse(document.getElementById('algIn').value);if(queue.length&&qi<queue.length&&ms.map(m=>m.text).join(' ')===queue.map(m=>m.text).join(' ')){for(;qi<queue.length;qi++)pgMove(queue[qi]);}else{ms.forEach(pgMove);queue=ms;qi=ms.length;}drawPg(true);drawSteps();status('Applied '+ms.length+' moves.');}catch(e){status(e.message+'. Use R L U D F B, M, r f, x y z with \' or 2.',true);}};
  document.getElementById('algIn').addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('algApply').click();});
  document.getElementById('pgStep').onclick=()=>{if(qi<queue.length){pgMove(queue[qi]);status('Did '+queue[qi].text+' ('+(qi+1)+' of '+queue.length+').');qi++;drawPg(true);drawSteps();}};
  document.getElementById('pgReset').onclick=()=>{pg=solved();queue=[];qi=0;drawPg();drawSteps();status('Solved cube. White bottom, green front.');};
  document.getElementById('pgScramble').onclick=()=>{const sc=makeScramble();pg=solved();applyAlg(pg,'z2 '+sc+' z2');queue=[];qi=0;drawPg();drawSteps();status('Scrambled: '+sc+' (applied with white on top, then flipped so white is on the bottom).');};
  if(window.THREE&&window.Cube3D){try{cube3d=new Cube3D(document.getElementById('pgIso'),{speed:260});}catch(e){cube3d=null;}}
  const sp=document.getElementById('pgSpeed');sp.oninput=()=>{if(cube3d)cube3d.speed=+sp.value;document.getElementById('pgSpeedVal').textContent=sp.value+' ms';};
  drawPg();drawSteps();
}

/* ---------- scramble + timer ---------- */
function makeScramble(n=20){const faces='RLUDFB',axis={R:0,L:0,U:1,D:1,F:2,B:2},suf=['',"'",'2'];const out=[];
  while(out.length<n){const f=faces[Math.floor(Math.random()*6)];const a=out[out.length-1],b=out[out.length-2];
    if(a&&a[0]===f)continue;if(a&&b&&axis[a[0]]===axis[f]&&axis[b[0]]===axis[f])continue;out.push(f+suf[Math.floor(Math.random()*3)]);}
  return out.join(' ');}
let times=[];try{times=JSON.parse(localStorage.getItem('cfop-times')||'[]');}catch(e){}
const fmt=ms=>ms==null?'–':(ms/1000).toFixed(2);
function aoN(n){if(times.length<n)return null;const l=times.slice(-n).slice().sort((a,b)=>a-b);const cut=Math.ceil(n*0.05);const m=l.slice(cut,n-cut);return m.reduce((a,b)=>a+b,0)/m.length;}
function drawTimes(){try{localStorage.setItem('cfop-times',JSON.stringify(times));}catch(e){}
  document.getElementById('stBest').textContent=times.length?fmt(Math.min(...times)):'–';
  document.getElementById('stAo5').textContent=fmt(aoN(5));document.getElementById('stAo12').textContent=fmt(aoN(12));document.getElementById('stN').textContent=times.length;
  const h=document.getElementById('times');h.replaceChildren();times.slice(-12).reverse().forEach(t=>{const s=document.createElement('span');s.textContent=fmt(t);h.appendChild(s);});}
function initTimer(){
  const clock=document.getElementById('clock'),scr=document.getElementById('scr');
  let state='idle',t0=0,raf=0,holdT=0;
  const newScr=()=>{scr.textContent=makeScramble();};newScr();
  const tick=()=>{clock.textContent=((performance.now()-t0)/1000).toFixed(2);raf=requestAnimationFrame(tick);};
  const down=()=>{if(state==='running'){cancelAnimationFrame(raf);const t=performance.now()-t0;clock.textContent=(t/1000).toFixed(2);times.push(Math.round(t));drawTimes();newScr();state='stopped';return;}
    if(state==='idle'||state==='done'){state='holding';clock.className='clock hold';holdT=setTimeout(()=>{if(state==='holding'){state='ready';clock.className='clock ready';clock.textContent='0.00';}},300);}};
  const up=()=>{if(state==='stopped'){state='done';return;}if(state==='holding'){clearTimeout(holdT);state='idle';clock.className='clock';}
    else if(state==='ready'){state='running';clock.className='clock';t0=performance.now();tick();}};
  document.addEventListener('keydown',e=>{if(['INPUT','SELECT'].includes(e.target.tagName))return;if(state==='running'){e.preventDefault();down();return;}if(e.code==='Space'&&!e.repeat){const r=clock.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;e.preventDefault();down();}});
  document.addEventListener('keyup',e=>{if(e.target.tagName==='INPUT')return;if(e.code==='Space'||state==='stopped'){up();}});
  clock.addEventListener('pointerdown',e=>{e.preventDefault();down();});clock.addEventListener('pointerup',e=>{e.preventDefault();up();});
  document.getElementById('newScr').onclick=newScr;
  document.getElementById('scrToPg').onclick=()=>{pg=solved();applyAlg(pg,'z2 '+scr.textContent+' z2');queue=[];qi=0;drawPg();drawSteps();status('Timer scramble loaded (scrambled white-top, shown white-bottom).');document.getElementById('playground').scrollIntoView();};
  document.getElementById('delLast').onclick=()=>{times.pop();drawTimes();};
  let armed=false;const cl=document.getElementById('clearTimes');cl.onclick=()=>{if(!armed){armed=true;cl.textContent='Click again to clear';setTimeout(()=>{armed=false;cl.textContent='Clear session';},2500);return;}times=[];drawTimes();armed=false;cl.textContent='Clear session';};
  drawTimes();
}

/* ---------- full OLL / PLL ---------- */
const OLL_ALGS={1:"R U2 R2 F R F' U2 R' F R F'",2:"F R U R' U' F' f R U R' U' f'",3:"f R U R' U' f' U' F R U R' U' F'",4:"f R U R' U' f' U F R U R' U' F'",
5:"l' U2 L U L' U l",6:"r U2 R' U' R U' r'",7:"r U R' U R U2 r'",8:"l' U' L U' L' U2 l",9:"R U R' U' R' F R2 U R' U' F'",10:"R U R' U R' F R F' R U2 R'",
11:"r U R' U R' F R F' R U2 r'",12:"M' R' U' R U' R' U2 R U' R r'",13:"F U R U' R2 F' R U R U' R'",14:"R' F R U R' F' R F U' F'",15:"l' U' l L' U' L U l' U l",
16:"r U r' R U R' U' r U' r'",17:"R U R' U R' F R F' U2 R' F R F'",18:"r U R' U R U2 r2 U' R U' R' U2 r",19:"r' R U R U R' U' M' R' F R F'",20:"r U R' U' M2 U R U' R' U' M'",
21:"R U R' U R U' R' U R U2 R'",22:"R U2 R2 U' R2 U' R2 U2 R",23:"R2 D R' U2 R D' R' U2 R'",24:"r U R' U' r' F R F'",25:"F' r U R' U' r' F R",26:"R U2 R' U' R U' R'",27:"R U R' U R U2 R'",
28:"r U R' U' M U R U' R'",29:"R U R' U' R U' R' F' U' F R U R'",30:"F R' F R2 U' R' U' R U R' F2",31:"R' U' F U R U' R' F' R",32:"L U F' U' L' U L F L'",
33:"R U R' U' R' F R F'",34:"R U R2 U' R' F R U R U' F'",35:"R U2 R2 F R F' R U2 R'",36:"L' U' L U' L' U L U L F' L' F",37:"F R' F' R U R U' R'",
38:"R U R' U R U' R' U' R' F R F'",39:"L F' L' U' L U F U' L'",40:"R' F R U R' U' F' U R",41:"R U R' U R U2 R' F R U R' U' F'",42:"R' U' R U' R' U2 R F R U R' U' F'",
43:"F' U' L' U L F",44:"F U R U' R' F'",45:"F R U R' U' F'",46:"R' U' R' F R F' U R",47:"R' U' R' F R F' R' F R F' U R",48:"F R U R' U' R U R' U' F'",
49:"r U' r2 U r2 U r2 U' r",50:"r' U r2 U' r2 U' r2 U r'",51:"F U R U' R' U R U' R' F'",52:"R U R' U R U' B U' B' R'",53:"l' U2 L U L' U' L U L' U l",
54:"r U2 R' U' R U R' U' R U' r'",55:"R' F R U R U' R2 F' R2 U' R' U R U R'",56:"r' U' r U' R' U R U' R' U R r' U r",57:"R U R' U' M' U R U' r'"};
const PLL_ALGS={Aa:"x R' U R' D2 R U' R' D2 R2 x'",Ab:"x R2 D2 R U R' D2 R U' R x'",E:"x' R U' R' D R U R' D' R U R' D R U' R' D' x",F:"R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R",
Ga:"R2 U R' U R' U' R U' R2 U' D R' U R D'",Gb:"R' U' R U D' R2 U R' U R U' R U' R2 D",Gc:"R2 U' R U' R U R' U R2 U D' R U' R' D",Gd:"R U R' U' D R2 U' R U' R' U R' U R2 D'",
H:"M2 U M2 U2 M2 U M2",Ja:"R' U L' U2 R U' R' U2 R L U'",Jb:"R U R' F' R U R' U' R' F R2 U' R' U'",Na:"R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'",
Nb:"R' U R U' R' F' U' F R U R' F R' F' R U' R",Ra:"R U' R' U' R U R D R' U' R D' R' U2 R' U'",Rb:"R2 F R U R U' R' F' R U2 R' U2 R U",T:"R U R' U' R' F R2 U' R' U' R U R' F'",
Ua:"R U' R U R U R U' R' U' R2",Ub:"R2 U R U R' U' R' U' R' U R'",V:"R' U R' U' B' R' B2 U' B' U B' R B R",Y:"F R U' R' U' R U R' F' R U R' U' R' F R F'",Z:"M2 U M2 U M' U2 M2 U2 M' U2"};
const OLL_GROUPS=[['Dot (no edges oriented)',[1,2,3,4,17,18,19,20]],['Cross (OCLL)',[21,22,23,24,25,26,27]],['Corners already oriented',[28,57]],['Line / I-shape',[51,52,55,56]],['T-shape',[33,45]],['Square',[5,6]],['C-shape',[34,46]],['W-shape',[36,38]],['P-shape',[31,32,43,44]],['Fish',[9,10,35,37]],['Knight move',[13,14,15,16]],['Small lightning',[7,8,11,12]],['Big lightning',[39,40]],['Awkward',[29,30,41,42]],['Small L',[47,48,49,50,53,54]]];
const PLL_GROUPS=[['Edges only',['Ua','Ub','H','Z']],['Corners only',['Aa','Ab','E']],['Adjacent corner swap',['T','F','Ja','Jb','Ra','Rb']],['Diagonal corner swap',['V','Y','Na','Nb']],['G-perms',['Ga','Gb','Gc','Gd']]];
function renderFull(){
  const o=document.getElementById('fullOllCards');
  OLL_GROUPS.forEach(([g,ns])=>{o.insertAdjacentHTML('beforeend',`<div class="group-title">${g} · ${ns.length}</div>`);const grid=document.createElement('div');grid.className='cards';o.appendChild(grid);
    ns.forEach(n=>{const alg=OLL_ALGS[n];grid.appendChild(card({name:'OLL '+n,sub:alg.split(' ').length+' moves',alg},llDiagram(caseOf(alg),'oll'),'foll'+n));});});
  const p=document.getElementById('fullPllCards');
  PLL_GROUPS.forEach(([g,ns])=>{p.insertAdjacentHTML('beforeend',`<div class="group-title">${g} · ${ns.length}</div>`);const grid=document.createElement('div');grid.className='cards';p.appendChild(grid);
    ns.forEach(n=>{const alg=PLL_ALGS[n];grid.appendChild(card({name:n+'-perm',sub:alg.split(' ').length+' moves',alg},pllDia(caseOf(alg),'pll','all'),'fpll'+n));});});
}

/* ---------- COLL / ZBLL ---------- */
const COLL=[
 ['H',"R U R' U R U' R' U R U2 R'","H"],['H',"R U R' U R U L' U R' U' L","Sune + Niklas"],['H',"F' r U R' U' r' F R2 U2 R' U' R U' R'","Bowtie + Sune⁻¹"],['H',"R U' L' U R' U' L R U' L' U R' U' L","Niklas + Niklas"],
 ['Pi',"R U2 R2 U' R2 U' R2 U2 R","Pi"],['Pi',"L' U R U' L U' R' U' R U' R'","Niklas⁻¹ + Sune⁻¹"],['Pi',"R' U2 R U R' U R2 U' L' U R' U' L","Back Sune⁻¹ + Niklas"],['Pi',"L' U R U' L U R2 U' R U' R' U2 R","Niklas⁻¹ + Back Sune"],['Pi',"R U R' U R U2 R2 F' r U R U' r' F","Sune + Bowtie⁻¹"],['Pi',"R2 D R' U2 R D' R' U2 R' U' L' U R U' L U R'","Headlights + U' Niklas⁻¹"],
 ['Sune',"R U R' U R U2 R'","Sune"],['Sune',"R U' L' U R' U' L","Niklas"],['Sune',"R U R' U R2 D R' U2 R D' R2","Sune + Headlights⁻¹"],['Sune',"R2 D' R U2 R' D R2 U R' U R","Headlights′ + Back Sune⁻¹"],['Sune',"R' U' R U' R' U2 R L' U R U' L U R'","Back Sune + Niklas⁻¹"],['Sune',"r U R' U' r' F R F' R U' L' U R' U' L","Chameleon + Niklas"],
 ['Antisune',"R U2 R' U' R U' R'","Sune⁻¹"],['Antisune',"L' U R U' L U R'","Niklas⁻¹"],['Antisune',"R2 D R' U2 R D' R2 U' R U' R'","Headlights + Sune⁻¹"],['Antisune',"R' U' R U' R2 D' R U2 R' D R2","Back Sune + Headlights′⁻¹"],['Antisune',"R U' L' U R' U' L R' U2 R U R' U R","Niklas + Back Sune⁻¹"],['Antisune',"R' F' r U R U' r' F L' U R U' L U R'","Bowtie⁻¹ + Niklas⁻¹"],
 ['U',"R2 D R' U2 R D' R' U2 R'","Headlights"],['U',"R2 D' R U2 R' D R U2 R","Headlights′"],['U',"R U R' U R U2 R2 U' R U' R' U2 R","Sune + Back Sune"],['U',"R2 D R' U' R D' R' U' R' U R U R'","Headlights + Ra⁻¹"],['U',"F' r U R' U' r' F R2 U R' U R U2 R'","Bowtie + Sune"],['U',"R U R' U R U2 R' U R U2 R D R' U2 R D' R2","Sune + U Headlights⁻¹"],
 ['T',"r U R' U' r' F R F'","Chameleon"],['T',"R' F' r U R U' r' F","Bowtie⁻¹"],['T',"R U2 R' U' R U' R2 U2 R U R' U R","Sune⁻¹ + Back Sune⁻¹"],['T',"F' r U R' U' r' F U' R U' R' U2 R","Bowtie + Back Sune"],['T',"R U2 R' U' R U' R2 F' r U R U' r' F","Sune⁻¹ + Bowtie⁻¹"],['T',"r U R' U' r' F R F' U2 L' U R U' L U R'","Chameleon + U2 Niklas⁻¹"],
 ['L',"F' r U R' U' r' F R","Bowtie"],['L',"F R' F' r U R U' r'","Chameleon⁻¹"],['L',"R U2 R D R' U2 R D' R2","Headlights⁻¹"],['L',"R' U2 R' D' R U2 R' D R2","Headlights′⁻¹"],['L',"R U R' U R U' R' U R U' R' U R U2 R'","Sune + H"],['L',"R2 D R' U2 R D' R' U2 R' U R U' L' U R' U' L","Headlights + U Niklas"],
 ['Oriented',"R U2 R' U' R U2 L' U R' U' L","Sune⁻¹ + Niklas"],['Oriented',"F R U' R' U' R U R' F' R U R' U' R' F R F'","Y-perm"]
];
const COLL_GROUPS={H:'H · 4 cases',Pi:'Pi · 6 cases',Sune:'Sune (S) · 6 cases',Antisune:'Antisune (AS) · 6 cases',U:'U · Headlights · 6 cases',T:'T · Chameleon · 6 cases',L:'L · Bowtie · 6 cases',Oriented:'Corners oriented, only swapped · 2 cases'};
function renderCOLL(){
  const host=document.getElementById('collCards');let g=null,grid,n=0;
  COLL.forEach(([shape,alg,from],i)=>{
    if(shape!==g){g=shape;n=0;host.insertAdjacentHTML('beforeend',`<div class="group-title">${COLL_GROUPS[shape]}</div>`);grid=document.createElement('div');grid.className='cards';host.appendChild(grid);}
    n++;
    const name=(shape==='Oriented'?(n===1?'Adjacent swap':'Diagonal swap'):shape+' '+n);
    grid.appendChild(card({name,sub:alg.split(' ').length+' moves',alg,tip:'Built from: '+from},llDiagram(caseOf(alg),'coll'),'coll'+i));
  });
}

/* ---------- finger trick tutorial ---------- */
const HOME={L:{T:['F',.15,.55],I:['U',.12,.75],M:['B',16,-47],R:['B',3,-47]},R:{T:['F',.85,.55],I:['U',.88,.75],M:['B',50,-47],R:['B',63,-47]}};
const FT=[
 {k:'Home grip',steps:['Thumbs on the front face, near the middle row.','Index fingers rest on the top layer, toward the back corners.','Middle and ring fingers sit on the back face.','Grip lightly: the cube should rest on your thumbs and fingertips, not your palms.'],mist:'Squeezing the cube. A light grip turns faster and locks up less.',prac:"Hold this for 30 s while turning nothing. Then try R U R' U' without looking at your hands."},
 {k:'R',wrist:'R',arrow:[['F',.83,.92],['F',.83,.1],['U',.85,.55]],steps:['Start from home grip.','Turn your right wrist up, like turning a key. The thumb stays on the front.','Stop at exactly 90°, then let your index finger land back on the top.'],mist:'Moving the whole arm or re-gripping with the palm.',prac:"R U R' U'"},
 {k:"R'",wrist:'R',arrow:[['U',.85,.55],['F',.83,.1],['F',.83,.92]],steps:['Start from home grip, or from the grip after an R.','Turn your right wrist down toward you.','Thumb ends near the bottom of the front face, ready for the next move.'],mist:'Letting the thumb slide off the cube.',prac:"R U R' U'"},
 {k:'U',fingers:{R:{I:['U',.92,.82]}},active:['R.I'],arrow:[['U',.92,.82],['U',.92,.18],['U',.5,.1]],steps:['Right index on the back-right of the top layer.','Flick it toward you and to the left in one fast push.','The finger comes off the cube and returns to the top.'],mist:'Pushing with the whole hand instead of just the fingertip.',prac:"R U R' U'"},
 {k:"U'",fingers:{L:{I:['U',.08,.82]}},active:['L.I'],arrow:[['U',.08,.82],['U',.08,.18],['U',.5,.1]],steps:['Left index on the back-left of the top layer.','Flick toward you and to the right.','Return the finger to the top.'],mist:"Doing U' with the right hand, which blocks the next R move.",prac:"R U R' U'"},
 {k:'U2',fingers:{R:{I:['U',.92,.82],M:['U',.75,.88]}},active:['R.I','R.M'],arrow:[['U',.92,.82],['U',.92,.15],['U',.1,.15]],steps:['Right index and middle finger ready on the back-right of the top.','Index flicks the first quarter turn.','Middle finger follows straight away for the second quarter.'],mist:'Pausing between the two flicks. It should sound like one move.',prac:"R U2 R'"},
 {k:'F',fingers:{R:{I:['F',.93,.12]}},active:['R.I'],arrow:[['F',.96,.14],['F',.96,.86]],steps:["Usually comes right after R': your right index is already on the front-right.",'Push the right side of the front face down with the index fingertip.','The left hand holds the rest of the cube still.'],mist:'Regripping before the F. Use where the hand already is.',prac:"R' F R F'"},
 {k:"F'",fingers:{R:{T:['F',.93,.86]}},active:['R.T'],arrow:[['F',.96,.86],['F',.96,.14]],steps:['Right thumb on the bottom-right of the front face.','Push the right side of the front face up.','Thumb returns to home position.'],mist:'Using the wrist. A thumb push is faster here.',prac:"F R' F' R"},
 {k:'D',fingers:{L:{R:['D',.12,.35]}},active:['L.R'],arrow:[['D',.12,.35],['D',.88,.35]],steps:['Left ring finger on the front-left of the bottom layer.','Push the bottom layer to the right.','The other fingers keep the top two layers still.'],mist:'Twisting the whole cube instead of just the bottom layer.',prac:"R2 D R' U2 R D' R' U2 R'"},
 {k:"D'",fingers:{R:{R:['D',.88,.35]}},active:['R.R'],arrow:[['D',.88,.35],['D',.12,.35]],steps:['Right ring finger on the front-right of the bottom layer.','Pull the bottom layer to the left.','Return to home grip.'],mist:'Letting the right hand drift off the right side.',prac:"R2 D R' U2 R D' R' U2 R'"},
 {k:"M'",fingers:{L:{R:['B',30,-47]}},active:['L.R'],arrow:[['F',.5,.92],['F',.5,.08],['U',.5,.85]],steps:['Left ring finger on the back of the middle slice.','Push the back of the slice down. The front of the slice rises.','Thumbs hold the left and right layers still.'],mist:'Turning the whole cube. Keep R and L locked with your thumbs.',prac:'M2 U M2 U2 M2 U M2'},
 {k:'M2',fingers:{L:{R:['B',30,-47],M:['B',42,-49]}},active:['L.R','L.M'],arrow:[['F',.5,.92],['F',.5,.08],['U',.5,.95]],steps:['Left ring and middle fingers on the back of the middle slice.','Ring finger pushes the first quarter, middle finger the second.','Some solvers alternate ring fingers of both hands instead.'],mist:'Stopping halfway between the two quarters.',prac:'M2 U M2 U2 M2 U M2'},
 {k:'r',wrist:'R',fingers:{R:{T:['F',.78,.88]}},arrow:[['F',.6,.92],['F',.6,.1],['U',.62,.55]],steps:['Lower your right thumb so it covers the middle column.','Turn the wrist up as for R. The middle slice comes with it.','Return to home grip.'],mist:'Thumb too high, so only R turns.',prac:"r U R' U' r' F R F'"},
 {k:'L',wrist:'L',arrow:[['U',.15,.55],['F',.17,.1],['F',.17,.92]],steps:['Start from home grip.','Turn the left wrist down toward you.','Return the left index to the top.'],mist:'Using L when the algorithm can stay on R and U.',prac:"L' U' L U"}
];
function ftPoint(p){const[f,u,v]=p;const L=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
  switch(f){case'F':return[66*u,66*v];case'B':return[u,v];
  case'U':return L([66*u,0],[11+44*u,-33],v);case'D':return L([66*u,66],[11+44*u,99],v);
  case'L':return L([0,66*u],[-33,11+44*u],v);case'R':return L([66,66*u],[99,11+44*u],v);}}
function ftDiagram(it){
  const S=svg('-112 -64 290 174');S.style.width='100%';S.style.height='auto';
  const faces={F:'G',U:'Y',D:'W',L:'R',R:'O'};
  for(const f in faces){const q=[[0,0],[1,0],[1,1],[0,1]].map(([u,v])=>ftPoint([f,u,v]).join(',')).join(' ');el('polygon',{points:q,style:'fill:var(--body)'},S);
    for(let i=0;i<3;i++)for(let j=0;j<3;j++){const e=.05;const q2=[[i/3+e,j/3+e],[(i+1)/3-e,j/3+e],[(i+1)/3-e,(j+1)/3-e],[i/3+e,(j+1)/3-e]].map(([u,v])=>ftPoint([f,u,v]).join(',')).join(' ');
      el('polygon',{points:q2,style:'fill:'+HEX[faces[f]]+';opacity:.85'},S);}}
  const tx=el('text',{x:33,y:-56,'text-anchor':'middle',style:'fill:var(--muted);font:600 7px var(--text)'},S);tx.textContent='BEHIND THE CUBE';
  const defs=el('defs',{},S);const mk=el('marker',{id:'ftArrow',viewBox:'0 0 10 10',refX:'7',refY:'5',markerWidth:'4',markerHeight:'4',orient:'auto'},defs);el('path',{d:'M0,0 L10,5 L0,10 z',style:'fill:var(--accent)'},mk);
  const palms={L:[-80,60],R:[146,60]};
  const fing=JSON.parse(JSON.stringify(HOME));if(it.fingers)for(const h in it.fingers)Object.assign(fing[h],it.fingers[h]);
  const act=new Set(it.active||[]);
  for(const h of['L','R']){const[px,py]=palms[h];const col=h==='L'?'var(--hand-l)':'var(--hand-r)';const wrist=it.wrist===h;
    for(const f of['R','M','I','T']){const p=fing[h][f];const[x,y]=ftPoint(p);const back=p[0]==='B';
      const dx=x-px,dy=y-py,d=Math.hypot(dx,dy);const sx=px+dx/d*18,sy=py+dy/d*24;
      el('line',{x1:sx,y1:sy,x2:x,y2:y,style:`stroke:${col};stroke-width:7;stroke-linecap:round;opacity:${back?.22:.4}`+(back?';stroke-dasharray:3 4':'')},S);}
    el('ellipse',{cx:px,cy:py,rx:22,ry:30,style:`fill:${col};fill-opacity:.2;stroke:${wrist?'var(--accent)':col};stroke-width:${wrist?3:1.5}`},S);
    const lab=el('text',{x:px,y:py+4,'text-anchor':'middle',style:`fill:${wrist?'var(--accent)':'var(--fg)'};font:700 8px var(--text)`},S);lab.textContent=wrist?(h==='L'?'LEFT WRIST':'RIGHT WRIST'):(h==='L'?'LEFT':'RIGHT');
    for(const f of['R','M','I','T']){const[x,y]=ftPoint(fing[h][f]);const on=act.has(h+'.'+f);
      el('circle',{cx:x,cy:y,r:on?8.5:6.5,style:`fill:${on?'var(--accent)':col};stroke:var(--surface);stroke-width:1.5`},S);
      const t=el('text',{x,y:y+2.8,'text-anchor':'middle',style:`fill:${on?'var(--accent-ink)':'#fff'};font:700 ${on?8:7}px var(--text)`},S);t.textContent=f;}}
  if(it.arrow){const pts=it.arrow.map(ftPoint);el('path',{d:'M'+pts.map(p=>p.join(',')).join(' L'),style:'fill:none;stroke:var(--accent);stroke-width:3.2;stroke-linecap:round;stroke-linejoin:round','marker-end':'url(#ftArrow)'},S);}
  return S;
}
function initFT(){
  const tabs=document.getElementById('ftTabs'),dia=document.getElementById('ftDia');let cur=0,rig=null;
  if(window.THREE&&window.Cube3D&&window.HandRig){
    dia.innerHTML=`<div class="ft3d" id="ft3d"><div class="ft-now" id="ftNow" aria-live="polite"></div></div>
      <div class="algline ft-ctl"><button class="primary" id="ftReplay">Play move</button><button id="ftPractice">Play practice</button>
      <label class="muted" for="ftSpeed">Speed</label><select id="ftSpeed"><option value="0.3">Slow motion</option><option value="0.6" selected>Learning</option><option value="1">Normal</option><option value="1.8">Fast</option></select></div>
      <p class="muted hint3d">Blue = the finger or hand doing the move. Drag to look from any side (fingers on the back are visible from behind).</p>`;
    try{const c=new Cube3D(document.getElementById('ft3d'),{cam:[3.2,8.2,11.2],lookY:-0.7,speed:400});rig=new HandRig(c);}catch(e){rig=null;}
  }
  const now=t=>{const n=document.getElementById('ftNow');if(n)n.innerHTML=t;};
  const playList=(alg)=>{if(!rig)return;let ms;try{ms=parse(alg);}catch(e){return;}
    rig.mul=+document.getElementById('ftSpeed').value;
    rig.play(ms,(m,label)=>now(m?`<code>${m.text}</code> ${label}`:'Done. Press play to watch again.'));};
  const show=i=>{cur=i;[...tabs.children].forEach((b,j)=>b.setAttribute('aria-selected',j===i));const it=FT[i];
    if(rig){const home=it.k==='Home grip';let pracOk=true;try{parse(it.prac);}catch(e){pracOk=false;}
      document.getElementById('ftReplay').hidden=home;document.getElementById('ftPractice').hidden=!pracOk;
      document.getElementById('ftReplay').onclick=()=>playList(it.k);document.getElementById('ftPractice').onclick=()=>playList(it.prac);
      if(home){rig.reset();now('Home grip: thumbs on the front, index fingers on top, middle and ring fingers behind.');}
      else playList(it.k);}
    else dia.replaceChildren(ftDiagram(it));
    document.getElementById('ftText').innerHTML=`<h3>${it.k==='Home grip'?'Home grip':'Move <code>'+it.k+'</code>'}</h3><ol>${it.steps.map(s=>`<li>${s}</li>`).join('')}</ol><p><b>Common mistake:</b> ${it.mist}</p><p><b>Practice:</b> <code>${it.prac}</code></p>`;};
  FT.forEach((it,i)=>{const b=document.createElement('button');b.textContent=it.k;b.setAttribute('role','tab');b.onclick=()=>show(i);tabs.appendChild(b);});
  show(0);
}

/* ---------- drills ---------- */
const FINGER={R:'RW',"R'":'RW',R2:'RW×2',L:'LW',"L'":'LW',L2:'LW×2',U:'RI',"U'":'LI',U2:'RI+M',F:'RI',"F'":'RT',F2:'RI×2',D:'LR',"D'":'RR',D2:'LR×2',"M'":'LR',M2:'LR+M',M:'LT',r:'RW',"r'":'RW',f:'RW',"f'":'RW'};
const DRILLS=[
 {name:'Sexy move',alg:"R U R' U'",t:'6 reps under 2.5 s',why:'The most common trigger in F2L and OLL.'},
 {name:'Reverse sexy',alg:"U R U' R'",t:'6 reps under 2.5 s',why:'Starts with the flick: trains U timing.'},
 {name:'Left sexy',alg:"L' U' L U",t:'6 reps under 3 s',why:'Builds the left hand for left-slot inserts.'},
 {name:'Sledgehammer',alg:"R' F R F'",t:'6 reps under 3 s',why:'Trains the F flick with the right index.'},
 {name:'Anti-sledge (Hedgeslammer)',alg:"F R' F' R",t:'6 reps under 3 s',why:"Trains the F' thumb push."},
 {name:'Sexy + Sledge',alg:"R U R' U' R' F R F'",t:'3 reps under 3 s',why:'Joins the two triggers without a regrip.'},
 {name:'Double sexy',alg:"R U R' U' R U R' U'",t:'3 reps under 3 s',why:'Endurance and rhythm at speed.'},
 {name:'Sune',alg:"R U R' U R U2 R'",t:'6 reps under 6 s',why:'Trains the U2 double flick.'},
 {name:'Antisune',alg:"R U2 R' U' R U' R'",t:'6 reps under 6 s',why:"Left index U' flicks under R moves."},
 {name:'Niklas',alg:"R U' L' U R' U' L",t:'4 reps under 5 s',why:'Both wrists working together.'},
 {name:'Ua-perm',alg:"R U' R U R U R U' R' U' R2",t:'3 reps under 4.5 s',why:'Fast R and U alternation.'},
 {name:'Ub-perm',alg:"R2 U R U R' U' R' U' R' U R'",t:'3 reps under 4.5 s',why:'R2 wrist double turns.'},
 {name:'T-perm',alg:"R U R' U' R' F R2 U' R' U' R U R' F'",t:'2 reps under 3 s',why:'Flows from R into F with no regrip.'},
 {name:'H-perm',alg:'M2 U M2 U2 M2 U M2',t:'2 reps under 3 s',why:'M2 ring-finger flicks.'},
 {name:'Z-perm',alg:"M2 U M2 U M' U2 M2 U2 M' U2",t:'2 reps under 4 s',why:'Mixes M2, M\' and U2.'},
 {name:'Y-perm',alg:"F R U' R' U' R U R' F' R U R' U' R' F R F'",t:'2 reps under 4.5 s',why:'Long algorithm: stamina and accuracy.'}
];
function repsOf(alg){const s=solved();let n=0;do{applyAlg(s,alg);n++;}while(n<60&&!s.every(x=>eq(x.p,x.h)&&eq(x.n,x.hn)));return n;}
let dtimes={};try{dtimes=JSON.parse(localStorage.getItem('cfop-drill')||'{}');}catch(e){}
function initDrills(){
  const host=document.getElementById('drillCards'),sel=document.getElementById('drillSel');
  DRILLS.forEach((d,i)=>{d.n=repsOf(d.alg);
    const c=document.createElement('div');c.className='card drill';
    const toks=parse(d.alg).map(m=>`<span class="tok"><b>${m.text}</b><i>${FINGER[m.text]||''}</i></span>`).join('');
    c.innerHTML=`<div class="nm"><b>${d.name}</b><span>×${d.n} = solved</span></div><div class="toks">${toks}</div><div class="hint">${d.why}</div><div class="hint"><b>Target:</b> ${d.t}</div>`;
    const row=document.createElement('div');row.className='row';
    const b1=document.createElement('button');b1.className='sm';b1.textContent='Try it';b1.onclick=()=>{pg=solved();queue=[];for(let k=0;k<d.n;k++)queue.push(...parse(d.alg));qi=0;drawPg();drawSteps();document.getElementById('algIn').value=d.alg;status(d.name+' ×'+d.n+' queued. It ends solved.');document.getElementById('playground').scrollIntoView();};
    const b2=document.createElement('button');b2.className='sm';b2.textContent='Time it';b2.onclick=()=>{sel.value=i;sel.onchange();document.getElementById('drillTimer').scrollIntoView({block:'center'});};
    row.append(b1,b2);c.appendChild(row);host.appendChild(c);
    const o=document.createElement('option');o.value=i;o.textContent=d.name+' ×'+d.n;sel.appendChild(o);});
  const clock=document.getElementById('dclock');let run=false,t0=0,raf=0;
  const showStats=()=>{const d=DRILLS[sel.value];const l=dtimes[d.name]||[];document.getElementById('dBest').textContent=l.length?(Math.min(...l)/1000).toFixed(2):'–';document.getElementById('dLast').textContent=l.length?l.slice(-5).map(t=>(t/1000).toFixed(2)).join(' · '):'–';document.getElementById('drillAlg').textContent=d.alg+'  ×'+d.n;};
  sel.onchange=()=>{if(run){cancelAnimationFrame(raf);run=false;}clock.textContent='0.00';showStats();};
  const tick=()=>{clock.textContent=((performance.now()-t0)/1000).toFixed(2);raf=requestAnimationFrame(tick);};
  const toggle=()=>{if(!run){run=true;t0=performance.now();clock.className='clock ready';tick();}else{run=false;cancelAnimationFrame(raf);clock.className='clock';const t=Math.round(performance.now()-t0);clock.textContent=(t/1000).toFixed(2);const nm=DRILLS[sel.value].name;(dtimes[nm]=dtimes[nm]||[]).push(t);try{localStorage.setItem('cfop-drill',JSON.stringify(dtimes));}catch(e){}showStats();}};
  clock.addEventListener('pointerdown',e=>{e.preventDefault();toggle();});
  clock.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();e.stopPropagation();toggle();}});
  sel.value=0;showStats();
  let ctx=null,timer=null;const btn=document.getElementById('metroBtn'),bpm=document.getElementById('bpm'),beat=document.getElementById('beat'),val=document.getElementById('bpmVal');
  const click=()=>{const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=1000;g.gain.setValueAtTime(.3,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.05);o.connect(g).connect(ctx.destination);o.start();o.stop(ctx.currentTime+.06);beat.classList.add('on');setTimeout(()=>beat.classList.remove('on'),90);};
  const start=()=>{clearInterval(timer);timer=setInterval(click,60000/bpm.value);};
  btn.onclick=()=>{try{ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();ctx.resume();}catch(e){}if(timer){clearInterval(timer);timer=null;btn.textContent='Start';}else{start();btn.textContent='Stop';}};
  bpm.oninput=()=>{val.textContent=bpm.value+' bpm';if(timer)start();};
}

/* ---------- recognition quiz ---------- */
function initQuiz(){
  const pool=[...Object.entries(OLL_ALGS).map(([n,alg])=>({name:'OLL '+n,alg,mode:'oll',set:'Full OLL'})),...Object.entries(PLL_ALGS).map(([n,alg])=>({name:n+'-perm',alg,mode:'pll',set:'Full PLL'}))];
  let cur;const dia=document.getElementById('quizDia'),ans=document.getElementById('quizAns');
  const next=()=>{cur=pool[Math.floor(Math.random()*pool.length)];const k=Math.floor(Math.random()*4);const pre=['','U','U2',"U'"][k];
    dia.replaceChildren(llDiagram(caseOf(cur.alg,pre),cur.mode));ans.innerHTML='<span class="muted">Which case is this?</span>';cur.pre=pre;};
  document.getElementById('quizNext').onclick=next;
  document.getElementById('quizReveal').onclick=()=>{const auf=cur.pre?({U:"U'",U2:'U2',"U'":'U'})[cur.pre]:'';ans.innerHTML=`<b style="font-family:var(--display)">${cur.name}</b> <span class="muted">(${cur.set})</span><br><code>${auf?'('+auf+') ':''}${cur.alg}</code>`;};
  next();
}

/* ---------- full ZBLL browser ---------- */
const ZB_SETS=[['T','T · Chameleon'],['U','U · Headlights'],['L','L · Bowtie'],['H','H'],['Pi','Pi'],['S','Sune'],['AS','Antisune'],['PLL','PLL']];
function initZB(){
  const tabs=document.getElementById('zbTabs'),host=document.getElementById('zbllCards');
  const idOf=(set,ci,n)=>'zb-'+set+'-'+ci+'-'+n;
  const counters={};ZBLL.forEach(([set,ci])=>{const k=set+'/'+ci;counters[k]=(counters[k]||0)+1;allIds.add(idOf(set,ci,counters[k]));});
  let saved='T';try{saved=localStorage.getItem('cfop-zbset')||'T';}catch(e){}
  const show=set=>{[...tabs.children].forEach(b=>b.setAttribute('aria-selected',b.dataset.set===set));try{localStorage.setItem('cfop-zbset',set);}catch(e){}
    host.replaceChildren();let ci=-1,grid,n=0;
    ZBLL.filter(z=>z[0]===set).forEach(([s,c,alg])=>{
      if(c!==ci){ci=c;n=0;host.insertAdjacentHTML('beforeend',`<div class="group-title">${set==='PLL'?'PLL':set+' · COLL case '+c}</div>`);grid=document.createElement('div');grid.className='cards';host.appendChild(grid);}
      n++;grid.appendChild(card({name:(set==='PLL'?'PLL ':'ZBLL '+set+' ')+c+'.'+n,sub:alg.split(' ').length+' moves',alg},pllDia(caseOf(alg),'pll'),idOf(set,c,n)));});
    updateProgress();};
  ZB_SETS.forEach(([k,label])=>{const cnt=ZBLL.filter(z=>z[0]===k).length;const b=document.createElement('button');b.dataset.set=k;b.setAttribute('role','tab');b.innerHTML=`${label} <span class="cnt">${cnt}</span>`;b.onclick=()=>show(k);tabs.appendChild(b);});
  show(ZB_SETS.some(s=>s[0]===saved)?saved:'T');
}

/* ---------- 3D hero ---------- */
function initHero(){
  const host=document.getElementById('heroCube');
  const fallback=()=>host.appendChild(isoDiagram(solved(),null));
  if(!(window.THREE&&window.Cube3D))return fallback();
  let c;try{c=new Cube3D(host,{autoSpin:true,speed:330});}catch(e){return fallback();}
  const model=solved();c.sync(model);
  if(c.reduced)return;
  const demo=parse("R U R' U' R U R' U' R U R' U' R U R' U' R U R' U' R U R' U'");
  const run=()=>{demo.forEach(m=>{applyMove(model,m);c.enqueue(m);});c.model=model;};
  c.onIdle=()=>setTimeout(run,1800);
  setTimeout(run,900);
}

/* ---------- boot ---------- */
renderF2L();
renderLL(OLLE,'olleCards','olle','olle');
renderLL(OLLC,'ollcCards','oll','ollc');
renderLL(PLLC,'pllcCards','pllc','pllc','corners');
renderLL(PLLE,'plleCards','pll','plle','all');
initHero();
renderFull();renderCOLL();initZB();
initPg();initTimer();initDrills();initFT();initQuiz();updateProgress();

