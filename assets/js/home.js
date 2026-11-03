/* Home-page only: masonry preview, AniList stats (with count-up), contact form. */
import { Masonry } from "./masonry.js";
import { HOME_PHOTOS } from "./photos.js";
import { countUp } from "./textfx.js";

const work = document.getElementById("work-grid");
if (work) Masonry(work, HOME_PHOTOS, { maxCols: 3, minCol: 300 });

document.getElementById("year").textContent = new Date().getFullYear();

// Discord Webhook Message
const WEBHOOK_URL = "https://discord.com/api/webhooks/1403638244620369982/O5eRNvAIhG51_WsDS_nxjF2YZ4dKo-eb3r2Alh9YCZbeAJUD_CiaiP2Co4DAM0QAB30H";

const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
if (contactForm) {
	contactForm.addEventListener("submit", async (e) => {
		e.preventDefault();
		formStatus.textContent = "";
		const data = new FormData(contactForm);
		const name = (data.get("name") || "Anonymous").toString().trim() || "Anonymous";
		const email = (data.get("email") || "").toString().trim();
		const message = (data.get("message") || "").toString().trim();
		if (!message) {
			formStatus.textContent = "Please enter a message.";
			formStatus.style.color = "#f87171";
			return;
		}
		if (!email) {
			formStatus.textContent = "Please enter a valid email.";
			formStatus.style.color = "#f87171";
			return;
		}
		formStatus.textContent = "Sending...";
		formStatus.style.color = "#fbbf24";
		const payload = {
			content: `New Contact From ${name} (${email})`,
			embeds: [
				{
					title: "Portfolio Contact",
					color: 0xffffff,
					fields: [
						{ name: "Name", value: name, inline: true },
						{ name: "Email", value: email, inline: false },
						{ name: "Message", value: message.length > 1024 ? message.slice(0, 1021) + "..." : message },
					],
					timestamp: new Date().toISOString(),
				},
			],
			allowed_mentions: { parse: [] },
		};
		try {
			const res = await fetch(WEBHOOK_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			if (!res.ok) throw new Error("Request failed");
			contactForm.reset();
			formStatus.textContent = "Message sent successfully.";
			formStatus.style.color = "#34d399";
		} catch (err) {
			formStatus.textContent = "Failed to send message!";
			formStatus.style.color = "#f87171";
		}
	});
}

// Fetch AniList data
async function fetchAniListData(username) {
	const query = `
	query ($name: String) {
		User(name: $name) {
			name
			siteUrl
			statistics { anime { count minutesWatched episodesWatched meanScore } }
			favourites { anime { nodes { title { english romaji } coverImage { large } siteUrl } } }
		}
	}`;
	try {
		const res = await fetch("https://graphql.anilist.co", {
			method: "POST",
			headers: { "Content-Type": "application/json", Accept: "application/json" },
			body: JSON.stringify({ query, variables: { name: username } }),
		});
		const { data } = await res.json();
		const u = data.User;
		const a = u.statistics.anime;

		document.getElementById("anilist-username").textContent = `@${u.name}`;
		document.getElementById("anilist-profile").href = u.siteUrl;
		countUp(document.getElementById("anime-count"), a.count);
		countUp(document.getElementById("mean-score"), a.meanScore, { decimals: 1 });
		countUp(document.getElementById("episodes-watched"), a.episodesWatched);
		countUp(document.getElementById("time-watched"), a.minutesWatched / 1440, { decimals: 1, suffix: " days" });

		const box = document.getElementById("favourites-gallery");
		box.textContent = "";
		u.favourites.anime.nodes.forEach((n) => {
			const title = n.title.english || n.title.romaji || "Anime";
			const link = document.createElement("a");
			link.className = "fav glare";
			link.href = n.siteUrl;
			link.target = "_blank";
			link.rel = "noopener";
			const img = document.createElement("img");
			img.src = n.coverImage.large;
			img.alt = title;
			img.loading = "lazy";
			const cap = document.createElement("span");
			cap.textContent = title;
			link.append(img, cap);
			box.appendChild(link);
		});
	} catch (err) {
		console.error("Error fetching AniList data:", err);
	}
}

fetchAniListData("xpsniket");
