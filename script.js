const pad = (value) => String(value).padStart(2, "0");

const weekNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const content = { projects: [], blogroll: [] };
const projectIndexPath = "projects/index.json";
const blogrollPath = "blogroll.json";
const galleryPhotosPath = "assets/gallery/photos.json";
const galleryDiscordUrl = "https://discord.com/";
const leafletAssets = {
  css: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  js: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
};
const commentsConfig = {
  repo: "zhy072/zhy072.github.io",
  issuePrefix: "post:",
  label: "post-comment",
  theme: "github-light",
};

const detailMap = {
  home: ["Home Navigation", "This is the hub for posts, projects, recommendations, links, and notes."],
  gallery: ["Homepage Artwork", "Replace assets/image1.jpg with your own illustration, photo, or visual identity."],
  message: ["Message", "This can become a comment system, a form service, or stay as an email-based message page."],
  now: ["Current Time", "This card comes from the live clock and can expand into a timeline or daily log."],
  about: ["About Me", "Use this page for your bio, experience, skills, and contact links."],
  site: ["About This Site", "Use this page for the tech stack, changelog, and design notes."],
  calendar: ["Calendar", "Use this page for schedules, learning logs, or update history."],
  quote: ["Daily Note", ""],
};

const greetingSlots = [
  { end: 5, title: "Past Midnight", copy: "The night is still here. Take it slow." },
  { end: 7, title: "Early Morning", copy: "A quiet start to a new day." },
  { end: 11, title: "Good Morning", copy: "Hope your day starts smoothly." },
  { end: 13, title: "Good Noon", copy: "Remember to take a proper lunch break." },
  { end: 18, title: "Good Afternoon", copy: "I'm Zhili, Nice to meet you!" },
  { end: 22, title: "Good Evening", copy: "Thanks for stopping by after a long day." },
  { end: 23, title: "Good Night", copy: "Welcome in. Stay as long as you like." },
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

const quotes = [
  {
    id: "upright-path",
    translation: "Neither lured by praise nor cowed by slander; walk the path and keep myself upright.",
    original: "不诱于誉，不恐于诽，率道而行，端然正己。",
    source: "---from DeepSeek-V4",
  },
  {
    id: "kirakiller",
    translation: "The careless, up-and-down state of things is a hit right now. When feeling down, that's when moving forward. This up-and-down growth still feels like it's not quite enough. I want to be filled with the taste of standing at the very top of the bottom.",
    original: 'ぞんざいでアップダウンな現状が今ヒット中 落ち込んでる方が 進めるセオリー Upダウンな成長が いまひとつ 底辺のてっぺんの味で 満たされたいわ\n粗糙又起伏不定的现状, 此刻正大受欢迎。“越是低落，越能前进”——这就是我的理论。作为创作者还欠缺的东西, 就用这差到极点的品味来弥补吧。',
    source: "---綺羅キラー",
  },
  {
    id: "emotion",
    translation: "Emotions stem from impulse.",
    original: "感情源于冲动",
    source: "",
  },
];

const calendarHolidayRanges = [
  { start: "2026-01-01", end: "2026-01-03", type: "cn", region: "China", name: "New Year's Day / 元旦" },
  { start: "2026-02-15", end: "2026-02-23", type: "cn", region: "China", name: "Spring Festival / 春节" },
  { start: "2026-04-04", end: "2026-04-06", type: "cn", region: "China", name: "Qingming Festival / 清明节" },
  { start: "2026-05-01", end: "2026-05-05", type: "cn", region: "China", name: "Labor Day / 劳动节" },
  { start: "2026-06-19", end: "2026-06-21", type: "cn", region: "China", name: "Dragon Boat Festival / 端午节" },
  { start: "2026-09-25", end: "2026-09-27", type: "cn", region: "China", name: "Mid-Autumn Festival / 中秋节" },
  { start: "2026-10-01", end: "2026-10-07", type: "cn", region: "China", name: "National Day / 国庆节" },
  { start: "2026-01-01", type: "us", region: "United States", name: "New Year's Day" },
  { start: "2026-01-19", type: "us", region: "United States", name: "Birthday of Martin Luther King, Jr." },
  { start: "2026-02-16", type: "us", region: "United States", name: "Washington's Birthday" },
  { start: "2026-05-25", type: "us", region: "United States", name: "Memorial Day" },
  { start: "2026-06-19", type: "us", region: "United States", name: "Juneteenth National Independence Day" },
  { start: "2026-07-03", type: "us", region: "United States", name: "Independence Day" },
  { start: "2026-09-07", type: "us", region: "United States", name: "Labor Day" },
  { start: "2026-10-12", type: "us", region: "United States", name: "Columbus Day" },
  { start: "2026-11-11", type: "us", region: "United States", name: "Veterans Day" },
  { start: "2026-11-26", type: "us", region: "United States", name: "Thanksgiving Day" },
  { start: "2026-12-25", type: "us", region: "United States", name: "Christmas Day" },
];

const calendarHolidays = calendarHolidayRanges.flatMap((holiday) =>
  expandHolidayRange(holiday.start, holiday.end || holiday.start).map((date) => ({ ...holiday, date }))
);

const galleryLocationMap = {
  "SanDiego-CA-US": { label: "San Diego, CA, United States", lat: 32.7157, lng: -117.1611 },
  "LaJolla-CA-US": { label: "La Jolla, CA, United States", lat: 32.8328, lng: -117.2713 },
  "LosAngeles-CA-US": { label: "Los Angeles, CA, United States", lat: 34.0522, lng: -118.2437 },
  "Irvine-CA-US": { label: "Irvine, CA, United States", lat: 33.6846, lng: -117.8265 },
  "Seattle-WA-US": { label: "Seattle, WA, United States", lat: 47.6062, lng: -122.3321 },
  "Tokyo-JP": { label: "Tokyo, Japan", lat: 35.6762, lng: 139.6503 },
  "Shanghai-CN": { label: "Shanghai, China", lat: 31.2304, lng: 121.4737 },
};
const galleryRegionAliases = {
  CA: ["California"],
  WA: ["Washington"],
};
const galleryCountryAliases = {
  CN: ["China"],
  JP: ["Japan"],
  US: ["United States", "USA", "America"],
};

const galleryFallbackPhotos = [{ src: "assets/image1.jpg", alt: "Life photo", location: "SanDiego-CA-US" }];
let leafletLoadPromise = null;

const greetingSeed = Math.random();

function expandHolidayRange(startKey, endKey) {
  const [startYear, startMonth, startDay] = startKey.split("-").map(Number);
  const [endYear, endMonth, endDay] = endKey.split("-").map(Number);
  const date = new Date(startYear, startMonth - 1, startDay);
  const end = new Date(endYear, endMonth - 1, endDay);
  const dates = [];

  while (date <= end) {
    dates.push(`${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`);
    date.setDate(date.getDate() + 1);
  }

  return dates;
}

function isStarred(post) {
  return post.star === true || post.starred === true || post.star === "true" || post.starred === "true";
}

function getProjects() {
  return Array.isArray(content.projects) ? content.projects : [];
}

function getBlogroll() {
  return Array.isArray(content.blogroll) ? content.blogroll : [];
}

function getProjectSections(project) {
  return Array.isArray(project.sections) ? project.sections : [];
}

function getProjectPosts(project) {
  const directPosts = Array.isArray(project.posts) ? project.posts : [];
  const sectionPosts = getProjectSections(project).flatMap((section) => {
    const posts = Array.isArray(section.posts) ? section.posts : [];
    return posts.map((post) => ({
      ...post,
      sectionId: post.sectionId || section.id,
      sectionTitle: post.sectionTitle || section.title || section.id,
      sectionSummary: post.sectionSummary || section.summary || "",
    }));
  });

  return [...directPosts, ...sectionPosts];
}

function getAllPosts() {
  return getProjects().flatMap((project) => {
    const posts = getProjectPosts(project);
    return posts.map((post) => ({
      ...post,
      projectId: project.id,
      projectTitle: project.title,
      projectSummary: project.summary,
      starred: isStarred(post),
    }));
  });
}

function getPostTimestamp(post) {
  const value = post?.publishedAt || "";
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function sortPostsByDate(posts) {
  return [...posts].sort((left, right) => {
    const dateOrder = getPostTimestamp(right) - getPostTimestamp(left);
    if (dateOrder !== 0) return dateOrder;
    return String(left.title || "").localeCompare(String(right.title || ""));
  });
}

function getPostsByDate() {
  return sortPostsByDate(getAllPosts());
}

function getPostById(id) {
  return getAllPosts().find((post) => post.id === id);
}

function getDateKey(value) {
  if (!value) return "";

  const dateOnly = String(value).split("T")[0];
  const match = dateOnly.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) return `${match[1]}-${pad(Number(match[2]))}-${pad(Number(match[3]))}`;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function getPostsByDateKey(dateKey) {
  return getPostsByDate().filter((post) => getDateKey(post.publishedAt) === dateKey);
}

function getHolidayEntries(dateKey) {
  return calendarHolidays.filter((holiday) => holiday.date === dateKey);
}

function formatDate(value) {
  if (!value) return "Undated";

  const dateOnly = String(value).split("T")[0];
  const match = dateOnly.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) return `${match[1]}/${Number(match[2])}/${Number(match[3])}`;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}`;
}

function getProjectAnchor(projectId) {
  return `project-${String(projectId || "").replace(/[^A-Za-z0-9_-]/g, "-")}`;
}

function getProjectSectionAnchor(projectId, sectionId) {
  return `${getProjectAnchor(projectId)}-section-${String(sectionId || "").replace(/[^A-Za-z0-9_-]/g, "-")}`;
}

function getPostHref(post, source = {}) {
  const params = new URLSearchParams({ view: "post", id: post.id });
  if (source.from) params.set("from", source.from);
  if (source.projectId) params.set("project", source.projectId);
  if (source.sectionId) params.set("section", source.sectionId);
  if (source.date) params.set("date", source.date);
  return `detail.html?${params.toString()}`;
}

function getProjectHref(projectId, sectionId) {
  const anchor = sectionId ? getProjectSectionAnchor(projectId, sectionId) : getProjectAnchor(projectId);
  return `detail.html?view=projects#${anchor}`;
}

