const siteContent = {
  projects: [
    {
      id: "site",
      title: "Site",
      summary: "Notes about this website, design decisions, and update logs.",
      posts: [
        {
          id: "notice",
          title: "Notice",
          excerpt: "This site is still being built.",
          publishedAt: "2026-05-01",
          star: true,
          tags: ["site", "log"],
          body: [
            "This is the first managed post on the site.",
            "Edit this post, add new posts, or move posts between projects in content.js. Recent Posts, Latest Post, Random Pick, and Recommendations will update automatically.",
          ],
        },
        {
          id: "post-system",
          title: "Post Management Plan",
          excerpt: "Projects work like folders, and posts work like files inside them.",
          publishedAt: "2026-04-28",
          star: false,
          tags: ["site", "system"],
          body: [
            "Every post now lives inside a project. The editable publishedAt field controls Recent Posts and Latest Post ordering.",
            "The star flag controls whether a post appears in Recommendations.",
          ],
        },
      ],
    },
    {
      id: "course-notes",
      title: "Course Notes",
      summary: "Coursework notes, lab writeups, and architecture references.",
      posts: [
        {
          id: "cmu-15445-database",
          title: "CMU 15-445 & Database",
          excerpt: "Labs, architecture notes, docs, and gotchas.",
          publishedAt: "2026-04-23",
          star: true,
          tags: ["database", "course"],
          body: [
            "A working notebook for database system concepts, lab architecture, and implementation details.",
            "Use this entry as the place for links, notes, and reminders while working through the course material.",
          ],
        },
        {
          id: "linux-root-notes",
          title: "Linux Root Notes",
          excerpt: "A folder-like mental model for organizing notes and posts.",
          publishedAt: "2026-04-18",
          star: false,
          tags: ["linux", "notes"],
          body: [
            "The site content model follows a simple filesystem idea: projects are folders, and posts are files.",
            "This makes it easier to keep course notes, project logs, and personal writing separated without losing one global timeline.",
          ],
        },
      ],
    },
  ],
  blogroll: [
    {
      title: "Maggie Appleton",
      url: "https://maggieappleton.com/",
      category: "Essays",
      description: "Visual essays about programming, knowledge tools, and interfaces.",
    },
    {
      title: "Julia Evans",
      url: "https://jvns.ca/",
      category: "Systems",
      description: "Clear notes about debugging, networking, shells, and how computers work.",
    },
    {
      title: "MIT 6.824",
      url: "https://pdos.csail.mit.edu/6.824/",
      category: "Courses",
      description: "Distributed systems course materials and papers.",
    },
  ],
};

window.siteContent = siteContent;
