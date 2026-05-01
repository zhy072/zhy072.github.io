const pad = (value) => String(value).padStart(2, "0");

const weekNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const detailMap = {
  home: ["Home Navigation", "This can become a full hub for posts, projects, about, links, and recommendations."],
  gallery: ["Homepage Artwork", "Replace assets/image1.jpg with your own illustration, photo, or visual identity."],
  message: ["Message", "This can become a comment system, a form service, or stay as an email-based message page."],
  all: ["All Sections", "Use this page for a sitemap, archives, and tags."],
  now: ["Current Time", "This card comes from the live clock and can expand into a timeline or daily log."],
  about: ["About Me", "Use this page for your bio, experience, skills, and contact links."],
  projects: ["Projects", "Use this page for projects, papers, open-source repos, and coursework."],
  site: ["About This Site", "Use this page for the tech stack, changelog, and design notes."],
  calendar: ["Calendar", "Use this page for schedules, learning logs, or update history."],
  latest: ["Latest Post", "Turn this into a post list or connect it to your blog generator."],
  recommend: ["Random Pick", "Use this page for notes, books, tools, courses, and favorite articles."],
  links: ["Blogroll", "Use this page for friends, technical blogs, and sites you read often."],
  music: ["Music", "Use this page for playlists, currently playing tracks, or favorite albums."],
  likes: ["Likes", "Use this page for bookmarks, inspirations, and useful links."],
};

const greetingSlots = [
  { end: 5, title: "Past Midnight", copy: "The night is still here. Take it slow." },
  { end: 7, title: "Early Morning", copy: "A quiet start to a new day." },
  { end: 11, title: "Good Morning", copy: "Hope your day starts smoothly." },
  { end: 13, title: "Good Noon", copy: "Remember to take a proper lunch break." },
  { end: 17, title: "Good Afternoon", copy: "I'm Zhili, Nice to meet you!" },
  { end: 19, title: "Good Evening", copy: "Thanks for stopping by after a long day." },
  { end: 22, title: "Good Night", copy: "Welcome in. Stay as long as you like." },
  { end: 24, title: "Late Night", copy: "Do not forget to get some rest." },
];

const specialGreetings = [
  { hour: 0, minute: 0, title: "Midnight Reset", copy: "A new date just opened." },
  { hour: 3, minute: 14, title: "Pi Minute", copy: "3.14 quietly passed through." },
  { hour: 5, minute: 20, title: "5:20", copy: "A small reminder to be gentle with life." },
  { hour: 11, minute: 11, title: "11:11", copy: "Make a tiny wish." },
  { hour: 12, minute: 34, title: "12:34", copy: "The digits lined up for a second." },
  { hour: 23, minute: 59, title: "See You Tomorrow", copy: "Even the last minute counts." },
];

const audioTracks = [
  { title: "Close To You", src: "assets/music/close-to-you.mp3" },
  { title: "Song 1", src: "assets/music/song1.mp3" },
  { title: "Song 2", src: "assets/music/song2.mp3" },
];

const greetingSeed = Math.random();

