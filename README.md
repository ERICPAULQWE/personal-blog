# personal-blog

A modern personal blog & knowledge base built with **Next.js**.

This site is designed for long-term knowledge accumulation and presentation of:
- Learning notes written in **Markdown / MDX** (from Obsidian)
- Interactive **React-based labs and demos**
- Clean typography, dark mode, and high-quality reading experience

---

## ✨ Features

- 📚 **Notes**: Markdown / MDX content with tags, archive, and series
- 🧪 **Labs**: Interactive pages built with React and MDX
- 🌓 **Dark Mode**: System-based theme switching
- 💬 **Comments**: GitHub login via Giscus
- 🔍 **Search**: Full-text search (build-time)
- 🧮 **Math**: LaTeX formula rendering (inline & block)
- 🚀 **Deploy**: Vercel + custom domain

---

## 🛠 Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **UI**: shadcn/ui, Radix UI
- **Animation**: Framer Motion
- **Content**: Markdown / MDX
- **Comments**: GitHub Discussions (Giscus)
- **Deploy**: Vercel

---

## 📂 Project Structure

```

src/
app/          # App Router pages & layouts
components/   # Reusable UI components
lib/          # Utilities & content helpers
content/
notes/        # Markdown / MDX notes
labs/         # Interactive MDX labs
public/
images/       # Static images

````

---

## 🚀 Development

Install dependencies:

```bash
npm install
````

Start local development server:

```bash
npm run dev
```

Open in browser:

```
http://localhost:3000
```

---

## 📝 Content Workflow

* Write notes in **Obsidian**
* Export or sync Markdown files to `content/notes`
* Commit & push to GitHub
* Vercel automatically builds and deploys

No manual backend or database required.

---

## 📌 Status

This project is under active development and will evolve incrementally:

* Phase 1: Core blog & content system
* Phase 2: Optional admin publishing UI
* Phase 3: Advanced labs & performance optimizations

---

## 📄 License

MIT

````

---

