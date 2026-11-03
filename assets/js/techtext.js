/* Tech Text — a wordmark whose letters turn into dashed vector outlines
   under the cursor. One SVG <text> per line, one <tspan> per letter; each
   letter's fill/stroke opacity is eased by its distance to the pointer. */
const NS = "http://www.w3.org/2000/svg";

export async function TechText(host, { lines, fontSize = 200, radius = 190, lineGap = 0.92 } = {}) {
	const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
	const coarse = matchMedia("(pointer: coarse)").matches;

	const svg = document.createElementNS(NS, "svg");
	svg.setAttribute("class", "tt");
	svg.setAttribute("aria-hidden", "true");
	svg.setAttribute("viewBox", "0 0 1000 500");
	const texts = lines.map((line, li) => {
		const t = document.createElementNS(NS, "text");
		t.setAttribute("class", "tt-text");
		t.setAttribute("x", 0);
		t.setAttribute("y", fontSize * 0.85 + li * fontSize * lineGap);
		t.style.fontSize = fontSize + "px";
		[...line].forEach((ch) => {
			const s = document.createElementNS(NS, "tspan");
			s.textContent = ch;
			t.appendChild(s);
		});
		svg.appendChild(t);
		return t;
	});
	host.appendChild(svg);
	if (reduce) {
		fit();
		return;
	}

	try {
		await document.fonts.load(`800 ${fontSize}px "Bricolage Grotesque"`);
		await document.fonts.ready;
	} catch {}
	const bb = fit();

	function fit() {
		const b = svg.getBBox();
		const pad = 10;
		const top = fontSize * 0.2;
		const bottom = fontSize * 0.2;
		svg.setAttribute("viewBox", `${b.x - pad} ${b.y + top} ${b.width + pad * 2} ${b.height - top - bottom}`);
		return b;
	}
	if (reduce) return;

	/* glyph centres, in svg user units */
	const glyphs = [];
	texts.forEach((t) => {
		[...t.children].forEach((el, i) => {
			const r = t.getExtentOfChar(i);
			glyphs.push({ el, cx: r.x + r.width / 2, cy: r.y + r.height / 2, p: 0 });
		});
	});

	let px = null,
		py = null,
		raf = 0,
		visible = true,
		lastMove = 0;
	const t0 = performance.now();
	const vb = svg.viewBox.baseVal;

	window.addEventListener(
		"pointermove",
		(e) => {
			px = e.clientX;
			py = e.clientY;
			lastMove = performance.now();
			wake();
		},
		{ passive: true }
	);
	document.documentElement.addEventListener("pointerleave", () => {
		px = py = null;
		wake();
	});
	new IntersectionObserver(([e]) => {
		visible = e.isIntersecting;
		if (visible) wake();
	}).observe(host);
	document.addEventListener("visibilitychange", wake);

	function wake() {
		if (!raf && visible && !document.hidden) raf = requestAnimationFrame(tick);
	}

	function tick(now) {
		raf = 0;
		if (!visible || document.hidden) return;
		let x = null,
			y = null;
		const m = svg.getScreenCTM();
		if (m) {
			const inv = m.inverse();
			const idle = now - lastMove > 3200;
			const intro = now - t0 < 2600;
			if (px != null && !(coarse && idle)) {
				const pt = new DOMPoint(px, py).matrixTransform(inv);
				x = pt.x;
				y = pt.y;
			} else if (intro || (coarse && idle)) {
				/* a virtual cursor sweeps the word: once on load, and forever on touch */
				const s = intro ? (now - t0) / 2600 : (now / 5200) % 1;
				const u = intro ? s : 0.5 - 0.5 * Math.cos(s * Math.PI * 2);
				x = vb.x + vb.width * (-0.05 + 1.1 * u);
				y = vb.y + vb.height * (0.5 + 0.28 * Math.sin(u * 9));
			}
		}
		let busy = x != null;
		for (const g of glyphs) {
			let target = 0;
			if (x != null) {
				const d = Math.hypot(x - g.cx, y - g.cy);
				const k = Math.max(0, 1 - d / radius);
				target = k * k * (3 - 2 * k);
			}
			g.p += (target - g.p) * 0.16;
			if (Math.abs(g.p - target) < 0.002) g.p = target;
			if (g.p > 0) busy = true;
			g.el.style.fillOpacity = (1 - g.p).toFixed(3);
			g.el.style.strokeOpacity = Math.min(1, g.p * 1.8).toFixed(3);
		}
		const off = (-now / 45) % 18;
		texts.forEach((t) => (t.style.strokeDashoffset = off));
		if (busy) raf = requestAnimationFrame(tick);
	}
	wake();
}
