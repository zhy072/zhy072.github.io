const pad = (value) => String(value).padStart(2, "0");

const weekNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const content = window.siteContent || { projects: [], blogroll: [] };
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

const greetingSeed = Math.random();

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

function getPostHref(post) {
  return `detail.html?view=post&id=${encodeURIComponent(post.id)}`;
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

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
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

function fillHomePostCard(prefix, post) {
  const card = document.querySelector(`#${prefix}PostCard`);
  const title = document.querySelector(`#${prefix}PostTitle`);
  const excerpt = document.querySelector(`#${prefix}PostExcerpt`);
  const date = document.querySelector(`#${prefix}PostDate`);
  if (!card || !title || !excerpt || !date || !post) return;

  card.href = getPostHref(post);
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

function createPostListItem(post) {
  const link = createElement("a", "post-list-item");
  link.href = getPostHref(post);

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

function renderPostList(title, posts, emptyMessage) {
  const contentTarget = resetDetail(title, { wide: true });
  if (!contentTarget) return;

  if (!posts.length) {
    renderEmpty(contentTarget, emptyMessage);
    return;
  }

  const list = createElement("div", "post-list");
  posts.forEach((post) => list.appendChild(createPostListItem(post)));
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
      .forEach((post) => nested.appendChild(createPostListItem(post)));

    if (!posts.length) nested.appendChild(createElement("p", "empty-copy", "No posts in this project yet."));
    section.appendChild(nested);
    list.appendChild(section);
  });

  contentTarget.appendChild(list);
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

  const body = createElement("div", "post-body");
  const paragraphs = Array.isArray(post.body) && post.body.length ? post.body : [post.excerpt || ""];
  paragraphs.forEach((paragraph) => {
    if (paragraph) body.appendChild(createElement("p", "", paragraph));
  });
  contentTarget.appendChild(body);

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
    postLink.href = getPostHref(message.post);
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

function renderQuoteDetail() {
  const contentTarget = resetDetail("Daily Note");
  if (!contentTarget) return;

  contentTarget.className = "quote-detail";
  contentTarget.innerHTML = `
    <span class="quote-detail-mark">“</span>
    <span class="quote-detail-original">不诱于誉，不恐于诽，率道而行，端然正己。</span>
    <span class="quote-detail-source">---from DeepSeek-V4</span>
  `;
}

function renderStaticDetail(view) {
  const [nextTitle, nextCopy] = detailMap[view] || detailMap.home;
  const contentTarget = resetDetail(nextTitle);
  if (!contentTarget) return;
  contentTarget.appendChild(createElement("p", "", nextCopy));
}

function renderDetailPage() {
  const title = document.querySelector("#detailTitle");
  const contentTarget = document.querySelector("#detailContent");
  if (!title || !contentTarget) return;

  const params = new URLSearchParams(window.location.search);
  const view = params.get("view") || "home";

  if (view === "quote") {
    renderQuoteDetail();
    return;
  }

  if (view === "latest") {
    renderPostList("Recent Posts", getPostsByDate(), "No posts yet.");
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
      "No starred posts yet."
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

  if (view === "post") {
    renderPostDetail(getPostById(params.get("id")));
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

renderCalendar();
renderHomePosts();
renderDetailPage();
renderMessagePage();
updateClock();
updateGreeting();
initMenuHover();
window.setInterval(updateClock, 1000);
window.setInterval(updateGreeting, 60 * 1000);
