const pad = (value) => String(value).padStart(2, "0");

const weekNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const content = { projects: [], blogroll: [] };
const projectIndexPath = "projects/index.json";
const blogrollPath = "blogroll.json";
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

function getAllPosts() {
  return getProjects().flatMap((project) => {
    const posts = Array.isArray(project.posts) ? project.posts : [];
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

function getPostsByDate() {
  return getAllPosts().sort((left, right) => {
    const dateOrder = getPostTimestamp(right) - getPostTimestamp(left);
    if (dateOrder !== 0) return dateOrder;
    return String(left.title || "").localeCompare(String(right.title || ""));
  });
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

function getPostHref(post, source = {}) {
  const params = new URLSearchParams({ view: "post", id: post.id });
  if (source.from) params.set("from", source.from);
  if (source.projectId) params.set("project", source.projectId);
  if (source.date) params.set("date", source.date);
  return `detail.html?${params.toString()}`;
}

function getProjectHref(projectId) {
  return `detail.html?view=projects#${getProjectAnchor(projectId)}`;
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

async function loadPost(project, postFile) {
  const path = `projects/${project.id}/${postFile}`;
  const markdown = await fetchText(path);
  const parsed = parseFrontmatter(markdown);
  const id = parsed.data.id || getPostIdFromPath(postFile);

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
    starred: isStarred(parsed.data),
  };
}

async function loadContent() {
  const index = await fetchJson(projectIndexPath, { projects: [] });
  const projects = Array.isArray(index.projects) ? index.projects : [];

  const loadedProjects = await Promise.all(
    projects.map(async (project) => {
      const postFiles = Array.isArray(project.posts) ? project.posts : [];
      const posts = await Promise.all(
        postFiles.map((postFile) =>
          loadPost(project, postFile).catch(() => null)
        )
      );

      return {
        ...project,
        posts: posts.filter(Boolean),
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
  if (!title || !contentTarget) return null;

  title.textContent = titleText;
  contentTarget.className = "detail-content";
  contentTarget.replaceChildren();
  card?.classList.toggle("detail-wide", Boolean(options.wide));
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
  eyebrow.textContent = `${post.projectTitle || "Project"} / ${formatDate(post.publishedAt)}`;

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
    const nested = createElement("div", "project-posts");
    posts
      .map((post) => ({
        ...post,
        projectId: project.id,
        projectTitle: project.title,
        starred: isStarred(post),
      }))
      .sort((left, right) => getPostTimestamp(right) - getPostTimestamp(left))
      .forEach((post) =>
        nested.appendChild(createPostListItem(post, { from: "projects", projectId: project.id }))
      );

    if (!posts.length) nested.appendChild(createElement("p", "empty-copy", "No posts in this project yet."));
    section.appendChild(nested);
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
  meta.textContent = `${post.projectTitle || "Project"} / ${formatDate(post.publishedAt)}`;
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
  const targets = {
    latest: ["detail.html?view=latest", "← Recent Posts"],
    recommend: ["detail.html?view=recommend", "← Recommendations"],
    projects: [getProjectHref(projectId), "← Projects"],
    calendar: [dateKey ? `detail.html?view=day&date=${encodeURIComponent(dateKey)}` : "index.html", "← Calendar"],
    messages: ["message.html", "← Messages"],
    home: ["index.html", "← Home"],
  };

  const [href, label] = view === "post" && targets[from] ? targets[from] : targets.home;
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
