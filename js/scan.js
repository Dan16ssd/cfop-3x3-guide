/* Scan a real cube with the camera (or paint it by hand), check it, then let Coach Dann explain
   the fastest CFOP solution step by step: inspection, cross / X-cross, each pair, OLL, PLL. */

/* ---------- cube model from 6 faces ---------- */
// each face as seen by the camera: n = face normal, u = the direction that is "up" in the picture
const SC_FACES=[
  {k:'F',c:'G',n:[0,0,1],u:[0,1,0],top:'Y'},
  {k:'R',c:'O',n:[1,0,0],u:[0,1,0],top:'Y'},
  {k:'B',c:'B',n:[0,0,-1],u:[0,1,0],top:'Y'},
  {k:'L',c:'R',n:[-1,0,0],u:[0,1,0],top:'Y'},
  {k:'U',c:'Y',n:[0,1,0],u:[0,0,-1],top:'B'},
  {k:'D',c:'W',n:[0,-1,0],u:[0,0,1],top:'G'}];
const scCross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const scPos=(f,i)=>{const r=scCross(f.u,f.n),row=Math.floor(i/3),col=i%3;return [0,1,2].map(a=>f.n[a]+r[a]*(col-1)+f.u[a]*(1-row));};
/* faces: {F:[9 colors],...} -> sticker model with homes, or {err:[...]} */
function scBuild(faces){
  const err=[],cnt={};
  for(const f of SC_FACES)for(let i=0;i<9;i++){const c=faces[f.k][i];if(!c){err.push(['missing']);return {err};}cnt[c]=(cnt[c]||0)+1;}
  for(const c of 'WYGBRO')if(cnt[c]!==9)err.push(['count',c,cnt[c]||0]);
  if(err.length)return {err};
  const st=[];for(const f of SC_FACES)for(let i=0;i<9;i++)st.push({p:scPos(f,i),n:f.n.slice(),c:faces[f.k][i]});
  const ref=solved(),byP=new Map();
  for(const s of st){const k=s.p.join();(byP.get(k)||byP.set(k,[]).get(k)).push(s);}
  const refP=new Map();for(const s of ref){const k=s.h.join();(refP.get(k)||refP.set(k,[]).get(k)).push(s);}
  const used=new Map();
  for(const [k,list] of byP){const cols=list.map(s=>s.c).sort().join('');
    let home=null;for(const [hk,rl] of refP)if(rl.length===list.length&&rl.map(s=>s.c).sort().join('')===cols){home=rl;break;}
    if(!home){err.push(['nopiece',list.map(s=>s.c)]);continue;}
    const hk=home[0].h.join();if(used.has(hk)){err.push(['twice',list.map(s=>s.c)]);continue;}used.set(hk,1);
    for(const s of list){const h=home.find(r=>r.c===s.c);s.h=h.h.slice();s.hn=h.hn.slice();}}
  if(err.length)return {err};
  // can it be solved? corner twist, edge flip, permutation parity
  const pcs=[...byP.values()],cor=pcs.filter(l=>l.length===3),edg=pcs.filter(l=>l.length===2);
  let tw=0;for(const l of cor){const ud=l.find(s=>s.c==='W'||s.c==='Y');if(ud.n[1])continue;const p=l[0].p;
    const ny=[0,p[1],0],nx=[p[0],0,0],nz=[0,0,p[2]],tri=scCross(nx,nz).reduce((a,v,i)=>a+v*ny[i],0);
    const o=tri>0?[ny,nx,nz]:[ny,nz,nx];tw+=o.findIndex(v=>eq(v,ud.n));}
  if(tw%3)err.push(['twist']);
  let fl=0;for(const l of edg){const p=l[0].p,pri=l.find(s=>'WY'.includes(s.c))||l.find(s=>'GB'.includes(s.c));const ax=p[1]?1:2;if(!pri.n[ax])fl++;}
  if(fl%2)err.push(['flip']);
  const par=list=>{const pos=list.map(l=>l[0].p.join()),home=list.map(l=>l[0].h.join());const idx=new Map(pos.map((k,i)=>[k,i]));
    const perm=home.map(h=>idx.get(h));let sw=0;const seen=new Array(perm.length).fill(false);
    for(let i=0;i<perm.length;i++){if(seen[i])continue;let j=i,len=0;while(!seen[j]){seen[j]=true;j=perm[j];len++;}sw+=len-1;}return sw%2;};
  if(par(cor)!==par(edg))err.push(['parity']);
  if(err.length)return {err};
  return {model:st};
}
const SC_TRACK=[...[[0,-1,1],[1,-1,0],[0,-1,-1],[-1,-1,0]].map(h=>[h,[0,-1,0]]),...[[1,-1,1],[-1,-1,1],[-1,-1,-1],[1,-1,-1]].map(h=>[h,[0,-1,0]]),
  ...[[1,0,1],[-1,0,1],[-1,0,-1],[1,0,-1]].map(h=>[h,[h[0],0,0]]),...[[0,1,1],[1,1,0],[0,1,-1],[-1,1,0]].map(h=>[h,[0,1,0]])];
