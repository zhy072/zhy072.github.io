const pad = (value) => String(value).padStart(2, "0");

const weekNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
const detailMap = {
  home: ["主页导航", "这里可以拆成文章、项目、关于、推荐和博客友链等独立页面。"],
  gallery: ["首页插画", "把 assets/image1.jpg 替换成你的插画、照片或个人形象图即可。"],
  message: ["留言", "这里可以换成评论系统、表单服务，或继续使用邮件留言。"],
  all: ["全部栏目", "这里可以放完整站点地图、归档和标签。"],
  now: ["当前时间", "这个卡片来自首页实时钟表，也可以扩展成日程或时间线。"],
  about: ["关于我", "这里适合放个人介绍、经历、技能栈和联系方式。"],
  projects: ["我的项目", "这里适合放项目展示、论文、开源仓库和课程作品。"],
  site: ["关于网站", "这里可以记录网站技术栈、更新日志和设计说明。"],
  calendar: ["日历", "这里可以扩展成日程、学习记录或更新日志。"],
  latest: ["最新文章", "这里可以改成文章列表，或连接到你的博客生成器。"],
  recommend: ["随机推荐", "这里适合放课程笔记、书影音、工具和优秀文章。"],
  links: ["优秀博客", "这里可以放朋友链接、技术博客和常看的网站。"],
  music: ["音乐", "这里可以改成歌单、正在播放或喜欢的专辑。"],
  likes: ["收藏", "这里可以放收藏夹、灵感库或常用链接。"],
};

const greetingSlots = [
  { end: 5, title: "凌晨好", copy: "夜色还在，慢慢来。" },
  { end: 7, title: "清晨好", copy: "新的一天开始了。" },
  { end: 11, title: "早上好", copy: "祝你今天开局顺利。" },
  { end: 13, title: "中午好", copy: "记得好好吃饭。" },
  { end: 17, title: "下午好", copy: "I'm Zhili, Nice to meet you!" },
  { end: 19, title: "傍晚好", copy: "今天也辛苦了。" },
  { end: 22, title: "晚上好", copy: "欢迎来这里坐坐。" },
  { end: 24, title: "深夜好", copy: "别忘了早点休息。" },
];

const specialGreetings = [
  { hour: 0, minute: 0, title: "零点好", copy: "新的日期开始了。" },
  { hour: 3, minute: 14, title: "π 时刻", copy: "3.14 刚好路过。" },
  { hour: 5, minute: 20, title: "520", copy: "今天也要对生活温柔一点。" },
  { hour: 11, minute: 11, title: "11:11", copy: "许愿时间。" },
  { hour: 12, minute: 34, title: "12:34", copy: "数字排队经过主页。" },
  { hour: 23, minute: 59, title: "明天见", copy: "最后一分钟也算来过。" },
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
      ? { title: "第 7 分钟彩蛋", copy: "你刷新到了一条隐藏问候。" }
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
  const labels = ["一", "二", "三", "四", "五", "六", "日"];
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
    toggle.setAttribute("aria-label", isPlaying ? "暂停" : "播放");
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
        title.textContent = audio.error ? "把歌曲放进 assets/music" : `${currentTrack.title} · 点击播放`;
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
    title.textContent = "把歌曲放进 assets/music";
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
      "来自个人网站的留言：",
      "",
      `名字：${name || "未填写"}`,
      `联系方式：${contact || "未填写"}`,
      "",
      message,
    ].join("\n");

    window.location.href = `mailto:zhy072@ucsd.edu?subject=${encodeURIComponent(
      "个人网站留言"
    )}&body=${encodeURIComponent(body)}`;
  });
}

renderCalendar();
renderDetailPage();
updateClock();
updateGreeting();
initMusicPlayer();
initMessageForm();
window.setInterval(updateClock, 1000);
window.setInterval(updateGreeting, 60 * 1000);
