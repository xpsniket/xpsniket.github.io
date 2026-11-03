/* Rotating Text — cycles phrases with a per-letter 3D flip. */
export function RotatingText(el, { words, interval = 2600, stagger = 34 } = {}) {
	const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
	let i = 0;
	const pad = () => parseFloat(getComputedStyle(el).fontSize) * 0.6;

	function make(text) {
		const w = document.createElement("span");
		w.className = "rot-word";
		w.setAttribute("aria-hidden", "true");
		[...text].forEach((c) => {
			const s = document.createElement("span");
			s.className = "rot-ch";
			s.textContent = c === " " ? " " : c;
			w.appendChild(s);
		});
		return w;
	}

	el.textContent = "";
	const sr = document.createElement("span");
	sr.className = "sr-only";
	sr.textContent = words.join(", ");
	el.appendChild(sr);
	let cur = make(words[0]);
	el.appendChild(cur);
	const size = () => (el.style.width = cur.offsetWidth + pad() + "px");
	size();
	document.fonts?.ready.then(size);
	if (reduce) return;

	setInterval(() => {
		if (document.hidden) return;
		i = (i + 1) % words.length;
		const next = make(words[i]);
		el.appendChild(next);
		el.style.width = next.offsetWidth + pad() + "px";
		const out = cur;
		[...out.children].forEach((c, k) =>
			c.animate(
				[
					{ transform: "rotateX(0) translateY(0)", opacity: 1 },
					{ transform: "rotateX(-90deg) translateY(-45%)", opacity: 0 },
				],
				{ duration: 420, delay: k * stagger, easing: "cubic-bezier(.5,0,.75,0)", fill: "forwards" }
			)
		);
		[...next.children].forEach((c, k) =>
			c.animate(
				[
					{ transform: "rotateX(90deg) translateY(45%)", opacity: 0 },
					{ transform: "rotateX(0) translateY(0)", opacity: 1 },
				],
				{ duration: 560, delay: 180 + k * stagger, easing: "cubic-bezier(.22,1,.36,1)", fill: "both" }
			)
		);
		cur = next;
		setTimeout(() => out.remove(), 420 + out.children.length * stagger + 60);
	}, interval);
}
