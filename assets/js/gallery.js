/* Gallery page: jelly-radio filter driving a springy masonry. */
import { Masonry } from "./masonry.js";
import { JellyRadio } from "./jelly.js";
import { PHOTOS } from "./photos.js";

document.getElementById("year").textContent = new Date().getFullYear();

const grid = document.getElementById("gallery-grid");
const count = document.getElementById("gallery-count");
const m = Masonry(grid, PHOTOS, { maxCols: 4, minCol: 250 });
const label = (n) => (count.textContent = `${n} photograph${n === 1 ? "" : "s"}`);
label(PHOTOS.length);

JellyRadio(document.getElementById("gallery-filter"), {
	onChange(v) {
		const pass = (p) => v === "all" || p.orient === v;
		m.filter(pass);
		label(PHOTOS.filter(pass).length);
	},
});