function getRandomPost(posts) {
  if (!posts.length) return null;

  try {
    const lastPostId = window.localStorage.getItem("lastRandomPostId");
    const pool = posts.length > 1 ? posts.filter((post) => post.id !== lastPostId) : posts;
    const candidates = pool.length ? pool : posts;
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    window.localStorage.setItem("lastRandomPostId", pick.id);
    return pick;
  } catch {
    return posts[Math.floor(Math.random() * posts.length)];
  }
}

function getQuoteById(id) {
  return quotes.find((quote) => quote.id === id) || null;
}

function getRandomQuote() {
  return quotes[Math.floor(Math.random() * quotes.length)] || null;
}

function shuffleItems(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function normalizeGalleryPhoto(photo) {
  if (typeof photo === "string") return { src: photo, alt: "Life photo" };
  return {
    src: photo?.src || "",
    alt: photo?.alt || "Life photo",
    caption: photo?.caption || "",
    location: photo?.location || "",
    lat: Number(photo?.lat),
    lng: Number(photo?.lng),
  };
}

async function loadGalleryPhotos() {
  const loadedPhotos = await fetchJson(galleryPhotosPath, galleryFallbackPhotos);
  const photos = (Array.isArray(loadedPhotos) ? loadedPhotos : [])
    .map(normalizeGalleryPhoto)
    .filter((photo) => photo.src);
  return photos.length ? photos : galleryFallbackPhotos;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getGalleryLocation(photo) {
  const mapped = galleryLocationMap[photo.location];
  if (mapped) return { key: photo.location, ...mapped };

  if (Number.isFinite(photo.lat) && Number.isFinite(photo.lng)) {
    return {
      key: photo.location || `${photo.lat},${photo.lng}`,
      label: photo.location || "Pinned location",
      lat: photo.lat,
      lng: photo.lng,
    };
  }

  return null;
}

function getGalleryLocationGroups(photos) {
  const groups = new Map();

  photos.forEach((photo) => {
    const location = getGalleryLocation(photo);
    if (!location) return;

    if (!groups.has(location.key)) {
      groups.set(location.key, { ...location, photos: [] });
    }
    groups.get(location.key).photos.push(photo);
  });

  return [...groups.values()].map((group) => ({
    ...group,
    representative: shuffleItems(group.photos)[0],
  }));
}

function wrapLongitudeNear(longitude, baseLongitude) {
  let wrappedLongitude = longitude;
  while (wrappedLongitude - baseLongitude > 180) wrappedLongitude -= 360;
  while (wrappedLongitude - baseLongitude < -180) wrappedLongitude += 360;
  return wrappedLongitude;
}

function getPhotoMapDisplayGroups(groups) {
  const baseLongitude = groups[0]?.lng ?? 0;
  return groups.map((group) => ({
    ...group,
    mapLng: wrapLongitudeNear(group.lng, baseLongitude),
  }));
}

function getPhotoMapPoint(group) {
  return [group.lat, Number.isFinite(group.mapLng) ? group.mapLng : group.lng];
}

function getPhotoMapPointNear(group, baseLongitude) {
  return [group.lat, wrapLongitudeNear(group.lng, baseLongitude)];
}

function getClosestPhotoMarker(markers, map, key) {
  const markerCopies = markers.get(key);
  if (!Array.isArray(markerCopies) || !markerCopies.length) return null;

  const centerLongitude = map.getCenter().lng;
  return markerCopies.reduce((closest, marker) => {
    const currentDistance = Math.abs(marker.getLatLng().lng - centerLongitude);
    const closestDistance = Math.abs(closest.getLatLng().lng - centerLongitude);
    return currentDistance < closestDistance ? marker : closest;
  }, markerCopies[0]);
}

function loadStylesheet(href) {
  if (document.querySelector(`link[href="${href}"]`)) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.addEventListener("load", resolve, { once: true });
    link.addEventListener("error", reject, { once: true });
    document.head.appendChild(link);
  });
}

function loadScript(src) {
  if (document.querySelector(`script[src="${src}"]`)) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.addEventListener("load", resolve, { once: true });
    script.addEventListener("error", reject, { once: true });
    document.head.appendChild(script);
  });
}

function ensureLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  leafletLoadPromise =
    leafletLoadPromise ||
    Promise.all([loadStylesheet(leafletAssets.css), loadScript(leafletAssets.js)]).then(() => {
      if (!window.L) throw new Error("Leaflet did not initialize.");
      return window.L;
    });
  return leafletLoadPromise;
}

async function geocodeLocation(query) {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return null;

  const params = new URLSearchParams({
    format: "jsonv2",
    limit: "1",
    q: trimmedQuery,
  });
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`);
  if (!response.ok) return null;

  const results = await response.json();
  return Array.isArray(results) ? results[0] || null : null;
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

async function fetchJson(path, fallback) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Unable to load ${path}`);
    return await response.json();
  } catch {
    return fallback;
  }
}

