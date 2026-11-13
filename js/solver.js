/* CFOP F2L solver: cross / X-cross / XX-cross + one pair at a time, white on the bottom.
   Pieces are tracked as (position, direction of a reference sticker), 24 states each.
   Runs in a Web Worker (or Node for testing). Face moves only: R L U D F B. */
(function (root) {
  const FACES = { R: [0, 1], L: [0, -1], U: [1, 1], D: [1, -1], F: [2, 1], B: [2, -1] };
  const FN = ['R', 'L', 'U', 'D', 'F', 'B'];
  const MV = [];
  FN.forEach(f => [1, 2, -1].forEach(k => MV.push({ f, k, t: f + (k === 2 ? '2' : k === -1 ? "'" : '') })));
  const AXIS = f => FACES[f][0];

  function rot(v, axis, sgn) { // sgn=-1: -90deg about +axis
    const [x, y, z] = v;
    if (axis === 0) return sgn < 0 ? [x, z, -y] : [x, -z, y];
    if (axis === 1) return sgn < 0 ? [-z, y, x] : [z, y, -x];
    return sgn < 0 ? [y, -x, z] : [-y, x, z];
  }
  function turn(v, f) { // quarter turn clockwise of face f, for a vector on that layer
    const [a, s] = FACES[f];
    return rot(v, a, -s);
  }

  // enumerate piece states
  const EDGES = [], CORNERS = [];
  for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
    const p = [x, y, z], nz = p.filter(c => c !== 0).length;
    const ns = [];
    p.forEach((c, i) => { if (c) { const n = [0, 0, 0]; n[i] = c; ns.push(n); } });
    if (nz === 2) ns.forEach(n => EDGES.push([p, n]));
    if (nz === 3) ns.forEach(n => CORNERS.push([p, n]));
  }
  const key = (p, n) => p.join(',') + '|' + n.join(',');
  function table(list) {
    const idx = new Map(list.map((s, i) => [key(s[0], s[1]), i]));
    const T = new Int8Array(list.length * 18);
    list.forEach(([p, n], i) => MV.forEach((m, j) => {
      let P = p, N = n;
      const [a, s] = FACES[m.f];
      if (p[a] === s) for (let q = 0; q < (m.k + 4) % 4; q++) { P = turn(P, m.f); N = turn(N, m.f); }
      T[i * 18 + j] = idx.get(key(P, N));
    }));
    return { T, idx };
  }
  const E = table(EDGES), C = table(CORNERS);
  const eid = (p, n) => E.idx.get(key(p, n)), cid = (p, n) => C.idx.get(key(p, n));

  // solved states (white = D, reference sticker for slot edges = the x-axis sticker)
  const CROSS = [[0, -1, 1], [1, -1, 0], [0, -1, -1], [-1, -1, 0]].map(p => eid(p, [0, -1, 0]));
  const SLOTS = [[1, 1], [-1, 1], [-1, -1], [1, -1]].map(([x, z]) => ({
    c: cid([x, -1, z], [0, -1, 0]), e: eid([x, 0, z], [x, 0, 0]),
    name: (z > 0 ? 'F' : 'B') + (x > 0 ? 'R' : 'L')
  }));

  // pruning tables
  function bfs(size, start, next) {
    const d = new Uint8Array(size).fill(255);
    let fr = [start]; d[start] = 0; let depth = 0;
    while (fr.length) {
      const nf = [];
      for (const s of fr) for (let j = 0; j < 18; j++) { const t = next(s, j); if (d[t] === 255) { d[t] = depth + 1; nf.push(t); } }
      fr = nf; depth++;
    }
    return d;
  }
  const crossIdx = (a, b, c, d) => ((a * 24 + b) * 24 + c) * 24 + d;
  const CROSS_D = bfs(331776, crossIdx(...CROSS), (s, j) => {
    const a = (s / 13824) | 0, b = ((s / 576) | 0) % 24, c = ((s / 24) | 0) % 24, d = s % 24;
    return crossIdx(E.T[a * 18 + j], E.T[b * 18 + j], E.T[c * 18 + j], E.T[d * 18 + j]);
  });
  // cross edges + one slot edge (24^5) per slot is big; use cross + slot corner? keep pair tables (576) + cross-with-pair-edge (24^5) lazily
  const PAIR_D = SLOTS.map(sl => bfs(576, sl.c * 24 + sl.e, (s, j) => C.T[((s / 24) | 0) * 18 + j] * 24 + E.T[(s % 24) * 18 + j]));
  let CE_D = null; // cross + slot-edge, built for slot 0 and reused through y symmetry
  // y-rotation maps of piece states (for symmetry)
  function ymap(list, idx) {
    return list.map(([p, n]) => idx.get(key(rot(p, 1, -1), rot(n, 1, -1))));
  }
  const YE = ymap(EDGES, E.idx), YC = ymap(CORNERS, C.idx);

  const TOPE = [[0, 1, 1], [1, 1, 0], [0, 1, -1], [-1, 1, 0]].map(p => eid(p, [0, 1, 0]));
  const N = 16;
  // state: [e0..e3 cross, c0..c3 slot corners, e0..e3 slot edges, 4 top edges]
  function stateFrom(moves) {
    const s = [...CROSS, ...SLOTS.map(x => x.c), ...SLOTS.map(x => x.e), ...TOPE];
    for (const j of moves) for (let i = 0; i < N; i++) s[i] = (i >= 4 && i < 8 ? C : E).T[s[i] * 18 + j];
    return s;
  }
  const isCross = s => s[0] === CROSS[0] && s[1] === CROSS[1] && s[2] === CROSS[2] && s[3] === CROSS[3];
  const pairOK = (s, k) => s[4 + k] === SLOTS[k].c && s[8 + k] === SLOTS[k].e;

  function search(s0, goal, h, maxDepth, budget, allowed) {
    const JS = allowed || [...Array(18).keys()];
    const path = []; let nodes = 0;
    const s = s0.slice();
    function dfs(st, g, bound, last) {
      const hv = h(st);
      if (hv === 0 && goal(st)) return true;
      if (g + hv > bound) return false;
      if (++nodes > budget) throw 'budget';
      for (const j of JS) {
        const f = (j / 3) | 0;
        if (last >= 0 && (f === last || ((f >> 1) === (last >> 1) && f < last))) continue;
        const ns = new Array(N);
        for (let i = 0; i < N; i++) ns[i] = (i >= 4 && i < 8 ? C : E).T[st[i] * 18 + j];
        path.push(j);
        if (dfs(ns, g + 1, bound, f)) return true;
        path.pop();
      }
      return false;
    }
    try {
      for (let b = h(s); b <= maxDepth; b++) if (dfs(s, 0, b, -1)) return { moves: path.slice(), nodes };
    } catch (e) { if (e !== 'budget') throw e; }
    return null;
  }

  const crossH = s => CROSS_D[crossIdx(s[0], s[1], s[2], s[3])];
  const pairH = (s, k) => PAIR_D[k][s[4 + k] * 24 + s[8 + k]];

  // goal: cross + all slots in `keep` + `need` more slots
  const edgesOriented = st => EDGES[st[12]][1][1] === 1 && EDGES[st[13]][1][1] === 1 && EDGES[st[14]][1][1] === 1 && EDGES[st[15]][1][1] === 1;
  function stage(s, keep, need, maxDepth, budget, ec, allowed) {
    const free = [0, 1, 2, 3].filter(k => !keep.includes(k));
    const h = st => {
      let m = crossH(st);
      for (const k of keep) m = Math.max(m, pairH(st, k));
      if (need) { const v = free.map(k => pairH(st, k)).sort((a, b) => a - b); m = Math.max(m, v[need - 1]); }
      return m;
    };
    const goal = st => isCross(st) && keep.every(k => pairOK(st, k)) && free.filter(k => pairOK(st, k)).length >= need && (!ec || edgesOriented(st));
    return search(s, goal, h, maxDepth, budget, allowed);
  }
  const apply = (s, moves) => { const t = s.slice(); for (const j of moves) for (let i = 0; i < N; i++) t[i] = (i >= 4 && i < 8 ? C : E).T[t[i] * 18 + j]; return t; };
  const solvedSlots = s => [0, 1, 2, 3].filter(k => pairOK(s, k));

  /* returns a list of finished plans; on the last pair also tries edge control (all top edges oriented -> ZBLL) */
  function finishPairs(s, steps, budget) {
    const out = [];
    while (solvedSlots(s).length < 4) {
      const keep = solvedSlots(s);
      if (keep.length === 3 && !edgesOriented(s)) {
        const plain = stage(s, keep, 1, 16, budget);
        const ec = stage(s, keep, 1, (plain ? plain.moves.length : 12) + 4, budget, true);
        if (ec) out.push([...steps, { kind: 'pair', ec: true, slots: [0, 1, 2, 3].filter(k => !keep.includes(k)).map(k => SLOTS[k].name), moves: ec.moves }]);
        if (!plain) return out;
        s = apply(s, plain.moves);
        steps = [...steps, { kind: 'pair', slots: [0, 1, 2, 3].filter(k => !keep.includes(k)).map(k => SLOTS[k].name), moves: plain.moves }];
        continue;
      }
      const r = stage(s, keep, 1, 16, budget);
      if (!r) return out;
      s = apply(s, r.moves);
      const now = solvedSlots(s).filter(k => !keep.includes(k));
      steps = [...steps, { kind: 'pair', slots: now.map(k => SLOTS[k].name), moves: r.moves }];
    }
    out.push(steps);
    return out;
  }

  /* scramble: array of move tokens already in the white-bottom frame */
  function solveF2L(tokens, opt = {}) {
    const ids = tokens.map(t => MV.findIndex(m => m.t === t));
    if (ids.some(i => i < 0)) throw new Error('bad move');
    const s0 = stateFrom(ids);
    const budget = opt.budget || 4e6;
    const plans = [];
    // plain cross
    const cr = stage(s0, [], 0, 8, budget);
    if (cr) { const s = apply(s0, cr.moves); plans.push(...finishPairs(s, [{ kind: 'cross', slots: solvedSlots(s).map(k => SLOTS[k].name), moves: cr.moves }], budget)); }
    // x-cross
    const xc = stage(s0, [], 1, 11, budget);
    if (xc) { const s = apply(s0, xc.moves); plans.push(...finishPairs(s, [{ kind: 'xcross', slots: solvedSlots(s).map(k => SLOTS[k].name), moves: xc.moves }], budget)); }
    // xx-cross
    if (opt.xx !== false) {
      const xx = stage(s0, [], 2, 14, opt.xxBudget || 2.5e7);
      if (xx) { const s = apply(s0, xx.moves); plans.push(...finishPairs(s, [{ kind: 'xxcross', slots: solvedSlots(s).map(k => SLOTS[k].name), moves: xx.moves }], budget)); }
    }
    const len = p => p.reduce((a, x) => a + x.moves.length, 0);
    plans.sort((a, b) => len(a) - len(b));
    return plans.map(p => p.map(x => ({ ...x, moves: x.moves.map(j => MV[j].t) })));
  }

  /* all optimal solutions for one F2L case (used offline to build the advanced F2L list) */
  function allOptimal(s0, goal, h, allowed, maxDepth, cap) {
    for (let b = h(s0); b <= maxDepth; b++) {
      const out = [], path = [];
      (function dfs(st, g, last) {
        if (out.length >= cap) return;
        const hv = h(st);
        if (g === b) { if (hv === 0 && goal(st)) out.push(path.slice()); return; }
        if (g + hv > b) return;
        for (const j of allowed) {
          const f = (j / 3) | 0;
          if (last >= 0 && (f === last || ((f >> 1) === (last >> 1) && f < last))) continue;
          const ns = new Array(N);
          for (let i = 0; i < N; i++) ns[i] = (i >= 4 && i < 8 ? C : E).T[st[i] * 18 + j];
          path.push(j); dfs(ns, g + 1, f); path.pop();
        }
      })(s0, 0, -1);
      if (out.length) return out;
    }
    return [];
  }
  function pairCases(slot, gens) {
    const allowed = []; MV.forEach((m, j) => { if (gens.includes(m.f)) allowed.push(j); });
    const U1 = MV.findIndex(m => m.t === 'U');
    const sl = SLOTS[slot];
    const cPos = new Set(), ePos = new Set();
    CORNERS.forEach(([p], i) => { if (p[1] === 1 || i === sl.c || (p[0] === CORNERS[sl.c][0][0] && p[2] === CORNERS[sl.c][0][2] && p[1] === -1)) cPos.add(i); });
    EDGES.forEach(([p], i) => { if (p[1] === 1 || (p[1] === 0 && p[0] === EDGES[sl.e][0][0] && p[2] === EDGES[sl.e][0][2])) ePos.add(i); });
    const seen = new Set(), cases = [];
    const h = st => Math.max(crossH(st), ...[0, 1, 2, 3].map(k => pairH(st, k)));
    const goal = st => isCross(st) && [0, 1, 2, 3].every(k => pairOK(st, k));
    for (const c of cPos) for (const e of ePos) {
      let cc = c, ee = e; const orbit = [];
      for (let q = 0; q < 4; q++) { orbit.push(cc * 24 + ee); cc = C.T[cc * 18 + U1]; ee = E.T[ee * 18 + U1]; }
      const rep = Math.min(...orbit);
      if (seen.has(rep)) continue; seen.add(rep);
      if (c === sl.c && e === sl.e) continue;
      const s0 = [...CROSS, ...SLOTS.map(x => x.c), ...SLOTS.map(x => x.e), ...TOPE];
      s0[4 + slot] = c; s0[8 + slot] = e;
      const sols = allOptimal(s0, goal, h, allowed, 13, 400);
      cases.push({ cIn: CORNERS[c][0][1] === 1, eIn: EDGES[e][0][1] === 1, cOri: CORNERS[c][1][1], sols: sols.map(p => p.map(j => MV[j].t)) });
    }
    return cases;
  }

  /* optimal cross / X-cross / XX-cross. slots: array of slot names that must be solved (e.g. ['FR']),
     or need: how many pairs (any slots). Returns {moves, slots} or null if over budget. */
  function solveStart(tokens, opt = {}) {
    const ids = tokens.map(t => MV.findIndex(m => m.t === t));
    if (ids.some(i => i < 0)) throw new Error('bad move');
    const s0 = stateFrom(ids);
    const keep = (opt.slots || []).map(n => SLOTS.findIndex(x => x.name === n));
    const r = stage(s0, keep, keep.length ? 0 : (opt.need || 0), opt.maxDepth || 16, opt.budget || 3e7);
    if (!r) return null;
    const s = apply(s0, r.moves);
    return { moves: r.moves.map(j => MV[j].t), slots: solvedSlots(s).map(k => SLOTS[k].name) };
  }
  function startReport(tokens, need, budget) {
    const best = solveStart(tokens, { need, budget });
    const per = [];
    if (need === 1) for (const sl of SLOTS) per.push({ slots: [sl.name], r: solveStart(tokens, { slots: [sl.name], budget }) });
    if (need === 2) for (let a = 0; a < 4; a++) for (let b = a + 1; b < 4; b++) per.push({ slots: [SLOTS[a].name, SLOTS[b].name], r: solveStart(tokens, { slots: [SLOTS[a].name, SLOTS[b].name], budget: budget / 3 }) });
    return { best, per };
  }

  /* last slot: shortest plain insert and shortest insert that also orients all top edges */
  function solveEC(tokens, budget) {
    const ids = tokens.map(t => MV.findIndex(m => m.t === t));
    if (ids.some(i => i < 0)) throw new Error('bad move');
    const s0 = stateFrom(ids);
    const keep = solvedSlots(s0);
    if (!isCross(s0) || keep.length !== 3) throw new Error('not a last-slot case');
    const slot = SLOTS[[0, 1, 2, 3].find(k => !keep.includes(k))].name;
    const gens = [slot[1], 'U', slot[0]];
    const allowed = []; MV.forEach((m, j) => { if (gens.includes(m.f)) allowed.push(j); });
    const plain = stage(s0, keep, 1, 14, budget, false, allowed);
    const ec = stage(s0, keep, 1, (plain ? plain.moves.length : 10) + 7, budget, true, allowed);
    const mt = r => r ? r.moves.map(j => MV[j].t) : null;
    return { slot, plain: mt(plain), ec: mt(ec) };
  }

  const api = { solveF2L, MV, pairCases, solveStart, startReport, solveEC };
  if (typeof module !== 'undefined') module.exports = api;
  root.CFOPSolver = api;
  if (typeof WorkerGlobalScope !== 'undefined' && root instanceof WorkerGlobalScope) {
    root.onmessage = e => {
      try { if (e.data.cmd === 'ec') postMessage({ id: e.data.id, ec: solveEC(e.data.moves, e.data.budget || 2e7) }); else if (e.data.cmd === 'start') postMessage({ id: e.data.id, report: startReport(e.data.moves, e.data.need, e.data.budget || 2e7) }); else postMessage({ id: e.data.id, plans: solveF2L(e.data.moves, e.data.opt || {}) }); }
      catch (err) { postMessage({ id: e.data.id, error: String(err.message || err) }); }
    };
  }
})(typeof self !== 'undefined' ? self : globalThis);
