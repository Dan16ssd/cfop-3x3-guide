/* Smart cubes and pro timers on the timer page.
   Smart cubes (Bluetooth): GAN (gan-web-bluetooth), QiYi / GoCube / GiiKER (cubing.js).
   Pro timers: GAN Smart Timer (Bluetooth) and SpeedStacks / Stackmat (audio cable into the mic input). */

const SM_GAN='https://cdn.jsdelivr.net/npm/gan-web-bluetooth@3.0.2/+esm';
const SM_CUBING='https://cdn.jsdelivr.net/npm/cubing@0.66.1/bluetooth/+esm';

/* ---------- Kociemba facelets (white top, green front) -> sticker model (white bottom) ---------- */
const SM_KCOL={U:'W',R:'R',F:'G',D:'Y',L:'O',B:'B'};
function smFromFacelets(str){
  if(!str||str.length!==54)return null;
  const st=[];'URFDLB'.split('').forEach((k,fi)=>{const f=SC_FACES.find(x=>x.k===k);
    for(let i=0;i<9;i++){const p=scPos(f,i);st.push({p:[-p[0],-p[1],p[2]],n:[-f.n[0],-f.n[1],f.n[2]],c:SM_KCOL[str[fi*9+i]]});}});
  const r=scHome(st);return r.model||null;
}
/* "R'" -> {f:'R',a:3}; a = quarter turns clockwise */
const smMv=t=>{t=String(t).trim();const f=t[0],s=t.slice(1);return {f,a:s.includes('2')?2:s.includes("'")?3:1};};
const smTxt=(f,a)=>f+(['','',"2","'"][a]);
const smCross=s=>okBy(s,st=>st.p[1]===-1&&nz(st.p)<=2);

/* ---------- Stackmat signal decoder: 1200 baud, 8N1, either polarity ---------- */
function stackmatDecoder(rate,onPacket){
  const bitLen=rate/1200,quiet=Math.ceil(bitLen*13);let peak=0,lvl=1,run=0;
  const dec=[{bits:[],bytes:[]},{bits:[],bytes:[]}];
  const parse=b=>{
    for(const n of [6,5]){if(b.length<n+2)continue;const body=b.slice(-(n+2)),st=String.fromCharCode(body[0]);
      if(!' IASLRC'.includes(st))continue;const d=body.slice(1,n+1);if(d.some(v=>v<48||v>57))continue;
      const sum=d.reduce((a,v)=>a+v-48,0);if(body[n+1]!==64+sum)continue;
      const x=d.map(v=>v-48),ms=x[0]*60000+(x[1]*10+x[2])*1000+(n===6?x[3]*100+x[4]*10+x[5]:(x[3]*10+x[4])*10);
      onPacket({status:st,ms});return true;}
    return false;};
  const byte=(d,v)=>{d.bytes.push(v);if(d.bytes.length>14)d.bytes.shift();const n=d.bytes.length;
    if(n>=2&&d.bytes[n-2]===10&&d.bytes[n-1]===13){parse(d.bytes.slice(0,n-2));d.bytes=[];}};
  const bit=(d,b)=>{if(!d.bits.length){if(b===0)d.bits.push(0);return;}d.bits.push(b);
    if(d.bits.length===10){if(d.bits[9]===1){let v=0;for(let i=0;i<8;i++)v|=d.bits[1+i]<<i;byte(d,v);}else d.bytes=[];d.bits=[];}};
  // emit the bits of one run of the same level; a long quiet line (between packets) also ends any half byte
  const flush=()=>{if(run>=quiet)return;const n=Math.round(run/bitLen);for(let i=0;i<n;i++){bit(dec[0],lvl);bit(dec[1],1-lvl);}};
  const idle=()=>{for(let i=0;i<12;i++){bit(dec[0],lvl);bit(dec[1],1-lvl);}for(const d of dec)d.bits=[];};
  // sound inputs are AC coupled (the line drifts back to 0), so find the bit edges, not the level
  const k=Math.max(2,Math.round(bitLen/6)),hist=new Float32Array(k);let hi=0;
  return samples=>{for(let i=0;i<samples.length;i++){const s=samples[i],d=s-hist[hi];hist[hi]=s;hi=(hi+1)%k;
    const a=Math.abs(d);peak=a>peak?a:peak*0.9999;
    const thr=Math.max(peak*0.4,0.004);const nl=d>thr?1:d<-thr?0:lvl;
    if(nl!==lvl){flush();lvl=nl;run=0;}run++;if(run===quiet)idle();}};
}

