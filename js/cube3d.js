/* 3D cube renderer (three.js). Mirrors the sticker model in app.js:
   x = right, y = up, z = front. A move turns the layer selected by MOVES[face]
   by (dir * k) quarter turns about the axis, right-hand rule. */
(function () {
  const AX = ['x', 'y', 'z'];
  const STICKER = {
    Y: 0xffd500, W: 0xf4f6f8, G: 0x009b48, B: 0x0046ad, O: 0xff6a00, R: 0xc8102e
  };

  function roundedSquare(size, r) {
    const s = size / 2, sh = new THREE.Shape();
    sh.moveTo(-s + r, -s);
    sh.lineTo(s - r, -s); sh.quadraticCurveTo(s, -s, s, -s + r);
    sh.lineTo(s, s - r); sh.quadraticCurveTo(s, s, s - r, s);
    sh.lineTo(-s + r, s); sh.quadraticCurveTo(-s, s, -s, s - r);
    sh.lineTo(-s, -s + r); sh.quadraticCurveTo(-s, -s, -s + r, -s);
    return new THREE.ShapeGeometry(sh, 6);
  }

  class Cube3D {
    constructor(el, opt = {}) {
      this.el = el;
      this.opt = opt;
      this.speed = opt.speed || 260;
      this.queue = [];
      this.anim = null;
      this.model = null;
      this.onIdle = null;
      this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      el.appendChild(this.renderer.domElement);
      this.renderer.domElement.style.touchAction = opt.touch || 'pan-y';
      this.renderer.domElement.setAttribute('aria-label', 'Interactive 3D cube. Drag to rotate.');
      this.renderer.domElement.setAttribute('role', 'img');

      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(opt.fov || 30, 1, 0.1, 100);
      this.camera.position.set(...(opt.cam || [5.6, 4.9, 7.6]));
      this.camera.lookAt(0, opt.lookY != null ? opt.lookY : -0.15, 0);
      this.scene.add(new THREE.AmbientLight(0xffffff, 0.78));
      const key = new THREE.DirectionalLight(0xffffff, 0.45);
      key.position.set(4, 8, 6);
      this.scene.add(key);

      this.root = new THREE.Group();
      this.scene.add(this.root);
      this.bodyMat = new THREE.MeshLambertMaterial({ color: 0x15171c });
      this.stickerGeo = roundedSquare(0.84, 0.12);
      this.bodyGeo = new THREE.BoxGeometry(0.97, 0.97, 0.97);
      this.mats = {};
      for (const k in STICKER) this.mats[k] = new THREE.MeshLambertMaterial({ color: STICKER[k], side: THREE.DoubleSide });
      this.build();

      this.resize();
      if ('ResizeObserver' in window) new ResizeObserver(() => this.resize()).observe(el);
      else addEventListener('resize', () => this.resize());
      this.bindDrag();
      this.last = performance.now();
      const loop = (t) => { this.frame(t); requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    }

    build() {
      if (this.cubies) this.cubies.forEach(c => this.root.remove(c));
      this.cubies = [];
      for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
        if (!x && !y && !z) continue;
        const g = new THREE.Group();
        g.add(new THREE.Mesh(this.bodyGeo, this.bodyMat));
        const home = [x, y, z];
        for (let a = 0; a < 3; a++) {
          if (!home[a]) continue;
          const n = [0, 0, 0]; n[a] = home[a];
          const face = faceOf(n);
          const m = new THREE.Mesh(this.stickerGeo, this.mats[FACE_COLOR[face]]);
          m.userData.hn = n;
          m.position.set(n[0] * 0.487, n[1] * 0.487, n[2] * 0.487);
          m.lookAt(n[0] * 2, n[1] * 2, n[2] * 2);
          g.add(m);
        }
        g.position.set(x, y, z);
        g.userData.home = home;
        this.root.add(g);
        this.cubies.push(g);
      }
    }

    resize() {
      const w = this.el.clientWidth || 280, h = this.el.clientHeight || w;
      this.renderer.setSize(w, h, false);
      this.renderer.domElement.style.width = '100%';
      this.renderer.domElement.style.height = '100%';
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    }

    bindDrag() {
      const c = this.renderer.domElement;
      let drag = null;
      c.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY }; c.setPointerCapture(e.pointerId); this.userTouched = true; });
      c.addEventListener('pointermove', e => {
        if (!drag) return;
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        drag = { x: e.clientX, y: e.clientY };
        this.root.rotation.y += dx * 0.012;
        this.root.rotation.x = Math.max(-1.2, Math.min(1.2, this.root.rotation.x + dy * 0.012));
      });
      const end = () => { drag = null; };
      c.addEventListener('pointerup', end);
      c.addEventListener('pointercancel', end);
      c.addEventListener('dblclick', () => { this.root.rotation.set(0, 0, 0); });
    }

    /* Put every cubie where the sticker model says it is. */
    sync(model) {
      this.model = model;
      const v = a => new THREE.Vector3(a[0], a[1], a[2]);
      for (const g of this.cubies) {
        const st = model.filter(s => eq(s.h, g.userData.home));
        for (const m of g.children) if (m.userData.hn) { const s = st.find(q => eq(q.hn, m.userData.hn)); if (s && this.mats[s.c] && m.material !== this.mats[s.c]) m.material = this.mats[s.c]; }
        g.position.copy(v(st[0].p));
        if (st.length >= 2) {
          const h1 = v(st[0].hn), h2 = v(st[1].hn), h3 = h1.clone().cross(h2);
          const n1 = v(st[0].n), n2 = v(st[1].n), n3 = n1.clone().cross(n2);
          const A = new THREE.Matrix4().makeBasis(h1, h2, h3);
          const B = new THREE.Matrix4().makeBasis(n1, n2, n3);
          B.multiply(A.transpose());
          g.quaternion.setFromRotationMatrix(B);
        } else {
          g.quaternion.setFromUnitVectors(v(st[0].hn), v(st[0].n));
        }
      }
    }

    clear() {
      this.queue = [];
      if (this.anim) this.finish(true);
    }

    enqueue(mv) { this.queue.push(mv); }

    start(mv) {
      const [a, dir, sel] = MOVES[mv.face];
      const pivot = new THREE.Group();
      this.root.add(pivot);
      for (const g of this.cubies) {
        const p = [Math.round(g.position.x), Math.round(g.position.y), Math.round(g.position.z)];
        if (sel(p)) pivot.attach(g);
      }
      const turns = dir * (mv.k === 2 ? 2 : mv.k);
      const dur = this.reduced ? 0 : this.speed * (Math.abs(turns) === 2 ? 1.45 : 1);
      this.anim = { pivot, axis: AX[a], target: turns * Math.PI / 2, t0: performance.now(), dur };
    }

    finish(skipSync) {
      const { pivot, axis, target } = this.anim;
      pivot.rotation[axis] = target;
      pivot.updateMatrixWorld(true);
      for (const g of [...pivot.children]) {
        this.root.attach(g);
        g.position.set(Math.round(g.position.x), Math.round(g.position.y), Math.round(g.position.z));
        const m = new THREE.Matrix4().makeRotationFromQuaternion(g.quaternion);
        const e = m.elements;
        for (let i = 0; i < 16; i++) e[i] = Math.round(e[i]);
        g.quaternion.setFromRotationMatrix(m);
      }
      this.root.remove(pivot);
      this.anim = null;
      if (!skipSync && !this.queue.length) {
        if (this.model) this.sync(this.model);
        if (this.onIdle) this.onIdle();
      }
    }

    frame(t) {
      const dt = t - this.last; this.last = t;
      if (!this.anim && this.queue.length) this.start(this.queue.shift());
      if (this.anim) {
        const k = this.anim.dur ? Math.min(1, (t - this.anim.t0) / this.anim.dur) : 1;
        const ease = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        this.anim.pivot.rotation[this.anim.axis] = this.anim.target * ease;
        if (k >= 1) this.finish(false);
      }
      if (this.opt.autoSpin && !this.reduced && !this.userTouched) this.root.rotation.y += dt * 0.00025;
      this.renderer.render(this.scene, this.camera);
    }

    get busy() { return !!this.anim || this.queue.length > 0; }
  }

  window.Cube3D = Cube3D;
})();
