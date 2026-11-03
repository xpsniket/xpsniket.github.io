/* Gooey Nav — the active pill breaks into goo that flows over to the item
   you pick: a fast "lead" blob and a slow "tail" blob, merged by an SVG
   goo filter, so a gooey neck stretches between old and new. */
export function GooeyNav(nav) {
	const links = [...nav.querySelectorAll("a[data-nav]")];
	const lead = nav.querySelector(".gnav-lead");
	const tail = nav.querySelector(".gnav-tail");
	let active = Math.max(
		0,
		links.findIndex((a) => a.getAttribute("aria-current"))
	);
	let lock = 0;

	function place(i, instant) {
		const a = links[i];
		if (instant) nav.classList.add("no-anim");
		for (const p of [lead, tail]) {
			p.style.transform = `translateX(${a.offsetLeft}px)`;
			p.style.width = a.offsetWidth + "px";
		}
		if (instant) {
			nav.offsetWidth; // flush so the jump is not animated
			nav.classList.remove("no-anim");
		}
		links.forEach((l, k) => {
			l.classList.toggle("on", k === i);
			k === i && l.dataset.nav !== "ext" ? l.setAttribute("aria-current", l.getAttribute("href").startsWith("#") ? "location" : "page") : l.removeAttribute("aria-current");
		});
		active = i;
	}

	links.forEach((a, i) =>
		a.addEventListener("click", () => {
			if (i === active) return;
			lock = performance.now() + 900;
			place(i);
		})
	);

	new ResizeObserver(() => place(active, true)).observe(nav);
	document.fonts?.ready.then(() => place(active, true));
	place(active, true);

	/* scroll-spy: sections map to a nav item via data-spy (or their own id) */
	const hashLinks = links.map((a) => (a.getAttribute("href").match(/^#(.+)/) || [])[1]);
	const sections = [...document.querySelectorAll("main > section[id], main section[id][data-spy]")];
	if (!sections.length || !hashLinks.some(Boolean)) return;
	let ticking = false;
	function spy() {
		ticking = false;
		if (performance.now() < lock) return;
		const line = innerHeight * 0.4;
		let cur = null;
		for (const s of sections) if (s.getBoundingClientRect().top <= line) cur = s;
		if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) cur = sections[sections.length - 1];
		if (!cur) return;
		const id = cur.dataset.spy || cur.id;
		const i = hashLinks.indexOf(id);
		if (i >= 0 && i !== active) place(i);
	}
	addEventListener(
		"scroll",
		() => {
			if (!ticking) {
				ticking = true;
				requestAnimationFrame(spy);
			}
		},
		{ passive: true }
	);
	spy();
}
