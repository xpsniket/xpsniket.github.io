/* Scroll Velocity / Logo Loop — an endless strip. With `velocity` its speed
   (and direction) follows how fast you scroll; with `pause` it eases to a
   stop on hover. */
export function Marquee(el, { speed = 50, velocity = false, pause = false } = {}) {
	const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
	const track = el.firstElementChild;
	const base = [...track.children];
	let setW = 0;

	function build() {
		[...track.children].slice(base.length).forEach((c) => c.remove());
		const need = Math.ceil((el.clientWidth * 2) / Math.max(1, track.scrollWidth)) + 1;
		for (let i = 0; i < need; i++)
			base.forEach((b) => {
				const c = b.cloneNode(true);
				c.setAttribute("aria-hidden", "true");
				track.appendChild(c);
			});
		setW = track.children[base.length] ? track.children[base.length].offsetLeft : track.scrollWidth;
	}
	build();
	new ResizeObserver(build).observe(el);
	document.fonts?.ready.then(build);
	if (reduce) return;

	let x = 0,
		dir = -1,
		boost = 0,
		hover = 1,
		hovering = false,
		last = performance.now(),
		lastY = scrollY,
		visible = true,
		raf = 0;
	if (pause) {
		el.addEventListener("pointerenter", () => (hovering = true));
		el.addEventListener("pointerleave", () => (hovering = false));
	}
	new IntersectionObserver(([e]) => {
		visible = e.isIntersecting;
		if (visible && !raf) raf = requestAnimationFrame(tick);
	}).observe(el);

	function tick(now) {
		raf = 0;
		if (!visible || document.hidden) return;
		const dt = Math.min(50, now - last) / 1000;
		last = now;
		const dy = scrollY - lastY;
		lastY = scrollY;
		if (velocity) {
			boost += ((Math.abs(dy) / Math.max(dt, 0.008)) * 0.35 - boost) * 0.12;
			if (Math.abs(dy) > 1) dir = dy > 0 ? -1 : 1;
		}
		hover += ((hovering ? 0 : 1) - hover) * 0.1;
		x += dir * (speed + boost) * hover * dt;
		if (setW) {
			if (x <= -setW) x += setW;
			if (x > 0) x -= setW;
		}
		track.style.transform = `translate3d(${x}px,0,0)`;
		raf = requestAnimationFrame(tick);
	}
	raf = requestAnimationFrame(tick);
	document.addEventListener("visibilitychange", () => {
		if (!raf && !document.hidden) {
			last = performance.now();
			raf = requestAnimationFrame(tick);
		}
	});
}
