# zhy072.github.io
personal webpage

## Edit Map

- Homepage structure and card links: `index.html`
- Glass effects, background, card sizing, and responsive layout: `styles.css`
- Project index: `projects/index.json`
- Markdown posts: `projects/<project-id>/<post-id>.md`
- Blogroll links: `blogroll.json`
- Live clock, time-based greeting, markdown loading, post sorting, GitHub Issue comments, and detail rendering: `script.js`
- Shared placeholder destination page: `detail.html`
- Message page: `message.html`

## Image Placeholders

The homepage uses these placeholder paths. The gradient placeholders still work before real images are added:

- `assets/avatar.jpg`: avatar
- `assets/image1.jpg`: top artwork

Place same-name images in `assets/`, then update the matching `<img>` tags in `index.html` if you rename them.

## Common Edits

- Change the name: search for `Zhili Yang`
- Add a project: create `projects/<project-id>/`, then add it to `projects/index.json`
- Add a post: create `projects/<project-id>/<post-id>.md`, then list the file in that project's `posts`
- Change Recent Posts / Latest Post order: edit the markdown front matter field `publishedAt`
- Put a post into Recommendations: set `star: true` in the markdown front matter
- Edit Blogroll links: update `blogroll.json`
- Post messages use Utterances and are stored in GitHub Issues for `zhy072/zhy072.github.io`
- Change time-based greetings and Easter eggs: edit `greetingSlots` and `specialGreetings` in `script.js`
- Change Github / bilibili / email: search for `github.com/yourname`, `space.bilibili.com/yourid`, and `zhy072@ucsd.edu`
- Change destination page copy for static pages: edit `detailMap` in `script.js`

## GitHub Issue Comments

- Install the Utterances GitHub App for `zhy072/zhy072.github.io`
- Enable GitHub Issues on the repository
- Create a `post-comment` label if you want comment issues grouped by label
- Each post comment thread uses an issue title in the form `post:<post-id>`

## Post Markdown Format

```md
---
title: Notice
excerpt: This site is still being built.
publishedAt: 2026-05-01
star: true
tags: [site, log]
---

Write the post body here with Markdown.
```

Use fenced code blocks with a language name for syntax highlighting:

````md
```python
def forward(x):
    return x
```
````