async function fetchText(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Unable to load ${path}`);
  return response.text();
}

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: markdown.trim() };

  const data = {};
  match[1].split("\n").forEach((line) => {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) return;

    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();
    data[key] = parseFrontmatterValue(rawValue);
  });

  return { data, body: match[2].trim() };
}

function parseFrontmatterValue(value) {
  if (value === "true") return true;
  if (value === "false") return false;

  if (value.startsWith("[") && value.endsWith("]")) {
    return value
      .slice(1, -1)
      .split(",")
      .map((item) => stripQuotes(item.trim()))
      .filter(Boolean);
  }

  return stripQuotes(value);
}

function stripQuotes(value) {
  return value.replace(/^["']|["']$/g, "");
}

function getPostIdFromPath(path) {
  const fileName = path.split("/").pop() || "";
  return fileName.replace(/\.md$/i, "");
}

function getPostPath(project, postFile, section) {
  const cleanPostFile = String(postFile || "").replace(/^\/+/, "");
  const parts = ["projects", project.id];
  if (section?.id) parts.push(section.id);
  parts.push(cleanPostFile);
  return parts.filter(Boolean).join("/");
}

function slugifyPostId(value) {
  return String(value || "")
    .trim()
    .replace(/\.md$/i, "")
    .replace(/[^A-Za-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getDefaultPostId(project, postFile, section) {
  const baseId = getPostIdFromPath(postFile);
  if (!section?.id) return slugifyPostId(baseId);
  return slugifyPostId(`${project.id}-${section.id}-${baseId}`);
}

async function loadPost(project, postFile, section) {
  const path = getPostPath(project, postFile, section);
  const markdown = await fetchText(path);
  const parsed = parseFrontmatter(markdown);
  const id = parsed.data.id || getDefaultPostId(project, postFile, section);

  return {
    id,
    path,
    title: parsed.data.title || id,
    excerpt: parsed.data.excerpt || "",
    publishedAt: parsed.data.publishedAt || "",
    star: isStarred(parsed.data),
    tags: Array.isArray(parsed.data.tags) ? parsed.data.tags : [],
    markdown: parsed.body,
    projectId: project.id,
    projectTitle: project.title,
    projectSummary: project.summary,
    sectionId: section?.id || "",
    sectionTitle: section?.title || section?.id || "",
    sectionSummary: section?.summary || "",
    starred: isStarred(parsed.data),
  };
}

async function loadPostOrNull(project, postFile, section) {
  try {
    return await loadPost(project, postFile, section);
  } catch (error) {
    console.warn(`Unable to load post: ${getPostPath(project, postFile, section)}`, error);
    return null;
  }
}

async function loadContent() {
  const index = await fetchJson(projectIndexPath, { projects: [] });
  const projects = Array.isArray(index.projects) ? index.projects : [];

  const loadedProjects = await Promise.all(
    projects.map(async (project) => {
      const postFiles = Array.isArray(project.posts) ? project.posts : [];
      const sectionItems = Array.isArray(project.sections) ? project.sections : [];
      const posts = await Promise.all(
        postFiles.map((postFile) => loadPostOrNull(project, postFile))
      );
      const sections = await Promise.all(
        sectionItems.map(async (section) => {
          const sectionPostFiles = Array.isArray(section.posts) ? section.posts : [];
          const sectionPosts = await Promise.all(
            sectionPostFiles.map((postFile) => loadPostOrNull(project, postFile, section))
          );

          return {
            ...section,
            posts: sectionPosts.filter(Boolean),
          };
        })
      );

      return {
        ...project,
        posts: posts.filter(Boolean),
        sections,
      };
    })
  );

  content.projects = loadedProjects;
  content.blogroll = await fetchJson(blogrollPath, []);
}

function getPostIssueTerm(post) {
  return `${commentsConfig.issuePrefix}${post.id}`;
}

function getPostIdFromIssue(issue) {
  const title = String(issue?.title || "");
  return title.startsWith(commentsConfig.issuePrefix)
    ? title.slice(commentsConfig.issuePrefix.length)
    : "";
}

function getGitHubApiBase() {
  return `https://api.github.com/repos/${commentsConfig.repo}`;
}

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
  const postsByDate = getAllPosts().reduce((result, post) => {
    const dateKey = getDateKey(post.publishedAt);
    if (!dateKey) return result;
    result[dateKey] = result[dateKey] || [];
    result[dateKey].push(post);
    return result;
  }, {});

  title.textContent = `${year}/${month + 1}/${today} ${weekNames[now.getDay()]}`;
  grid.replaceChildren();

  labels.forEach((label) => {
    const cell = document.createElement("span");
    cell.className = "weekday";
    cell.textContent = label;
    grid.appendChild(cell);
  });

  for (let index = 0; index < startOffset; index += 1) {
    const empty = document.createElement("span");
    empty.className = "calendar-empty";
    grid.appendChild(empty);
  }

  for (let day = 1; day <= days; day += 1) {
    const dateKey = `${year}-${pad(month + 1)}-${pad(day)}`;
    const dayPosts = postsByDate[dateKey] || [];
    const holidays = getHolidayEntries(dateKey);
    const hasPosts = dayPosts.length > 0;
    const hasHolidays = holidays.length > 0;
    const isClickable = hasPosts || hasHolidays;
    const cell = document.createElement(isClickable ? "a" : "span");
    const classes = ["calendar-day", day < 10 ? "day-single" : "day-double"];
    const number = createElement("span", "calendar-number", day);

    if (day === today) classes.push("today");
    if (isClickable) {
      classes.push("is-clickable");
      cell.href = `detail.html?view=day&date=${dateKey}`;
    }
    if (hasPosts) {
      classes.push("has-posts", `post-level-${Math.min(dayPosts.length, 3)}`);
      cell.dataset.count = String(dayPosts.length);
    }
    if (holidays.some((holiday) => holiday.type === "cn")) classes.push("holiday-cn");
    if (holidays.some((holiday) => holiday.type === "us")) classes.push("holiday-us");
    if (holidays.some((holiday) => holiday.type === "cn") && holidays.some((holiday) => holiday.type === "us")) {
      classes.push("holiday-both");
    }

    const titleParts = [
      ...holidays.map((holiday) => `${holiday.region}: ${holiday.name}`),
      ...dayPosts.map((post) => post.title || "Untitled"),
    ];
    if (titleParts.length) cell.title = titleParts.join(" / ");

    const ariaParts = [];
    if (holidays.length) ariaParts.push(holidays.map((holiday) => holiday.name).join(", "));
    if (dayPosts.length) ariaParts.push(`${dayPosts.length} post${dayPosts.length > 1 ? "s" : ""}`);
    if (ariaParts.length) cell.setAttribute("aria-label", `${formatDate(dateKey)}: ${ariaParts.join("; ")}`);

    if (hasPosts) number.appendChild(createElement("span", "calendar-post-dot"));
    cell.className = classes.join(" ");
    cell.appendChild(number);
    grid.appendChild(cell);
  }
}

function fillHomePostCard(prefix, post) {
  const card = document.querySelector(`#${prefix}PostCard`);
  const title = document.querySelector(`#${prefix}PostTitle`);
  const excerpt = document.querySelector(`#${prefix}PostExcerpt`);
  const date = document.querySelector(`#${prefix}PostDate`);
  if (!card || !title || !excerpt || !date || !post) return;

  card.href = getPostHref(post, { from: "home" });
  title.textContent = post.title || "Untitled";
  excerpt.textContent = post.excerpt || "";
  date.dateTime = post.publishedAt || "";
  date.textContent = formatDate(post.publishedAt);
}

function renderHomePosts() {
  const posts = getPostsByDate();
  fillHomePostCard("latest", posts[0]);
  fillHomePostCard("random", getRandomPost(posts));
}

function renderHomeQuote() {
  const card = document.querySelector(".quote-card");
  const text = document.querySelector("#quoteText");
  if (!card || !text) return;

  const quote = getRandomQuote();
  if (!quote) return;

  text.textContent = quote.translation;
  card.href = `detail.html?view=quote&id=${encodeURIComponent(quote.id)}`;
}

