const pad = (value) => String(value).padStart(2, "0");

const weekNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
const detailMap = {
  home: ["主页导航", "这里可以拆成文章、项目、关于、推荐和博客友链等独立页面。"],
  gallery: ["首页插画", "把 assets/image1.jpg 替换成你的插画、照片或个人形象图即可。"],
  write: ["写文章", "后续可以接入博客发布流程，或改成文章编辑入口。"],
  all: ["全部栏目", "这里可以放完整站点地图、归档和标签。"],
  now: ["当前时间", "这个卡片来自首页实时钟表，也可以扩展成日程或时间线。"],
  about: ["关于我", "这里适合放个人介绍、经历、技能栈和联系方式。"],
  calendar: ["日历", "这里可以扩展成日程、学习记录或更新日志。"],
  latest: ["最新文章", "这里可以改成文章列表，或连接到你的博客生成器。"],
  recommend: ["随机推荐", "这里适合放课程笔记、书影音、工具和优秀文章。"],
  music: ["音乐", "这里可以改成歌单、正在播放或喜欢的专辑。"],
  likes: ["收藏", "这里可以放收藏夹、灵感库或常用链接。"],
};

function updateClock() {
  const target = document.querySelector("#clockTime");
  if (!target) return;

  const now = new Date();
  target.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
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

renderCalendar();
renderDetailPage();
updateClock();
window.setInterval(updateClock, 1000);
