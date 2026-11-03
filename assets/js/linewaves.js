/* Line Waves — fine diagonal lines that flow in silky waves while a band of
   light drifts through them. Canvas 2D, batched into alpha buckets. */
export function LineWaves(canvas, { angle = -24, spacing = 16, step = 38, fps = 24, scale = 0.6 } = {}) {
	const ctx = canvas.getContext("2d");
	const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
	const BUCKETS = 9;
	const theta = (angle * Math.PI) / 180;
	let w = 0,
		h = 0,
		dpr = 1,
		raf = 0,
		last = 0;

	function resize() {
		dpr = scale; /* faded background: render small, let CSS stretch it */
		w = canvas.clientWidth;
		h = canvas.clientHeight;
		canvas.width = Math.round(w * dpr);
		canvas.height = Math.round(h * dpr);
		draw(performance.now());
	}

	function wave(u, v, t) {
		return 22 * Math.sin(u * 0.0042 + v * 0.0021 + t * 0.55) + 12 * Math.sin(u * 0.0095 - v * 0.003 - t * 0.35);
	}

	function draw(now) {
		const t = now / 1000;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.globalCompositeOperation = "source-over";
		ctx.clearRect(0, 0, w, h);
		ctx.save();
		ctx.translate(w / 2, h / 2);
		ctx.rotate(theta);
		const D = Math.hypot(w, h) / 2 + 40;
		const range = D * 2;
		/* the drifting band of light, in the rotated across-line axis */
		const band = ((t * 55) % (range + 600)) - D - 300;
		const bandW = 260;
		const paths = Array.from({ length: BUCKETS }, () => new Path2D());

		for (let v = -D; v <= D; v += spacing) {
			let px = -D,
				py = v + wave(-D, v, t);
			for (let u = -D + step; u <= D + step; u += step) {
				const y = v + wave(u, v, t);
				const mx = (u + px) / 2;
				const my = (y + py) / 2;
				const s = my + mx * 0.18;
				const k = (s - band) / bandW;
				let a = 0.16 + 0.84 * Math.exp(-k * k) + 0.12 * Math.sin(mx * 0.006 + v * 0.01 + t * 0.4);
				a = a < 0 ? 0 : a > 1 ? 1 : a;
				const b = Math.min(BUCKETS - 1, (a * BUCKETS) | 0);
				paths[b].moveTo(px, py);
				paths[b].lineTo(u, y);
				px = u;
				py = y;
			}
		}
		ctx.lineWidth = 1.3;
		ctx.lineCap = "round";
		for (let i = 0; i < BUCKETS; i++) {
			ctx.strokeStyle = `rgba(255,255,255,${(((i + 0.5) / BUCKETS) ** 1.4).toFixed(3)})`;
			ctx.stroke(paths[i]);
		}
		ctx.restore();
		/* fade toward the bottom, baked in so the browser needs no mask layer */
		ctx.globalCompositeOperation = "destination-in";
		const g = ctx.createLinearGradient(0, 0, 0, h);
		g.addColorStop(0, "rgba(0,0,0,1)");
		g.addColorStop(0.55, "rgba(0,0,0,.55)");
		g.addColorStop(1, "rgba(0,0,0,.18)");
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, w, h);
	}

	function loop(now) {
		raf = requestAnimationFrame(loop);
		if (now - last < 1000 / fps) return;
		last = now;
		draw(now);
	}
	function start() {
		if (!raf && !reduce && !document.hidden) raf = requestAnimationFrame(loop);
	}
	function stop() {
		cancelAnimationFrame(raf);
		raf = 0;
	}

	new ResizeObserver(resize).observe(canvas);
	document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
	resize();
	start();
}
