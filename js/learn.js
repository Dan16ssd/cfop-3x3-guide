/* Learning path with Coach Dann: chapter by chapter from the beginner method to sub-8.
   Steps: say (coach talks), q (question), do (do an alg on your cube), go (practice on another page), goal (timer checkpoint). */
const LEARN=[
 {t:'Meet the cube',goal:'Know the pieces and the moves',c:'#9ba6c7',ls:[
  {t:'The pieces',i:'🧩',s:[
   {say:"Hi, I'm Coach Dann! I'll take you from your very first solve all the way to sub-8. One small step at a time. Ready?"},
   {say:'A cube has 3 kinds of pieces: 6 centers with 1 color, 12 edges with 2 colors, and 8 corners with 3 colors.'},
   {say:'The centers never move against each other. White is always opposite yellow, green opposite blue, red opposite orange. So the center tells you the color of its face.'},
   {q:'How many colors does an edge piece have?',o:['1','2','3'],a:1,why:'Edges sit between two centers, so they have 2 colors.'},
   {q:'Which color is opposite white?',o:['Yellow','Green','Red'],a:0,why:'White and yellow are always opposite.'},
   {q:'A corner piece has how many colors?',o:['3','2','4'],a:0,why:'Corners touch 3 faces.'}]},
  {t:'Your first moves',i:'🔤',s:[
   {say:'Every face has a letter: R right, L left, U up, D down, F front, B back.'},
   {say:'A letter alone means: turn that face clockwise, as if you were looking straight at that face.'},
   {say:"A ' (prime) means counter-clockwise: R' is R backwards. A 2 means a half turn: R2."},
   {q:"What does U' mean?",o:['Turn the top face counter-clockwise','Turn the top face clockwise','Turn the top face twice'],a:0,why:"The ' means counter-clockwise."},
   {q:'R2 means…',o:['Turn the right face 180°','Turn R and L together','Turn R three times'],a:0,why:'2 = a half turn. Direction does not matter.'},
   {do:"Your first algorithm. Do it 6 times on a solved cube and it comes back solved. Cubers call it the sexy move.",alg:"R U R' U'"}]},
  {t:'Holding the cube',i:'✋',s:[
   {say:'x, y and z turn the whole cube. y turns it the same way as U.'},
   {say:'On this site we hold the cube with white on the bottom and green in front. Every picture uses this.'},
   {go:'Have a look at the notation page. It shows M, wide moves like r, and cube rotations.',to:'notation',b:'Open notation'},
   {q:'Which rotation turns the whole cube like U?',o:['y','x','z'],a:0,why:'y follows U, x follows R, z follows F.'}]}
 ]},
 {t:'Beginner method · part 1',goal:'Solve the first two layers',c:'#2fd27a',ls:[
  {t:'The daisy',i:'🌼',s:[
   {say:'Step 1 is the white cross. The easiest way to start is the daisy.'},
   {say:'Hold yellow on top. Bring the 4 white edges up around the yellow center, white facing up. If a spot is taken, turn U to move it aside first.'},
   {say:"Now turn U until one edge's side color matches the center below it. Then turn that face twice (for example F2). Do this for all 4 edges."},
   {say:'Flip the cube over: white is on the bottom and you have a white cross whose sides match the centers.'},
   {q:'With the daisy built, how do you send an edge down?',o:['Match its side color with the center, then turn that face twice','Do R U R\' U\'','Turn D twice'],a:0,why:'Matching first means the edge lands in the right place.'}]},
  {t:'White corners',i:'⬜',s:[
   {say:'Step 2: the white corners. Find a corner with white on it in the top layer.'},
   {say:'Turn U until it sits right above its home: between the two centers that match its colors. Hold that spot at the front-right.'},
   {do:"Now repeat this until the corner is solved. It takes 1, 3 or 5 times.",alg:"R U R' U'"},
   {say:"A white corner stuck in the bottom in the wrong place? Hold it at the front-right and do R U R' U' once. It comes up and you can try again."},
   {q:"How many times might R U R' U' be needed for one corner?",o:['1, 3 or 5','Always 6','Exactly 2'],a:0,why:'Each time the corner twists, so it takes an odd number.'}]},
  {t:'Middle layer',i:'🧱',s:[
   {say:'Step 3: the 4 edges of the middle layer. White stays on the bottom.'},
   {say:'Find an edge in the top layer with no yellow on it. Turn U until its front color matches the front center.'},
   {do:'If its top color matches the RIGHT center, it goes right:',alg:"U R U' R' U' F' U F"},
   {do:'If its top color matches the LEFT center, it goes left:',alg:"U' L' U L U F U' F'"},
   {say:'An edge stuck in the middle layer the wrong way round? Insert any top edge into its spot. That pushes it out to the top.'},
   {q:'The front color matches the front center and the top color matches the right center. Which one?',o:["U R U' R' U' F' U F","U' L' U L U F U' F'"],a:0,why:'The edge goes to the right, so you use the right-hand algorithm.'}]}
 ]},
 {t:'Beginner method · part 2',goal:'Your first full solve',c:'#ffd23f',ls:[
  {t:'Yellow cross',i:'➕',s:[
   {say:'Step 4: a yellow cross on top. Ignore the corners for now. One algorithm does everything.',dia:{alg:"F R U R' U' F'",m:'olle'}},
   {do:'Learn it:',alg:"F R U R' U' F'"},
   {say:'Only a yellow dot? Do it once and you get an L.'},
   {say:'An L? Turn U so its two yellow edges point to the back and the left. Do the algorithm: you get a line.'},
   {say:'A line? Hold it horizontally (left to right) and do the algorithm once more. Cross done!'},
   {q:'You see a vertical yellow line (front to back). What first?',o:['Turn U once so it is horizontal','Do the algorithm right away','Do it twice'],a:0,why:'The line must go left to right, then one algorithm makes the cross.'}]},
  {t:'Yellow face',i:'🟨',s:[
   {say:'Step 5: make the whole top yellow with the Sune.',dia:{alg:"R U R' U R U2 R'",m:'oll'}},
   {do:'The Sune:',alg:"R U R' U R U2 R'"},
   {say:'Exactly 1 yellow corner on top: hold it at the front-left and do the Sune. Not done yet? Hold the yellow corner at the front-left again and repeat.'},
   {say:'No yellow corners on top: turn U until the front-left corner has its yellow facing LEFT. Then do the Sune.'},
   {say:'2 yellow corners on top: turn U until the front-left corner has its yellow facing YOU (the front). Then do the Sune.'},
   {q:'One yellow corner is on top. Where do you hold it?',o:['Front-left','Front-right','Back-right'],a:0,why:'Sune solves the one-corner case with that corner at the front-left.'}]},
  {t:'Yellow corners',i:'🔄',s:[
   {say:'Step 6: put the yellow corners in their places. Look at the sides for headlights: two matching colors on the two corners of one side.'},
   {say:'Headlights on one side: hold them on the LEFT and do the T-perm.',dia:{alg:"R U R' U' R' F R2 U' R' U' R U R' F'",m:'pllc',ar:'corners'}},
   {do:'T-perm:',alg:"R U R' U' R' F R2 U' R' U' R U R' F'"},
   {say:'No headlights anywhere: do the Y-perm from any angle.',dia:{alg:"F R U' R' U' R U R' F' R U R' U' R' F R F'",m:'pllc',ar:'corners'}},
   {do:'Y-perm:',alg:"F R U' R' U' R U R' F' R U R' U' R' F R F'"},
   {q:'Where do you hold the headlights for the T-perm?',o:['On the left','On the right','In front'],a:0,why:'The T-perm swaps the two right corners, so the solved headlights go on the left.'}]},
  {t:'Yellow edges',i:'🏁',s:[
   {say:'Last step! Move the yellow edges home. If one side is fully solved, hold it at the back.',dia:{alg:"R U' R U R U R U' R' U' R2",m:'pll',ar:'all'}},
   {do:'Ua-perm. If the edges cycle the wrong way, do it again or use Ub.',alg:"R U' R U R U R U' R' U' R2"},
   {do:'Ub-perm, the other direction:',alg:"R2 U R U R' U' R' U' R' U R'"},
   {say:'No solved side? Opposite edges swapped both ways is the H-perm. Neighbors swapped in pairs is the Z-perm. Both are on the PLL page.'},
   {go:'The PLL page shows all of these with arrows and a 3D view.',to:'pll',b:'Open PLL'},
   {q:'With the Ua-perm, where is the solved side?',o:['At the back','At the front','On the right'],a:0,why:'The other three edges cycle while the back stays solved.'}]},
  {t:'Your first solve!',i:'🏆',ck:1,s:[
   {say:'You know a whole method now. Scramble your cube and solve it from start to finish. Use the guide whenever you need it.'},
   {goal:'Do one full solve on the timer. Any time counts!',ms:Infinity,n:1}]}
 ]},
 {t:'Sub-2:00',goal:'Cross on the bottom, no daisy',c:'#ff9a4d',ls:[
  {t:'Cross without the daisy',i:'✚',s:[
   {say:'The daisy wastes moves. Now build the white cross straight on the bottom.'},
   {say:'Find a white edge. Think about where it must go, then bring it down in 1 to 3 moves without breaking the edges already placed.'},
   {go:'The cross page explains the ideas with examples.',to:'cross',b:'Open cross'},
   {q:'Where should the cross be while you solve the rest?',o:['On the bottom','On top','On the left'],a:0,why:'With the cross on the bottom you can see the pieces for the next steps.'}]},
  {t:'Inspection',i:'👀',s:[
   {say:'In competitions you get 15 seconds to look before you start. Use them to plan the whole cross.'},
   {go:'Train it: the trainer gives a scramble, you plan the cross and compare with the best solution.',to:'xtrainer',b:'Open trainer'},
   {say:'Good crosses take 8 moves or fewer. Aim for that.'}]},
  {t:'Checkpoint: sub-2:00',i:'🏁',ck:1,s:[
   {say:'Time to show your progress!'},
   {goal:'Get an average of 5 under 2:00.',ms:120000,n:5}]}
 ]},
 {t:'Sub-1:00',goal:'Intuitive F2L',c:'#2fd27a',ls:[
  {t:'What is F2L?',i:'🤝',s:[
   {say:'F2L means First Two Layers. You pair a white corner with its middle edge, then insert them together. This replaces steps 2 and 3 of the beginner method.'},
   {say:'It is the biggest speed jump you will make. Fewer moves, and no algorithms to memorize: you learn to understand it.'},
   {q:'In F2L you insert…',o:['A corner and its edge together','Only corners','Only edges'],a:0,why:'One pair at a time, four pairs in total.'}]},
  {t:'Basic inserts',i:'➡️',s:[
   {say:'When the pair is already joined in the top layer, it goes in with 3 moves.',dia:{alg:"R U R'",m:'f2l'}},
   {do:'Insert a pair from the top:',alg:"R U R'"},
   {do:'And the other way:',alg:"R U' R'"},
   {say:'Most cases are: split or join the pair with a few moves, then use one of these inserts.'}]},
  {t:'The cases',i:'📚',s:[
   {go:'The F2L page shows every basic case with a picture and its solution. Learn a few each day and tick them as Learned.',to:'f2l',b:'Open F2L'},
   {say:'Try to solve each case on your cube before you look at the solution. Understanding beats memorizing.'}]},
  {t:'Checkpoint: sub-1:00',i:'🏁',ck:1,s:[
   {goal:'Get an average of 5 under 1:00.',ms:60000,n:5}]}
 ]},
 {t:'Sub-45',goal:'2-look last layer',c:'#ffd23f',ls:[
  {t:'2-look OLL',i:'🟡',s:[
   {say:'You already know the yellow cross and the Sune. 2-look OLL adds a faster algorithm for each case.'},
   {say:'Look 1 has 3 cases for the edges. Look 2 has 7 cases for the corners.',dia:{alg:"R U2 R' U' R U' R'",m:'oll'}},
   {go:'Learn the 10 algorithms on the OLL page.',to:'oll',b:'Open OLL'},
   {q:'The Antisune is the mirror of…',o:['The Sune','The T-perm','The sexy move'],a:0,why:'Antisune does the Sune backwards: R U2 R\' U\' R U\' R\'.'}]},
  {t:'2-look PLL',i:'🔁',s:[
   {say:'You know T, Y, Ua and Ub already. Add the H-perm and Z-perm and you have 2-look PLL.'},
   {go:'Practise them on the PLL page.',to:'pll',b:'Open PLL'}]},
  {t:'Know them at a glance',i:'⚡',s:[
   {say:'Knowing an algorithm is half the job. You must recognize the case in under a second.'},
   {q:'Which case is this?',dia:{alg:"R U R' U R U2 R'",m:'oll'},o:['Sune','Antisune','Pi'],a:0,why:'One yellow corner on top, at the front-left: Sune.'},
   {go:'Use the recognition trainer with 2-look OLL and 2-look PLL until every case shows as known.',to:'recog',b:'Open trainer'}]},
  {t:'Checkpoint: sub-45',i:'🏁',ck:1,s:[
   {goal:'Get an average of 5 under 45 seconds.',ms:45000,n:5}]}
 ]},
 {t:'Sub-30',goal:'Finger tricks and look-ahead',c:'#ff9a4d',ls:[
  {t:'Finger tricks',i:'👆',s:[
   {say:'Stop turning with your whole hand. Turn U with your right index finger, U\' with your left index finger, and R with your wrist.'},
   {go:'The finger tricks page has 3D hands for every move.',to:'fingertricks',b:'Open finger tricks'},
   {q:'Which finger usually does U?',o:['Right index finger','Right thumb','Left pinky'],a:0,why:'The right index pushes the top layer to the left.'}]},
  {t:'Drills and rhythm',i:'🥁',s:[
   {say:'Drill the common triggers until they are automatic. Use the metronome: one move per beat.'},
   {go:'Do the drills with the drill timer and the BPM metronome.',to:'drills',b:'Open drills'}]},
  {t:'Look-ahead',i:'🔭',s:[
   {say:'The secret of fast cubers: they do not turn faster, they stop less. While you solve one pair, look for the next one.'},
   {say:'Do 5 solves at half speed without ever stopping. Slow and smooth beats fast and jerky.'},
   {q:'What makes you faster at this level?',o:['Fewer pauses','Turning as fast as possible','More algorithms'],a:0,why:'Pauses cost the most time.'}]},
  {t:'Checkpoint: sub-30',i:'🏁',ck:1,s:[
   {goal:'Get an average of 5 under 30 seconds.',ms:30000,n:5}]}
 ]},
 {t:'Sub-20',goal:'Full PLL and the X-cross',c:'#8b5cf6',ls:[
  {t:'Full PLL',i:'🧠',s:[
   {say:'Full PLL solves the whole permutation in one look: 21 algorithms. You know 6 already.'},
   {say:'Learn them in groups: corners only (A, E), adjacent swaps (T, F, J, R), diagonal swaps (V, Y, N), then the 4 G-perms.'},
   {go:'Open Full PLL. Each case has a 3D view you can turn.',to:'fullpll',b:'Open Full PLL'}]},
  {t:'PLL recognition',i:'⚡',s:[
   {say:'Recognize PLLs by looking at only two sides: headlights, blocks and colors that match.'},
   {go:'In the recognition trainer, pick Full PLL. Get all 21 to known.',to:'recog',b:'Open trainer'}]},
  {t:'Cross + first pair',i:'✖️',s:[
   {say:'In inspection, plan the cross AND your first pair. This is called an X-cross.'},
   {go:'Follow the training path in the X-cross trainer, steps 1 to 3.',to:'xtrainer',b:'Open trainer'}]},
  {t:'Checkpoint: sub-20',i:'🏁',ck:1,s:[
   {goal:'Get an average of 5 under 20 seconds.',ms:20000,n:5}]}
 ]},
 {t:'Sub-15',goal:'Full OLL and advanced F2L',c:'#4d7cff',ls:[
  {t:'Full OLL',i:'📖',s:[
   {say:'Full OLL has 57 cases. Learn the easy ones first, a few per day, and keep 2-look as a backup.'},
   {go:'Open Full OLL. Cases are grouped by shape so they are easier to learn.',to:'fulloll',b:'Open Full OLL'},
   {go:'Then drill recognition with Full OLL in the trainer.',to:'recog',b:'Open trainer'}]},
  {t:'Advanced F2L',i:'🎯',s:[
   {say:'Learn better solutions for every F2L case in every slot. No rotations, fewer moves.'},
   {go:'Open Advanced F2L. Pick your colors and slot.',to:'af2l',b:'Open Advanced F2L'},
   {go:'Then train back slots, keyhole and pseudo-slotting in the trainer path, steps 4 to 8.',to:'xtrainer',b:'Open trainer'}]},
  {t:'Checkpoint: sub-15',i:'🏁',ck:1,s:[
   {goal:'Get an average of 5 under 15 seconds.',ms:15000,n:5}]}
 ]},
 {t:'Sub-12',goal:'COLL and pro training',c:'#c8102e',ls:[
  {t:'COLL',i:'🌀',s:[
   {say:'When the yellow cross is already done, COLL orients and places the corners in one go. Then only an edge PLL is left.'},
   {go:'Open COLL and start with the Sune and Antisune sets.',to:'coll',b:'Open COLL'}]},
  {t:'Train like a pro',i:'💪',s:[
   {say:'Top cubers plan their practice: drills, slow solves, film and review.'},
   {go:'Read the Yiheng Wang training plan and follow its daily routine.',to:'yiheng',b:'Open training plan'}]},
  {t:'XX-cross',i:'✖️',s:[
   {go:'Finish the X-cross trainer path up to the XX-cross.',to:'xtrainer',b:'Open trainer'}]},
  {t:'Checkpoint: sub-12',i:'🏁',ck:1,s:[
   {goal:'Get an average of 5 under 12 seconds.',ms:12000,n:5}]}
 ]},
 {t:'Sub-10',goal:'Edge control and ZBLL',c:'#8b5cf6',ls:[
  {t:'Edge control',i:'🎛️',s:[
   {say:'While inserting your last pair, orient the yellow edges at the same time. Then you always get a ZBLL case.'},
   {go:'Train edge control in the trainer.',to:'xtrainer',b:'Open trainer'}]},
  {t:'First ZBLL sets',i:'🗂️',s:[
   {say:'ZBLL solves the whole last layer in one algorithm. Nobody learns 493 cases at once: start with the T and U sets.'},
   {go:'Open ZBLL and start with the T set.',to:'zbll',b:'Open ZBLL'}]},
  {t:'Checkpoint: sub-10',i:'🏁',ck:1,s:[
   {goal:'Get an average of 5 under 10 seconds.',ms:10000,n:5}]}
 ]},
 {t:'Sub-8',goal:'The final boss',c:'#ffd23f',ls:[
  {t:'More ZBLL',i:'📈',s:[
   {say:'Add ZBLL sets one by one: L, then Pi, H, Sune, Antisune. Review old sets every week so you do not forget them.'},
   {go:'Keep learning in ZBLL.',to:'zbll',b:'Open ZBLL'}]},
  {t:'Race your friends',i:'⚔️',s:[
   {say:'Racing makes you fast under pressure. Challenge a friend on the same scramble!'},
   {go:'Open Vs friend.',to:'versus',b:'Open Vs friend'}]},
  {t:'Checkpoint: sub-8',i:'👑',ck:1,s:[
   {goal:'Get an average of 5 under 8 seconds. Legend!',ms:8000,n:5}]}
 ]}
];

