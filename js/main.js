/* Renders the public profile from data.json (or an admin preview in localStorage). */
(function () {
  "use strict";

  // ---- Theme ----
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) document.documentElement.setAttribute("data-theme", savedTheme);
  syncThemeIcon();
  themeToggle.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    syncThemeIcon();
  });
  function syncThemeIcon() {
    themeToggle.textContent = document.documentElement.getAttribute("data-theme") === "dark" ? "☀️" : "🌙";
  }

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const ICONS = {
    github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.5v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.6.8.5 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.8 0 0 .77 0 1.73v20.54C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>',
    website: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z"/></svg>',
    twitter: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 1.2h3.6l-7.9 9 9.3 12.3h-7.3l-5.7-7.5-6.5 7.5H.7l8.4-9.6L0 1.2h7.5l5.2 6.9 6.2-6.9zm-1.3 19.1h2L6.5 3.3H4.4l13.2 17z"/></svg>',
    email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg>'
  };

  function initials(name) {
    return (name || "")
      .split(/\s+/).filter(Boolean).slice(0, 2)
      .map((w) => w[0].toUpperCase()).join("");
  }

  function load() {
    // Admin live-preview takes precedence when opened with ?preview=1
    try {
      const preview = localStorage.getItem("profilePreview");
      if (preview && /[?&]preview=1\b/.test(location.search)) return Promise.resolve(JSON.parse(preview));
    } catch (e) {}
    return fetch("data.json", { cache: "no-store" }).then((r) => {
      if (!r.ok) throw new Error("Could not load data.json");
      return r.json();
    });
  }

  function render(data) {
    const p = data.profile || {};

    document.title = (p.name ? p.name + " — " : "") + "Portfolio";
    document.getElementById("navBrand").textContent = p.name || "Portfolio";
    document.getElementById("footerName").textContent = "© " + new Date().getFullYear() + " " + (p.name || "");

    // Hero
    document.getElementById("heroLocation").textContent = p.location || "";
    document.getElementById("heroName").textContent = p.name || "";
    document.getElementById("heroTitle").textContent = p.title || "";
    document.getElementById("heroTagline").textContent = p.tagline || "";
    document.getElementById("heroInitials").textContent = initials(p.name);
    if (p.photo) {
      document.getElementById("heroAvatar").innerHTML = '<img src="' + esc(p.photo) + '" alt="' + esc(p.name) + '">';
    }
    const resumeBtn = document.getElementById("resumeBtn");
    if (p.resumeUrl) { resumeBtn.href = p.resumeUrl; resumeBtn.hidden = false; resumeBtn.target = "_blank"; }

    // Social
    const social = p.social || {};
    const socialHtml = Object.keys(ICONS)
      .filter((k) => social[k])
      .map((k) => '<a href="' + esc(social[k]) + '" target="_blank" rel="noopener" aria-label="' + k + '">' + ICONS[k] + "</a>")
      .join("");
    document.getElementById("heroSocial").innerHTML = socialHtml;

    // About
    document.getElementById("aboutText").textContent = p.about || "";

    // Experience
    const exp = data.experience || [];
    document.getElementById("experienceList").innerHTML = exp.length ? exp.map((e) => {
      const end = e.current ? "Present" : (e.end || "");
      const dates = [e.start, end].filter(Boolean).join(" – ");
      const meta = [e.company, e.location].filter(Boolean).join(" · ");
      const logo = e.logo ? '<img class="tl-item__logo" src="' + esc(e.logo) + '" alt="" loading="lazy">' : "";
      return (
        '<div class="tl-item">' +
        '<div class="tl-item__head">' +
        logo +
        '<span class="tl-item__role">' + esc(e.role) + "</span>" +
        (dates ? '<span class="tl-item__date">' + esc(dates) + "</span>" : "") +
        "</div>" +
        '<div class="tl-item__meta"><span class="tl-item__company">' + esc(e.company || "") + "</span>" +
        (e.location ? " · " + esc(e.location) : "") + "</div>" +
        '<p class="tl-item__desc">' + esc(e.description || "") + "</p>" +
        "</div>"
      );
    }).join("") : '<p class="empty">No experience added yet.</p>';

    // Skills grouped by category
    const skills = data.skills || [];
    const groups = {};
    skills.forEach((s) => { (groups[s.category || "Other"] = groups[s.category || "Other"] || []).push(s); });
    const skillKeys = Object.keys(groups);
    document.getElementById("skillsList").innerHTML = skillKeys.length ? skillKeys.map((cat) =>
      '<div class="skill-group"><h3 class="skill-group__title">' + esc(cat) + "</h3>" +
      groups[cat].map((s) => {
        const lvl = Math.max(0, Math.min(100, Number(s.level) || 0));
        return '<div class="skill"><div class="skill__head"><span class="skill__name">' + esc(s.name) +
          '</span><span class="skill__pct">' + lvl + '%</span></div>' +
          '<div class="skill__bar"><span class="skill__fill" style="width:' + lvl + '%"></span></div></div>';
      }).join("") + "</div>"
    ).join("") : '<p class="empty">No skills added yet.</p>';

    // Certifications
    const certs = data.certifications || [];
    document.getElementById("certificationsList").innerHTML = certs.length ? certs.map((c) => {
      const meta = [c.date ? "Issued " + c.date : "", c.expiry ? "Expires " + c.expiry : "", c.credentialId ? "ID: " + c.credentialId : ""].filter(Boolean).join(" · ");
      const badge = c.image ? '<img src="' + esc(c.image) + '" alt="" style="width:44px;height:44px;object-fit:contain;border-radius:8px">' : "🎓";
      return '<div class="card"><div class="card__badge">' + badge + "</div>" +
        '<div class="card__title">' + esc(c.name) + "</div>" +
        '<div class="card__issuer">' + esc(c.issuer || "") + "</div>" +
        (meta ? '<div class="card__meta">' + esc(meta) + "</div>" : "") +
        (c.url ? '<a class="card__link" href="' + esc(c.url) + '" target="_blank" rel="noopener">View credential →</a>' : "") +
        "</div>";
    }).join("") : '<p class="empty">No certifications added yet.</p>';

    // Education
    const edu = data.education || [];
    const eduEl = document.getElementById("educationList");
    if (eduEl) {
      eduEl.innerHTML = edu.length ? edu.map((ed) => {
        const dates = [ed.start, ed.end].filter(Boolean).join(" – ");
        const sub = [ed.degree, ed.field].filter(Boolean).join(", ");
        return (
          '<div class="tl-item">' +
          '<div class="tl-item__head">' +
          '<span class="tl-item__role">' + esc(ed.institution || "") + "</span>" +
          (dates ? '<span class="tl-item__date">' + esc(dates) + "</span>" : "") +
          "</div>" +
          (sub ? '<div class="tl-item__meta"><span class="tl-item__company">' + esc(sub) + "</span></div>" : "") +
          (ed.description ? '<p class="tl-item__desc">' + esc(ed.description) + "</p>" : "") +
          "</div>"
        );
      }).join("") : '<p class="empty">No education added yet.</p>';
    }

    // Projects (featured first) — hide the whole section + nav link when empty
    const projects = (data.projects || []).slice().sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    const projectsSection = document.getElementById("projects");
    const projectsNav = document.querySelector('a[href="#projects"]');
    if (projectsSection) projectsSection.hidden = projects.length === 0;
    if (projectsNav) projectsNav.hidden = projects.length === 0;
    document.getElementById("projectsList").innerHTML = projects.length ? projects.map((pr) => {
      const img = pr.image ? '<img src="' + esc(pr.image) + '" alt="' + esc(pr.title) + '">' : esc(initials(pr.title));
      const tech = (pr.tech || []).map((t) => '<span class="chip">' + esc(t) + "</span>").join("");
      const links = [
        pr.url ? '<a href="' + esc(pr.url) + '" target="_blank" rel="noopener">Live ↗</a>' : "",
        pr.repo ? '<a href="' + esc(pr.repo) + '" target="_blank" rel="noopener">Code ↗</a>' : ""
      ].filter(Boolean).join("");
      return '<div class="project"><div class="project__img">' + img + "</div>" +
        '<div class="project__body">' +
        '<div class="project__title">' + (pr.featured ? '<span class="project__star">★</span>' : "") + esc(pr.title) + "</div>" +
        '<p class="project__desc">' + esc(pr.description || "") + "</p>" +
        (tech ? '<div class="project__tech">' + tech + "</div>" : "") +
        (links ? '<div class="project__links">' + links + "</div>" : "") +
        "</div></div>";
    }).join("") : '<p class="empty">No projects added yet.</p>';

    // Contact
    const contact = [];
    if (p.email) contact.push('<a class="btn btn--primary" href="mailto:' + esc(p.email) + '">' + ICONS.email + " " + esc(p.email) + "</a>");
    if (social.linkedin) contact.push('<a class="btn btn--ghost" href="' + esc(social.linkedin) + '" target="_blank" rel="noopener">LinkedIn</a>');
    if (social.github) contact.push('<a class="btn btn--ghost" href="' + esc(social.github) + '" target="_blank" rel="noopener">GitHub</a>');
    if (p.phone) contact.push('<a class="btn btn--ghost" href="tel:' + esc(p.phone) + '">' + esc(p.phone) + "</a>");
    document.getElementById("contactLinks").innerHTML = contact.join("");
  }

  load()
    .then(render)
    .catch((err) => {
      document.getElementById("heroName").textContent = "Welcome";
      document.getElementById("heroTagline").textContent =
        "Could not load data.json. If viewing locally, run a local server (see README) or open admin.html to set up your content.";
      console.error(err);
    });
})();