function resetDetail(titleText, options = {}) {
  const title = document.querySelector("#detailTitle");
  const contentTarget = document.querySelector("#detailContent");
  const card = document.querySelector(".detail-card");
  const shell = document.querySelector(".detail-shell");
  if (!title || !contentTarget) return null;

  closeGalleryLightbox();
  title.textContent = titleText;
  contentTarget.className = "detail-content";
  contentTarget.replaceChildren();
  card?.classList.remove("gallery-detail-card");
  card?.classList.remove("gallery-map-card");
  shell?.classList.remove("gallery-detail-shell");
  shell?.classList.remove("gallery-map-shell");
  card?.classList.toggle("detail-wide", Boolean(options.wide));
  if (options.gallery) {
    card?.classList.add("gallery-detail-card");
    shell?.classList.add("gallery-detail-shell");
  }
  if (options.galleryMap) {
    card?.classList.add("gallery-map-card");
    shell?.classList.add("gallery-map-shell");
  }
  document.title = `${titleText} | Zhili Yang`;
  return contentTarget;
}

function renderEmpty(contentTarget, message) {
  contentTarget.appendChild(createElement("p", "empty-copy", message));
}

function createPostListItem(post, source = {}) {
  const link = createElement("a", "post-list-item");
  link.href = getPostHref(post, source);

  const eyebrow = createElement("p", "post-eyebrow");
  const locationParts = [post.projectTitle || "Project", post.sectionTitle].filter(Boolean);
  eyebrow.textContent = `${locationParts.join(" / ")} / ${formatDate(post.publishedAt)}`;

  const title = createElement("h2", "", post.title || "Untitled");
  const excerpt = createElement("p", "post-excerpt", post.excerpt || "");

  const footer = createElement("div", "post-footer");
  const time = createElement("time", "", formatDate(post.publishedAt));
  time.dateTime = post.publishedAt || "";
  footer.appendChild(time);

  if (post.starred) {
    footer.appendChild(createElement("span", "post-star", "Starred"));
  }

  link.append(eyebrow, title, excerpt, footer);
  return link;
}

function renderPostList(title, posts, emptyMessage, source = {}) {
  const contentTarget = resetDetail(title, { wide: true });
  if (!contentTarget) return;

  if (!posts.length) {
    renderEmpty(contentTarget, emptyMessage);
    return;
  }

  const list = createElement("div", "post-list");
  posts.forEach((post) => list.appendChild(createPostListItem(post, source)));
  contentTarget.appendChild(list);
}

function renderProjects() {
  const contentTarget = resetDetail("Projects", { wide: true });
  if (!contentTarget) return;

  const projects = getProjects();
  if (!projects.length) {
    renderEmpty(contentTarget, "No projects yet.");
    return;
  }

  const list = createElement("div", "project-list");
  projects.forEach((project) => {
    const section = createElement("section", "project-folder");
    section.id = getProjectAnchor(project.id);
    const heading = createElement("div", "project-heading");
    heading.append(
      createElement("span", "folder-mark", "/"),
      createElement("h2", "", project.title || "Untitled Project")
    );
    section.appendChild(heading);

    if (project.summary) section.appendChild(createElement("p", "project-summary", project.summary));

    const posts = Array.isArray(project.posts) ? project.posts : [];
    if (posts.length) {
      const nested = createElement("div", "project-posts");
      sortPostsByDate(posts).forEach((post) =>
        nested.appendChild(createPostListItem(post, { from: "projects", projectId: project.id }))
      );
      section.appendChild(nested);
    }

    const folders = getProjectSections(project);
    folders.forEach((folder) => {
      const folderSection = createElement("section", "project-subfolder");
      folderSection.id = getProjectSectionAnchor(project.id, folder.id);

      const folderHeading = createElement("div", "project-subheading");
      folderHeading.append(
        createElement("span", "subfolder-mark", "/"),
        createElement("h3", "", folder.title || folder.id || "Untitled Folder")
      );
      folderSection.appendChild(folderHeading);

      if (folder.summary) folderSection.appendChild(createElement("p", "project-summary", folder.summary));

      const folderPosts = Array.isArray(folder.posts) ? folder.posts : [];
      const nested = createElement("div", "project-posts");
      sortPostsByDate(folderPosts).forEach((post) =>
        nested.appendChild(
          createPostListItem(post, { from: "projects", projectId: project.id, sectionId: folder.id })
        )
      );

      if (!folderPosts.length) nested.appendChild(createElement("p", "empty-copy", "No posts in this folder yet."));
      folderSection.appendChild(nested);
      section.appendChild(folderSection);
    });

    if (!posts.length && !folders.length) {
      section.appendChild(createElement("p", "empty-copy", "No posts in this project yet."));
    }

    list.appendChild(section);
  });

  contentTarget.appendChild(list);
  scrollToHashTarget();
}

function renderBlogroll() {
  const contentTarget = resetDetail("Blogroll", { wide: true });
  if (!contentTarget) return;

  const links = getBlogroll();
  if (!links.length) {
    renderEmpty(contentTarget, "No links yet.");
    return;
  }

  const grouped = links.reduce((result, link) => {
    const key = link.category || "Links";
    result[key] = result[key] || [];
    result[key].push(link);
    return result;
  }, {});

  const wrapper = createElement("div", "blogroll-list");
  Object.entries(grouped).forEach(([category, items]) => {
    const section = createElement("section", "blogroll-group");
    section.appendChild(createElement("h2", "", category));

    const grid = createElement("div", "blogroll-grid");
    items.forEach((item) => {
      const link = createElement("a", "blogroll-item");
      link.href = item.url;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.append(
        createElement("h3", "", item.title || item.url),
        createElement("p", "", item.description || item.url)
      );
      grid.appendChild(link);
    });

    section.appendChild(grid);
    wrapper.appendChild(section);
  });

  contentTarget.appendChild(wrapper);
}

function scrollToHashTarget() {
  const hash = window.location.hash;
  if (!hash || !document.getElementById) return;

  const target = document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!target) return;

  window.setTimeout(() => {
    target.scrollIntoView({ block: "start" });
  }, 0);
}

function renderOverview() {
  const contentTarget = resetDetail("All Sections", { wide: true });
  if (!contentTarget) return;

  const sections = [
    ["Recent Posts", "Latest writing across every project.", "detail.html?view=latest"],
    ["Projects", "Foldered notes, logs, and coursework.", "detail.html?view=projects"],
    ["Recommendations", "Favorite notes and posts.", "detail.html?view=recommend"],
    ["Blogroll", "External sites and reading links.", "detail.html?view=links"],
  ];

  const list = createElement("div", "section-grid");
  sections.forEach(([sectionTitle, copy, href]) => {
    const link = createElement("a", "section-card");
    link.href = href;
    link.append(createElement("h2", "", sectionTitle), createElement("p", "", copy));
    list.appendChild(link);
  });

  contentTarget.appendChild(list);
}

function renderDayPosts(dateKey) {
  const posts = getPostsByDateKey(dateKey);
  const holidays = getHolidayEntries(dateKey);
  const title = dateKey ? `Calendar / ${formatDate(dateKey)}` : "Calendar";
  const contentTarget = resetDetail(title, { wide: true });
  if (!contentTarget) return;

  if (holidays.length) {
    const panel = createElement("section", "holiday-panel");

    holidays.forEach((holiday) => {
      const item = createElement("article", `holiday-item holiday-${holiday.type}`);
      item.append(
        createElement("span", `holiday-badge ${holiday.type}`, holiday.region),
        createElement("h2", "", holiday.name),
        createElement("p", "", `${holiday.region} holiday on ${formatDate(dateKey)}.`)
      );
      panel.appendChild(item);
    });

    contentTarget.appendChild(panel);
  }

  if (!posts.length) {
    contentTarget.appendChild(createElement("p", "empty-copy", "No posts on this date."));
    return;
  }

  const list = createElement("div", "post-list");
  posts.forEach((post) => {
    list.appendChild(createPostListItem(post, { from: "calendar", date: dateKey }));
  });
  contentTarget.appendChild(list);
}

