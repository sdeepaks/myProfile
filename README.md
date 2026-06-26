# Personal Profile Website

A fast, professional, **static** portfolio site — no backend, no database, no build step. All content lives in a single `data.json` file, and a built-in admin editor (`admin.html`) lets you manage everything from your browser.

## What's included

| File | Purpose |
|------|---------|
| `index.html` | The public profile (hero, about, experience, skills, certifications, projects, contact) |
| `admin.html` | Browser-based editor to manage your content |
| `data.json`  | **Your content** — the single source of truth |
| `css/`, `js/` | Styles and scripts |
| `.nojekyll`  | Tells GitHub Pages to serve files as-is |

## How to edit your content

You have two options:

**A. Use the admin editor (recommended) — runs locally only**
1. Start the local server (`node serve.js 8000`) and open `http://localhost:8000/admin.html`.
2. Edit Profile, Experience, Skills, Certifications, Projects. Changes autosave in your browser as you type, and the admin loads your current `data.json` automatically.
3. Click **Preview ↗** to see the live result.
4. When happy, click **⬇ Download data.json**.
5. Replace the `data.json` in this folder with the downloaded file, then commit & push (see below).

> **The admin is intentionally NOT deployed.** It's listed in `.gitignore`, so it never appears at your public URL — only you can use it, on your own machine. This is the right model for a static site: there's no server to enforce a real login, and any in-page password gate would be trivially bypassable. The admin can only ever produce a `data.json` for you to commit; it cannot change your live site. To edit, run it locally as above. Use **Reset to saved file** to discard browser edits and reload from `data.json`.

**B. Edit `data.json` by hand** — it's plain JSON; just keep the structure.

### Images & CV
Static hosting has no file upload. For a photo, project image, certification badge, or CV:
- Put the file in an `assets/` folder in this repo and reference it as `assets/me.jpg`, **or**
- Paste any public image/PDF URL.

## Run locally
Because the site uses `fetch()` to load `data.json`, open it through a local server (not `file://`):

```bash
# Option 1 — Node (a tiny server is included)
node serve.js 8000

# Option 2 — Python
python -m http.server 8000
```
Then visit `http://localhost:8000`. (`serve.js` is only for local preview — you don't need to deploy it.)

`admin.html` works by double-clicking too, but the public page needs the server to load `data.json`.

## Deploy to GitHub Pages (free)

1. Create a new GitHub repository, e.g. `myprofile` (or `<yourusername>.github.io` for a root URL).
2. Push these files:
   ```bash
   git init
   git add .
   git commit -m "Initial profile site"
   git branch -M main
   git remote add origin https://github.com/<yourusername>/<repo>.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, pick `main` / `/ (root)`, **Save**.
4. Your site goes live at `https://<yourusername>.github.io/<repo>/` within a minute or two.

### Custom domain (optional)
In **Settings → Pages → Custom domain**, enter your domain (e.g. `deepak.dev`) and add the DNS records GitHub shows. A `CNAME` file is created automatically.

## Other free/cheap hosting options
| Host | Notes |
|------|-------|
| **GitHub Pages** | Free, push-to-deploy, custom domains. Used above. |
| **Cloudflare Pages** | Free, very fast CDN, drag-and-drop or Git deploy, custom domains. |
| **Netlify** | Free tier, drag-and-drop deploy, instant HTTPS, form handling if you later add a contact form. |
| **Vercel** | Free tier, great DX, custom domains. |

All four host this site as-is — just point them at this folder/repo.

## Theme
A light/dark toggle (🌙/☀️) sits in the top nav and remembers your choice. Colors are CSS variables in `css/style.css` (`:root` and `[data-theme="dark"]`) — change `--primary` / `--accent` to rebrand.
