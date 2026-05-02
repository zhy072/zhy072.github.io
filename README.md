# zhy072.github.io
personal webpage

## Edit Map

- Homepage structure and card links: `index.html`
- Glass effects, background, card sizing, and responsive layout: `styles.css`
- Editable projects, posts, recommendations, and blogroll data: `content.js`
- Live clock, time-based greeting, post sorting, GitHub Issue comments, and detail rendering: `script.js`
- Shared placeholder destination page: `detail.html`
- Message page: `message.html`

## Image Placeholders

The homepage uses these placeholder paths. The gradient placeholders still work before real images are added:

- `assets/avatar.jpg`: avatar
- `assets/image1.jpg`: top artwork

Place same-name images in `assets/`, then update the matching `<img>` tags in `index.html` if you rename them.

## Common Edits

- Change the name: search for `Zhili Yang`
- Add or edit posts: update `projects[].posts[]` in `content.js`
- Change Recent Posts / Latest Post order: edit each post's `publishedAt`
- Put a post into Recommendations: set `star: true`
- Edit Blogroll links: update `blogroll[]` in `content.js`
- Post messages use Utterances and are stored in GitHub Issues for `zhy072/zhy072.github.io`
- Change time-based greetings and Easter eggs: edit `greetingSlots` and `specialGreetings` in `script.js`
- Change Github / bilibili / email: search for `github.com/yourname`, `space.bilibili.com/yourid`, and `zhy072@ucsd.edu`
- Change destination page copy for static pages: edit `detailMap` in `script.js`

## GitHub Issue Comments

- Install the Utterances GitHub App for `zhy072/zhy072.github.io`
- Enable GitHub Issues on the repository
- Create a `post-comment` label if you want comment issues grouped by label
- Each post comment thread uses an issue title in the form `post:<post-id>`