function renderMarkdown(markdown) {
  const body = createElement("div", "post-body");
  const lines = String(markdown || "").split("\n");
  let paragraph = [];
  let list = null;
  let codeBlock = null;
  let codeLanguage = "";

  const flushParagraph = () => {
    if (!paragraph.length) return;
    body.appendChild(createElement("p", "", paragraph.join(" ").trim()));
    paragraph = [];
  };

  const flushList = () => {
    if (!list) return;
    body.appendChild(list);
    list = null;
  };

  const flushCodeBlock = () => {
    if (!codeBlock) return;
    const pre = document.createElement("pre");
    const code = document.createElement("code");
    const rawCode = codeBlock.join("\n");
    const language = normalizeCodeLanguage(codeLanguage, rawCode);
    const copyButton = createElement("button", "code-copy-button");
    const copyIcon = createElement("span", "code-copy-icon");
    copyIcon.append(createElement("span", "code-copy-back"), createElement("span", "code-copy-front"));

    copyButton.type = "button";
    copyButton.title = "Copy code";
    copyButton.setAttribute("aria-label", "Copy code");
    copyButton.appendChild(copyIcon);
    copyButton.addEventListener("click", () => copyCodeToClipboard(rawCode, copyButton));

    pre.className = "code-block";
    if (language) pre.dataset.language = language;
    code.className = language ? `language-${language}` : "";
    code.innerHTML = highlightCode(rawCode, language);
    pre.append(copyButton, code);
    body.appendChild(pre);
    codeBlock = null;
    codeLanguage = "";
  };

  lines.forEach((line) => {
    if (line.trim().startsWith("```")) {
      if (codeBlock) {
        flushCodeBlock();
      } else {
        flushParagraph();
        flushList();
        codeLanguage = line.trim().slice(3).trim().split(/\s+/)[0] || "";
        codeBlock = [];
      }
      return;
    }

    if (codeBlock) {
      codeBlock.push(line);
      return;
    }

    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }

    const headingMatch = trimmed.match(/^(#{2,4})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      const level = Math.min(headingMatch[1].length, 4);
      body.appendChild(createElement(`h${level}`, "", headingMatch[2]));
      return;
    }

    const listMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (listMatch) {
      flushParagraph();
      if (!list) list = document.createElement("ul");
      list.appendChild(createElement("li", "", listMatch[1]));
      return;
    }

    paragraph.push(trimmed);
  });

  flushParagraph();
  flushList();
  flushCodeBlock();

  if (!body.children.length) {
    body.appendChild(createElement("p", "", "No content yet."));
  }

  return body;
}

function normalizeCodeLanguage(language, code) {
  const normalized = String(language || "").toLowerCase();
  if (["py", "python"].includes(normalized)) return "python";
  if (["js", "javascript", "jsx", "ts", "typescript", "tsx"].includes(normalized)) return "javascript";
  if (["json"].includes(normalized)) return "json";
  if (["css"].includes(normalized)) return "css";
  if (["html", "xml", "svg"].includes(normalized)) return "html";

  if (/^\s*(import|from|class|def)\s/m.test(code)) return "python";
  if (/^\s*(const|let|var|function|import|export)\s/m.test(code)) return "javascript";
  return normalized;
}

async function copyCodeToClipboard(code, button) {
  try {
    await navigator.clipboard.writeText(code);
    setCopyButtonState(button, true);
  } catch {
    const copied = copyCodeWithFallback(code);
    setCopyButtonState(button, copied);
  }
}

function copyCodeWithFallback(code) {
  const textarea = document.createElement("textarea");
  textarea.value = code;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }

  textarea.remove();
  return copied;
}

function setCopyButtonState(button, copied) {
  button.classList.toggle("is-copied", copied);
  button.classList.toggle("is-failed", !copied);
  button.title = copied ? "Copied" : "Copy failed";
  button.setAttribute("aria-label", copied ? "Copied" : "Copy failed");
  window.setTimeout(() => {
    button.classList.remove("is-copied", "is-failed");
    button.title = "Copy code";
    button.setAttribute("aria-label", "Copy code");
  }, 1400);
}

function highlightCode(code, language) {
  const grammar = getCodeGrammar(language);
  if (!grammar) return escapeHtml(code);

  const tokens = [];
  let rest = code;

  while (rest) {
    let matched = false;
    for (const rule of grammar) {
      rule.regex.lastIndex = 0;
      const match = rule.regex.exec(rest);
      if (!match) continue;

      tokens.push({
        type: rule.type,
        value: match[0],
      });
      rest = rest.slice(match[0].length);
      matched = true;
      break;
    }

    if (!matched) {
      tokens.push({ type: "", value: rest[0] });
      rest = rest.slice(1);
    }
  }

  return tokens
    .map((token) => {
      const escaped = escapeHtml(token.value);
      return token.type ? `<span class="tok-${token.type}">${escaped}</span>` : escaped;
    })
    .join("");
}