const SLOT_C={FR:'GO',FL:'GR',BL:'BR',BR:'BO'};
const SLOT_POS={FR:[1,1],FL:[-1,1],BL:[-1,-1],BR:[1,-1]};

/* best CFOP plan for a model (white bottom, green front) */
async function scPlan(model){
  const pieces=SC_TRACK.map(([h,hn])=>{const s=model.find(x=>eq(x.h,h)&&eq(x.hn,hn));return [s.p,s.n];});
  const plans=await runF2L([],{pieces});
  const results=[];
  for(const plan of plans){
    const s=cloneS(model),steps=[];let done=[];
    for(const st of plan){const mv=st.moves.join(' '),before=cloneS(s);if(mv)applyAlg(s,mv);
      if(st.kind==='pair'){done=done.concat(st.slots);steps.push({kind:'pair',slots:st.slots,ec:st.ec,moves:mv,before});}
      else{done=(st.slots||[]).slice();const k=st.kind==='cross'&&done.length?(done.length>1?'xxcross':'xcross'):st.kind;steps.push({kind:k,slots:done.slice(),moves:mv,before});}}
    if(!f2lDone(s))continue;
    const ll=solveLL(s);if(!ll)continue;
    for(const v of [ll.zb,ll.op].filter(Boolean)){const t=cloneS(s),lls=[];
      for(const x of v){lls.push({kind:'ll',name:x.name,moves:x.moves,before:cloneS(t),zb:v===ll.zb});if(x.moves)applyAlg(t,x.moves);}
      if(!isSolved(t))continue;
      const all=[...steps,...lls];results.push({steps:all,n:all.reduce((a,x)=>a+htm(x.moves),0),kind:plan[0].kind,zb:v===ll.zb});}
  }
  results.sort((a,b)=>a.n-b.n);return results;
}

/* ---------- words for what Coach Dann sees ---------- */
const SC_DIR=n=>({'0,1,0':'up','0,-1,0':'down','0,0,1':'the front','0,0,-1':'the back','1,0,0':'the right','-1,0,0':'the left'})[n.join()];
const SC_SPOT=p=>{const a=[];if(p[2]===1)a.push('front');if(p[2]===-1)a.push('back');if(p[0]===1)a.push('right');if(p[0]===-1)a.push('left');return a.join('-');};
const SC_LAYER={1:'top',0:'middle','-1':'bottom'};
const scColName=c=>L(COL_NAME[c]).toLowerCase();
function scSee(s,h){
  const list=s.filter(x=>eq(x.h,h)),p=list[0].p,kind=list.length===3?'corner':'edge';
  const order=c=>'WYGBRO'.indexOf(c),cols=list.map(x=>x.c).sort((a,b)=>order(a)-order(b));
  const name=Lt('scPc',L(kind),cols.map(scColName).join('-'));
  const ref=list.find(x=>'WY'.includes(x.c))||list.find(x=>'GB'.includes(x.c))||list[0];
  if(eq(p,h)){const ok=list.every(x=>eq(x.n,x.hn));return `<b>${name}</b>: ${ok?L('already in place ✓'):L(kind==='edge'?'in its spot, but flipped':'in its spot, but twisted the wrong way')}`;}
  return `<b>${name}</b>: ${Lt('scAt',L(SC_LAYER[p[1]]),L(SC_SPOT(p)))} · ${Lt('scFace',scColName(ref.c),L(SC_DIR(ref.n)))}`;
}
const scSlotName=sl=>Lt('scSlot',L(SC_SPOT([SLOT_POS[sl][0],0,SLOT_POS[sl][1]])),SLOT_C[sl].split('').map(scColName).join('-'));

