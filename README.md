# zhy072.github.io
personal webpage

## 修改位置

- 首页结构和卡片链接：`index.html`
- 玻璃质感、背景、卡片尺寸和响应式布局：`styles.css`
- 实时时钟、时间问候、随机音乐、留言表单和详情页标题：`script.js`
- 点进卡片后的通用占位页：`detail.html`
- 留言页：`message.html`

## 图片占位

当前首页使用这些占位路径，不需要先放图片也能显示渐变占位：

- `assets/avatar.jpg`：头像
- `assets/image1.jpg`：顶部大图
- `assets/image2.jpg`：最新文章封面
- `assets/image3.jpg`：随机推荐封面

把同名图片放进 `assets/` 后，再到 `index.html` 删除对应卡片里的占位文字即可。

## 常用替换

- 改名字：搜索 `Zhili Yang`
- 改时间段问候和彩蛋：编辑 `script.js` 里的 `greetingSlots` 和 `specialGreetings`
- 改 Github / bilibili / 邮箱：搜索 `github.com/yourname`、`space.bilibili.com/yourid`、`zhy072@ucsd.edu`
- 改子页面文案：编辑 `script.js` 里的 `detailMap`

## 音乐

把歌曲放到 `assets/music/`，然后编辑 `script.js` 里的 `audioTracks`：

- `assets/music/close-to-you.mp3`
- `assets/music/song1.mp3`
- `assets/music/song2.mp3`

浏览器可能会拦截有声自动播放；代码会先自动尝试，失败时点击音乐卡片即可播放。
