/* Watcher — a mascot whose two eyes sit on a sphere and follow the cursor.
   Vanilla port of the React Bits "Watcher": one spring on a face point, read
   as a yaw/pitch turn; both eyes are derived from it, foreshortened by depth.
   Click it and it talks back. */
const NS = "http://www.w3.org/2000/svg";
const R = 50;
const GAP = 0.19;
const TILT = 64;
const STYLES = { Slant: { w: 9, h: 15, r: 4.5 }, Dots: { w: 11, h: 11, r: 5.5 }, Squares: { w: 12, h: 12, r: 3.5 } };
const SHAPES = {
	Ball: "M50 0 A50 50 0 1 1 49.99 0 Z",
	Cube: "M30 6 H70 A24 24 0 0 1 94 30 V70 A24 24 0 0 1 70 94 H30 A24 24 0 0 1 6 70 V30 A24 24 0 0 1 30 6 Z",
	Pill: "M34 17 H66 A33 33 0 0 1 66 83 H34 A33 33 0 0 1 34 17 Z",
};
const LINES = ["Hey, I see you.", "Boop.", "That tickles.", "Hi there!", "Stop poking me.", "I'm watching you.", "Say cheese.", "You found me."];
const TINTS = ["#3b5bff", "#179c52", "#e0307f"];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const mk = (tag, attrs = {}) => {
	const e = document.createElementNS(NS, tag);
	for (const k in attrs) e.setAttribute(k, attrs[k]);
	return e;
};

