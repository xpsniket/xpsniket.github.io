/* Target Cursor.
   Normal system cursor everywhere. Over anything interactive the cursor is
   replaced by four corner brackets that snap around that object, matching
   its size and corner radius. Fine pointers only. */
export function TargetCursor({ selector = "a, button, input, textarea, select, summary, [data-cursor]", pad = 8 } = {}) {
	if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
	const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

	const root = document.createElement("div");
	root.className = "tc";
	const corners = ["tl", "tr", "br", "bl"].map((c) => {
		const e = document.createElement("i");
		e.className = "tc-c " + c;
		root.appendChild(e);
		return e;
	});
	const label = document.createElement("div");
	label.className = "tc-label";
	document.body.append(root, label);
	document.documentElement.classList.add("has-tc");

	let mx = 0,
		my = 0,
		cx = 0,
		cy = 0,
		w = 24,
		h = 24,
		target = null,
		tRad = 8,
		size = 12,
		raf = 0,
		settle = 0;

	function pick(node) {
		const t = node && node.closest ? node.closest(selector) : null;
		return t && t.dataset.cursor !== "off" ? t : null;
	}
	function setTarget(t) {
		if (t === target) return;
		const was = target;
		target = t;
		root.classList.toggle("snap", !!t);
		if (t) {
			/* open out from the pointer when arriving from empty space */
			if (!was) {
				cx = mx;
				cy = my;
				w = h = 22;
			}
			const r = t.getBoundingClientRect();
			const br = parseFloat(getComputedStyle(t).borderTopLeftRadius) || 0;
			tRad = Math.min(br + pad, Math.min(r.width, r.height) / 2 + pad);
			size = Math.max(10, Math.min(tRad * 0.75, 15)); /* short arcs, like the reference */
			root.style.setProperty("--s", size + "px");
			root.style.setProperty("--r", Math.min(tRad, size) + "px");
			const text = t.dataset.cursorLabel || "";
			label.textContent = text;
			label.classList.toggle("show", !!text);
			kick();
		} else {
			label.classList.remove("show");
		}
	}
	const refresh = () => setTarget(pick(document.elementFromPoint(mx, my)));

	addEventListener(
		"pointermove",
		(e) => {
			mx = e.clientX;
			my = e.clientY;
			setTarget(pick(e.target));
		},
		{ passive: true }
	);
	addEventListener("pointerdown", () => root.classList.add("press"));
	addEventListener("pointerup", () => root.classList.remove("press"));
	document.documentElement.addEventListener("pointerleave", () => setTarget(null));
	/* re-check what is under a still pointer once scrolling / clicking settles */
	const later = (ms) => {
		clearTimeout(settle);
		settle = setTimeout(refresh, ms);
	};
	addEventListener("scroll", () => later(120), { passive: true });
	for (const ev of ["click", "keyup"]) addEventListener(ev, () => later(80));

	function kick() {
		if (!raf) raf = requestAnimationFrame(frame);
	}

	function frame() {
		raf = 0;
		if (!target) return;
		if (!target.isConnected) return setTarget(null);
		const r = target.getBoundingClientRect();
		const tx = r.left + r.width / 2;
		const ty = r.top + r.height / 2;
		const tw = r.width + pad * 2;
		const th = r.height + pad * 2;
		const k = reduce ? 1 : 0.3;
		cx += (tx - cx) * k;
		cy += (ty - cy) * k;
		w += (tw - w) * k;
		h += (th - h) * k;

		const hw = w / 2,
			hh = h / 2,
			s = size;
		corners[0].style.transform = `translate(${cx - hw}px,${cy - hh}px)`;
		corners[1].style.transform = `translate(${cx + hw - s}px,${cy - hh}px)`;
		corners[2].style.transform = `translate(${cx + hw - s}px,${cy + hh - s}px)`;
		corners[3].style.transform = `translate(${cx - hw}px,${cy + hh - s}px)`;
		label.style.transform = `translate(${cx - hw}px,${cy - hh - 24}px)`;
		raf = requestAnimationFrame(frame); /* keeps following while the page scrolls */
	}
}
