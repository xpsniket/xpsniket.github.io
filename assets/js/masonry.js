/* Masonry — springs into place, reflows as it resizes, filters with a spring,
   and opens images in a lightbox. Items are absolutely positioned from the
   known aspect ratios, so layout never waits on image loads. */
export function Masonry(el, items, { gap = 14, minCol = 260, maxCols = 4 } = {}) {
	el.classList.add("mas", "init");
	const lb = Lightbox();
	const nodes = items.map((it, i) => {
		const a = document.createElement("a");
		a.className = "mas-item";
		a.href = it.src;
		a.dataset.cursorLabel = "View";
		a.setAttribute("aria-label", it.alt || "Open photograph");
		const img = document.createElement("img");
		img.src = it.thumb || it.src;
		img.alt = it.alt || "";
		img.width = it.w;
		img.height = it.h;
		img.loading = "lazy";
		img.decoding = "async";
		const done = () => img.classList.add("loaded");
		img.complete && img.naturalWidth ? done() : img.addEventListener("load", done);
		a.appendChild(img);
		el.appendChild(a);
		const n = { el: a, it, show: true, entered: false, x: 0, y: 0, cw: 0, ch: 0 };
		a.addEventListener("click", (e) => {
			e.preventDefault();
			const vis = nodes.filter((m) => m.show);
			lb.open(
				vis.map((m) => m.it),
				vis.indexOf(n)
			);
		});
		return n;
	});

	function apply(n) {
		const e = n.el;
		e.style.width = n.cw + "px";
		e.style.height = n.ch + "px";
		const shown = n.show && n.entered;
		const y = n.entered || !n.show ? n.y : n.y + 70;
		e.style.transform = `translate(${n.x}px,${y}px) scale(${shown ? 1 : n.show ? 0.94 : 0.6})`;
		e.style.opacity = shown ? 1 : 0;
		e.dataset.hidden = n.show ? "" : "1";
		e.tabIndex = n.show ? 0 : -1;
		e.setAttribute("aria-hidden", n.show ? "false" : "true");
	}

	function layout() {
		const W = el.clientWidth;
		if (!W) return;
		const cols = Math.max(2, Math.min(maxCols, Math.floor((W + gap) / (minCol + gap))));
		const cw = (W - gap * (cols - 1)) / cols;
		const hs = new Array(cols).fill(0);
		nodes.forEach((n) => {
			n.cw = cw;
			n.ch = (cw * n.it.h) / n.it.w;
			if (n.show) {
				const c = hs.indexOf(Math.min(...hs));
				n.x = c * (cw + gap);
				n.y = hs[c];
				hs[c] += n.ch + gap;
			}
			apply(n);
		});
		el.style.height = Math.max(0, Math.max(...hs) - gap) + "px";
	}

	let queued = 0;
	new ResizeObserver(() => {
		cancelAnimationFrame(queued);
		queued = requestAnimationFrame(layout);
	}).observe(el);
	layout();
	requestAnimationFrame(() => requestAnimationFrame(() => el.classList.remove("init")));

	/* spring in as items scroll into view */
	const io = new IntersectionObserver(
		(entries) => {
			let k = 0;
			entries
				.filter((e) => e.isIntersecting)
				.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
				.forEach((e) => {
					const n = nodes.find((m) => m.el === e.target);
					io.unobserve(e.target);
					if (n.entered) return;
					n.entered = true;
					n.el.style.transitionDelay = k++ * 70 + "ms";
					apply(n);
					setTimeout(() => (n.el.style.transitionDelay = ""), 1100 + k * 70);
				});
		},
		{ rootMargin: "0px 0px -6% 0px", threshold: 0.05 }
	);
	nodes.forEach((n) => io.observe(n.el));

	return {
		filter(fn) {
			let k = 0;
			nodes.forEach((n) => {
				n.show = fn(n.it);
				if (n.show) {
					n.entered = true;
					n.el.style.transitionDelay = k++ * 35 + "ms";
				}
			});
			layout();
			setTimeout(() => nodes.forEach((n) => (n.el.style.transitionDelay = "")), 1000 + k * 35);
		},
	};
}

export function Lightbox() {
	let list = [],
		i = 0,
		opener = null;
	const root = document.createElement("div");
	root.className = "lb";
	root.setAttribute("role", "dialog");
	root.setAttribute("aria-modal", "true");
	root.setAttribute("aria-label", "Image preview");
	root.innerHTML = `<img alt="" /><button class="lb-x" aria-label="Close">Close</button><button class="lb-prev" aria-label="Previous">←</button><button class="lb-next" aria-label="Next">→</button><div class="lb-count"></div>`;
	document.body.appendChild(root);
	const img = root.querySelector("img");
	const count = root.querySelector(".lb-count");

	function show() {
		img.src = list[i].src;
		img.alt = list[i].alt || "";
		count.textContent = `${i + 1} / ${list.length}`;
		[list[(i + 1) % list.length], list[(i - 1 + list.length) % list.length]].forEach((it) => (new Image().src = it.src));
	}
	function close() {
		root.removeAttribute("data-open");
		opener && opener.focus && opener.focus();
	}
	const step = (d) => {
		i = (i + d + list.length) % list.length;
		show();
	};
	root.querySelector(".lb-x").addEventListener("click", close);
	root.querySelector(".lb-prev").addEventListener("click", () => step(-1));
	root.querySelector(".lb-next").addEventListener("click", () => step(1));
	root.addEventListener("click", (e) => e.target === root && close());
	addEventListener("keydown", (e) => {
		if (!root.hasAttribute("data-open")) return;
		if (e.key === "Escape") close();
		if (e.key === "ArrowRight") step(1);
		if (e.key === "ArrowLeft") step(-1);
	});
	return {
		open(items, index) {
			list = items;
			i = Math.max(0, index);
			opener = document.activeElement;
			show();
			root.setAttribute("data-open", "");
			root.querySelector(".lb-x").focus();
		},
	};
}
