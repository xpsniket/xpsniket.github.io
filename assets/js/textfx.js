/* Text effects: Scroll Reveal (words unblur as you scroll), Decrypted Text
   (glyphs cycle before resolving) and Count Up (odometer-style number). */
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export function ScrollReveal(el) {
	const words = el.textContent.trim().split(/\s+/);
	el.setAttribute("aria-label", words.join(" "));
	el.textContent = "";
	const spans = words.map((w) => {
		const s = document.createElement("span");
		s.className = "sr-w";
		s.setAttribute("aria-hidden", "true");
		s.textContent = w;
		el.append(s, " ");
		return s;
	});
	if (reduce) return;
	let queued = false;
	function update() {
		queued = false;
		const r = el.getBoundingClientRect();
		if (r.bottom < -200 || r.top > innerHeight + 200) return;
		const p = clamp((innerHeight * 0.88 - r.top) / (r.height + innerHeight * 0.25), 0, 1);
		const n = spans.length;
		spans.forEach((s, i) => {
			const k = clamp((p * (n + 4) - i) / 4, 0, 1);
			s.style.opacity = (0.16 + 0.84 * k).toFixed(2);
		});
	}
	addEventListener(
		"scroll",
		() => {
			if (!queued) {
				queued = true;
				requestAnimationFrame(update);
			}
		},
		{ passive: true }
	);
	addEventListener("resize", update);
	update();
}

export function Decrypt(el, { duration = 750 } = {}) {
	const final = el.textContent;
	if (reduce) return;
	const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+<>/";
	let done = false;
	const io = new IntersectionObserver(([e]) => {
		if (!e.isIntersecting || done) return;
		done = true;
		io.disconnect();
		el.setAttribute("aria-label", final);
		const t0 = performance.now();
		(function step(now) {
			const t = (now - t0) / duration;
			el.textContent = [...final].map((c, i) => (c === " " || t >= (i + 1) / final.length ? c : glyphs[(Math.random() * glyphs.length) | 0])).join("");
			if (t < 1) requestAnimationFrame(step);
			else el.textContent = final;
		})(t0);
	});
	io.observe(el);
}

export function countUp(el, to, { decimals = 0, suffix = "", duration = 1500 } = {}) {
	const fmt = (v) => v.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
	if (reduce) return (el.textContent = fmt(to));
	const run = () => {
		const t0 = performance.now();
		(function step(now) {
			const t = clamp((now - t0) / duration, 0, 1);
			const e = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
			el.textContent = fmt(to * e);
			if (t < 1) requestAnimationFrame(step);
		})(t0);
	};
	const io = new IntersectionObserver(([e]) => {
		if (!e.isIntersecting) return;
		io.disconnect();
		run();
	});
	io.observe(el);
}
