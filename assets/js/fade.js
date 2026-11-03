/* Fade Content — fades blocks in on scroll: plain rise, out-of-focus blur
   (default) or from washed-out gray (data-fade="gray"). */
export function FadeContent() {
	const els = [...document.querySelectorAll(".reveal, [data-fade]")];
	if (!("IntersectionObserver" in window)) return els.forEach((e) => e.classList.add("is-in"));
	const io = new IntersectionObserver(
		(entries) => {
			entries.forEach((en) => {
				if (!en.isIntersecting) return;
				en.target.classList.add("is-in");
				io.unobserve(en.target);
			});
		},
		{ threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
	);
	els.forEach((e) => io.observe(e));
}
