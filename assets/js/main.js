/* Shared by every page: background, chrome (watcher + gooey nav), cursor,
   and the React Bits-style components used across the site. */
import { LineWaves } from "./linewaves.js";
import { TechText } from "./techtext.js";
import { RotatingText } from "./rotating.js";
import { TargetCursor } from "./cursor.js";
import { GooeyNav } from "./gooeynav.js";
import { Watcher } from "./watcher.js";
import { FadeContent } from "./fade.js";
import { Marquee } from "./marquee.js";
import { ScrollReveal, Decrypt } from "./textfx.js";
import { Spotlight, Tilt, ClickSpark } from "./touch.js";

const $ = (s) => document.querySelector(s);
const all = (s) => document.querySelectorAll(s);

const waves = $("#waves");
if (waves) LineWaves(waves);

const wt = $("#watcher");
if (wt) Watcher(wt);

const nav = $(".gnav");
if (nav) GooeyNav(nav);

const name = $("#hero-name");
if (name) TechText(name, { lines: ["Susobhan", "Pradhan"] });

const rot = $("#rot");
if (rot) RotatingText(rot, { words: ["stills", "portraits", "streets", "abstracts", "landscapes", "motion"] });

all("[data-marquee]").forEach((el) => Marquee(el, { speed: Number(el.dataset.speed) || 50, velocity: el.dataset.marquee === "velocity", pause: el.dataset.marquee === "loop" }));
all("[data-scroll-reveal]").forEach((el) => ScrollReveal(el));
all("[data-decrypt]").forEach((el) => Decrypt(el));

Spotlight();
Tilt();
const sparks = $("#sparks");
if (sparks) ClickSpark(sparks);

FadeContent();
TargetCursor();