function getCodeGrammar(language) {
  const common = {
    string: /^(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/,
    number: /^\b\d+(?:\.\d+)?\b/,
  };

  if (language === "python") {
    return [
      { type: "comment", regex: /^#[^\n]*/ },
      { type: "string", regex: /^(?:"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/ },
      { type: "keyword", regex: /^\b(?:and|as|assert|async|await|break|class|continue|def|del|elif|else|except|False|finally|for|from|if|import|in|is|lambda|None|nonlocal|not|or|pass|raise|return|True|try|while|with|yield)\b/ },
      { type: "self", regex: /^\bself\b/ },
      { type: "builtin", regex: /^\b(?:bool|dict|enumerate|float|int|len|list|map|max|min|print|range|set|str|sum|super|tuple|zip)\b/ },
      { type: "type", regex: /^\b[A-Z]\w*(?=\s*(?:\(|:))/ },
      { type: "function", regex: /^\b[A-Za-z_]\w*(?=\s*\()/ },
      { type: "number", regex: common.number },
    ];
  }

  if (language === "javascript") {
    return [
      { type: "comment", regex: /^(?:\/\/[^\n]*|\/\*[\s\S]*?\*\/)/ },
      { type: "string", regex: /^(?:`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/ },
      { type: "keyword", regex: /^\b(?:async|await|break|case|catch|class|const|continue|default|else|export|extends|false|finally|for|from|function|if|import|in|let|new|null|return|switch|this|throw|true|try|typeof|undefined|var|while)\b/ },
      { type: "function", regex: /^\b[A-Za-z_$][\w$]*(?=\s*\()/ },
      { type: "number", regex: common.number },
    ];
  }

  if (language === "json") {
    return [
      { type: "string", regex: /^"(?:\\.|[^"\\])*"(?=\s*:)/ },
      { type: "value", regex: /^"(?:\\.|[^"\\])*"/ },
      { type: "keyword", regex: /^\b(?:true|false|null)\b/ },
      { type: "number", regex: /^-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i },
    ];
  }

  if (language === "css") {
    return [
      { type: "comment", regex: /^\/\*[\s\S]*?\*\// },
      { type: "string", regex: common.string },
      { type: "keyword", regex: /^[@.#]?[A-Za-z_-][\w-]*(?=\s*[:{,])/ },
      { type: "number", regex: /^\b\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|s|ms)?\b/ },
    ];
  }

  if (language === "html") {
    return [
      { type: "comment", regex: /^<!--[\s\S]*?-->/ },
      { type: "keyword", regex: /^<\/?[A-Za-z][\w:-]*/ },
      { type: "string", regex: common.string },
      { type: "function", regex: /^\b[A-Za-z_:][\w:.-]*(?==)/ },
    ];
  }

  return null;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderPostDetail(post) {
  const contentTarget = resetDetail(post?.title || "Post Not Found", { wide: true });
  if (!contentTarget) return;

  if (!post) {
    renderEmpty(contentTarget, "This post does not exist.");
    return;
  }

  const meta = createElement("p", "post-detail-meta");
  const locationParts = [post.projectTitle || "Project", post.sectionTitle].filter(Boolean);
  meta.textContent = `${locationParts.join(" / ")} / ${formatDate(post.publishedAt)}`;
  contentTarget.appendChild(meta);

  if (post.excerpt) contentTarget.appendChild(createElement("p", "post-detail-excerpt", post.excerpt));

  contentTarget.appendChild(renderMarkdown(post.markdown));

  if (Array.isArray(post.tags) && post.tags.length) {
    const tags = createElement("div", "tag-row");
    post.tags.forEach((tag) => tags.appendChild(createElement("span", "", tag)));
    contentTarget.appendChild(tags);
  }

  contentTarget.appendChild(createPostMessagePanel(post));
}

function createMessageItem(message) {
  const item = createElement("article", "message-item");
  const header = createElement("div", "message-header");
  const name = createElement("strong", "", `@${message.user?.login || "github-user"}`);
  const time = createElement("time", "", formatDateTime(message.created_at || message.updated_at));
  time.dateTime = message.created_at || message.updated_at || "";
  header.append(name, time);

  const body = createElement("p", "message-body", message.body || "");
  item.append(header, body);

  const postLine = createElement("p", "message-post");

  if (message.post) {
    const postLink = createElement("a", "", `Post / ${message.post.title}`);
    postLink.href = getPostHref(message.post, { from: "messages" });
    postLine.appendChild(postLink);
  } else {
    postLine.appendChild(createElement("span", "", "Post / Missing post"));
  }

  if (message.issue?.html_url) {
    postLine.appendChild(createElement("span", "", " / "));
    const issueLink = createElement("a", "", `GitHub Issue #${message.issue.number}`);
    issueLink.href = message.issue.html_url;
    issueLink.target = "_blank";
    issueLink.rel = "noreferrer";
    postLine.appendChild(issueLink);
  }

  item.appendChild(postLine);
  return item;
}

function createPostMessagePanel(post) {
  const panel = createElement("section", "post-message-panel utterances-panel");
  panel.appendChild(createElement("h2", "", "Messages"));

  const mount = createElement("div", "utterances-mount");
  const script = document.createElement("script");
  script.src = "https://utteranc.es/client.js";
  script.async = true;
  script.crossOrigin = "anonymous";
  script.setAttribute("data-repo", commentsConfig.repo);
  script.setAttribute("data-issue-term", getPostIssueTerm(post));
  script.setAttribute("data-label", commentsConfig.label);
  script.setAttribute("data-theme", commentsConfig.theme);
  mount.appendChild(script);
  panel.appendChild(mount);
  return panel;
}

async function fetchPostIssues() {
  const response = await fetch(`${getGitHubApiBase()}/issues?state=open&sort=updated&direction=desc&per_page=100`, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!response.ok) throw new Error("Unable to load GitHub issues.");

  const issues = await response.json();
  if (!Array.isArray(issues)) return [];

  return issues.filter((issue) => !issue.pull_request && getPostIdFromIssue(issue));
}

async function fetchIssueComments(issue) {
  const separator = issue.comments_url.includes("?") ? "&" : "?";
  const response = await fetch(`${issue.comments_url}${separator}per_page=100`, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!response.ok) return [];

  const comments = await response.json();
  if (!Array.isArray(comments)) return [];

  const post = getPostById(getPostIdFromIssue(issue));
  return comments.map((comment) => ({ ...comment, issue, post }));
}

async function renderMessagePage() {
  const list = document.querySelector("#messageList");
  if (!list) return;

  list.replaceChildren();
  renderEmpty(list, "Loading GitHub messages...");
  document.title = "Messages | Zhili Yang";

  try {
    const issues = await fetchPostIssues();
    const messageGroups = await Promise.all(issues.map(fetchIssueComments));
    const messages = messageGroups
      .flat()
      .sort((left, right) => Date.parse(right.created_at || "") - Date.parse(left.created_at || ""));

    list.replaceChildren();
    if (!messages.length) {
      renderEmpty(list, "No GitHub Issue messages yet.");
      return;
    }

    messages.forEach((message) => list.appendChild(createMessageItem(message)));
  } catch {
    list.replaceChildren();
    renderEmpty(list, "Could not load GitHub Issue messages.");
  }
}

function handleGalleryLightboxKey(event) {
  if (event.key === "Escape") closeGalleryLightbox();
}

function closeGalleryLightbox() {
  document.querySelectorAll(".gallery-lightbox").forEach((lightbox) => lightbox.remove());
  document.body.classList.remove("gallery-lightbox-open");
  document.removeEventListener("keydown", handleGalleryLightboxKey);
}

function openGalleryLightbox(photo) {
  closeGalleryLightbox();

  const lightbox = createElement("div", "gallery-lightbox");
  const frame = createElement("figure", "gallery-lightbox-frame");
  const image = document.createElement("img");
  const closeButton = createElement("button", "gallery-lightbox-close", "Close");

  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", photo.alt || "Life photo");
  image.src = photo.src;
  image.alt = photo.alt || "";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Close enlarged photo");

  frame.appendChild(image);
  if (photo.caption) frame.appendChild(createElement("figcaption", "", photo.caption));
  lightbox.append(frame, closeButton);

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeGalleryLightbox();
  });
  closeButton.addEventListener("click", closeGalleryLightbox);
  document.addEventListener("keydown", handleGalleryLightboxKey);
  document.body.classList.add("gallery-lightbox-open");
  document.body.appendChild(lightbox);
  closeButton.focus();
}

function openMapPhotoGroupDialog(group) {
  closeGalleryLightbox();

  const lightbox = createElement("div", "gallery-lightbox map-group-lightbox");
  const dialog = createElement("section", "map-group-dialog");
  const header = createElement("header", "map-group-header");
  const titleBlock = createElement("div", "map-group-title");
  const title = createElement("h2", "", group.label);
  const meta = createElement(
    "p",
    "",
    `${group.photos.length} photo${group.photos.length > 1 ? "s" : ""} / ${group.key}`
  );
  const closeButton = createElement("button", "gallery-lightbox-close", "Close");
  const grid = createElement("div", "map-group-photo-grid");

  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", `${group.label} photos`);
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Close photo group");

  titleBlock.append(title, meta);
  header.append(titleBlock);
  dialog.append(header, grid);

  group.photos.forEach((photo, index) => {
    const figure = createElement("figure", "map-group-photo");
    const image = document.createElement("img");
    image.src = photo.src;
    image.alt = photo.alt || `${group.label} photo ${index + 1}`;
    image.loading = "lazy";
    image.decoding = "async";
    figure.tabIndex = 0;
    figure.setAttribute("role", "button");
    figure.setAttribute("aria-label", `Enlarge ${photo.alt || `${group.label} photo ${index + 1}`}`);
    figure.addEventListener("click", () => openGalleryLightbox(photo));
    figure.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openGalleryLightbox(photo);
    });
    figure.appendChild(image);
    if (photo.caption) figure.appendChild(createElement("figcaption", "", photo.caption));
    grid.appendChild(figure);
  });

  lightbox.append(dialog, closeButton);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeGalleryLightbox();
  });
  closeButton.addEventListener("click", closeGalleryLightbox);
  document.addEventListener("keydown", handleGalleryLightboxKey);
  document.body.classList.add("gallery-lightbox-open");
  document.body.appendChild(lightbox);
  closeButton.focus();
}

function renderQuoteDetail(params) {
  const contentTarget = resetDetail("Daily Note");
  if (!contentTarget) return;

  const quote = getQuoteById(params.get("id")) || getRandomQuote();
  if (!quote) {
    renderEmpty(contentTarget, "No quotes yet.");
    return;
  }

  contentTarget.className = "quote-detail";
  contentTarget.replaceChildren();
  contentTarget.append(
    createElement("span", "quote-detail-mark", "“"),
    createElement("span", "quote-detail-original", quote.original)
  );

  if (quote.source) {
    contentTarget.appendChild(createElement("span", "quote-detail-source", quote.source));
  }
}

async function renderGalleryDetail() {
  const contentTarget = resetDetail("Welcome to life Frames community", { gallery: true });
  if (!contentTarget) return;

  contentTarget.className = "detail-content gallery-page";

  const copy = createElement(
    "p",
    "gallery-copy",
    "Snapshots from days, walks, meals, trips, and the small scenes I want to remember."
  );
  const actions = createElement("div", "gallery-actions");
  const mapLink = createElement("a", "gallery-action primary", "Browse map");
  const discordLink = createElement("a", "gallery-action secondary", "Join blog on Discord");
  const wall = createElement("div", "gallery-photo-wall");

  mapLink.href = "detail.html?view=gallery-map";
  discordLink.href = galleryDiscordUrl;
  discordLink.target = "_blank";
  discordLink.rel = "noreferrer";
  wall.id = "lifeGallery";
  wall.setAttribute("aria-label", "Random life photos");

  actions.append(mapLink, discordLink);
  contentTarget.append(copy, actions, wall);

  const pool = await loadGalleryPhotos();
  const selected = shuffleItems(pool).slice(0, Math.min(7, pool.length));
  const displayPhotos = Array.from({ length: 7 }, (_, index) => selected[index % selected.length]);

  wall.replaceChildren();
  displayPhotos.forEach((photo, index) => {
    const figure = createElement("figure", `gallery-photo-card gallery-photo-${(index % 7) + 1}`);
    const image = document.createElement("img");
    image.src = photo.src;
    image.alt = photo.alt || "";
    image.loading = "lazy";
    image.decoding = "async";
    figure.tabIndex = 0;
    figure.setAttribute("role", "button");
    figure.setAttribute("aria-label", `Enlarge ${photo.alt || "life photo"}`);
    figure.addEventListener("click", () => openGalleryLightbox(photo));
    figure.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openGalleryLightbox(photo);
    });
    figure.appendChild(image);
    if (photo.caption) figure.appendChild(createElement("figcaption", "", photo.caption));
    wall.appendChild(figure);
  });
}

function getGallerySearchText(group) {
  const keyParts = String(group.key || "")
    .split("-")
    .filter(Boolean);
  const aliases = keyParts.flatMap((part) => [
    part,
    ...(galleryRegionAliases[part] || []),
    ...(galleryCountryAliases[part] || []),
  ]);

  return `${group.label || ""} ${group.key || ""} ${aliases.join(" ")}`;
}

function createMapPlaceCard(group) {
  const card = createElement("button", "map-place-card");
  const image = document.createElement("img");
  const body = createElement("span", "map-place-card-body");
  const title = createElement("strong", "", group.label);
  const meta = createElement("span", "", `${group.photos.length} photo${group.photos.length > 1 ? "s" : ""}`);
  const location = createElement("span", "", group.key);

  card.type = "button";
  card.dataset.location = group.key;
  image.src = group.representative.src;
  image.alt = group.representative.alt || "";
  image.loading = "lazy";
  body.append(title, meta, location);
  card.append(image, body);
  return card;
}

function createPhotoMapMarkerHtml(group) {
  return `
    <span class="photo-map-marker-shell">
      <img src="${escapeHtml(group.representative.src)}" alt="" />
      ${group.photos.length > 1 ? `<span class="photo-map-count">${group.photos.length}</span>` : ""}
    </span>
  `;
}

function renderPhotoMap(groups, mapElement, listElement, onOpenGroup) {
  const L = window.L;
  const map = L.map(mapElement, {
    attributionControl: false,
    zoomControl: true,
    minZoom: 3,
    scrollWheelZoom: true,
    worldCopyJump: false,
    maxBounds: [
      [-85.0511, -540],
      [85.0511, 540],
    ],
    maxBoundsViscosity: 0.65,
  });
  const markers = new Map();
  const groupsByKey = new Map(groups.map((group) => [group.key, group]));
  const openGroup = typeof onOpenGroup === "function" ? onOpenGroup : () => {};
  const markerWorldOffsets = [-360, 0, 360];

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 19,
  }).addTo(map);

  groups.forEach((group) => {
    const icon = L.divIcon({
      className: "photo-map-marker",
      html: createPhotoMapMarkerHtml(group),
      iconSize: [58, 58],
      iconAnchor: [29, 29],
      popupAnchor: [0, -30],
    });
    const [lat, baseLng] = getPhotoMapPoint(group);
    const markerCopies = markerWorldOffsets
      .map((offset) => baseLng + offset)
      .filter((lng) => lng >= -540 && lng <= 540)
      .map((lng) => {
        const marker = L.marker([lat, lng], { icon }).addTo(map);

        marker.bindPopup(`
          <div class="photo-map-popup">
            <img src="${escapeHtml(group.representative.src)}" alt="" />
            <strong>${escapeHtml(group.label)}</strong>
            <span>${group.photos.length} photo${group.photos.length > 1 ? "s" : ""}</span>
          </div>
        `);
        marker.on("click", () => openGroup(group));
        return marker;
      });
    markers.set(group.key, markerCopies);
  });

  if (groups.length > 1) {
    map.fitBounds(
      groups.map(getPhotoMapPoint),
      { padding: [56, 56], maxZoom: 7 }
    );
  } else if (groups.length === 1) {
    map.setView(getPhotoMapPoint(groups[0]), 11);
  } else {
    map.setView([20, 0], 2);
  }

  listElement.querySelectorAll(".map-place-card").forEach((card) => {
    card.addEventListener("click", () => {
      const marker = getClosestPhotoMarker(markers, map, card.dataset.location);
      const group = groupsByKey.get(card.dataset.location);
      if (!marker) return;
      map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), 10), { duration: 0.7 });
      window.setTimeout(() => {
        marker.openPopup();
        if (group) openGroup(group);
      }, 450);
    });
  });

  return { map, markers, searchMarker: null };
}

