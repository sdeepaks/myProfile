/* Client-side admin: edit content, autosave to localStorage, export data.json. */
(function () {
  "use strict";

  const STORAGE_KEY = "profileData";
  let data = null;

  // Field definitions for each collection (label, key, type, options)
  const SCHEMA = {
    experience: {
      label: (it) => it.role || "New role",
      fields: [
        { k: "role", l: "Role / title" },
        { k: "company", l: "Company" },
        { k: "location", l: "Location" },
        { k: "start", l: "Start (e.g. 2022)" },
        { k: "end", l: "End (blank if current)" },
        { k: "current", l: "Current role", t: "check" },
        { k: "description", l: "Description", t: "textarea", full: true }
      ],
      blank: { role: "", company: "", location: "", start: "", end: "", current: false, description: "" }
    },
    skills: {
      label: (it) => it.name || "New skill",
      fields: [
        { k: "name", l: "Skill name" },
        { k: "category", l: "Category (groups skills)" },
        { k: "level", l: "Proficiency (0–100)", t: "number" }
      ],
      blank: { name: "", category: "General", level: 70 }
    },
    certifications: {
      label: (it) => it.name || "New certification",
      fields: [
        { k: "name", l: "Certification name", full: true },
        { k: "issuer", l: "Issuer" },
        { k: "date", l: "Issue date (e.g. 2023)" },
        { k: "expiry", l: "Expiry (optional)" },
        { k: "credentialId", l: "Credential ID (optional)" },
        { k: "url", l: "Credential URL (optional)", full: true },
        { k: "image", l: "Badge image URL (optional)", full: true }
      ],
      blank: { name: "", issuer: "", date: "", expiry: "", credentialId: "", url: "", image: "" }
    },
    projects: {
      label: (it) => it.title || "New project",
      fields: [
        { k: "title", l: "Title" },
        { k: "featured", l: "Featured (show first)", t: "check" },
        { k: "description", l: "Description", t: "textarea", full: true },
        { k: "tech", l: "Tech (comma separated)", t: "csv", full: true },
        { k: "url", l: "Live URL (optional)" },
        { k: "repo", l: "Repo URL (optional)" },
        { k: "image", l: "Image URL (optional)", full: true }
      ],
      blank: { title: "", featured: false, description: "", tech: [], url: "", repo: "", image: "" }
    }
  };

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function defaults() {
    return { profile: { name: "", title: "", tagline: "", about: "", email: "", phone: "", location: "", photo: "", resumeUrl: "", social: { github: "", linkedin: "", website: "", twitter: "" } }, experience: [], skills: [], certifications: [], projects: [] };
  }

  function markDirty() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    localStorage.setItem("profilePreview", JSON.stringify(data));
    document.getElementById("dirty").hidden = false;
  }

  // ---------- Profile bindings ----------
  function bindProfile() {
    document.querySelectorAll("[data-field]").forEach((el) => {
      el.value = data.profile[el.dataset.field] || "";
      el.addEventListener("input", () => { data.profile[el.dataset.field] = el.value; markDirty(); });
    });
    document.querySelectorAll("[data-social]").forEach((el) => {
      el.value = (data.profile.social || {})[el.dataset.social] || "";
      el.addEventListener("input", () => {
        data.profile.social = data.profile.social || {};
        data.profile.social[el.dataset.social] = el.value;
        markDirty();
      });
    });
  }

  // ---------- Collection rendering ----------
  function renderCollection(name) {
    const cfg = SCHEMA[name];
    const list = data[name] || (data[name] = []);
    const container = document.getElementById("list-" + name);
    if (!list.length) { container.innerHTML = '<p class="adm-empty">Nothing here yet. Click “+ Add” to create one.</p>'; return; }

    container.innerHTML = list.map((item, i) => {
      const fields = cfg.fields.map((f) => {
        const val = item[f.k];
        const id = name + "-" + i + "-" + f.k;
        let input;
        if (f.t === "check") {
          input = '<label class="adm-check"><input type="checkbox" data-coll="' + name + '" data-idx="' + i + '" data-key="' + f.k + '"' + (val ? " checked" : "") + " /> " + esc(f.l) + "</label>";
          return '<div>' + input + "</div>";
        } else if (f.t === "textarea") {
          input = '<textarea rows="3" data-coll="' + name + '" data-idx="' + i + '" data-key="' + f.k + '">' + esc(val || "") + "</textarea>";
        } else if (f.t === "csv") {
          input = '<input data-coll="' + name + '" data-idx="' + i + '" data-key="' + f.k + '" data-type="csv" value="' + esc(Array.isArray(val) ? val.join(", ") : (val || "")) + '" />';
        } else {
          input = '<input type="' + (f.t === "number" ? "number" : "text") + '" data-coll="' + name + '" data-idx="' + i + '" data-key="' + f.k + '" value="' + esc(val == null ? "" : val) + '" />';
        }
        return '<label' + (f.full ? ' class="adm-full"' : "") + ">" + esc(f.l) + input + "</label>";
      });

      // arrange: full-width fields stacked, others in 2-col rows
      const rows = [];
      let buffer = [];
      cfg.fields.forEach((f, fi) => {
        if (f.full || f.t === "check") {
          if (buffer.length) { rows.push('<div class="adm-row">' + buffer.join("") + "</div>"); buffer = []; }
          rows.push(fields[fi]);
        } else {
          buffer.push(fields[fi]);
          if (buffer.length === 2) { rows.push('<div class="adm-row">' + buffer.join("") + "</div>"); buffer = []; }
        }
      });
      if (buffer.length) rows.push('<div class="adm-row">' + buffer.join("") + "</div>");

      return (
        '<div class="adm-item">' +
        '<div class="adm-item__head">' +
        '<span class="adm-item__title">' + esc(cfg.label(item)) + "</span>" +
        '<div class="adm-item__actions">' +
        '<button class="icon-btn" data-move="up" data-coll="' + name + '" data-idx="' + i + '"' + (i === 0 ? " disabled" : "") + ' title="Move up">↑</button>' +
        '<button class="icon-btn" data-move="down" data-coll="' + name + '" data-idx="' + i + '"' + (i === list.length - 1 ? " disabled" : "") + ' title="Move down">↓</button>' +
        '<button class="icon-btn icon-btn--danger" data-del="' + name + '" data-idx="' + i + '" title="Delete">🗑</button>' +
        "</div></div>" +
        rows.join("") +
        "</div>"
      );
    }).join("");
  }

  function renderAll() {
    Object.keys(SCHEMA).forEach(renderCollection);
  }

  // ---------- Event delegation for collection inputs ----------
  document.addEventListener("input", (e) => {
    const el = e.target;
    if (!el.dataset || el.dataset.coll == null) return;
    const { coll, idx, key, type } = el.dataset;
    const item = data[coll][idx];
    if (el.type === "checkbox") item[key] = el.checked;
    else if (type === "csv") item[key] = el.value.split(",").map((s) => s.trim()).filter(Boolean);
    else if (el.type === "number") item[key] = el.value === "" ? "" : Number(el.value);
    else item[key] = el.value;
    markDirty();
    // update the item title live
    const head = el.closest(".adm-item") && el.closest(".adm-item").querySelector(".adm-item__title");
    if (head) head.textContent = SCHEMA[coll].label(item);
  });

  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-add],[data-del],[data-move]");
    if (!el) return;
    if (el.dataset.add) {
      const name = el.dataset.add;
      data[name].push(JSON.parse(JSON.stringify(SCHEMA[name].blank)));
      renderCollection(name); markDirty();
    } else if (el.dataset.del != null) {
      const name = el.dataset.del, idx = Number(el.dataset.idx);
      if (confirm("Delete this item?")) { data[name].splice(idx, 1); renderCollection(name); markDirty(); }
    } else if (el.dataset.move) {
      const name = el.dataset.coll, idx = Number(el.dataset.idx);
      const to = el.dataset.move === "up" ? idx - 1 : idx + 1;
      if (to < 0 || to >= data[name].length) return;
      const arr = data[name];
      [arr[idx], arr[to]] = [arr[to], arr[idx]];
      renderCollection(name); markDirty();
    }
  });

  // ---------- Tabs ----------
  document.querySelectorAll(".adm-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".adm-tab").forEach((t) => t.classList.remove("is-active"));
      document.querySelectorAll(".adm-panel").forEach((p) => p.classList.remove("is-active"));
      tab.classList.add("is-active");
      document.querySelector('.adm-panel[data-panel="' + tab.dataset.tab + '"]').classList.add("is-active");
    });
  });

  // ---------- Toolbar ----------
  document.getElementById("exportBtn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "data.json";
    a.click();
    URL.revokeObjectURL(a.href);
    document.getElementById("dirty").hidden = true;
  });

  document.getElementById("previewBtn").addEventListener("click", () => {
    localStorage.setItem("profilePreview", JSON.stringify(data));
    window.open("index.html?preview=1", "_blank");
  });

  document.getElementById("importBtn").addEventListener("click", () => document.getElementById("importFile").click());
  document.getElementById("importFile").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        data = Object.assign(defaults(), JSON.parse(reader.result));
        data.profile = Object.assign(defaults().profile, data.profile || {});
        bindProfile(); renderAll(); markDirty();
        alert("Imported successfully.");
      } catch (err) { alert("Invalid JSON file."); }
    };
    reader.readAsText(file);
  });

  document.getElementById("resetBtn").addEventListener("click", (e) => {
    e.preventDefault();
    if (!confirm("Discard browser edits and reload from data.json?")) return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("profilePreview");
    location.reload();
  });

  // ---------- Boot ----------
  function boot(loaded) {
    data = Object.assign(defaults(), loaded || {});
    data.profile = Object.assign(defaults().profile, data.profile || {});
    data.profile.social = Object.assign(defaults().profile.social, data.profile.social || {});
    bindProfile();
    renderAll();
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try { boot(JSON.parse(stored)); document.getElementById("dirty").hidden = false; }
    catch (e) { boot(null); }
  } else {
    fetch("data.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => boot(d))
      .catch(() => boot(null));
  }
})();
