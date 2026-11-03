/* Photo list: file stem + intrinsic pixel size (so masonry can lay out
   before any image has loaded). `orient` is derived from the aspect ratio. */
const RAW = [
	["DOC-20250809-WA0027_", 1920, 2560],
	["1724753315832", 1920, 1280],
	["DOC-20250809-WA0004_", 1920, 640],
	["DOC-20250809-WA0002_", 1920, 1918],
	["DOC-20250809-WA0005_", 1920, 1919],
	["DOC-20250809-WA0006_", 1920, 2560],
	["DOC-20250809-WA0007_", 1920, 2560],
	["DOC-20250809-WA0009_", 1920, 3413],
	["DOC-20250809-WA0010_", 1920, 1440],
	["DOC-20250809-WA0011_", 1920, 1440],
	["DOC-20250809-WA0012_", 1920, 1080],
	["DOC-20250809-WA0013_", 1920, 2560],
	["DOC-20250809-WA0014_", 1920, 2560],
	["DOC-20250809-WA0015_", 1920, 2560],
	["DOC-20250809-WA0016_", 1920, 2560],
	["DOC-20250809-WA0017_", 1920, 1440],
	["DOC-20250809-WA0018_", 1920, 2075],
	["DOC-20250809-WA0019_", 1920, 2560],
	["DOC-20250809-WA0020_", 1920, 1440],
	["DOC-20250809-WA0021_", 1920, 2560],
	["DOC-20250809-WA0022_", 1920, 1440],
	["DOC-20250809-WA0023_", 1920, 1440],
	["DOC-20250809-WA0025_", 1920, 1970],
	["DOC-20250809-WA0026_", 1920, 1438],
	["DOC-20250809-WA0028_", 1920, 2560],
	["IMG_20231030_163512_1", 1920, 1438],
	["IMG_20240625_180812", 1920, 2560],
	["IMG20221019165758", 1920, 1080],
];

export const PHOTOS = RAW.map(([stem, w, h], i) => ({
	src: `images/${stem}.webp`,
	thumb: `images/thumbs/${stem}.webp`,
	w,
	h,
	alt: `Photograph ${i + 1} by Susobhan Pradhan`,
	orient: h / w > 1.2 ? "portrait" : w / h > 1.2 ? "landscape" : "square",
	stem,
}));

/* the handful shown on the home page */
const HOME = ["DOC-20250809-WA0027_", "1724753315832", "DOC-20250809-WA0022_", "IMG_20240625_180812", "DOC-20250809-WA0004_", "DOC-20250809-WA0006_", "DOC-20250809-WA0010_", "DOC-20250809-WA0013_", "DOC-20250809-WA0016_"];
export const HOME_PHOTOS = HOME.map((s) => PHOTOS.find((p) => p.stem === s));