async function renderGalleryMapDetail() {
  const contentTarget = resetDetail("Photos around the world", { galleryMap: true });
  if (!contentTarget) return;

  contentTarget.className = "detail-content gallery-map-page";

  const toolbar = createElement("div", "map-toolbar");
  const search = createElement("label", "map-search");
  const searchInput = document.createElement("input");
  const mode = createElement("div", "map-mode-tabs");
  const mapTab = createElement("button", "is-active", "Map");
  const cardsTab = createElement("button", "", "Cards");
  const mapShell = createElement("div", "photo-map-shell");
  const mapElement = createElement("div", "photo-map-canvas");
  const listElement = createElement("aside", "photo-map-list");
  const cardsElement = createElement("div", "photo-map-cards");
  const cardNoResults = createElement("div", "map-no-results-toast", "Find Nothing (｡•́︿•̀｡)");

  searchInput.type = "search";
  searchInput.placeholder = "Search by location...";
  search.appendChild(searchInput);
  mapTab.type = "button";
  cardsTab.type = "button";
  mode.append(mapTab, cardsTab);
  toolbar.append(search, mode);
  mapShell.append(mapElement, listElement);
  cardNoResults.setAttribute("role", "status");
  cardNoResults.setAttribute("aria-live", "polite");
  contentTarget.append(toolbar, mapShell, cardsElement, cardNoResults);

  const photos = await loadGalleryPhotos();
  const groups = getPhotoMapDisplayGroups(getGalleryLocationGroups(photos));
  const groupsByKey = new Map(groups.map((group) => [group.key, group]));
  let currentMode = "map";
  let mapController = null;

  if (!groups.length) {
    listElement.appendChild(createElement("p", "empty-copy", "No mapped photos yet. Add location fields in assets/gallery/photos.json."));
    mapElement.appendChild(createElement("p", "empty-copy", "Add locations to render the map."));
    return;
  }

  groups.forEach((group) => {
    listElement.appendChild(createMapPlaceCard(group));
    cardsElement.appendChild(createMapPlaceCard(group));
  });
  cardsElement.querySelectorAll(".map-place-card").forEach((card) => {
    card.addEventListener("click", () => {
      const group = groupsByKey.get(card.dataset.location);
      if (group) openMapPhotoGroupDialog(group);
    });
  });
  cardNoResults.hidden = true;

  const setMode = (modeName) => {
    const showCards = modeName === "cards";
    currentMode = modeName;
    mapShell.hidden = showCards;
    cardsElement.hidden = !showCards;
    mapTab.classList.toggle("is-active", !showCards);
    cardsTab.classList.toggle("is-active", showCards);
    if (showCards) applyCardsFilter();
    if (!showCards) cardNoResults.hidden = true;
  };

  const normalizeSearchText = (value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const getMatches = () => {
    const query = searchInput.value.trim().toLowerCase();
    const normalizedQuery = normalizeSearchText(query);
    if (!normalizedQuery) return groups;

    const queryParts = normalizedQuery.split(/\s+/).filter(Boolean);
    return groups.filter((group) => {
      const searchableText = normalizeSearchText(getGallerySearchText(group));
      return queryParts.every((part) => searchableText.includes(part));
    });
  };
  const applyCardsFilter = () => {
    const query = searchInput.value.trim();
    const matches = getMatches();
    const matchKeys = new Set(matches.map((group) => group.key));
    let visibleCount = 0;

    cardsElement.querySelectorAll(".map-place-card").forEach((card) => {
      const isVisible = !query || matchKeys.has(card.dataset.location);
      card.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });
    cardNoResults.hidden = !query || visibleCount > 0;
  };
  const focusMapSearch = async () => {
    if (!mapController) return;

    const matches = getMatches();
    if (matches.length === 1) {
      const marker = getClosestPhotoMarker(mapController.markers, mapController.map, matches[0].key);
      if (!marker) return;
      mapController.map.flyTo(marker.getLatLng(), Math.max(mapController.map.getZoom(), 10), { duration: 0.7 });
      window.setTimeout(() => marker.openPopup(), 700);
      return;
    }

    if (matches.length > 1) {
      const centerLongitude = mapController.map.getCenter().lng;
      mapController.map.fitBounds(
        matches.map((group) => getPhotoMapPointNear(group, centerLongitude)),
        { padding: [70, 70], maxZoom: 7 }
      );
      return;
    }

    const query = searchInput.value.trim();
    const result = await geocodeLocation(query);
    if (!result || !Number.isFinite(Number(result.lat)) || !Number.isFinite(Number(result.lon))) return;

    if (mapController.searchMarker) {
      mapController.searchMarker.remove();
      mapController.searchMarker = null;
    }

    const lat = Number(result.lat);
    const rawLng = Number(result.lon);
    const centerLongitude = mapController.map.getCenter().lng;
    const lng = wrapLongitudeNear(rawLng, centerLongitude);
    const [south, north, west, east] = Array.isArray(result.boundingbox)
      ? result.boundingbox.map(Number)
      : [NaN, NaN, NaN, NaN];
    const boundsShift = lng - rawLng;

    if ([south, north, west, east].every(Number.isFinite)) {
      mapController.map.fitBounds(
        [
          [south, west + boundsShift],
          [north, east + boundsShift],
        ],
        { padding: [70, 70], maxZoom: 10 }
      );
    } else {
      mapController.map.flyTo([lat, lng], 8, { duration: 0.7 });
    }

    mapController.searchMarker = window.L
      .circleMarker([lat, lng], {
        radius: 9,
        color: "#111111",
        weight: 2,
        fillColor: "#ffffff",
        fillOpacity: 0.9,
      })
      .addTo(mapController.map)
      .bindPopup(escapeHtml(result.display_name || query));
    window.setTimeout(() => mapController.searchMarker?.openPopup(), 500);
  };
  const focusCardsMatches = () => {
    applyCardsFilter();
    const firstMatch = cardsElement.querySelector(".map-place-card:not([hidden])");
    firstMatch?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  };
  setMode("map");
  mapTab.addEventListener("click", () => setMode("map"));
  cardsTab.addEventListener("click", () => setMode("cards"));
  searchInput.addEventListener("input", () => {
    if (currentMode === "cards") applyCardsFilter();
  });
  searchInput.addEventListener("keydown", async (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (currentMode === "cards") {
      focusCardsMatches();
      return;
    }
    await focusMapSearch();
  });

  try {
    await ensureLeaflet();
    mapController = renderPhotoMap(groups, mapElement, listElement, openMapPhotoGroupDialog);
  } catch {
    mapElement.replaceChildren(createElement("p", "empty-copy", "Could not load the interactive map library."));
  }
}

function renderStaticDetail(view) {
  const [nextTitle, nextCopy] = detailMap[view] || detailMap.home;
  const contentTarget = resetDetail(nextTitle);
  if (!contentTarget) return;
  contentTarget.appendChild(createElement("p", "", nextCopy));
}

function updateBackLink(params, view, post) {
  const backLink = document.querySelector(".back-link");
  if (!backLink) return;

  const from = params.get("from");
  const dateKey = params.get("date");
  const projectId = params.get("project") || post?.projectId;
  const sectionId = params.get("section") || post?.sectionId;
  const targets = {
    latest: ["detail.html?view=latest", "← Recent Posts"],
    recommend: ["detail.html?view=recommend", "← Recommendations"],
    projects: [getProjectHref(projectId, sectionId), "← Projects"],
    calendar: [dateKey ? `detail.html?view=day&date=${encodeURIComponent(dateKey)}` : "index.html", "← Calendar"],
    messages: ["message.html", "← Messages"],
    home: ["index.html", "← Home"],
  };

  const [href, label] =
    view === "gallery-map"
      ? ["detail.html?view=gallery", "← Gallery"]
      : view === "post" && targets[from]
        ? targets[from]
        : targets.home;
  backLink.href = href;
  backLink.textContent = label;
  backLink.setAttribute("aria-label", label.replace("← ", "Back to "));
}

function renderDetailPage() {
  const title = document.querySelector("#detailTitle");
  const contentTarget = document.querySelector("#detailContent");
  if (!title || !contentTarget) return;

  const params = new URLSearchParams(window.location.search);
  const view = params.get("view") || "home";
  updateBackLink(params, view);

  if (view === "quote") {
    renderQuoteDetail(params);
    return;
  }

  if (view === "gallery") {
    renderGalleryDetail();
    return;
  }

  if (view === "gallery-map") {
    renderGalleryMapDetail();
    return;
  }

  if (view === "latest") {
    renderPostList("Recent Posts", getPostsByDate(), "No posts yet.", { from: "latest" });
    return;
  }

  if (view === "projects") {
    renderProjects();
    return;
  }

  if (view === "recommend") {
    renderPostList(
      "Recommendations",
      getPostsByDate().filter((post) => post.starred),
      "No starred posts yet.",
      { from: "recommend" }
    );
    return;
  }

  if (view === "links") {
    renderBlogroll();
    return;
  }

  if (view === "all") {
    renderOverview();
    return;
  }

  if (view === "day") {
    renderDayPosts(params.get("date"));
    return;
  }

  if (view === "post") {
    const post = getPostById(params.get("id"));
    updateBackLink(params, view, post);
    renderPostDetail(post);
    return;
  }

  renderStaticDetail(view);
}

function initMenuHover() {
  document.querySelectorAll(".menu-item").forEach((item) => {
    item.addEventListener("pointerenter", () => item.classList.add("is-hovered"));
    item.addEventListener("pointerleave", () => item.classList.remove("is-hovered"));
    item.addEventListener("focus", () => item.classList.add("is-hovered"));
    item.addEventListener("blur", () => item.classList.remove("is-hovered"));
  });
}

async function initSite() {
  renderCalendar();
  updateClock();
  updateGreeting();
  initMenuHover();

  await loadContent();
  renderCalendar();
  renderHomePosts();
  renderHomeQuote();
  renderDetailPage();
  renderMessagePage();
}

initSite();
window.setInterval(updateClock, 1000);
window.setInterval(updateGreeting, 60 * 1000);
