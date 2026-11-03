/* Pointer-driven surfaces: Spotlight Card / Border Glow, Magnet, Tilted Card,
   and Click Spark. All of them are no-ops for touch-only devices (except
   click sparks, which also work on tap). */
const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Spotlight() {
	if (!fine) return;
	document.addEventListener(
		"pointermove",
		(e) => {
			const card = e.target.closest && e.target.closest(".spot");
			if (!card) return;
			const r = card.getBoundingClientRect();
			card.style.setProperty("--mx", e.clientX - r.left + "px");
			card.style.setProperty("--my", e.clientY - r.top + "px");
		},
		{ passive: true }
	);
}

export function Magnet({ reach = 22, pull = 0.22, max = 9 } = {}) {
	if (!fine || reduce) return;
	const els = [...document.querySelectorAll("[data-magnet]")];
	let queued = false,
		px = 0,
		py = 0;
	const clamp = (v) => Math.max(-max, Math.min(max, v));
	function update() {
		queued = false;
		for (const el of els) {
			const r = el.getBoundingClientRect();
			const dx = px - (r.left + r.width / 2);
			const dy = py - (r.top + r.height / 2);
			const near = Math.abs(dx) < r.width / 2 + reach && Math.abs(dy) < r.height / 2 + reach;
			el.style.transform = near ? `translate(${clamp(dx * pull)}px,${clamp(dy * pull)}px)` : "";
		}
	}
	addEventListener(
		"pointermove",
		(e) => {
			px = e.clientX;
			py = e.clientY;
			if (!queued) {
				queued = true;
				requestAnimationFrame(update);
			}
		},
		{ passive: true }
	);
}

export function Tilt() {
	if (!fine || reduce) return;
	document.querySelectorAll("[data-tilt]").forEach((el) => {
		el.addEventListener("pointermove", (e) => {
			const r = el.getBoundingClientRect();
			const px = (e.clientX - r.left) / r.width;
			const py = (e.clientY - r.top) / r.height;
			el.style.transition = "transform .12s ease-out";
			el.style.transform = `perspective(900px) rotateX(${((0.5 - py) * 12).toFixed(2)}deg) rotateY(${((px - 0.5) * 14).toFixed(2)}deg) scale(1.025)`;
		});
		el.addEventListener("pointerleave", () => {
			el.style.transition = "transform .8s cubic-bezier(.34,1.56,.64,1)";
			el.style.transform = "";
		});
	});
}

export function ClickSpark(canvas) {
	if (reduce) return;
	const ctx = canvas.getContext("2d");
	let sparks = [],
		raf = 0,
		dpr = 1;
	function size() {
		dpr = Math.min(devicePixelRatio || 1, 2);
		canvas.width = innerWidth * dpr;
		canvas.height = innerHeight * dpr;
	}
	size();
	addEventListener("resize", size);
	addEventListener("pointerdown", (e) => {
		const n = 9;
		for (let i = 0; i < n; i++) sparks.push({ x: e.clientX, y: e.clientY, a: (i / n) * Math.PI * 2 + Math.random() * 0.4, t0: performance.now(), c: i % 2 ? "#ffffff" : "#c9a8ff" });
		if (!raf) raf = requestAnimationFrame(draw);
	});
	function draw(now) {
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, innerWidth, innerHeight);
		sparks = sparks.filter((s) => now - s.t0 < 480);
		for (const s of sparks) {
			const t = (now - s.t0) / 480;
			const e = 1 - Math.pow(1 - t, 3);
			const d = 8 + 26 * e;
			const len = 12 * (1 - t);
			ctx.strokeStyle = s.c;
			ctx.lineWidth = 2;
			ctx.lineCap = "round";
			ctx.beginPath();
			ctx.moveTo(s.x + Math.cos(s.a) * d, s.y + Math.sin(s.a) * d);
			ctx.lineTo(s.x + Math.cos(s.a) * (d + len), s.y + Math.sin(s.a) * (d + len));
			ctx.stroke();
		}
		raf = sparks.length ? requestAnimationFrame(draw) : 0;
		if (!raf) ctx.clearRect(0, 0, innerWidth, innerHeight);
	}
}