/* ---------- camera colors ---------- */
const scLab=([r,g,b])=>{const f=v=>{v/=255;return v>0.04045?Math.pow((v+0.055)/1.055,2.4):v/12.92;};r=f(r);g=f(g);b=f(b);
  let x=(r*0.4124+g*0.3576+b*0.1805)/0.95047,y=r*0.2126+g*0.7152+b*0.0722,z=(r*0.0193+g*0.1192+b*0.9505)/1.08883;
  const h=t=>t>0.008856?Math.cbrt(t):7.787*t+16/116;x=h(x);y=h(y);z=h(z);return [116*y-16,500*(x-y),200*(y-z)];};
const SC_REF0={W:[230,232,235],Y:[225,215,40],G:[20,150,70],B:[25,80,190],R:[190,25,40],O:[245,110,25]};

function initScan(){
  const page=document.getElementById('scan');if(!page)return;
  const $=id=>document.getElementById(id);
  const video=$('scVideo'),grid=$('scGrid'),off=$('scOff'),stepBox=$('scStep'),net=$('scNet'),pal=$('scPal'),msg=$('scMsg');
  const raw={},man={};SC_FACES.forEach(f=>{raw[f.k]=new Array(9).fill(null);man[f.k]=new Array(9).fill(null);});
  let ref={...SC_REF0},cur=0,stream=null,loop=0,paint='W',live=new Array(9).fill(null);
  const near=rgb=>{const l=scLab(rgb);let best=null,bd=1e9;for(const c in ref){const m=scLab(ref[c]);const d=(l[0]-m[0])**2*0.6+(l[1]-m[1])**2+(l[2]-m[2])**2;if(d<bd){bd=d;best=c;}}return best;};
  const col=(f,i)=>i===4?f.c:(man[f.k][i]||(raw[f.k][i]?near(raw[f.k][i]):null));
  const faces=()=>{const o={};SC_FACES.forEach(f=>{o[f.k]=[...Array(9)].map((_,i)=>col(f,i));});return o;};
  const scanned=f=>raw[f.k][0]!==null||man[f.k].some((x,i)=>i!==4&&x);
  /* net */
  const NETPOS={U:[1,0],L:[0,1],F:[1,1],R:[2,1],B:[3,1],D:[1,2]};
  function drawNet(){net.replaceChildren();
    SC_FACES.forEach((f,fi)=>{const g=document.createElement('div');g.className='sc-face'+(fi===cur&&stream?' on':'');g.style.gridColumn=NETPOS[f.k][0]+1;g.style.gridRow=NETPOS[f.k][1]+1;
      for(let i=0;i<9;i++){const b=document.createElement('button');b.type='button';const c=col(f,i);b.style.background=c?HEX[c]:'';b.className=c?'':'empty';
        if(i===4){b.disabled=true;b.title=L(COL_NAME[f.c]);}else{b.setAttribute('aria-label',L(COL_NAME[c]||'')||'?');b.onclick=()=>{man[f.k][i]=paint;drawNet();hideGuide();};}
        g.appendChild(b);}
      net.appendChild(g);});}
  pal.replaceChildren(...'WYGBRO'.split('').map(c=>{const b=document.createElement('button');b.type='button';b.style.background=HEX[c];b.title=L(COL_NAME[c]);b.setAttribute('aria-pressed',c===paint);
    b.onclick=()=>{paint=c;pal.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));};return b;}));
  function drawStep(){const f=SC_FACES[cur],n=SC_FACES.filter(scanned).length;
    stepBox.innerHTML=`<small>${Lt('scSide',Math.min(cur+1,6),6)} · ${Lt('scDone',n)}</small><div class="sc-hold"><span class="sc-chip" style="background:${HEX[f.c]}"></span><span>${Lt('scShow',`<b>${L(COL_NAME[f.c])}</b>`,`<b>${L(COL_NAME[f.top])}</b>`)}</span><span class="sc-chip sm" style="background:${HEX[f.top]}"></span></div>`;}
  /* camera */
  const cv=document.createElement('canvas'),cx=cv.getContext('2d',{willReadFrequently:true});
  const cells=[];for(let i=0;i<9;i++){const d=document.createElement('div');d.innerHTML='<i></i>';grid.appendChild(d);cells.push(d);}
  function sample(){const w=video.videoWidth,h=video.videoHeight;if(!w)return null;const s=Math.min(w,h)*0.66,x0=(w-s)/2,y0=(h-s)/2;
    cv.width=90;cv.height=90;cx.drawImage(video,x0,y0,s,s,0,0,90,90);const out=[];
    for(let i=0;i<9;i++){const r=Math.floor(i/3),c=i%3,d=cx.getImageData(c*30+9,r*30+9,12,12).data;let R=0,G=0,B=0;for(let k=0;k<d.length;k+=4){R+=d[k];G+=d[k+1];B+=d[k+2];}const m=d.length/4;out.push([R/m,G/m,B/m]);}
    return out;}
  function tick(){const s=sample();if(s){live=s;s.forEach((rgb,i)=>{const c=near(rgb);cells[i].firstChild.style.background=HEX[c];});}loop=requestAnimationFrame(()=>setTimeout(tick,120));}
  async function startCam(){
    try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment',width:{ideal:640},height:{ideal:480}},audio:false});}
    catch(e){msg.textContent=L('The camera could not start. Allow camera access, or paint the colors by tapping the stickers.');return;}
    video.srcObject=stream;await video.play().catch(()=>{});off.hidden=true;grid.hidden=false;page.classList.add('cam-on');tick();drawNet();drawStep();}
  function stopCam(){cancelAnimationFrame(loop);if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;off.hidden=false;grid.hidden=true;page.classList.remove('cam-on');}
  function capture(){if(!stream||!live[0])return;const f=SC_FACES[cur];raw[f.k]=live.map(x=>x.slice());man[f.k]=new Array(9).fill(null);ref[f.c]=live[4].slice();
    hideGuide();const nx=SC_FACES.findIndex((g,i)=>i>cur&&!scanned(g));const any=SC_FACES.findIndex(g=>!scanned(g));
    cur=nx>=0?nx:any>=0?any:cur;drawNet();drawStep();
    if(any<0){msg.innerHTML=L('All 6 sides scanned. Check the colors against your cube. Tap a sticker to fix it, then press Solve.');stopCam();}
    else msg.textContent='';
    grid.classList.remove('snap');void grid.offsetWidth;grid.classList.add('snap');}
  $('scStart').onclick=startCam;$('scCap').onclick=capture;
  $('scRetake').onclick=()=>{const f=SC_FACES[cur];raw[f.k]=new Array(9).fill(null);man[f.k]=new Array(9).fill(null);if(!stream)startCam();drawNet();drawStep();};
  net.addEventListener('dblclick',e=>e.preventDefault());
  document.addEventListener('keydown',e=>{if(page.hidden||!stream||e.code!=='Space'||['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName))return;e.preventDefault();if(!e.repeat)capture();});
  addEventListener('hashchange',()=>{if(location.hash!=='#scan')stopCam();});
  $('scClear').onclick=()=>{SC_FACES.forEach(f=>{raw[f.k].fill(null);man[f.k].fill(null);});ref={...SC_REF0};cur=0;msg.textContent='';hideGuide();drawNet();drawStep();};
  $('scDemo').onclick=()=>{const s=solved();applyAlg(s,makeScramble());SC_FACES.forEach(f=>{raw[f.k].fill(null);for(let i=0;i<9;i++){const p=scPos(f,i);man[f.k][i]=s.find(x=>eq(x.p,p)&&eq(x.n,f.n)).c;}});
    msg.textContent=L('A random cube is loaded. Press Solve to see how Coach Dann solves it.');hideGuide();drawNet();};
  /* solve + guide */
  const guide=$('scGuide');let G=null,cube=null,anim=0;
  function hideGuide(){guide.hidden=true;}
  const ERR={missing:()=>L('Some stickers have no color yet. Scan every side or tap the gray stickers.'),
    count:(c,n)=>Lt('scCount',L(COL_NAME[c]),n),nopiece:cs=>Lt('scNoPiece',cs.map(scColName).join('-')),twice:cs=>Lt('scTwice',cs.map(scColName).join('-')),
    twist:()=>L('One corner is twisted. Check the corner stickers.'),flip:()=>L('One edge is flipped. Check the edge stickers.'),parity:()=>L('Two pieces are swapped. Check the stickers again.')};
  $('scSolve').onclick=async()=>{
    const b=scBuild(faces());
    if(b.err){const u=[];b.err.forEach(([k,...a])=>{const t=ERR[k](...a);if(!u.includes(t))u.push(t);});msg.innerHTML=`<span class="err">${u.slice(0,4).join('<br>')}</span>`;hideGuide();return;}
    stopCam();msg.innerHTML=`<span class="muted">${L('Coach Dann is looking for the fastest solution…')}</span>`;
    let res;try{res=await scPlan(b.model);}catch(e){msg.textContent=e.message;return;}
    if(!res.length){msg.innerHTML=`<span class="err">${L('No solution found. Check the colors again.')}</span>`;return;}
    msg.textContent='';showGuide(b.model,res);};
  function showGuide(model,res){
    const best=res[0];const kinds=['cross','xcross','xxcross'].map(k=>{const r=res.find(x=>x.kind===k);return r?{k,n:r.n}:null;}).filter(Boolean);
    const cards=[{kind:'insp',before:cloneS(model)},...best.steps,{kind:'done',before:null}];
    G={model,best,cards,i:0,kinds};guide.hidden=false;
    $('scSum').innerHTML=`<div><b>${best.n}</b><span>${L('moves')}</span></div><div><b>${(best.n/6).toFixed(1)} s</b><span>${L('at 6 TPS')}</span></div><div><b>${(best.n/10).toFixed(1)} s</b><span>${L('at 10 TPS')}</span></div>`;
    if(window.THREE&&window.Cube3D&&!cube){try{cube=new Cube3D($('sc3d'),{speed:260,touch:'none'});}catch(e){cube=null;}}
    $('scList').innerHTML=cards.map((c,i)=>`<li data-i="${i}"><span>${cardTitle(c)}</span>${c.moves?`<code>${c.moves}</code>`:''}</li>`).join('');
    $('scList').querySelectorAll('li').forEach(li=>li.onclick=()=>show(+li.dataset.i));
    show(0);guide.scrollIntoView({behavior:'smooth',block:'start'});}
  const KN={cross:'Cross',xcross:'X-cross',xxcross:'XX-cross'};
  function cardTitle(c){if(c.kind==='insp')return L('Inspection');if(c.kind==='done')return L('Solved!');
    if(c.kind==='pair')return Lt('scPairT',c.slots.join(' + '));if(c.kind==='ll')return c.name==='AUF'?L('Last turn (AUF)'):c.name;
    return L(KN[c.kind])+(c.slots.length?' ('+c.slots.join(', ')+')':'');}
  function show(i){const c=G.cards[i];G.i=i;const card=$('scCard');
    $('scList').querySelectorAll('li').forEach(li=>li.classList.toggle('cur',+li.dataset.i===i));
    let see=[],say='',extra='';
    if(c.kind==='insp'){const first=G.cards[1];
      say=L('Hold your cube with white on the bottom and green in front. Here is what I see in inspection:');
      see=[[0,-1,1],[1,-1,0],[0,-1,-1],[-1,-1,0]].map(h=>scSee(c.before,h));
      if(first.slots.length){first.slots.forEach(sl=>{const[x,z]=SLOT_POS[sl];see.push(scSee(c.before,[x,-1,z]),scSee(c.before,[x,0,z]));});}
      extra=`<p class="sc-plan">${Lt('scPlan',L(KN[first.kind]),first.slots.join(', '),htm(first.moves))}</p><p class="muted sc-cmp">${L('Best total by first step:')} ${G.kinds.map(k=>`<span class="${k.k===G.best.kind?'on':''}">${L(KN[k.k])} <b>${k.n}</b></span>`).join(' ')}</p>`;}
    else if(c.kind==='done'){say=Lt('scDoneSay',G.best.n);}
    else if(c.kind==='pair'){say=Lt('scPairSay',c.slots.map(scSlotName).join(' + '));
      c.slots.forEach(sl=>{const[x,z]=SLOT_POS[sl];see.push(scSee(c.before,[x,-1,z]),scSee(c.before,[x,0,z]));});
      if(c.ec)extra=`<p class="sc-plan">${L('This insert also turns the yellow edges the right way (edge control), so the last layer becomes one ZBLL case.')}</p>`;}
    else if(c.kind==='ll'){
      if(c.name==='AUF')say=L('Everything is solved except one turn of the top layer.');
      else if(c.zb)say=Lt('scZB',c.name);
      else if(/^OLL/.test(c.name))say=Lt('scOLL',c.name);
      else say=Lt('scPLL',c.name);
      const mode=c.zb||!/^OLL/.test(c.name)?'pll':'oll';
      if(c.name!=='AUF'){const d=llDiagram(c.before,mode,mode==='pll'?'all':undefined);extra=`<div class="sc-dia">${d.outerHTML}</div>`;}
      const m=memo(c.moves);if(m.cover>0)extra+=`<div class="mem">${m.html}</div>`;}
    else{say=c.slots.length?Lt('scXSay',L(KN[c.kind]),c.slots.map(scSlotName).join(' + ')):L('Build the white cross on the bottom.');}
    card.innerHTML=`<div class="sc-coach">${coachSVG(c.kind==='done'?'cheer':'talk')}<div class="sc-bub"><small>${Lt('scStepOf',i+1,G.cards.length)} · ${cardTitle(c)}</small>${say}</div></div>
      ${see.length?`<div class="sc-see"><b>${L('What I see')}</b><ul>${see.map(x=>`<li>${x}</li>`).join('')}</ul></div>`:''}${extra}
      ${c.moves?`<div class="sc-do"><b>${L('Do this')}</b><code>${c.moves}</code><small>${Lt('moves',htm(c.moves))}</small></div>`:''}
      <div class="algline sc-nav"><button type="button" class="sm" id="scPrev" ${i===0?'disabled':''}>◀ ${L('Back')}</button>${c.moves?`<button type="button" id="scShowMe">▶ ${L('Show me')}</button>`:''}${i<G.cards.length-1?`<button type="button" class="primary" id="scNext">${L('Next step')} ▶</button>`:`<button type="button" class="primary" id="scPg">${L('Open in playground')}</button>`}</div>`;
    $('scPrev').onclick=()=>show(i-1);
    if($('scNext'))$('scNext').onclick=()=>show(i+1);
    if($('scPg'))$('scPg').onclick=()=>{pg=cloneS(G.model);const full=G.best.steps.map(x=>x.moves).filter(Boolean).join(' ');queue=parse(full);qi=0;drawPg();drawSteps();status(L('Solution loaded. Press Next move to step through.'));document.getElementById('algIn').value=full;pgNavShow({from:'scan'});go('playground');};
    const state=c.before?cloneS(c.before):(()=>{const t=cloneS(G.model);G.best.steps.forEach(x=>{if(x.moves)applyAlg(t,x.moves);});return t;})();
    if(cube){cube.clear();cube.model=state;cube.sync(state);}
    if($('scShowMe'))$('scShowMe').onclick=()=>{if(!cube)return;clearTimeout(anim);const s=cloneS(c.before),mv=parse(c.moves);let k=0;cube.clear();cube.model=s;cube.sync(s);
      const step=()=>{if(G.i!==i)return;if(cube.busy){anim=setTimeout(step,40);return;}if(k>=mv.length)return;applyMove(s,mv[k]);cube.model=s;cube.enqueue(mv[k]);k++;anim=setTimeout(step,40);};step();};
  }
  drawNet();drawStep();grid.hidden=true;
}
initScan();
