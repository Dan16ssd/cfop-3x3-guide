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
function updateProgress(){const all=allIds.size||1;const n=[...learned].filter(id=>allIds.has(id)).length;document.getElementById('progText').textContent=Lt('learnedOf',n,all);document.getElementById('progFill').style.width=(n/all*100)+'%';
  const ST={cross:/^f2l\d/,f2l:/^(f2l\d|af-)/,oll:/^(olle|ollc|foll)/,pll:/^(pllc|plle|fpll)/};
  for(const k in ST){const ids=[...allIds].filter(i=>ST[k].test(i));const done=ids.filter(i=>learned.has(i)).length;const pct=ids.length?Math.round(done/ids.length*100):0;
    const bar=document.querySelector('[data-stage="'+k+'"]'),pc=document.querySelector('[data-stage-pc="'+k+'"]');if(bar)bar.style.width=pct+'%';if(pc)pc.textContent=pct+'% · '+done+'/'+ids.length;}}

const posName=p=>({'1,1,0':'top-right','0,1,1':'top-front','-1,1,0':'top-left','0,1,-1':'top-back'})[p.join(',')]||'in the slot';
const dirName={U:'up',F:'front',R:'right',L:'left',B:'back',D:'down'};

/* ---------- triggers: split algorithms into chunks you already know ---------- */
const TRIGGERS=[
 ['Sune',"R U R' U R U2 R'"],['Antisune',"R U2 R' U' R U' R'"],['Antisune',"R' U' R U' R' U2 R"],['Sune',"L' U' L U' L' U2 L"],
 ['Sexy',"R U R' U'"],['Reverse sexy',"U R U' R'"],['Left sexy',"L' U' L U"],['Left reverse sexy',"U' L' U L"],
 ['Wide sexy',"r U R' U'"],['Sledge',"R' F R F'"],['Hedge',"F R' F' R"],['Wide sledge',"r' F R F'"],
 ['Anti-sexy',"R' U' R U"],['Left sexy',"L U L' U'"],
 ['Insert',"R U R'"],['Insert',"R U' R'"],['Insert',"R U2 R'"],['Insert',"R' U' R"],['Insert',"R' U R"],['Insert',"R' U2 R"],
 ['Insert',"L' U' L"],['Insert',"L' U L"],['Insert',"L U L'"],['Insert',"L U' L'"],['Insert',"F' U' F"],['Insert',"F' U F"],['Insert',"F U F'"],['Insert',"F U' F'"],
 ['H-trigger',"M2 U M2"],['H-trigger',"M2 U' M2"],['M2 U2 M2',"M2 U2 M2"]
].map(([n,a])=>[n,a.split(' ')]).sort((a,b)=>b[1].length-a[1].length);
function memo(alg){
  const t=alg.replace(/[()]/g,'').trim().split(/\s+/),out=[];let i=0,hit=0;
  while(i<t.length){const tr=TRIGGERS.find(([,m])=>m.every((x,k)=>t[i+k]===x));
    if(tr){out.push({n:tr[0],m:tr[1].join(' ')});i+=tr[1].length;hit+=tr[1].length;}
    else{const last=out[out.length-1];if(last&&!last.n)last.m+=' '+t[i];else out.push({m:t[i]});i++;}}
  return {html:out.map(c=>c.n?`<span class="trg" title="${c.m}"><b>${L(c.n)}</b><i>${c.m}</i></span>`:`<code>${c.m}</code>`).join('<em>·</em>'),cover:hit/t.length};
}
function moveText(m){return m.face+(m.k===2?'2':m.k===-1?"'":'');}
function scrambleOf(alg){try{return invert(parse(alg)).map(moveText).join(' ');}catch(e){return '';}}
function card(item,diagram,id){
  allIds.add(id);const d=document.createElement('div');d.className='card'+(learned.has(id)?' learned':'');
  const dia=document.createElement('div');dia.className='dia';dia.appendChild(diagram);d.appendChild(dia);
  d.insertAdjacentHTML('beforeend',`<div class="nm"><b>${L(item.name)}</b>${item.sub?`<span>${String(item.sub).replace(/^(\d+) moves$/,(m,n)=>Lt('moves',n))}</span>`:''}</div><div class="alg">${item.alg}</div><div class="scr-line"><span>${L('Scramble')}</span><code>${scrambleOf(item.alg)}</code></div>${(()=>{const m=memo(item.alg);return m.cover>0?`<div class="mem"><span class="mem-h">${L('Memorize as')}</span>${m.html}</div>`:'';})()}${item.tip?`<div class="hint">${L(item.tip)}</div>`:''}`);
  const row=document.createElement('div');row.className='row';
  row.innerHTML=`<label class="chk"><input type="checkbox" id="lr-${id}" ${learned.has(id)?'checked':''}> ${L('Learned')}</label>`;
  const b=document.createElement('button');b.className='sm';b.textContent=L('Try it');b.onclick=()=>loadCase(item.alg,L(item.name));row.appendChild(b);
  if(item.easy){const e=document.createElement('button');e.className='sm easy-b';e.textContent=L('Easy way');e.onclick=()=>toggleEasy(d,item);row.appendChild(e);}
  row.querySelector('input').onchange=e=>{e.target.checked?learned.add(id):learned.delete(id);d.classList.toggle('learned',e.target.checked);saveLearned();};
  d.appendChild(row);return d;
}