function updateClock() {
  const target = document.querySelector("#clockTime");
  if (!target) return;

  const now = new Date();
  target.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function updateGreeting() {
  const title = document.querySelector("#greetingTitle");
  const copy = document.querySelector("#greetingCopy");
  if (!title || !copy) return;

  const now = new Date();
  const special = specialGreetings.find(
    (item) => item.hour === now.getHours() && item.minute === now.getMinutes()
  );
  const randomSpark =
    now.getMinutes() === 7 && greetingSeed < 0.32
      ? { title: "Minute Seven", copy: "You found a hidden greeting." }
      : null;
  const slot = greetingSlots.find((item) => now.getHours() < item.end);
  const greeting = special || randomSpark || slot || greetingSlots[greetingSlots.length - 1];

  title.textContent = greeting.title;
  copy.textContent = greeting.copy;
}

function renderCalendar() {
  const grid = document.querySelector("#calendarGrid");
  const title = document.querySelector("#calendarTitle");
  if (!grid || !title) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const startOffset = (first.getDay() + 6) % 7;

  title.textContent = `${year}/${month + 1}/${today} ${weekNames[now.getDay()]}`;
  grid.replaceChildren();

  labels.forEach((label) => {
    const cell = document.createElement("span");
    cell.className = "weekday";
    cell.textContent = label;
    grid.appendChild(cell);
  });

  for (let index = 0; index < startOffset; index += 1) {
    grid.appendChild(document.createElement("span"));
  }

  for (let day = 1; day <= days; day += 1) {
    const cell = document.createElement("span");
    cell.textContent = day;
    if (day === today) cell.className = "today";
    grid.appendChild(cell);
  }
}

function renderDetailPage() {
  const title = document.querySelector("#detailTitle");
  const copy = document.querySelector("#detailCopy");
  if (!title || !copy) return;

  const params = new URLSearchParams(window.location.search);
  const view = params.get("view") || "home";
  const [nextTitle, nextCopy] = detailMap[view] || detailMap.home;

  title.textContent = nextTitle;
  copy.textContent = nextCopy;
  document.title = `${nextTitle} | Zhili Yang`;
}

function initMenuHover() {
  document.querySelectorAll(".menu-item").forEach((item) => {
    item.addEventListener("pointerenter", () => item.classList.add("is-hovered"));
    item.addEventListener("pointerleave", () => item.classList.remove("is-hovered"));
    item.addEventListener("focus", () => item.classList.add("is-hovered"));
    item.addEventListener("blur", () => item.classList.remove("is-hovered"));
  });
}

function initMusicPlayer() {
  const audio = document.querySelector("#siteAudio");
  const card = document.querySelector("#musicCard");
  const toggle = document.querySelector("#playToggle");
  const title = document.querySelector("#trackTitle");
  const progress = document.querySelector("#musicProgress");
  if (!audio || !card || !toggle || !title || !progress) return;

  let currentTrack = null;

  const pickTrack = () => {
    if (audioTracks.length === 1) return audioTracks[0];
    const available = audioTracks.filter((track) => track.src !== currentTrack?.src);
    return available[Math.floor(Math.random() * available.length)];
  };

  const setTrack = (track) => {
    currentTrack = track;
    audio.src = track.src;
    audio.volume = 0.62;
    title.textContent = track.title;
    progress.style.width = "0%";
  };

  const setPlaying = (isPlaying) => {
    card.classList.toggle("is-playing", isPlaying);
    toggle.setAttribute("aria-label", isPlaying ? "Pause" : "Play");
  };

  const play = () => {
    audio
      .play()
      .then(() => {
        setPlaying(true);
        title.textContent = currentTrack.title;
      })
      .catch(() => {
        setPlaying(false);
        title.textContent = audio.error ? "Add songs to assets/music" : `${currentTrack.title} · Click to play`;
      });
  };

  const togglePlayback = () => {
    if (audio.paused) {
      play();
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    togglePlayback();
  });

  card.addEventListener("click", (event) => {
    if (event.target.closest("button")) return;
    togglePlayback();
  });

  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    progress.style.width = `${Math.min((audio.currentTime / audio.duration) * 100, 100)}%`;
  });

  audio.addEventListener("ended", () => {
    setTrack(pickTrack());
    play();
  });

  audio.addEventListener("error", () => {
    setPlaying(false);
    progress.style.width = "0%";
    title.textContent = "Add songs to assets/music";
  });

  setTrack(pickTrack());
  play();
}

function initMessageForm() {
  const form = document.querySelector("#messageForm");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.querySelector("#messageName").value.trim();
    const contact = document.querySelector("#messageContact").value.trim();
    const message = document.querySelector("#messageBody").value.trim();
    if (!message) return;

    const body = [
      "Message from the personal website:",
      "",
      `Name: ${name || "Not provided"}`,
      `Contact: ${contact || "Not provided"}`,
      "",
      message,
    ].join("\n");

    window.location.href = `mailto:zhy072@ucsd.edu?subject=${encodeURIComponent(
      "Personal website message"
    )}&body=${encodeURIComponent(body)}`;
  });
}

renderCalendar();
renderDetailPage();
updateClock();
updateGreeting();
initMenuHover();
initMusicPlayer();
initMessageForm();
window.setInterval(updateClock, 1000);
window.setInterval(updateGreeting, 60 * 1000);