/* Coach Dann: a cube with a face, a sweatband and little arms */
function coachSVG(mood){
  const P=(u,v)=>[22+70*u+16*v,44-14*v],R=(v,w)=>[92+16*v,44-14*v+68*w],F=(u,w)=>[22+70*u,44+68*w];
  const poly=(pts,fill)=>`<polygon points="${pts.map(p=>p.map(n=>n.toFixed(1)).join(',')).join(' ')}" fill="${fill}"/>`;
  const quad=(f,a,b,c,d,col)=>{const g=.05;return poly([f(a+g,c+g),f(b-g,c+g),f(b-g,d-g),f(a+g,d-g)],col);};
  let s='<ellipse cx="62" cy="126" rx="36" ry="5" fill="rgba(0,0,0,.28)"/>';
  // legs
  s+='<rect x="38" y="110" width="9" height="12" rx="3" fill="#1f2937"/><rect x="66" y="110" width="9" height="12" rx="3" fill="#1f2937"/><ellipse cx="42" cy="122" rx="8" ry="4" fill="#ff6a00"/><ellipse cx="72" cy="122" rx="8" ry="4" fill="#ff6a00"/>';
  // arms (behind the body edges)
  const arm={idle:[[24,82,10,100],[100,84,114,100]],talk:[[24,82,10,100],[100,80,118,62]],cheer:[[24,78,6,48],[100,76,118,46]],think:[[24,82,10,100],[100,82,82,94]]}[mood]||[[24,82,10,100],[100,84,114,100]];
  for(const[a,b,c,d]of arm)s+=`<path d="M${a} ${b} L${c} ${d}" stroke="#111827" stroke-width="8" stroke-linecap="round"/><path d="M${a} ${b} L${c} ${d}" stroke="#cbd5e1" stroke-width="4.5" stroke-linecap="round"/><circle cx="${c}" cy="${d}" r="6.5" fill="#fff" stroke="#111827" stroke-width="2"/>`;
  // body
  s+=poly([P(0,0),P(1,0),P(1,1),P(0,1)],'#111827')+poly([R(0,0),R(1,0),R(1,1),R(0,1)],'#0b1220')+poly([F(0,0),F(1,0),F(1,1),F(0,1)],'#111827');
  for(let i=0;i<3;i++)for(let j=0;j<3;j++){s+=quad(P,i/3,(i+1)/3,j/3,(j+1)/3,'#ffd500');s+=quad(R,i/3,(i+1)/3,j/3,(j+1)/3,'#ff6a00');s+=quad(F,i/3,(i+1)/3,j/3,(j+1)/3,'#009b48');}
  // sweatband with name
  s+='<rect x="21" y="50" width="72" height="12" fill="#fff"/><rect x="21" y="54.5" width="72" height="3" fill="#c8102e"/><path d="M92 50 L108 36 L108 48 L92 62Z" fill="#e5e7eb"/>';
  // face
  const look={think:[2,-2],cheer:[0,-1]}[mood]||[0,0];
  s+=`<ellipse cx="45" cy="75" rx="8" ry="9" fill="#fff"/><ellipse cx="69" cy="75" rx="8" ry="9" fill="#fff"/><circle cx="${46+look[0]}" cy="${76+look[1]}" r="4" fill="#111"/><circle cx="${70+look[0]}" cy="${76+look[1]}" r="4" fill="#111"/><circle cx="${47+look[0]}" cy="${74.5+look[1]}" r="1.3" fill="#fff"/><circle cx="${71+look[0]}" cy="${74.5+look[1]}" r="1.3" fill="#fff"/>`;
  s+='<circle cx="34" cy="88" r="4" fill="#ff8fa3" opacity=".7"/><circle cx="80" cy="88" r="4" fill="#ff8fa3" opacity=".7"/>';
  s+=mood==='cheer'?'<path d="M47 89 Q57 103 67 89 Z" fill="#111"/><path d="M51 95 Q57 99 63 95" stroke="#ff5a7a" stroke-width="3" fill="none"/>'
    :mood==='talk'?'<ellipse cx="57" cy="93" rx="6" ry="4.5" fill="#111"/>'
    :mood==='think'?'<path d="M50 94 L64 92" stroke="#111" stroke-width="3" stroke-linecap="round"/>'
    :'<path d="M47 90 Q57 99 67 90" stroke="#111" stroke-width="3.2" fill="none" stroke-linecap="round"/>';
  return `<svg class="coach" viewBox="0 0 124 132" role="img" aria-label="Coach Dann">${s}</svg>`;
}