export function Watcher(host, { follow = 60, bounce = 30, shape = "Cube", eyes = "Slant", eyeScale = 1.25 } = {}) {
	const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
	const base = STYLES[eyes] || STYLES.Slant;
	const eye = { w: base.w * eyeScale, h: base.h * eyeScale, r: base.r * eyeScale };

	const svg = mk("svg", { viewBox: "0 0 100 100", class: "wt-svg", "aria-hidden": "true" });
	const clipId = "wt-clip";
	const defs = mk("defs");
	const cp = mk("clipPath", { id: clipId });
	cp.appendChild(mk("path", { d: SHAPES[shape] || SHAPES.Cube }));
	defs.appendChild(cp);
	svg.appendChild(defs);
	svg.appendChild(mk("path", { class: "wt-body", d: SHAPES[shape] || SHAPES.Cube }));
	const clipped = mk("g", { "clip-path": `url(#${clipId})` });
	const eyeG = [0, 1].map(() => {
		const g = mk("g");
		g.appendChild(mk("rect", { class: "wt-eye" }));
		clipped.appendChild(g);
		return g;
	});
	svg.appendChild(clipped);
	const say = document.createElement("span");
	say.className = "wt-say";
	say.setAttribute("aria-live", "polite");
	const typedEl = document.createElement("span");
	const caret = document.createElement("span");
	caret.className = "wt-caret";
	say.append(typedEl, caret);
	host.append(svg, say);

	/* ── poke: type a line into the bubble, hold, fold away ── */
	let turn = 0,
		lastLine = -1;
	const wait = (ms) => new Promise((r) => setTimeout(r, ms));
	host.addEventListener("click", async () => {
		const mine = ++turn;
		const pool = LINES.map((_, i) => i).filter((i) => i !== lastLine);
		lastLine = pool[Math.floor(Math.random() * pool.length)];
		const line = LINES[lastLine];
		say.style.setProperty("--tint", TINTS[Math.floor(Math.random() * TINTS.length)]);
		typedEl.textContent = "";
		say.setAttribute("data-on", "");
		for (let k = 1; k <= line.length; k++) {
			await wait(38 + Math.random() * 30);
			if (mine !== turn) return;
			typedEl.textContent = line.slice(0, k);
		}
		await wait(1500);
		if (mine !== turn) return;
		say.removeAttribute("data-on");
	});

	/* ── the spring on the face point ── */
	const t = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 };
	let raf = 0,
		prev = 0,
		blink = 0,
		nextBlink = performance.now() + 2200;

	function draw(now) {
		let lid = 1;
		if (now > nextBlink) {
			blink = now;
			nextBlink = now + 2600 + Math.random() * 3200;
		}
		const since = now - blink;
		if (since < 160) lid = 1 - 0.9 * Math.sin((since / 160) * Math.PI);

		const as = (v) => Math.asin(clamp(v, -0.92, 0.92));
		const yaw = as(t.x);
		const pitch = -as(t.y);
		const cy = Math.cos(yaw),
			sy = Math.sin(yaw);
		const cpt = Math.cos(pitch),
			sp = Math.sin(pitch);
		const tilt = TILT * t.x * t.y;
		const g0 = GAP * Math.max(1, eyeScale * 0.8);

		[-g0, g0].forEach((x0, i) => {
			const g = eyeG[i];
			const z0 = Math.sqrt(1 - x0 * x0);
			const x1 = x0 * cy + z0 * sy;
			const z1 = -x0 * sy + z0 * cy;
			const y2 = -z1 * sp;
			const z2 = z1 * cpt;
			const near = clamp(z2, 0, 1);
			const k = 0.45 + 0.55 * near;
			const sx = k * (0.7 + 0.3 * near);
			const w = eye.w * sx;
			const h = Math.max(0.6, eye.h * k * lid);
			const rect = g.firstChild;
			rect.setAttribute("x", (-w / 2).toFixed(2));
			rect.setAttribute("y", (-h / 2).toFixed(2));
			rect.setAttribute("width", w.toFixed(2));
			rect.setAttribute("height", h.toFixed(2));
			rect.setAttribute("rx", Math.min(eye.r, w / 2, h / 2).toFixed(2));
			g.setAttribute("transform", `translate(${(50 + x1 * R).toFixed(2)} ${(50 + y2 * R).toFixed(2)}) rotate(${tilt.toFixed(2)})`);
			g.style.opacity = z2 < 0.05 ? "0" : "1";
		});
	}

	function tick(now) {
		if (document.hidden) {
			raf = 0;
			prev = 0;
			return;
		}
		const dt = prev ? Math.min(2.5, (now - prev) / 16.67) : 1;
		prev = now;
		if (still) {
			t.x = t.tx;
			t.y = t.ty;
		} else {
			const k = 0.06;
			const d = 0.34 - (clamp(bounce, 0, 100) / 100) * 0.22;
			t.vx += ((t.tx - t.x) * k - t.vx * d) * dt;
			t.vy += ((t.ty - t.y) * k - t.vy * d) * dt;
			t.x += t.vx * dt;
			t.y += t.vy * dt;
		}
		draw(now);
		/* park the loop once the spring has settled; wake for the next blink or pointer move */
		const moving = Math.abs(t.tx - t.x) + Math.abs(t.ty - t.y) + Math.abs(t.vx) + Math.abs(t.vy) > 0.002 || now - blink < 200;
		if (moving) raf = requestAnimationFrame(tick);
		else {
			raf = 0;
			prev = 0;
			clearTimeout(wakeT);
			wakeT = setTimeout(wake, Math.max(0, nextBlink - performance.now()));
		}
	}
	let wakeT = 0;
	function wake() {
		if (!raf && !document.hidden) raf = requestAnimationFrame(tick);
	}
	wake();
	document.addEventListener("visibilitychange", wake);

	/* the face goes where the pointer is, anywhere in the window */
	addEventListener(
		"pointermove",
		(e) => {
			const r = host.getBoundingClientRect();
			const dx = e.clientX - (r.left + r.width / 2);
			const dy = e.clientY - (r.top + r.height / 2);
			const d = Math.hypot(dx, dy) || 1;
			const reach = Math.max(60, Math.min(innerWidth, innerHeight) * 0.28);
			const far = Math.min(0.85, Math.tanh(d / reach) * (clamp(follow, 0, 100) / 100) * 1.5);
			t.tx = (dx / d) * far;
			t.ty = (dy / d) * far;
			wake();
		},
		{ passive: true }
	);
	document.documentElement.addEventListener("pointerleave", () => {
		t.tx = t.ty = 0;
		wake();
	});
}