function initSmart(){
  const $=id=>document.getElementById(id),T=window.TIMER;if(!T||!$('dvBar'))return;
  document.querySelectorAll('.dv-grp>.muted,#dvSync,#dvOff,#dvMic>.muted').forEach(el=>{el.textContent=L(el.textContent);});
  const clock=T.clock,panel=$('dvPanel'),msgEl=$('dvMsg'),info=$('dvInfo');
  let dev=null;          // {kind:'cube'|'timer'|'mat', name, off()}
  let cube=null,model=solved(),raf=0,inspT=0;
  const msg=(t,bad)=>{msgEl.textContent=t;msgEl.classList.toggle('bad',!!bad);};
  const setClock=(t,cls)=>{clock.textContent=t;clock.className='clock'+(cls?' '+cls:'');};
  const stopTick=()=>{cancelAnimationFrame(raf);clearInterval(inspT);raf=0;};
  const runTick=t0=>{stopTick();const f=()=>{clock.textContent=fmt(performance.now()-t0);raf=requestAnimationFrame(f);};f();};
  const bt=()=>{if(navigator.bluetooth)return true;
    msg(L('Bluetooth is not available in this browser. Use Chrome or Edge on Android, Windows, Mac or ChromeOS (on iPhone, the Bluefy browser).'),true);panel.hidden=false;return false;};
  const lib={};const load=async u=>lib[u]||(lib[u]=await import(u));
  // warm the libraries so the Bluetooth picker opens right on the first tap
  [['dvGan',SM_GAN],['dvGanT',SM_GAN],['dvOther',SM_CUBING]].forEach(([id,u])=>{const b=$(id);const w=()=>load(u).catch(()=>{delete lib[u];});
    b.addEventListener('pointerenter',w,{once:true});b.addEventListener('focus',w,{once:true});b.addEventListener('touchstart',w,{once:true,passive:true});});
  const lost=()=>navigator.userActivation&&!navigator.userActivation.isActive;

  const show=(kind,name)=>{panel.hidden=false;panel.dataset.kind=kind;$('dvName').textContent=name;info.textContent='';$('dvRes').replaceChildren();
    $('dvSync').hidden=kind!=='cube';$('dvScr').hidden=kind!=='cube';$('dv3d').hidden=kind!=='cube';$('dvMic').hidden=kind!=='mat';
    document.querySelectorAll('#dvBar button').forEach(b=>b.classList.remove('on'));};
  const disconnect=quiet=>{stopTick();if(dev){try{dev.off();}catch(e){}}dev=null;window.extTimer=false;setClock(clock.textContent);
    document.querySelectorAll('#dvBar button').forEach(b=>b.classList.remove('on'));if(!quiet){panel.hidden=true;}};
  const connected=(kind,name,off,btn)=>{dev={kind,name,off};window.extTimer=true;$(btn).classList.add('on');$('dvName').textContent=name;};
  $('dvOff').onclick=()=>disconnect();

  /* ===== smart cube ===== */
  let st='scr',tok=[],ti=0,part=0,fix=[],t0=0,moves=[],splits={},inspStart=0;
  const scrReset=()=>{tok=T.scr.textContent.trim().split(/\s+/).filter(Boolean);ti=0;part=0;fix=[];st='scr';drawScr();};
  const pushFix=(f,a)=>{const top=fix[fix.length-1];if(top&&top.f===f){top.a=(top.a+a)%4;if(!top.a)fix.pop();}else fix.push({f,a});};
  const drawScr=()=>{const el=$('dvScr');if(!dev||dev.kind!=='cube')return;
    if(st==='insp'||st==='solve'){el.innerHTML=`<span class="dv-go">${L(st==='insp'?'Inspection: your first turn starts the timer.':'Solving…')}</span>`;return;}
    const html=tok.map((t,i)=>{if(i<ti)return `<span class="done">${t}</span>`;
      if(i===ti){const need=(smMv(t).a-part+4)%4;return `<span class="cur">${part?smTxt(t[0],need):t}</span>`;}return `<span>${t}</span>`;}).join(' ');
    const undo=fix.length?`<div class="dv-fix">${L('Oops, undo:')} <b>${fix.slice().reverse().map(m=>smTxt(m.f,(4-m.a)%4)).join(' ')}</b></div>`:'';
    const warn=ti===0&&!part&&!fix.length&&!isSolved(model)?`<div class="dv-fix">${L('Solve the cube first (or tap “Mark as solved” if it already is).')}</div>`:'';
    el.innerHTML=`<div class="muted dv-lab">${L('Scramble on the smart cube (white top, green front):')}</div><div class="dv-tok">${html}</div>${undo}${warn}`;};
  new MutationObserver(()=>{if(st!=='solve')scrReset();}).observe(T.scr,{childList:true,characterData:true,subtree:true});
  const setModel=m=>{model=m;if(cube){cube.clear();cube.model=model;cube.sync(model);}drawScr();};
  const ensureCube=()=>{if(cube||!window.THREE||!window.Cube3D)return;try{cube=new Cube3D($('dv3d'),{speed:90,touch:'none'});cube.model=model;cube.sync(model);}catch(e){cube=null;}};
  const finish=now=>{const t=now-t0;stopTick();
    // join quarter turns of the same side (smart cubes send R2 as R R)
    const hm=[];for(const m of moves){const x=smMv(m),top=hm[hm.length-1];if(top&&top.f===x.f){top.a=(top.a+x.a)%4;if(!top.a)hm.pop();}else hm.push(x);}
    const n=hm.length,tps=moves.length/(t/1000);T.record(t);
    const sp=[['Cross',splits.cross],['F2L',splits.f2l],['OLL',splits.oll],['PLL',t]].filter(x=>x[1]!=null);
    $('dvRes').innerHTML=`<div class="dv-sum"><b>${fmt(t)}</b><span>${n} ${L('moves')}</span><span>${tps.toFixed(2)} ${L('TPS')}</span></div>`+
      `<div class="dv-splits">${sp.map(([k,v],i)=>`<span>${L(k)} <b>${fmt(v-(i?sp[i-1][1]:0))}</b></span>`).join('')}</div>`+
      `<details><summary>${L('Your moves')}</summary><p class="dv-moves">${hm.map(m=>smTxt(m.f,m.a)).join(' ')}</p></details>`;
    st='scr';scrReset();};
  const onMove=(mstr,now)=>{now=now||performance.now();const {f,a}=smMv(mstr);if(!'URFDLB'.includes(f))return;
    const site=parse(conjZ2(smTxt(f,a)).join(' '))[0];applyMove(model,site);if(cube){cube.model=model;cube.enqueue(site);}
    if(st==='scr'){
      if(fix.length)pushFix(f,a);
      else if(tok[ti]&&f===tok[ti][0]){part=(part+a)%4;if(part===smMv(tok[ti]).a){ti++;part=0;}}
      else if(tok[ti])pushFix(f,a);
      if(tok.length&&ti>=tok.length&&!fix.length){st='insp';inspStart=now;$('dvRes').replaceChildren();stopTick();
        const it=()=>{const s=(performance.now()-inspStart)/1000;setClock(s<15?String(Math.ceil(15-s)):s<17?'+2':'DNF','hold');};it();inspT=setInterval(it,100);}
      drawScr();return;}
    if(st==='insp'){st='solve';t0=now;moves=[];splits={};runTick(t0);drawScr();}
    if(st==='solve'){moves.push(smTxt(f,a));
      if(splits.cross==null&&smCross(model))splits.cross=now-t0;
      if(splits.f2l==null&&f2lDone(model)){splits.f2l=now-t0;if(splits.cross==null)splits.cross=splits.f2l;}
      if(splits.f2l!=null&&splits.oll==null&&topDone(model))splits.oll=now-t0;
      if(isSolved(model)){if(splits.f2l==null)splits.f2l=now-t0;if(splits.oll==null)splits.oll=now-t0;finish(now);}}
  };
  const cubeReady=(name,btn,off,onSync)=>{show('cube',name);connected('cube',name,off,btn);dev.sync=onSync;
    ensureCube();scrReset();setClock('0.00');msg(L('Connected. Turn a side: the 3D cube should follow. If it does not match, solve it and tap “Mark as solved”.'));};
  $('dvSync').onclick=()=>{if(dev&&dev.sync)dev.sync();setModel(solved());scrReset();msg(L('Synced: the cube is solved.'));};

  $('dvGan').onclick=async()=>{disconnect(true);if(!bt())return;show('cube','GAN');msg(L('Loading…'));
    try{const g=await load(SM_GAN);if(lost()){msg(L('Ready: tap the button again to choose your cube.'));return;}
      msg(L('Pick your cube in the Bluetooth window.'));
      const mac=async(d,fb)=>{const k='cfop-mac-'+((d&&d.name)||'');let v=null;try{v=localStorage.getItem(k);}catch(e){}
        if(v||!fb)return v;v=prompt(L('First time only: type your GAN cube’s MAC address (like AB:12:34:56:78:9A). It is on the box or in the GAN Cube app under cube info.'));
        if(v&&/^([0-9a-f]{2}[:-]){5}[0-9a-f]{2}$/i.test(v.trim())){v=v.trim().replace(/-/g,':').toUpperCase();try{localStorage.setItem(k,v);}catch(e){}return v;}return null;};
      const c=await g.connectGanCube(mac);let first=true;
      const sub=c.events$.subscribe(ev=>{
        if(ev.type==='MOVE')onMove(ev.move);
        else if(ev.type==='FACELETS'&&first){first=false;const m=smFromFacelets(ev.facelets);if(m){setModel(m);scrReset();}}
        else if(ev.type==='BATTERY')info.textContent='🔋 '+ev.batteryLevel+'%';
        else if(ev.type==='DISCONNECT'&&dev&&dev.kind==='cube'){disconnect(true);msg(L('The cube disconnected.'),true);}});
      cubeReady(c.deviceName||'GAN','dvGan',()=>{sub.unsubscribe();c.disconnect();},()=>c.sendCubeCommand({type:'REQUEST_RESET'}).catch(()=>{}));
      await c.sendCubeCommand({type:'REQUEST_FACELETS'});await c.sendCubeCommand({type:'REQUEST_BATTERY'});
    }catch(e){fail(e);}};
  $('dvOther').onclick=async()=>{disconnect(true);if(!bt())return;show('cube','QiYi / GoCube / GiiKER');msg(L('Loading…'));
    try{const cb=await load(SM_CUBING);if(lost()){msg(L('Ready: tap the button again to choose your cube.'));return;}
      msg(L('Pick your cube in the Bluetooth window.'));
      const p=await cb.connectSmartPuzzle();p.addAlgLeafListener(e=>onMove(e.latestAlgLeaf.toString()));
      let name='Smart cube';try{name=p.name()||name;}catch(e){}
      cubeReady(name,'dvOther',()=>p.disconnect(),null);setModel(solved());scrReset();
    }catch(e){fail(e);}};
  $('dvMoyu').onclick=()=>{disconnect(true);show('info','MoYu WeiLong AI');
    msg(L('MoYu AI cubes are not supported yet: the open Bluetooth libraries this site uses do not speak MoYu’s protocol, and it can’t be added safely without a real cube to test. For now, time with Space or a Stackmat.'));};
  const fail=e=>{const m=String(e&&e.message||e);disconnect(true);panel.hidden=false;
    msg(/cancel|chosen|User/i.test(m)?L('No device chosen.'):L('Could not connect: ')+m,true);};

  /* ===== GAN Smart Timer ===== */
  $('dvGanT').onclick=async()=>{disconnect(true);if(!bt())return;show('timer','GAN Smart Timer');msg(L('Loading…'));
    try{const g=await load(SM_GAN);if(lost()){msg(L('Ready: tap the button again to choose your timer.'));return;}
      msg(L('Pick your timer in the Bluetooth window.'));
      const c=await g.connectGanTimer(),S=g.GanTimerState;
      const sub=c.events$.subscribe(ev=>{switch(ev.state){
        case S.HANDS_ON:stopTick();setClock('0.00','hold');break;
        case S.GET_SET:setClock('0.00','ready');break;
        case S.HANDS_OFF:case S.IDLE:if(!raf)setClock(clock.textContent);break;
        case S.RUNNING:runTick(performance.now());break;
        case S.STOPPED:stopTick();if(ev.recordedTime)T.record(ev.recordedTime.asTimestamp);break;
        case S.DISCONNECT:if(dev&&dev.kind==='timer'){disconnect(true);msg(L('The timer disconnected.'),true);}break;}});
      show('timer','GAN Smart Timer');connected('timer','GAN Smart Timer',()=>{sub.unsubscribe();c.disconnect();},'dvGanT');
      msg(L('Connected. Put both hands on the timer, lift to start, touch it to stop: each solve is saved here.'));
    }catch(e){fail(e);}};

  /* ===== SpeedStacks / Stackmat over the audio cable ===== */
  const startMat=async devId=>{
    const stream=await navigator.mediaDevices.getUserMedia({audio:{deviceId:devId?{exact:devId}:undefined,echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
    const ctx=new (window.AudioContext||window.webkitAudioContext)(),src=ctx.createMediaStreamSource(stream),node=ctx.createScriptProcessor(2048,1,1);
    let last=-1,same=0,running=false,seen=0,lastPkt=0,shown='';
    const feed=stackmatDecoder(ctx.sampleRate,({status,ms})=>{lastPkt=performance.now();
      if(!seen++)msg(L('Timer signal found. Hands on the pads, lift to start, touch to stop: each solve is saved here.'));
      const cls=status==='A'||status==='C'?'ready':status==='L'||status==='R'?'hold':'';
      if(ms===0){running=false;setClock('0.00',cls);}
      else if(ms>last&&status!=='S'){running=true;same=0;setClock(fmt(ms));}
      else if(running&&(status==='S'||(ms===last&&++same>=4))){running=false;T.record(ms);}
      else if(!running&&ms!==last)setClock(fmt(ms),cls);
      last=ms;});
    node.onaudioprocess=e=>feed(e.inputBuffer.getChannelData(0));src.connect(node);node.connect(ctx.destination);
    const watch=setInterval(()=>{const s=seen&&performance.now()-lastPkt<1200?'ok':'none';if(s===shown)return;shown=s;
      if(s==='none')msg(L('No timer signal yet. Plug the timer’s data port into the mic / line-in (a 3.5 mm cable, or a USB sound adapter on phones) and switch the timer on.'),!!seen);
      else if(seen>1)msg(L('Timer signal found. Hands on the pads, lift to start, touch to stop: each solve is saved here.'));},500);
    return ()=>{clearInterval(watch);node.disconnect();src.disconnect();stream.getTracks().forEach(t=>t.stop());ctx.close();};
  };
  const mic=$('dvMicSel');
  const fillMics=async()=>{try{const ds=(await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==='audioinput');
    mic.replaceChildren(...ds.map((d,i)=>{const o=document.createElement('option');o.value=d.deviceId;o.textContent=d.label||(L('Input')+' '+(i+1));return o;}));}catch(e){}};
  const openMat=async devId=>{
    if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){show('mat','SpeedStacks / Stackmat');msg(L('This browser can’t read the audio input.'),true);return;}
    disconnect(true);show('mat','SpeedStacks / Stackmat');msg(L('Allow the microphone: the timer sends its time as sound through the cable.'));
    try{const off=await startMat(devId);connected('mat','SpeedStacks / Stackmat',off,'dvMat');await fillMics();if(devId)mic.value=devId;
      msg(L('No timer signal yet. Plug the timer’s data port into the mic / line-in (a 3.5 mm cable, or a USB sound adapter on phones) and switch the timer on.'));}
    catch(e){fail(e);}};
  $('dvMat').onclick=()=>openMat();
  // for testing without a cube: SMART.sim() then SMART.move("R'")
  window.SMART={sim:()=>{disconnect(true);cubeReady('Simulated cube','dvOther',()=>{},null);},move:m=>onMove(m)};
  mic.onchange=()=>openMat(mic.value);
}
initSmart();
