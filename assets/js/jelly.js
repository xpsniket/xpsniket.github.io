/* Jelly Radio — a radio group of chips where the chosen one swells and
   barges its neighbours outward (padding/size spring in CSS). */
export function JellyRadio(group, { onChange } = {}) {
	const chips = [...group.querySelectorAll("button")];
	function select(i, focus) {
		chips.forEach((c, k) => {
			c.setAttribute("aria-checked", String(k === i));
			c.tabIndex = k === i ? 0 : -1;
		});
		const c = chips[i];
		c.classList.remove("pop");
		void c.offsetWidth;
		c.classList.add("pop");
		if (focus) c.focus();
		onChange && onChange(c.dataset.value);
	}
	chips.forEach((c, i) => c.addEventListener("click", () => select(i)));
	group.addEventListener("keydown", (e) => {
		const cur = chips.findIndex((c) => c.getAttribute("aria-checked") === "true");
		const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
		if (!d) return;
		e.preventDefault();
		select((cur + d + chips.length) % chips.length, true);
	});
	chips.forEach((c, k) => (c.tabIndex = c.getAttribute("aria-checked") === "true" ? 0 : -1));
}