function renderF2L(){
  const host=document.getElementById('f2lCards');let g=null,grid;
  F2L.forEach((it,i)=>{
    if(it.g!==g){g=it.g;host.insertAdjacentHTML('beforeend',`<div class="group-title">${L(g)}</div>`);grid=document.createElement('div');grid.className='cards';host.appendChild(grid);}
    const s=caseOf(it.alg);
    const cw=s.find(st=>eq(st.h,[1,-1,1])&&st.c==='W');const eg=s.find(st=>eq(st.h,[1,0,1])&&st.c==='G');
    const item={name:Lt('case',i+1),sub:(it.alg.split(' ').length)+' moves',alg:it.alg,tip:Lt('f2ltip',L(dirName[faceOf(cw.n)]),L(posName(eg.p)),L(dirName[faceOf(eg.n)]))};
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
  box.innerHTML='<div class="view"></div><div class="dual-ctl"><button class="sm rb" type="button" title="'+L('Turn the cube to see the other sides')+'" aria-label="'+L('Turn the cube')+'">↻ '+L('Turn')+'</button><button class="sm tg" type="button"></button></div>';
  const view=box.querySelector('.view'),rb=box.querySelector('.rb'),tg=box.querySelector('.tg');
  const mask=mode==='pllc'?(st=>!(st.h[1]===1&&nz(st.h)===2&&st.n[1]!==1)):null;
  let rotY=0,top=false;
  const draw=()=>{let v;if(top)v=llDiagram(s,mode,arrows);else{const t=s.map(x=>({...x,p:x.p.slice(),n:x.n.slice()}));for(let i=0;i<rotY;i++)applyAlg(t,'y');v=isoDiagram(t,mask);}
    view.replaceChildren(v);tg.textContent=top?L('3D view'):L('Top view');rb.hidden=top;};
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
function loadCase(alg,name){pg=solved();applyAlg(pg,invert(parse(alg)));queue=parse(alg);qi=0;drawPg();drawSteps();status(Lt('loaded',name));document.getElementById('algIn').value=alg;go('playground');}
function initPg(){
  const pad=document.getElementById('movepad');
  ["R","R'","L","L'","U","U'","D","D'","F","F'","B","B'","M","M'","R2","U2","x","y"].forEach(m=>{const b=document.createElement('button');b.textContent=m;b.onclick=()=>{parse(m).forEach(pgMove);queue=[];qi=0;drawPg(true);drawSteps();status(Lt('did',m));};pad.appendChild(b);});
  document.getElementById('algApply').onclick=()=>{try{const ms=parse(document.getElementById('algIn').value);if(queue.length&&qi<queue.length&&ms.map(m=>m.text).join(' ')===queue.map(m=>m.text).join(' ')){for(;qi<queue.length;qi++)pgMove(queue[qi]);}else{ms.forEach(pgMove);queue=ms;qi=ms.length;}drawPg(true);drawSteps();status(Lt('applied',ms.length));}catch(e){status(Lt('badMove',e.message.replace(/^Unknown move /,'')),true);}};
  document.getElementById('algIn').addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('algApply').click();});
  document.getElementById('pgStep').onclick=()=>{if(qi<queue.length){pgMove(queue[qi]);status(Lt('didOf',queue[qi].text,qi+1,queue.length));qi++;drawPg(true);drawSteps();}};
  document.getElementById('pgReset').onclick=()=>{pg=solved();queue=[];qi=0;drawPg();drawSteps();status(L('Solved cube. White bottom, green front.'));};
  document.getElementById('pgScramble').onclick=()=>{const sc=makeScramble();pg=solved();applyAlg(pg,'z2 '+sc+' z2');queue=[];qi=0;drawPg();drawSteps();status(Lt('scrambled',sc));};
  if(window.THREE&&window.Cube3D){try{cube3d=new Cube3D(document.getElementById('pgIso'),{speed:260,touch:'none'});}catch(e){cube3d=null;}}
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
  const h=document.getElementById('times');h.replaceChildren();times.slice(-12).reverse().forEach(t=>{const s=document.createElement('span');s.textContent=fmt(t);h.appendChild(s);});
  drawLadder();}

/* ---------- ranks ---------- */
const RANKS=[
 [5000,'Legend','#c79a00','World-record territory. Only a handful of people have ever solved this fast.'],
 [7000,'World class','#d4511e','A time like this competes for podiums at big competitions.'],
 [10000,'Elite','#c8102e','Sub-10. Very few cubers ever get here.'],
 [15000,'Expert','#8e2ad6','Sub-15. Fast enough for finals at many competitions.'],
 [20000,'Advanced','#1747c9','Sub-20. CFOP is working. Look-ahead is your next big gain.'],
 [30000,'Intermediate','#0d8a4a','Sub-30. Learn full PLL and cut the pauses in F2L.'],
 [60000,'Learner','#13806f','Sub-1 minute. Next: intuitive F2L and finger tricks.'],
 [120000,'Beginner','#5a6475','Sub-2 minutes. Keep practising the cross and F2L.'],
 [Infinity,'Starter','#7a8292','Welcome to cubing. Follow the roadmap to get faster.']
];
const rankOf=ms=>RANKS.findIndex(r=>ms<r[0]);
const limitTxt=ms=>ms===Infinity?Lt('over2'):Lt('under',ms>=60000?Math.floor(ms/60000)+':00':fmt(ms).replace('.00',''));
function showRank(t,pb){
  const i=rankOf(t),r=RANKS[i],box=document.getElementById('rank');
  const next=i>0?RANKS[i-1]:null;
  box.hidden=false;
  box.innerHTML=`<div class="rank-badge" style="--rc:${r[2]}"><span>${L('Rank')}</span><b>${L(r[1])}</b></div>
    <div class="rank-txt"><p class="rank-time">${fmt(t)} s${pb?` <span class="pb">${L('New personal best!')}</span>`:''}</p>
    <p>${L(r[3])}</p>${next?`<p class="muted">${Lt('nextRank',L(next[1]),limitTxt(next[0]),((t-next[0])/1000+0.005).toFixed(2))}</p>`:`<p class="muted">${L('This is the top rank.')}</p>`}</div>`;
  box.classList.remove('pop');void box.offsetWidth;box.classList.add('pop');
}
function drawLadder(){
  const host=document.getElementById('ladder');if(!host)return;
  const ref=aoN(5)!=null?aoN(5):(times.length?Math.min(...times):null);
  const cur=ref==null?-1:rankOf(ref);
  host.innerHTML=`<p class="muted ladder-head">${ref==null?L('Finish a solve to get your rank.'):Lt('yourLevel',aoN(5)!=null?'ao5':L('best single'),fmt(ref))}</p>`+
    RANKS.map((r,i)=>`<div class="rung${i===cur?' on':''}" style="--rc:${r[2]}"><b>${L(r[1])}</b><span>${limitTxt(r[0])}</span></div>`).join('');
}
function initTimer(){
  const clock=document.getElementById('clock'),scr=document.getElementById('scr');
  let state='idle',t0=0,raf=0,holdT=0;
  const newScr=()=>{scr.textContent=makeScramble();};newScr();
  const tick=()=>{clock.textContent=((performance.now()-t0)/1000).toFixed(2);raf=requestAnimationFrame(tick);};
  const down=()=>{if(state==='running'){cancelAnimationFrame(raf);const t=performance.now()-t0;clock.textContent=(t/1000).toFixed(2);const pb=times.length>0&&t<Math.min(...times);times.push(Math.round(t));drawTimes();showRank(Math.round(t),pb);newScr();state='stopped';return;}
    if(state==='idle'||state==='done'){state='holding';clock.className='clock hold';holdT=setTimeout(()=>{if(state==='holding'){state='ready';clock.className='clock ready';clock.textContent='0.00';}},300);}};
  const up=()=>{if(state==='stopped'){state='done';return;}if(state==='holding'){clearTimeout(holdT);state='idle';clock.className='clock';}
    else if(state==='ready'){state='running';clock.className='clock';t0=performance.now();tick();}};
  document.addEventListener('keydown',e=>{if(['INPUT','SELECT'].includes(e.target.tagName))return;if(state==='running'){e.preventDefault();down();return;}if(e.code==='Space'&&!e.repeat){if(!clock.offsetParent)return;const r=clock.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;e.preventDefault();down();}});
  document.addEventListener('keyup',e=>{if(e.target.tagName==='INPUT')return;if(e.code==='Space'||state==='stopped'){up();}});
  clock.addEventListener('pointerdown',e=>{e.preventDefault();down();});clock.addEventListener('pointerup',e=>{e.preventDefault();up();});
  document.getElementById('newScr').onclick=newScr;
  document.getElementById('scrToPg').onclick=()=>{pg=solved();applyAlg(pg,'z2 '+scr.textContent+' z2');queue=[];qi=0;drawPg();drawSteps();status(L('Timer scramble loaded (scrambled white-top, shown white-bottom).'));go('playground');};
  document.getElementById('delLast').onclick=()=>{times.pop();drawTimes();};
  let armed=false;const cl=document.getElementById('clearTimes');cl.onclick=()=>{if(!armed){armed=true;cl.textContent=L('Click again to clear');setTimeout(()=>{armed=false;cl.textContent=L('Clear session');},2500);return;}times=[];drawTimes();armed=false;cl.textContent=L('Clear session');};
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
  OLL_GROUPS.forEach(([g,ns])=>{o.insertAdjacentHTML('beforeend',`<div class="group-title">${L(g)} · ${ns.length}</div>`);const grid=document.createElement('div');grid.className='cards';o.appendChild(grid);
    ns.forEach(n=>{const alg=OLL_ALGS[n];grid.appendChild(card({name:'OLL '+n,sub:alg.split(' ').length+' moves',alg,easy:'oll'},llDiagram(caseOf(alg),'oll'),'foll'+n));});});
  const p=document.getElementById('fullPllCards');
  PLL_GROUPS.forEach(([g,ns])=>{p.insertAdjacentHTML('beforeend',`<div class="group-title">${L(g)} · ${ns.length}</div>`);const grid=document.createElement('div');grid.className='cards';p.appendChild(grid);
    ns.forEach(n=>{const alg=PLL_ALGS[n];grid.appendChild(card({name:n+'-perm',sub:alg.split(' ').length+' moves',alg,easy:'all'},pllDia(caseOf(alg),'pll','all'),'fpll'+n));});});
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
    if(shape!==g){g=shape;n=0;host.insertAdjacentHTML('beforeend',`<div class="group-title">${L(COLL_GROUPS[shape])}</div>`);grid=document.createElement('div');grid.className='cards';host.appendChild(grid);}
    n++;
    const name=(shape==='Oriented'?(n===1?'Adjacent swap':'Diagonal swap'):shape+' '+n);
    grid.appendChild(card({name,sub:alg.split(' ').length+' moves',alg,tip:Lt('built',from),easy:'all'},llDiagram(caseOf(alg),'coll'),'coll'+i));
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
      <div class="algline ft-ctl"><button class="primary" id="ftReplay">${L('Play move')}</button><button id="ftPractice">${L('Play practice')}</button>
      <label class="muted" for="ftSpeed">${L('Speed')}</label><select id="ftSpeed"><option value="0.3">${L('Slow motion')}</option><option value="0.6" selected>${L('Learning')}</option><option value="1">${L('Normal')}</option><option value="1.8">${L('Fast')}</option></select></div>
      <p class="muted hint3d">${L('Blue = the finger or hand doing the move. Drag to look from any side (fingers on the back are visible from behind).')}</p>`;
    try{const c=new Cube3D(document.getElementById('ft3d'),{cam:[3.2,8.2,11.2],lookY:-0.7,speed:400,touch:'none'});rig=new HandRig(c);}catch(e){rig=null;}
  }
  const now=t=>{const n=document.getElementById('ftNow');if(n)n.innerHTML=t;};
  const playList=(alg)=>{if(!rig)return;let ms;try{ms=parse(alg);}catch(e){return;}
    rig.mul=+document.getElementById('ftSpeed').value;
    rig.play(ms,(m,label)=>now(m?`<code>${m.text}</code> ${L(label)}`:L('Done. Press play to watch again.')));};
  const show=i=>{cur=i;[...tabs.children].forEach((b,j)=>b.setAttribute('aria-selected',j===i));const it=FT[i];
    if(rig){const home=it.k==='Home grip';let pracOk=true;try{parse(it.prac);}catch(e){pracOk=false;}
      document.getElementById('ftReplay').hidden=home;document.getElementById('ftPractice').hidden=!pracOk;
      document.getElementById('ftReplay').onclick=()=>playList(it.k);document.getElementById('ftPractice').onclick=()=>playList(it.prac);
      if(home){rig.reset();now(L('Home grip: thumbs on the front, index fingers on top, middle and ring fingers behind.'));}
      else playList(it.k);}
    else dia.replaceChildren(ftDiagram(it));
    document.getElementById('ftText').innerHTML=`<h3>${it.k==='Home grip'?L('Home grip'):L('Move')+' <code>'+it.k+'</code>'}</h3><ol>${it.steps.map(s=>`<li>${L(s)}</li>`).join('')}</ol><p><b>${L('Common mistake:')}</b> ${L(it.mist)}</p><p><b>${L('Practice:')}</b> <code>${L(it.prac)}</code></p>`;};
  FT.forEach((it,i)=>{const b=document.createElement('button');b.textContent=it.k==='Home grip'?L('Home grip'):it.k;b.setAttribute('role','tab');b.onclick=()=>show(i);tabs.appendChild(b);});
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
    c.innerHTML=`<div class="nm"><b>${d.name}</b><span>${Lt('xSolved',d.n)}</span></div><div class="toks">${toks}</div><div class="hint">${L(d.why)}</div><div class="hint"><b>${L('Target:')}</b> ${Lt('target',d.t)}</div>`;
    const row=document.createElement('div');row.className='row';
    const b1=document.createElement('button');b1.className='sm';b1.textContent=L('Try it');b1.onclick=()=>{pg=solved();queue=[];for(let k=0;k<d.n;k++)queue.push(...parse(d.alg));qi=0;drawPg();drawSteps();document.getElementById('algIn').value=d.alg;status(Lt('queued',d.name,d.n));go('playground');};
    const b2=document.createElement('button');b2.className='sm';b2.textContent=L('Time it');b2.onclick=()=>{sel.value=i;sel.onchange();document.getElementById('drillTimer').scrollIntoView({block:'center'});};
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
  btn.onclick=()=>{try{ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();ctx.resume();}catch(e){}if(timer){clearInterval(timer);timer=null;btn.textContent=L('Start');}else{start();btn.textContent=L('Stop');}};
  bpm.oninput=()=>{val.textContent=bpm.value+' bpm';if(timer)start();};
}

/* ---------- recognition quiz ---------- */
function initQuiz(){
  const pool=[...Object.entries(OLL_ALGS).map(([n,alg])=>({name:'OLL '+n,alg,mode:'oll',set:L('Full OLL')})),...Object.entries(PLL_ALGS).map(([n,alg])=>({name:n+'-perm',alg,mode:'pll',set:L('Full PLL')}))];
  let cur;const dia=document.getElementById('quizDia'),ans=document.getElementById('quizAns');
  const next=()=>{cur=pool[Math.floor(Math.random()*pool.length)];const k=Math.floor(Math.random()*4);const pre=['','U','U2',"U'"][k];
    dia.replaceChildren(llDiagram(caseOf(cur.alg,pre),cur.mode));ans.innerHTML='<span class="muted">'+L('Which case is this?')+'</span>';cur.pre=pre;};
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
      if(c!==ci){ci=c;n=0;host.insertAdjacentHTML('beforeend',`<div class="group-title">${set==='PLL'?'PLL':set+' · '+Lt('collCase',c)}</div>`);grid=document.createElement('div');grid.className='cards';host.appendChild(grid);}
      n++;grid.appendChild(card({name:(set==='PLL'?'PLL ':'ZBLL '+set+' ')+c+'.'+n,sub:alg.split(' ').length+' moves',alg,easy:'all'},pllDia(caseOf(alg),'pll'),idOf(set,c,n)));});
    updateProgress();};
  ZB_SETS.forEach(([k,label])=>{const cnt=ZBLL.filter(z=>z[0]===k).length;const b=document.createElement('button');b.dataset.set=k;b.setAttribute('role','tab');b.innerHTML=`${L(label)} <span class="cnt">${cnt}</span>`;b.onclick=()=>show(k);tabs.appendChild(b);});
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

/* ---------- advanced F2L ---------- */
const AF2L_GROUPS=['Both pieces in the top layer','Corner on top, edge in the slot','Corner in the slot, edge on top','Both pieces in the slot'];
const AF2L_SLOTS=[['FR','Front-right','','R U F'],['FL','Front-left',"y'",'L U F'],['BR','Back-right','y','R U B'],['BL','Back-left','y2','L U B']];
function initAF2L(){
  if(typeof AF2L==='undefined')return;
  const tabs=document.getElementById('afTabs'),host=document.getElementById('afCards');
  Object.keys(AF2L).forEach(sl=>AF2L[sl].forEach((x,i)=>allIds.add('af-'+sl+'-'+i)));
  let saved='FR';try{saved=localStorage.getItem('cfop-afslot')||'FR';}catch(e){}
  const show=sl=>{[...tabs.children].forEach(b=>b.setAttribute('aria-selected',b.dataset.set===sl));try{localStorage.setItem('cfop-afslot',sl);}catch(e){}
    const cfg=AF2L_SLOTS.find(c=>c[0]===sl);const home={FR:[1,1],FL:[-1,1],BR:[1,-1],BL:[-1,-1]}[sl];
    const mask=st=>{const h=st.h;return nz(h)===1||(h[1]===-1&&nz(h)===2)||eq(h,[home[0],-1,home[1]])||eq(h,[home[0],0,home[1]]);};
    host.replaceChildren();host.insertAdjacentHTML('beforeend',`<p class="muted af-note">${Lt('afNote',L(cfg[1]),cfg[3])}</p>`);
    let g=-1,grid,n=0;
    AF2L[sl].forEach(([grp,alg],i)=>{
      if(grp!==g){g=grp;host.insertAdjacentHTML('beforeend',`<div class="group-title">${L(AF2L_GROUPS[grp])}</div>`);grid=document.createElement('div');grid.className='cards';host.appendChild(grid);}
      n++;const st=caseOf(alg);if(cfg[2])applyAlg(st,cfg[2]);
      grid.appendChild(card({name:sl+' · '+Lt('case',n),sub:alg.split(' ').length+' moves',alg},isoDiagram(st,mask),'af-'+sl+'-'+i));});
    updateProgress();};
  AF2L_SLOTS.forEach(([k,label])=>{const b=document.createElement('button');b.dataset.set=k;b.setAttribute('role','tab');b.innerHTML=`${k} <span class="cnt">${L(label)}</span>`;b.onclick=()=>show(k);tabs.appendChild(b);});
  show(AF2L[saved]?saved:'FR');
}

/* ---------- CFOP solver (modal) ---------- */
const cloneS=s=>s.map(st=>({...st,p:st.p.slice(),n:st.n.slice()}));
function okBy(s,pred){const ctr={};for(const st of s)if(nz(st.p)===1)ctr[st.n.join()]=st.c;return s.every(st=>!pred(st)||st.c===ctr[st.n.join()]);}
const AUFS=['','U',"U'",'U2'];
const isSolved=s=>okBy(s,()=>true), f2lDone=s=>okBy(s,st=>st.p[1]<1), topDone=s=>okBy(s,st=>st.n[1]===1);
const edgesOriented=s=>okBy(s,st=>st.n[1]===1&&nz(st.p)===2);
function postAUF(s){for(const a of AUFS){const t=cloneS(s);if(a)applyAlg(t,a);if(isSolved(t))return a;}return null;}
let ZB_NAMES=null;
function zbNames(){if(ZB_NAMES)return ZB_NAMES;const c={};ZB_NAMES=ZBLL.map(([set,ci])=>{const k=set+'/'+ci;c[k]=(c[k]||0)+1;return (set==='PLL'?'PLL ':'ZBLL '+set+' ')+ci+'.'+c[k];});return ZB_NAMES;}
const joinM=(a,b)=>[a,b].filter(Boolean).join(' ');
function solveLL(s){
  const out={zb:null,op:[]};
  if(isSolved(s))return out;
  if(edgesOriented(s)&&typeof ZBLL!=='undefined'){const names=zbNames();
    outer:for(const pre of AUFS)for(let i=0;i<ZBLL.length;i++){const t=cloneS(s);applyAlg(t,joinM(pre,ZBLL[i][2]));if(!topDone(t)||!f2lDone(t))continue;const post=postAUF(t);if(post!==null){out.zb=[{name:names[i],moves:joinM(joinM(pre,ZBLL[i][2]),post)}];break outer;}}}
  let t=cloneS(s);
  if(!topDone(t)){let found=null;
    outer2:for(const pre of AUFS)for(const n in OLL_ALGS){const u=cloneS(t);applyAlg(u,joinM(pre,OLL_ALGS[n]));if(topDone(u)&&f2lDone(u)){found={name:'OLL '+n,moves:joinM(pre,OLL_ALGS[n])};t=u;break outer2;}}
    if(!found)return null;out.op.push(found);}
  if(!isSolved(t)){const a=postAUF(t);if(a!==null)out.op.push({name:'AUF',moves:a});
    else{let found=null;
      outer3:for(const pre of AUFS)for(const n in PLL_ALGS){const u=cloneS(t);applyAlg(u,joinM(pre,PLL_ALGS[n]));if(!f2lDone(u)||!topDone(u))continue;const post=postAUF(u);if(post!==null){found={name:n+'-perm',moves:joinM(joinM(pre,PLL_ALGS[n]),post)};break outer3;}}
      if(!found)return null;out.op.push(found);}}
  return out;
}
const conjZ2=sc=>sc.trim().split(/\s+/).filter(Boolean).map(t=>({U:'D',D:'U',R:'L',L:'R'}[t[0]]||t[0])+t.slice(1));
let solverWorker=null;
function runF2L(moves){
  return new Promise((res,rej)=>{
    try{if(!solverWorker&&window.Worker&&location.protocol!=='file:')solverWorker=new Worker('js/solver.js?v='+SOLVER_V);}catch(e){solverWorker=null;}
    if(solverWorker){const id=Math.random();const h=e=>{if(e.data.id!==id)return;solverWorker.removeEventListener('message',h);e.data.error?rej(new Error(e.data.error)):res(e.data.plans);};solverWorker.addEventListener('message',h);solverWorker.postMessage({id,moves});}
    else setTimeout(()=>{try{res(CFOPSolver.solveF2L(moves));}catch(e){rej(e);}},30);
  });
}
const SOLVER_V='202611131800';
const htm=str=>str&&str.trim()?str.trim().split(/\s+/).filter(t=>!/^[xyz]/.test(t)).length:0;
const KIND_NAME={cross:'Cross',xcross:'X-cross',xxcross:'XX-cross'};
async function solveScramble(sc){
  const out=document.getElementById('solveOut');
  let toks;try{toks=conjZ2(sc);if(!toks.length||toks.some(t=>!/^[RLUDFB](2|')?$/.test(t)))throw 0;}catch(e){out.innerHTML=`<p class="status err">${L("Use face moves only: R L U D F B, with ' or 2.")}</p>`;return;}
  out.innerHTML=`<p class="muted sol-wait">${L('Searching cross, X-cross and XX-cross…')}</p>`;
  let plans;try{plans=await runF2L(toks);}catch(e){out.innerHTML=`<p class="status err">${e.message}</p>`;return;}
  const results=[];
  for(const plan of plans){
    const s=solved();applyAlg(s,toks.join(' '));
    const steps=[];let done=0;
    for(const st of plan){const mv=st.moves.join(' ');if(mv)applyAlg(s,mv);
      if(st.kind==='pair'){done+=st.slots.length;steps.push({label:Lt('pairN',done,st.slots.join(', '))+(st.ec?' · '+L('edge control'):''),moves:mv});}
      else{done=(st.slots||[]).length;const k=st.kind==='cross'&&done?(done>1?'xxcross':'xcross'):st.kind;steps.push({label:L(KIND_NAME[k])+(done?' ('+st.slots.join(', ')+')':''),moves:mv});}}
    if(!f2lDone(s))continue;
    const ll=solveLL(s);if(!ll)continue;
    const variants=[ll.op];if(ll.zb)variants.unshift(ll.zb);
    for(const v of variants){const all=[...steps,...v.map(x=>({label:x.name,moves:x.moves,ll:true}))];
      const t=solved();applyAlg(t,toks.join(' '));all.forEach(x=>{if(x.moves)applyAlg(t,x.moves);});
      if(!isSolved(t))continue;
      results.push({steps:all,n:all.reduce((a,x)=>a+htm(x.moves),0),kind:plan[0].kind,zb:v===ll.zb});}
  }
  if(!results.length){out.innerHTML=`<p class="status err">${L('No solution found.')}</p>`;return;}
  results.sort((a,b)=>a.n-b.n);
  const best=results[0];
  const cmp=['cross','xcross','xxcross'].map(k=>{const r=results.filter(x=>x.kind===k)[0];return r?`<span class="${r===best?'on':''}">${L(KIND_NAME[k])} <b>${r.n}</b></span>`:'';}).join('');
  const noZB=best.zb?results.find(r=>!r.zb):null;
  let gi=0;const flat=[];
  best.steps.forEach((x,si)=>{x.toks=x.moves?x.moves.split(' ').map(t=>{flat.push({t,si});return `<span data-i="${gi++}">${t}</span>`;}).join(' '):'–';});
  out.innerHTML=`<div class="sol-sum"><div><b>${best.n}</b><span>${L('moves')}</span></div><div><b>${(best.n/6).toFixed(1)} s</b><span>${L('at 6 TPS')}</span></div><div><b>${(best.n/10).toFixed(1)} s</b><span>${L('at 10 TPS')}</span></div></div>
    <p class="sol-cmp">${L('Best total by first step:')} ${cmp}</p>
    <ol class="sol-steps"><li><span class="lbl">${L('Inspection')}</span><code>z2</code><small>${L('Hold white on the bottom, green in front.')}</small></li>${best.steps.map((x,si)=>`<li data-step="${si}"${x.ll?' class="ll"':''}><span class="lbl">${x.label}</span><code>${x.toks}</code><small>${Lt('moves',htm(x.moves))}</small></li>`).join('')}</ol>
    ${noZB?`<p class="muted sol-alt">${Lt('noZB',noZB.n,noZB.steps.filter(x=>x.ll).map(x=>x.label).join(' + '))}</p>`:''}
    <div class="algline"><button id="solWatch">${L('Open in playground')}</button><button id="solCopy">${L('Copy solution')}</button></div>`;
  solPlayer(toks,flat,best.steps);
  const full=best.steps.map(x=>x.moves).filter(Boolean).join(' ');
  document.getElementById('solWatch').onclick=()=>{document.getElementById('solveDlg').close();pg=solved();applyAlg(pg,toks.join(' '));queue=parse(full);qi=0;drawPg();drawSteps();status(L('Solution loaded. Press Next move to step through.'));document.getElementById('algIn').value=full;go('playground');};
  document.getElementById('solCopy').onclick=e=>{try{navigator.clipboard.writeText('z2 '+full);e.target.textContent=L('Copied');}catch(err){}};
}
/* Easy way: solve a last-layer case with only the 2-look (beginner) algorithms */
function cornersPermuted(s){for(const a of AUFS){const t=cloneS(s);if(a)applyAlg(t,a);if(okBy(t,st=>st.p[1]===1&&nz(st.p)===3))return true;}return false;}
function easyLL(s,upto){
  const stages=[[edgesOriented,OLLE],[topDone,OLLC]];
  if(upto!=='oll')stages.push([cornersPermuted,PLLC],[t=>postAUF(t)!==null,PLLE]);
  const steps=[];let cur=cloneS(s);const keep=[];
  for(const [cond,list] of stages){
    if(!cond(cur)){let f=null;
      outer:for(const pre of AUFS)for(const it of list){const t=cloneS(cur);applyAlg(t,joinM(pre,it.alg));if(cond(t)&&f2lDone(t)&&keep.every(k=>k(t))){f={name:it.name,pre,alg:it.alg,t};break outer;}}
      if(!f)return null;steps.push(f);cur=f.t;}
    keep.push(cond);}
  if(upto!=='oll'){const a=postAUF(cur);if(a)steps.push({name:'AUF',pre:'',alg:a});}
  return steps;
}
function toggleEasy(d,item){
  let box=d.querySelector('.easy');if(box){box.remove();return;}
  const st=easyLL(caseOf(item.alg),item.easy);
  box=document.createElement('div');box.className='easy';
  if(!st){box.textContent=L('No easy way found.');d.appendChild(box);return;}
  const n=st.reduce((a,x)=>a+htm(joinM(x.pre,x.alg)),0);
  box.innerHTML=`<div class="easy-h">${Lt('easyHead',st.length,n,htm(item.alg))}</div><ol>${st.map(x=>`<li><b>${x.pre?'<code>'+x.pre+'</code> + ':''}${L(x.name)}</b><div class="mem">${memo(x.alg).html}</div></li>`).join('')}</ol>`;
  d.appendChild(box);
}
/* 3D player inside the solver window */
let solCube=null,solTimer=0;
function solPlayer(toks,flat,steps){
  const view=document.getElementById('solView'),now=document.getElementById('solNow'),out=document.getElementById('solveOut');
  if(!window.THREE||!window.Cube3D){view.hidden=true;return;}
  view.hidden=false;
  if(!solCube){try{solCube=new Cube3D(document.getElementById('solCube'),{speed:300,touch:'none'});}catch(e){view.hidden=true;return;}}
  const mv=flat.map(f=>parse(f.t)[0]);
  let pos=0,model=null,playing=false;
  const base=()=>{const m=solved();applyAlg(m,toks.join(' '));return m;};
  const paint=()=>{
    out.querySelectorAll('.sol-steps span[data-i]').forEach(sp=>{const i=+sp.dataset.i;sp.className=i<pos?'done':i===pos?'next':'';});
    const si=pos<flat.length?flat[pos].si:steps.length;
    out.querySelectorAll('.sol-steps li[data-step]').forEach(li=>li.classList.toggle('cur',+li.dataset.step===si));
    now.innerHTML=pos>=flat.length?`<b>${L('Solved!')}</b> ${Lt('moves',flat.length)}`:`<span>${steps[flat[pos].si].label}</span> · ${L('Move')} ${pos+1}/${flat.length}: <code>${flat[pos].t}</code>`;
    document.getElementById('solPlay').textContent=playing?'❚❚ '+L('Pause'):'▶ '+L('Play');};
  const jump=p=>{clearInterval(solTimer);playing=false;solCube.clear();model=base();for(let i=0;i<p;i++)applyMove(model,mv[i]);pos=p;solCube.model=model;solCube.sync(model);paint();};
  const fwd=()=>{if(pos>=flat.length)return false;applyMove(model,mv[pos]);solCube.model=model;solCube.enqueue(mv[pos]);pos++;paint();return true;};
  const back=()=>{if(pos<=0)return;pos--;const inv=invert([mv[pos]])[0];applyMove(model,inv);solCube.model=model;solCube.enqueue(inv);paint();};
  const play=()=>{if(playing){clearInterval(solTimer);playing=false;paint();return;}if(pos>=flat.length)jump(0);playing=true;paint();
    solTimer=setInterval(()=>{if(solCube.busy)return;if(!fwd()){clearInterval(solTimer);playing=false;paint();}},40);};
  const stepFwd=()=>{if(pos>=flat.length)return;clearInterval(solTimer);playing=false;const si=flat[pos].si;
    const go1=()=>{if(pos<flat.length&&flat[pos].si===si){if(!solCube.busy)fwd();solTimer=setTimeout(go1,40);}else paint();};go1();};
  document.getElementById('solPlay').onclick=play;
  document.getElementById('solNext').onclick=()=>{clearInterval(solTimer);playing=false;fwd();};
  document.getElementById('solPrev').onclick=()=>{clearInterval(solTimer);playing=false;back();};
  document.getElementById('solStep').onclick=stepFwd;
  document.getElementById('solReset').onclick=()=>jump(0);
  document.getElementById('solSpeed').onchange=e=>{solCube.speed=+e.target.value;};solCube.speed=+document.getElementById('solSpeed').value;
  out.querySelectorAll('.sol-steps li[data-step]').forEach(li=>{li.onclick=()=>{const p=flat.findIndex(f=>f.si===+li.dataset.step);jump(p<0?flat.length:p);};});
  jump(0);
}
function initSolver(){
  const dlg=document.getElementById('solveDlg');if(!dlg)return;
  const inp=document.getElementById('solveIn');
  const open=()=>{inp.value=document.getElementById('scr').textContent;document.getElementById('solveOut').replaceChildren();document.getElementById('solView').hidden=true;if(dlg.showModal)dlg.showModal();else dlg.setAttribute('open','');solveScramble(inp.value);};
  document.querySelectorAll('[data-solve]').forEach(b=>b.onclick=e=>{e.preventDefault();open();});
  document.getElementById('solveGo').onclick=()=>solveScramble(inp.value);
  document.getElementById('solveRand').onclick=()=>{inp.value=makeScramble();solveScramble(inp.value);};
  inp.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();solveScramble(inp.value);}};
  dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close();});
  dlg.addEventListener('close',()=>{clearInterval(solTimer);clearTimeout(solTimer);if(solCube)solCube.clear();});
  document.getElementById('solveRand').addEventListener('click',()=>{document.getElementById('solView').hidden=true;});
  document.getElementById('solveGo').addEventListener('click',()=>{document.getElementById('solView').hidden=true;});
}

/* ---------- pages: landing + one topic at a time ---------- */
const PAGES=[...document.querySelectorAll('section.chap')].map(x=>x.id);
function go(id){if(location.hash!=='#'+id)location.hash=id;else route();}
function route(){
  const id=location.hash.slice(1),hero=document.querySelector('header.hero'),home=document.getElementById('home');
  const page=PAGES.includes(id)?id:null;
  document.body.classList.toggle('on-page',!!page);
  hero.hidden=!!page;home.hidden=!!page;
  PAGES.forEach(p=>{document.getElementById(p).hidden=p!==page;});
  document.querySelectorAll('nav.bar a[href^="#"]').forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+page));
  const on=document.querySelector('nav.bar a.on');if(on){const bar=on.parentElement;bar.scrollTo({left:on.offsetLeft-bar.clientWidth/2+on.clientWidth/2});}
  window.scrollTo(0,0);
  document.title=(page?(document.querySelector('nav.bar a[href="#'+page+'"]')||{}).textContent+' · ':'')+(LANG==='lo'?'ຄູ່ມື CFOP 3x3':'CFOP 3x3 Guide');
}
function initPages(){
  const label=id=>{const a=document.querySelector('nav.bar a[href="#'+id+'"]');return a?a.textContent.trim():id;};
  PAGES.forEach((id,i)=>{const sec=document.getElementById(id),w=sec.querySelector('.wrap');
    w.insertAdjacentHTML('afterbegin',`<a class="back" href="#">← ${L('All topics')}</a>`);
    const prev=PAGES[i-1],next=PAGES[i+1];
    w.insertAdjacentHTML('beforeend',`<div class="pager">${prev?`<a href="#${prev}"><small>${L('Previous')}</small><b>← ${label(prev)}</b></a>`:'<span></span>'}${next?`<a class="nx" href="#${next}"><small>${L('Next')}</small><b>${label(next)} →</b></a>`:''}</div>`);});
  document.querySelectorAll('.stage[data-go]').forEach(st=>{st.tabIndex=0;st.onclick=()=>go(st.dataset.go);st.onkeydown=e=>{if(e.key==='Enter')go(st.dataset.go);};});
  addEventListener('hashchange',route);route();
}
/* ---------- boot ---------- */
applyStatic();
renderF2L();
renderLL(OLLE,'olleCards','olle','olle');
renderLL(OLLC,'ollcCards','oll','ollc');
renderLL(PLLC,'pllcCards','pllc','pllc','corners');
renderLL(PLLE,'plleCards','pll','plle','all');
initHero();
renderFull();renderCOLL();initZB();initAF2L();initSolver();initPages();
initPg();initTimer();initDrills();initFT();initQuiz();updateProgress();

