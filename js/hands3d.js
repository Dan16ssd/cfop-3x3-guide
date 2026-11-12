/* Animated 3D hands for the finger-trick tutorial.
   Hands live in the cube's root group, in cube coordinates (cube spans -1.5..1.5).
   Each finger is a 2-segment chain from a fixed knuckle to a movable fingertip. */
(function () {
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const AXV = [V(1, 0, 0), V(0, 1, 0), V(0, 0, 1)];
  const AXN = ['x', 'y', 'z'];
  // right hand, cube coordinates; left hand mirrors x
  const HOME = { T: V(1.0, -0.3, 1.72), I: V(1.05, 1.72, -0.95), M: V(1.05, 0.75, -1.72), R: V(1.05, -0.25, -1.72) };
  const KNUCK = { T: V(2.2, -1.0, 0.6), I: V(2.35, 1.0, -0.85), M: V(2.35, 0.45, -1.2), R: V(2.35, -0.2, -1.2) };
  const RAD = { T: 0.27, I: 0.23, M: 0.24, R: 0.22 };
  const FNAME = { T: 'thumb', I: 'index', M: 'middle', R: 'ring' };
  const ease = k => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
  const mir = (v, s) => V(v.x * s, v.y, v.z);

  function plan(m) {
    const fl = (hand, finger, st, k) => ({ type: 'flick', hand, finger, start: V(...st), mv: { face: m.face, k, text: m.face + (k === -1 ? "'" : '') } });
    const f = m.face, k = m.k;
    switch (f) {
      case 'R': case 'r': return [{ type: 'wrist', hand: 'R', mv: m }];
      case 'L': case 'l': return [{ type: 'wrist', hand: 'L', mv: m }];
      case 'U':
        if (k === 1) return [fl('R', 'I', [1.25, 1.72, -1.15], 1)];
        if (k === -1) return [fl('L', 'I', [-1.25, 1.72, -1.15], -1)];
        return [fl('R', 'I', [1.25, 1.72, -1.15], 1), fl('R', 'M', [1.25, 1.72, -1.15], 1)];
      case 'F':
        if (k === 1) return [fl('R', 'I', [1.2, 1.0, 1.72], 1)];
        if (k === -1) return [fl('R', 'T', [1.2, -1.0, 1.72], -1)];
        return [fl('R', 'I', [1.2, 1.0, 1.72], 1), fl('R', 'I', [1.2, 1.0, 1.72], 1)];
      case 'D':
        if (k === 1) return [fl('L', 'R', [-1.1, -1.72, 0.9], 1)];
        if (k === -1) return [fl('R', 'R', [1.1, -1.72, 0.9], -1)];
        return [fl('L', 'R', [-1.1, -1.72, 0.9], 1), fl('L', 'R', [-1.1, -1.72, 0.9], 1)];
      case 'M':
        if (k === -1) return [fl('L', 'R', [0, 1.0, -1.72], -1)];
        if (k === 2) return [fl('L', 'R', [0, 1.0, -1.72], -1), fl('L', 'M', [0, 1.0, -1.72], -1)];
        return [fl('L', 'I', [0, 1.72, -0.6], 1)];
      default: return [{ type: 'none', mv: m }];
    }
  }

  function describe(st) {
    if (st.type === 'wrist') return (st.hand === 'R' ? 'Right' : 'Left') + ' wrist';
    if (st.type === 'flick') return (st.hand === 'R' ? 'Right ' : 'Left ') + FNAME[st.finger];
    return 'Turn';
  }

  class HandRig {
    constructor(cube) {
      this.c = cube;
      this.skin = new THREE.MeshLambertMaterial({ color: 0xf0c4a0 });
      this.skinBack = new THREE.MeshLambertMaterial({ color: 0xf0c4a0, transparent: true, opacity: 0.55 });
      this.act = new THREE.MeshLambertMaterial({ color: 0x2f6bff, emissive: 0x0b2a80 });
      this.cyl = new THREE.CylinderGeometry(1, 1, 1, 14);
      this.sph = new THREE.SphereGeometry(1, 14, 10);
      this.hands = { R: this.makeHand(1), L: this.makeHand(-1) };
      this.token = 0;
      this.mul = 1;
      this.model = solved();
    }

    seg(mesh, a, b, r) {
      const d = b.clone().sub(a), len = d.length();
      mesh.position.copy(a).addScaledVector(d, 0.5);
      mesh.scale.set(r, len, r);
      mesh.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
    }

    makeHand(s) {
      const g = new THREE.Group();
      const palm = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.1, 2.0), this.skin);
      palm.position.set(2.62 * s, -0.05, -0.25);
      g.add(palm);
      const arm = new THREE.Mesh(this.cyl, this.skin);
      this.seg(arm, V(2.75 * s, -1.0, -0.2), V(3.7 * s, -4.4, 0.5), 0.62);
      g.add(arm);
      const fingers = {};
      for (const f of ['T', 'I', 'M', 'R']) {
        const parts = [new THREE.Mesh(this.cyl, this.skin), new THREE.Mesh(this.cyl, this.skin),
          new THREE.Mesh(this.sph, this.skin), new THREE.Mesh(this.sph, this.skin), new THREE.Mesh(this.sph, this.skin)];
        parts.forEach(p => g.add(p));
        fingers[f] = { k: mir(KNUCK[f], s), home: mir(HOME[f], s), tip: mir(HOME[f], s), parts, r: RAD[f] };
      }
      const hand = { g, palm, arm, fingers };
      this.c.root.add(g);
      for (const f in fingers) this.updateFinger(hand, f);
      return hand;
    }

    updateFinger(hand, f) {
      const F = hand.fingers[f], K = F.k, T = F.tip;
      const mid = K.clone().add(T).multiplyScalar(0.5);
      const M = mid.clone().add(mid.clone().normalize().multiplyScalar(0.45));
      const [s1, s2, jK, jM, jT] = F.parts;
      this.seg(s1, K, M, F.r); this.seg(s2, M, T, F.r);
      [[jK, K], [jM, M], [jT, T]].forEach(([m, p]) => { m.position.copy(p); m.scale.setScalar(F.r); });
    }

    paint(hand, f, on) {
      const parts = f ? hand.fingers[f].parts : [hand.palm, hand.arm, ...Object.values(hand.fingers).flatMap(x => x.parts)];
      parts.forEach(p => { p.material = on ? this.act : this.skin; });
    }

    reset() {
      this.token++;
      for (const h of Object.values(this.hands)) {
        h.g.rotation.set(0, 0, 0);
        this.paint(h, null, false);
        for (const f in h.fingers) { h.fingers[f].tip = h.fingers[f].home.clone(); this.updateFinger(h, f); }
      }
      this.model = solved();
      this.c.clear();
      this.c.sync(this.model);
    }

    tween(ms, fn, tok) {
      return new Promise(res => {
        const t0 = performance.now();
        const step = t => {
          if (this.token !== tok) return res(false);
          const k = ms <= 0 ? 1 : Math.min(1, (t - t0) / ms);
          fn(k);
          if (k < 1) requestAnimationFrame(step); else res(true);
        };
        requestAnimationFrame(step);
      });
    }

    async moveTip(hand, f, to, ms, tok) {
      const F = hand.fingers[f], from = F.tip.clone();
      return this.tween(ms, k => { F.tip = from.clone().lerp(to, ease(k)); this.updateFinger(hand, f); }, tok);
    }

    turnCube(mv, ms) {
      applyMove(this.model, mv);
      this.c.model = this.model;
      this.c.speed = ms;
      this.c.enqueue(mv);
    }

    /* Play a list of parsed moves. onStep(move, label) is called as each starts. */
    async play(moves, onStep) {
      this.reset();
      const tok = this.token;
      const base = 520 / this.mul;
      for (const m of moves) {
        for (const st of plan(m)) {
          if (onStep) onStep(m, describe(st));
          if (st.type === 'flick') {
            const hand = this.hands[st.hand], F = hand.fingers[st.finger];
            this.paint(hand, st.finger, true);
            if (!await this.moveTip(hand, st.finger, st.start, base * 0.55, tok)) return;
            const [a, dir] = MOVES[st.mv.face];
            const ang = dir * st.mv.k * Math.PI / 2 * 0.55;
            const start = st.start.clone();
            this.turnCube(st.mv, base);
            if (!await this.tween(base, k => { F.tip = start.clone().applyAxisAngle(AXV[a], ang * ease(Math.min(1, k / 0.7))); this.updateFinger(hand, st.finger); }, tok)) return;
            this.paint(hand, st.finger, false);
            if (!await this.moveTip(hand, st.finger, F.home, base * 0.45, tok)) return;
          } else if (st.type === 'wrist') {
            const hand = this.hands[st.hand];
            const [a, dir] = MOVES[st.mv.face];
            const ang = dir * (st.mv.k === 2 ? 2 : st.mv.k) * Math.PI / 2;
            const dur = base * (st.mv.k === 2 ? 1.45 : 1);
            this.paint(hand, null, true);
            this.turnCube(st.mv, dur);
            if (!await this.tween(dur, k => { hand.g.rotation[AXN[a]] = ang * ease(k); }, tok)) return;
            this.paint(hand, null, false);
            if (!await this.tween(base * 0.6, k => { hand.g.rotation[AXN[a]] = ang * (1 - ease(k)); }, tok)) return;
          } else {
            this.turnCube(st.mv, base);
            if (!await this.tween(base, () => {}, tok)) return;
          }
        }
      }
      if (onStep) onStep(null, 'Done');
    }
  }

  window.HandRig = HandRig;
})();