function initLearn(){
  const page=document.getElementById('learn');if(!page)return;
  const top=document.getElementById('lnTop'),path=document.getElementById('lnPath'),dlg=document.getElementById('lnDlg');
  let st={done:{},days:[]};try{Object.assign(st,JSON.parse(localStorage.getItem('cfop-learn'))||{});}catch(e){}
  const save=()=>{try{localStorage.setItem('cfop-learn',JSON.stringify(st));}catch(e){}};
  const id=(c,l)=>c+'-'+l;
  const flat=[];LEARN.forEach((ch,c)=>ch.ls.forEach((ls,l)=>flat.push([c,l])));
  const firstOpen=()=>flat.findIndex(([c,l])=>!(id(c,l) in st.done));
  const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
  const streak=()=>{const set=new Set(st.days);let n=0;const d=new Date();if(!set.has(today()))d.setDate(d.getDate()-1);
    for(;;){const k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');if(!set.has(k))break;n++;d.setDate(d.getDate()-1);}return n;};
  const xp=()=>Object.values(st.done).reduce((a,b)=>a+b,0);
  const OFF=[0,48,72,48,0,-48,-72,-48];
  const fmtT=ms=>ms>=60000?Math.floor(ms/60000)+':'+((ms%60000)/1000).toFixed(2).padStart(5,'0'):fmt(ms);
  let resume=null;

  function drawTop(){const n=Object.keys(st.done).length;
    top.innerHTML=`<span class="ln-stat" title="${L('XP')}">⚡ <b>${xp()}</b> ${L('XP')}</span><span class="ln-stat">🔥 <b>${streak()}</b> ${L('day streak')}</span><span class="ln-stat">✅ <b>${n}/${flat.length}</b> ${L('lessons')}</span><div class="ln-prog"><i style="width:${n/flat.length*100}%"></i></div>`;}
  function drawPath(){
    const cur=firstOpen();path.replaceChildren();
    LEARN.forEach((ch,c)=>{
      const sec=document.createElement('div');sec.className='ln-ch';sec.style.setProperty('--cc',ch.c);
      const doneN=ch.ls.filter((_,l)=>id(c,l) in st.done).length,startIdx=flat.findIndex(x=>x[0]===c),locked=cur!==-1&&startIdx>cur;
      sec.innerHTML=`<div class="ln-ban"><div><small>${Lt('chapter',c+1)} · ${doneN}/${ch.ls.length}</small><b>${L(ch.t)}</b><span>${L(ch.goal)}</span></div>${locked?`<button type="button" class="sm ln-jump">${L('Jump here')}</button>`:doneN===ch.ls.length?'<span class="ln-crown">👑</span>':''}</div><div class="ln-nodes"></div>`;
      const nodes=sec.querySelector('.ln-nodes');
      ch.ls.forEach((ls,l)=>{const k=flat.findIndex(x=>x[0]===c&&x[1]===l),done=id(c,l) in st.done,isCur=k===cur,lock=!done&&!isCur;
        const row=document.createElement('div');row.className='ln-row';row.style.setProperty('--off',OFF[k%OFF.length]+'px');
        const b=document.createElement('button');b.type='button';b.className='ln-node'+(done?' done':'')+(isCur?' cur':'')+(lock?' lock':'')+(ls.ck?' ck':'');
        b.innerHTML=`<span class="ln-ic">${done?'✓':lock?'🔒':ls.i}</span>`;b.title=L(ls.t);b.setAttribute('aria-label',L(ls.t)+(done?' ✓':lock?' 🔒':''));
        b.onclick=()=>{if(lock){bubble(row,L('Finish the lessons before this one first, or use Jump here on its chapter.'));return;}openLesson(c,l,0);};
        row.appendChild(b);row.insertAdjacentHTML('beforeend',`<span class="ln-lab">${L(ls.t)}</span>`);
        if(isCur){row.insertAdjacentHTML('afterbegin',`<span class="ln-start">${resume&&resume.c===c&&resume.l===l?L('Continue'):L('Start')}</span>`);
          const co=document.createElement('div');co.className='ln-coachside'+(OFF[k%OFF.length]>0?' left':'');co.innerHTML=coachSVG('talk')+`<div class="ln-say">${c===0&&l===0?L("Hi! I'm Coach Dann. Tap the glowing circle to start."):Lt('lnCoach',L(ch.goal))}</div>`;row.appendChild(co);}
        nodes.appendChild(row);});
      const jb=sec.querySelector('.ln-jump');
      if(jb){let armed=0;jb.onclick=()=>{if(Date.now()-armed>3500){armed=Date.now();jb.textContent=L('Skip all lessons before this? Click again');setTimeout(()=>{jb.textContent=L('Jump here');},3500);return;}
        flat.forEach(([c2,l2])=>{if(c2<c&&!(id(c2,l2) in st.done))st.done[id(c2,l2)]=0;});save();drawTop();drawPath();
        setTimeout(()=>sec.scrollIntoView({block:'start',behavior:'smooth'}),50);};}
      path.appendChild(sec);});
    if(cur===-1)path.insertAdjacentHTML('beforeend',`<div class="ln-end">${coachSVG('cheer')}<p><b>${L('You finished the whole path. You are a legend!')}</b></p></div>`);
  }
  function bubble(row,txt){const o=row.querySelector('.ln-tip');if(o)o.remove();row.insertAdjacentHTML('beforeend',`<span class="ln-tip">${txt}</span>`);setTimeout(()=>{const t=row.querySelector('.ln-tip');if(t)t.remove();},2600);}

  /* ---------- lesson player ---------- */
  let L_=null;
  const dia=d=>{const s=caseOf(d.alg);return d.m==='f2l'?isoDiagram(s,f2lMask):llDiagram(s,d.m,d.ar);};
  function openLesson(c,l,step){resume=null;L_={c,l,step,mist:0,ls:LEARN[c].ls[l]};
    dlg.innerHTML=`<div class="ln-dh"><button type="button" class="ln-x" aria-label="${L('Close')}">✕</button><div class="ln-bar"><i></i></div></div><div class="ln-body"><div class="ln-co"></div><div class="ln-bub"></div></div><div class="ln-extra"></div><div class="ln-foot"><div class="ln-fb" aria-live="polite"></div><div class="ln-btns"></div></div>`;
    dlg.querySelector('.ln-x').onclick=()=>dlg.close();
    if(!dlg.open)dlg.showModal();render();}
  const btn=(t,cls,fn)=>{const b=document.createElement('button');b.type='button';b.className=cls||'';b.textContent=t;b.onclick=fn;return b;};
  function render(){
    const {ls,step}=L_,sp=ls.s[step],bub=dlg.querySelector('.ln-bub'),ex=dlg.querySelector('.ln-extra'),fb=dlg.querySelector('.ln-fb'),bt=dlg.querySelector('.ln-btns'),co=dlg.querySelector('.ln-co');
    dlg.querySelector('.ln-bar i').style.width=(step/ls.s.length*100)+'%';
    fb.className='ln-fb';fb.innerHTML='';bt.replaceChildren();ex.replaceChildren();
    co.innerHTML=coachSVG(sp.q?'think':'talk');
    const text=sp.say||sp.q||sp.do||sp.go||sp.goal;bub.innerHTML=`<small>${L(ls.t)}</small>${L(text)}`;
    if(sp.dia){const d=document.createElement('div');d.className='ln-dia';d.appendChild(dia(sp.dia));ex.appendChild(d);}
    const cont=btn(L('Continue'),'primary ln-go',next);
    if(sp.say){bt.appendChild(cont);}
    else if(sp.do){ex.insertAdjacentHTML('beforeend',`<code class="ln-alg">${sp.alg}</code>`);const m=memo(sp.alg);if(m.cover>0)ex.insertAdjacentHTML('beforeend',`<div class="mem">${m.html}</div>`);
      ex.appendChild(btn('▶ '+L('Watch it in 3D'),'sm',()=>{resume={c:L_.c,l:L_.l,step:L_.step};dlg.close();loadCase(sp.alg,L(ls.t));}));
      cont.textContent=L('I did it')+' ✓';bt.appendChild(cont);}
    else if(sp.go){ex.appendChild(btn(L(sp.b)+' →','ln-open',()=>{resume={c:L_.c,l:L_.l,step:L_.step};dlg.close();go(sp.to);}));
      ex.insertAdjacentHTML('beforeend',`<p class="muted">${L('Come back here when you are done. Your lesson waits for you.')}</p>`);cont.textContent=L('Done')+' ✓';bt.appendChild(cont);}
    else if(sp.q){let pick=-1;const box=document.createElement('div');box.className='ln-opts';
      const order=sp.o.map((_,i)=>i).sort(()=>Math.random()-.5);
      order.forEach((oi,k)=>{const b=btn('','ln-opt',()=>{if(b.disabled)return;pick=oi;box.querySelectorAll('.ln-opt').forEach(x=>x.classList.remove('sel'));b.classList.add('sel');chk.disabled=false;});b.innerHTML=`<kbd>${k+1}</kbd> ${L(sp.o[oi])}`;b.dataset.i=oi;box.appendChild(b);});
      ex.appendChild(box);
      const chk=btn(L('Check'),'primary ln-go',()=>{if(pick<0)return;
        if(pick===sp.a){box.querySelectorAll('.ln-opt').forEach(x=>{x.disabled=true;if(+x.dataset.i===sp.a)x.classList.add('ok');});
          fb.className='ln-fb ok';fb.innerHTML=`<b>${L(['Nice!','Correct!','Great job!','Exactly!'][Math.floor(Math.random()*4)])}</b> ${sp.why?L(sp.why):''}`;co.innerHTML=coachSVG('cheer');bt.replaceChildren(cont);cont.focus();}
        else{L_.mist++;const w=box.querySelector('.ln-opt.sel');w.classList.remove('sel');w.classList.add('bad');w.disabled=true;pick=-1;chk.disabled=true;
          fb.className='ln-fb bad';fb.innerHTML=`<b>${L('Not quite. Try again!')}</b>`;co.innerHTML=coachSVG('think');}});
      chk.disabled=true;bt.appendChild(chk);}
    else if(sp.goal){const n=times.length,need=sp.n||5,v=need===1?(n?times[n-1]:null):aoN(need);const ok=v!=null&&v<sp.ms;
      ex.insertAdjacentHTML('beforeend',`<div class="ln-goal"><span>${need===1?L('Your last solve'):L('Your current ao5')}</span><b>${v==null?'–':fmtT(v)}</b>${sp.ms!==Infinity?`<small>${Lt('lnNeed',fmtT(sp.ms))}</small>`:''}</div>`);
      if(ok){fb.className='ln-fb ok';fb.innerHTML=`<b>${L('Goal reached!')}</b>`;co.innerHTML=coachSVG('cheer');bt.appendChild(cont);}
      else{fb.innerHTML=v==null?Lt('lnDo',need):L('Not yet. Keep practising, you are getting closer!');
        ex.appendChild(btn('⏱ '+L('Open timer'),'ln-open',()=>{resume={c:L_.c,l:L_.l,step:L_.step};dlg.close();go('timer');}));
        const honest=btn(L('I reached it on another timer'),'sm',next);bt.append(honest,btn(L('Later'),'',()=>dlg.close()));}}
  }
  function next(){L_.step++;if(L_.step<L_.ls.s.length){render();return;}finish();}
  function finish(){const k=id(L_.c,L_.l),first=!(k in st.done)||st.done[k]===0,gain=first?(10+(L_.mist===0?5:0)):0;
    if(first)st.done[k]=gain;const t=today();if(!st.days.includes(t))st.days.push(t);st.days=st.days.slice(-400);save();
    const nx=flat[firstOpen()];
    dlg.querySelector('.ln-bar i').style.width='100%';
    dlg.querySelector('.ln-co').innerHTML=coachSVG('cheer');
    dlg.querySelector('.ln-bub').innerHTML=`<small>${L(L_.ls.t)}</small><b>${L('Lesson complete!')}</b> ${L_.mist===0?L('Perfect, no mistakes!'):''}`;
    const ex=dlg.querySelector('.ln-extra');ex.innerHTML=`<div class="ln-win"><span>⚡ +${gain} ${L('XP')}</span><span>🔥 ${streak()} ${L('day streak')}</span></div>`;
    const fb=dlg.querySelector('.ln-fb');fb.className='ln-fb';fb.innerHTML='';
    const bt=dlg.querySelector('.ln-btns');bt.replaceChildren();
    if(nx)bt.appendChild(btn(L('Next lesson')+' ▶','primary ln-go',()=>openLesson(nx[0],nx[1],0)));
    bt.appendChild(btn(L('Back to the path'),nx?'':'primary',()=>dlg.close()));
    drawTop();drawPath();}
  dlg.addEventListener('close',()=>{drawTop();drawPath();const c=path.querySelector('.ln-node.cur');if(c&&!page.hidden)c.scrollIntoView({block:'center'});});
  dlg.addEventListener('keydown',e=>{if(!dlg.open)return;
    if(/^[1-4]$/.test(e.key)){const o=dlg.querySelectorAll('.ln-opt')[+e.key-1];if(o){e.preventDefault();o.click();}}
    else if(e.key==='Enter'&&!(e.target.tagName==='BUTTON'&&!e.target.classList.contains('ln-opt'))){const g=dlg.querySelector('.ln-go');if(g&&!g.disabled){e.preventDefault();g.click();}}});
  addEventListener('hashchange',()=>{if(location.hash==='#learn'&&resume){const r=resume;setTimeout(()=>openLesson(r.c,r.l,r.step),60);}});
  page.querySelector('.ln-reset').onclick=(()=>{let armed=0;return e=>{const b=e.target;if(Date.now()-armed>3500){armed=Date.now();b.textContent=L('Click again to erase your progress');setTimeout(()=>{b.textContent=L('Reset path');},3500);return;}
    st={done:{},days:[]};save();b.textContent=L('Reset path');drawTop();drawPath();};})();
  drawTop();drawPath();
  addEventListener('hashchange',()=>{if(location.hash==='#learn'){drawTop();drawPath();}});
}
initLearn();
