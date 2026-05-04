# zhy072.github.io
personal webpage

## Edit Map

- Homepage structure and card links: `index.html`
- Glass effects, background, card sizing, and responsive layout: `styles.css`
- Project index: `projects/index.json`
- Markdown posts: `projects/<project-id>/<post-id>.md` or `projects/<project-id>/<section-id>/<post-id>.md`
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
- Add a top-level post: create `projects/<project-id>/<post-id>.md`, then list the file in that project's `posts`
- Add a section folder: create `projects/<project-id>/<section-id>/<post-id>.md`, then list the file in that section's `posts`
- Change Recent Posts / Latest Post order: edit the markdown front matter field `publishedAt`
- Calendar marks are generated from each post's `publishedAt` date
- Calendar holiday colors and labels are configured in `calendarHolidayRanges` in `script.js`, now only for 2026
- Put a post into Recommendations: set `star: true` in the markdown front matter
- Edit Blogroll links: update `blogroll.json`
- Post messages use Utterances and are stored in GitHub Issues for `zhy072/zhy072.github.io`
- Change time-based greetings and Easter eggs: edit `greetingSlots` and `specialGreetings` in `script.js`
- Add daily quotes: add objects to the `quotes` array in `script.js` with `id`, `translation`, `original`, and optional `source`
- Add life gallery photos: place images under `assets/gallery/`, then list them in `assets/gallery/photos.json`
- Add map locations for gallery photos: give each photo a `location` such as `SanDiego-CA-US`; coordinates live in `galleryLocationMap` in `script.js`, or you can put `lat` and `lng` directly on a photo entry
- Change Github / bilibili / Zhihu / email: search for `github.com/radicalyyyahaha`, `bilibili.com`, `zhihu.com/people/radicalyyy/posts`, and `zhy072@ucsd.edu`
- Change destination page copy for static pages: edit `detailMap` in `script.js`

## GitHub Issue Comments

- Install the Utterances GitHub App for `zhy072/zhy072.github.io`
- Enable GitHub Issues on the repository
- Create a `post-comment` label if you want comment issues grouped by label
- Each post comment thread uses an issue title in the form `post:<post-id>`

## GitHub Pages Deployment

- Keep `.nojekyll` in the repo root so GitHub Pages serves `projects/**/*.md` as raw static files
- If live pages show `No posts yet`, check that `https://zhy072.github.io/projects/index.json` and the listed markdown files both return 200

## Project Index Format

Top-level project posts use `posts`. Foldered posts use `sections`:

```json
{
  "id": "course-notes",
  "title": "Course Notes",
  "posts": ["overview.md"],
  "sections": [
    {
      "id": "course-1",
      "title": "Course 1",
      "posts": ["cmu-15445-database.md"]
    }
  ]
}
```

The section example above maps to `projects/course-notes/course-1/cmu-15445-database.md`.

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

Use `$...$` for inline math and `$$...$$` for display math:

```md
The loss is $L = \|x - \hat{x}\|_2^2$.

$$
\nabla_\theta L(\theta) = \frac{1}{N}\sum_i \nabla_\theta \ell_i(\theta)
$$
```

Use `[label](https://example.com)` for inline links. Put a URL alone on one line to render it as a link card:

```md
[GitHub](https://github.com/)

https://github.com/hao-ai-lab/FastVideo/pull/1242
```

Use emphasis markers for bold and italic text:

```md
**bold**
*italic*
***bold italic***
```
