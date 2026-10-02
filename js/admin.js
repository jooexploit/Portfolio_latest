/* ============================================================
   jooexploit — admin.js  v1.0  (Phase 2)
   Admin Dashboard for Session Feedback System
   Modules:
     Auth     — signIn, signOut, auth guard, session check
     Router   — hash-based tab navigation
     Overview — stats cards + rating charts
     Sessions — list, create, edit, toggle, soft-delete
     Questions— list, create, edit, reorder, toggle, soft-delete
     Responses— paginated list, filters, search, detail view
     UI       — modal, toast, confirm dialog, loading states
   ============================================================ */

(function () {
  "use strict";

  /* ── Supabase client ──────────────────────────────────────── */
  const SUPABASE_URL      = window.__SUPABASE_URL__ || "";
  const SUPABASE_ANON_KEY = window.__SUPABASE_ANON_KEY__ || "";

  let sb = null;
  if (typeof window.supabase !== "undefined" && SUPABASE_URL && SUPABASE_ANON_KEY) {
    try { sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY); }
    catch (e) { console.error("[admin] Supabase init error:", e); }
  }

  /* ── Page detection ──────────────────────────────────────── */
  const isLoginPage     = !!document.getElementById("login-form");
  const isDashboardPage = !!document.getElementById("admin-dashboard-mount");

  /* ────────────────────────────────────────────────────────────
     UI HELPERS
  ──────────────────────────────────────────────────────────── */
  const UI = {
    /* ── Toast notifications ──────────────────────────────── */
    toast(message, type = "success", duration = 3500) {
      const container = document.getElementById("toast-container");
      if (!container) return;
      const id = `toast-${Date.now()}`;
      const icons = {
        success: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
        error:   `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
        info:    `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
      };
      const t = document.createElement("div");
      t.className = `toast toast--${type}`;
      t.id = id;
      t.setAttribute("role", "status");
      t.innerHTML = `<span class="toast__icon">${icons[type] || icons.info}</span><span class="toast__msg">${esc(message)}</span>`;
      container.appendChild(t);
      requestAnimationFrame(() => t.classList.add("toast--visible"));
      setTimeout(() => {
        t.classList.remove("toast--visible");
        setTimeout(() => t.remove(), 300);
      }, duration);
    },

    /* ── Modal ────────────────────────────────────────────── */
    modal: {
      el:       null,
      titleEl:  null,
      bodyEl:   null,
      footerEl: null,
      prevFocus: null,

      init() {
        this.el       = document.getElementById("admin-modal");
        this.titleEl  = document.getElementById("modal-title");
        this.bodyEl   = document.getElementById("modal-body");
        this.footerEl = document.getElementById("modal-footer");
        document.getElementById("modal-close-btn")?.addEventListener("click", () => this.close());
        document.getElementById("modal-backdrop")?.addEventListener("click", () => this.close());
        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape" && this.el && !this.el.hidden) this.close();
        });
      },

      open({ title, body, footer = "" }) {
        if (!this.el) return;
        this.prevFocus = document.activeElement;
        if (this.titleEl) this.titleEl.textContent = title;
        if (this.bodyEl)  this.bodyEl.innerHTML = body;
        if (this.footerEl) this.footerEl.innerHTML = footer;
        this.el.removeAttribute("hidden");
        // Focus first focusable element
        setTimeout(() => {
          const focusable = this.el.querySelector("input, select, textarea, button, [tabindex]");
          focusable?.focus();
        }, 50);
      },

      close() {
        if (!this.el) return;
        this.el.setAttribute("hidden", "");
        this.prevFocus?.focus();
      },

      setBodyHTML(html) {
        if (this.bodyEl) this.bodyEl.innerHTML = html;
      }
    },

    /* ── Confirm dialog ───────────────────────────────────── */
    confirm(title, message, onConfirm, dangerLabel = "Delete") {
      UI.modal.open({
        title,
        body: `<p style="color:var(--text-2);line-height:1.6">${esc(message)}</p>`,
        footer: `
          <button class="btn btn--ghost btn--sm" id="confirm-cancel">Cancel</button>
          <button class="btn btn--sm admin-btn--danger" id="confirm-ok">${esc(dangerLabel)}</button>
        `
      });
      document.getElementById("confirm-cancel")?.addEventListener("click", () => UI.modal.close());
      document.getElementById("confirm-ok")?.addEventListener("click", () => {
        UI.modal.close();
        onConfirm();
      });
    },

    /* ── Loading helpers ──────────────────────────────────── */
    loadingHTML: `<div class="admin-spinner-wrap"><div class="admin-loading-spinner"></div></div>`,
    emptyHTML(msg) { return `<div class="admin-empty"><p class="text-2">${esc(msg)}</p></div>`; },
    errorHTML(msg) { return `<div class="admin-error feedback-banner feedback-banner--error" style="margin:0"><p class="feedback-banner__msg">${esc(msg)}</p></div>`; }
  };

  /* ────────────────────────────────────────────────────────────
     UTILITY
  ──────────────────────────────────────────────────────────── */
  function esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function fmtDate(isoStr) {
    if (!isoStr) return "—";
    return new Date(isoStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  function fmtDateTime(isoStr) {
    if (!isoStr) return "—";
    return new Date(isoStr).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  function stars(n) {
    const full = Math.round(n || 0);
    return "★".repeat(full) + "☆".repeat(5 - full);
  }

  function badge(text, variant = "gray") {
    return `<span class="badge badge--${variant}">${esc(text)}</span>`;
  }

  function typeBadge(type) {
    const map = { rating: "blue", textarea: "gray", text: "gray", select: "purple" };
    return badge(type, map[type] || "gray");
  }

  /* ────────────────────────────────────────────────────────────
     AUTH MODULE
  ──────────────────────────────────────────────────────────── */
  const Auth = {
    async getSession() {
      if (!sb) return null;
      try {
        const { data } = await sb.auth.getSession();
        return data?.session || null;
      } catch (e) {
        return null;
      }
    },

    async isAdmin(userId) {
      if (!sb || !userId) return false;
      try {
        const { data, error } = await sb
          .from("admin_profiles")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();
        return !error && !!data;
      } catch (e) {
        return false;
      }
    },

    async guard() {
      if (!sb) {
        window.location.replace("/admin/login/");
        return false;
      }
      try {
        // Cryptographically verify session against Supabase Auth service
        const { data: userData, error: userError } = await sb.auth.getUser();
        if (userError || !userData?.user) {
          try { await sb.auth.signOut(); } catch (e) {}
          try { localStorage.clear(); } catch (e) {}
          window.location.replace("/admin/login/");
          return false;
        }

        // Authorize against admin_profiles table protected by RLS
        const admin = await this.isAdmin(userData.user.id);
        if (!admin) {
          try { await sb.auth.signOut(); } catch (e) {}
          try { localStorage.clear(); } catch (e) {}
          window.location.replace("/admin/login/");
          return false;
        }

        const session = await this.getSession();
        return { session, user: userData.user };
      } catch (err) {
        console.error("[admin] Guard error:", err);
        try { localStorage.clear(); } catch (e) {}
        window.location.replace("/admin/login/");
        return false;
      }
    },

    async signIn(email, password) {
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // Verify admin_profiles
      const admin = await this.isAdmin(data.user.id);
      if (!admin) {
        await sb.auth.signOut();
        try { localStorage.clear(); } catch (e) {}
        throw new Error("Your account does not have admin access. Contact the site owner.");
      }
      return data;
    },

    async signOut() {
      try { await sb?.auth.signOut(); } catch (e) {}
      try { localStorage.clear(); } catch (e) {}
      window.location.replace("/admin/login/");
    }
  };

  /* ────────────────────────────────────────────────────────────
     LOGIN PAGE
  ──────────────────────────────────────────────────────────── */
  async function initLoginPage() {
    // If already authenticated + admin → redirect to dashboard
    try {
      const session = await Auth.getSession();
      if (session?.user) {
        const admin = await Auth.isAdmin(session.user.id);
        if (admin) { window.location.replace("/admin/feedback/"); return; }
      }
    } catch (e) {}

    const form       = document.getElementById("login-form");
    const emailEl    = document.getElementById("login-email");
    const passEl     = document.getElementById("login-password");
    const submitBtn  = document.getElementById("login-submit-btn");
    const btnLabel   = submitBtn?.querySelector(".btn-label");
    const errorBanner= document.getElementById("login-error");
    const errorMsg   = document.getElementById("login-error-msg");
    const toggleBtn  = document.getElementById("toggle-password");

    // Password toggle
    toggleBtn?.addEventListener("click", () => {
      const isPass = passEl.type === "password";
      passEl.type = isPass ? "text" : "password";
      toggleBtn.setAttribute("aria-label", isPass ? "Hide password" : "Show password");
    });

    function showError(msg) {
      if (!errorBanner || !errorMsg) return;
      errorMsg.textContent = msg;
      errorBanner.removeAttribute("hidden");
    }

    function setLoading(loading) {
      if (submitBtn) submitBtn.disabled = loading;
      submitBtn?.classList.toggle("is-loading", loading);
      if (btnLabel) btnLabel.textContent = loading ? "Signing in..." : "Sign in";
    }

    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      errorBanner?.setAttribute("hidden", "");
      const email    = emailEl?.value?.trim() || "";
      const password = passEl?.value || "";
      if (!email || !password) { showError("Email and password are required."); return; }
      setLoading(true);
      try {
        await Auth.signIn(email, password);
        window.location.replace("/admin/feedback/");
      } catch (err) {
        setLoading(false);
        showError(err.message || "Invalid credentials. Please try again.");
      }
    });
  }

  /* ────────────────────────────────────────────────────────────
     ROUTER (hash-based tabs)
  ──────────────────────────────────────────────────────────── */
  const TABS = ["overview", "sessions", "questions", "responses"];

  const Router = {
    current: "overview",
    handlers: {},

    register(tab, fn) { this.handlers[tab] = fn; },

    navigate(tab) {
      if (!TABS.includes(tab)) tab = "overview";
      this.current = tab;
      window.location.hash = tab;
      this._render(tab);
    },

    _render(tab) {
      // Update nav items
      document.querySelectorAll(".admin-nav__item").forEach(a => {
        const isActive = a.dataset.tab === tab;
        a.classList.toggle("admin-nav__item--active", isActive);
        a.setAttribute("aria-current", isActive ? "page" : "false");
      });
      // Show/hide tab panels
      TABS.forEach(t => {
        const panel = document.getElementById(`tab-${t}`);
        if (panel) panel.hidden = t !== tab;
      });
      // Close mobile sidebar
      const sidebar = document.getElementById("admin-sidebar");
      sidebar?.classList.remove("admin-sidebar--open");
      document.getElementById("admin-sidebar-toggle")?.setAttribute("aria-expanded", "false");
      // Invoke handler
      if (this.handlers[tab]) this.handlers[tab]();
    },

    init() {
      const hash = window.location.hash.replace("#", "") || "overview";
      // Wire nav clicks
      document.querySelectorAll(".admin-nav__item").forEach(a => {
        a.addEventListener("click", (e) => {
          e.preventDefault();
          this.navigate(a.dataset.tab);
        });
      });
      this.navigate(hash);
    }
  };

  /* ────────────────────────────────────────────────────────────
     OVERVIEW MODULE
  ──────────────────────────────────────────────────────────── */
  const Overview = {
    rendered: false,

    async render() {
      if (this.rendered) return;
      const container = document.getElementById("overview-content");
      if (!container) return;
      container.innerHTML = UI.loadingHTML;

      try {
        const [overviewRes, ratingDistRes] = await Promise.all([
          sb.from("feedback_overview").select("*").maybeSingle(),
          sb.from("feedback").select("overall_rating").not("overall_rating", "is", null)
        ]);

        const stats = overviewRes.data || {};
        const ratings = (ratingDistRes.data || []).map(r => r.overall_rating);

        // Distribution
        const dist = [1,2,3,4,5].map(v => ({
          value: v,
          count: ratings.filter(r => r === v).length
        }));
        const maxCount = Math.max(...dist.map(d => d.count), 1);

        container.innerHTML = `
          ${this._statsGrid(stats)}
          ${ratings.length > 0 ? this._ratingChart(dist, maxCount, stats) : ""}
        `;
        this.rendered = true;
      } catch (err) {
        console.error("[admin/overview]", err);
        container.innerHTML = UI.errorHTML("Failed to load overview. " + err.message);
      }
    },

    _statsGrid(s) {
      const cards = [
        { label: "Total Responses",  value: s.total_responses ?? 0,                 icon: "📋" },
        { label: "Avg Overall Rating",value: s.avg_overall_rating ? `${Number(s.avg_overall_rating).toFixed(1)} / 5` : "—", icon: "⭐" },
        { label: "Active Sessions",  value: s.active_sessions ?? 0,                icon: "📚" },
        { label: "Active Questions", value: s.active_questions ?? 0,               icon: "❓" }
      ];
      return `<div class="stats-grid">${cards.map(c => `
        <div class="stat-card card">
          <div class="stat-card__emoji" aria-hidden="true">${c.icon}</div>
          <div class="stat-card__value">${esc(String(c.value))}</div>
          <div class="stat-card__label">${esc(c.label)}</div>
        </div>`).join("")}
      </div>`;
    },

    _ratingChart(dist, maxCount, stats) {
      const bars = dist.map(d => {
        const pct = Math.round((d.count / maxCount) * 100);
        return `
          <div class="chart-row">
            <span class="chart-row__label mono">${d.value}</span>
            <div class="chart-bar-wrap">
              <div class="chart-bar" style="--pct: ${pct}%" aria-label="${d.count} response${d.count !== 1 ? "s" : ""} rated ${d.value}">
                <div class="chart-bar__fill"></div>
              </div>
            </div>
            <span class="chart-row__count text-2">${d.count}</span>
          </div>`;
      }).join("");

      const avg = stats.avg_overall_rating ? Number(stats.avg_overall_rating).toFixed(2) : "—";

      return `
        <div class="admin-section-card card" style="margin-top:24px">
          <h2 class="admin-section-card__title">Overall Rating Distribution</h2>
          <p class="text-2" style="margin-bottom:20px;font-size:.875rem">Average: <strong>${esc(avg)}</strong> / 5</p>
          <div class="chart">${bars}</div>
        </div>`;
    },

    invalidate() { this.rendered = false; }
  };

  /* ────────────────────────────────────────────────────────────
     SESSIONS MODULE
  ──────────────────────────────────────────────────────────── */
  const Sessions = {
    data: [],

    async load() {
      const { data, error } = await sb
        .from("sessions")
        .select("*")
        .order("display_order");
      if (error) throw error;
      this.data = data || [];
    },

    async render() {
      const container = document.getElementById("sessions-content");
      if (!container) return;
      container.innerHTML = UI.loadingHTML;
      try {
        await this.load();
        container.innerHTML = this._buildHTML();
        this._bindEvents(container);
      } catch (err) {
        console.error("[admin/sessions]", err);
        container.innerHTML = UI.errorHTML("Failed to load sessions. " + err.message);
      }
    },

    _buildHTML() {
      if (this.data.length === 0) {
        return UI.emptyHTML(`No sessions yet. Click “Add Session” to create one.`);
      }
      const rows = this.data.map(s => `
        <tr>
          <td>${esc(s.name)}</td>
          <td class="text-2">${esc(s.description || "—")}</td>
          <td>${s.is_active ? badge("Active","green") : badge("Inactive","gray")}</td>
          <td class="mono text-2">#${s.display_order}</td>
          <td class="text-2">${fmtDate(s.created_at)}</td>
          <td>
            <div class="table-actions">
              <button class="btn btn--ghost btn--sm" data-action="edit-session" data-id="${esc(s.id)}" title="Edit">Edit</button>
              <button class="btn btn--ghost btn--sm" data-action="toggle-session" data-id="${esc(s.id)}" data-active="${s.is_active}" title="${s.is_active ? "Deactivate" : "Activate"}">
                ${s.is_active ? "Deactivate" : "Activate"}
              </button>
              <button class="btn btn--ghost btn--sm admin-btn--danger-ghost" data-action="delete-session" data-id="${esc(s.id)}" data-name="${esc(s.name)}" title="Delete">Delete</button>
            </div>
          </td>
        </tr>`).join("");

      return `
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead><tr>
              <th>Name</th><th>Description</th><th>Status</th><th>Order</th><th>Created</th><th>Actions</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`;
    },

    _bindEvents(container) {
      container.addEventListener("click", async (e) => {
        const btn = e.target.closest("[data-action]");
        if (!btn) return;
        const action = btn.dataset.action;
        const id     = btn.dataset.id;

        if (action === "edit-session")   this.openEditModal(id);
        if (action === "toggle-session") this.confirmToggle(id, btn.dataset.active === "true");
        if (action === "delete-session") this.confirmDelete(id, btn.dataset.name);
      });
    },

    openCreateModal() {
      UI.modal.open({
        title: "Add Session",
        body: this._formHTML(),
        footer: `
          <button class="btn btn--ghost btn--sm" id="modal-cancel">Cancel</button>
          <button class="btn btn--primary btn--sm" id="modal-save-session">Create Session</button>`
      });
      document.getElementById("modal-cancel")?.addEventListener("click", () => UI.modal.close());
      document.getElementById("modal-save-session")?.addEventListener("click", () => this.save(null));
    },

    openEditModal(id) {
      const s = this.data.find(x => x.id === id);
      if (!s) return;
      UI.modal.open({
        title: "Edit Session",
        body: this._formHTML(s),
        footer: `
          <button class="btn btn--ghost btn--sm" id="modal-cancel">Cancel</button>
          <button class="btn btn--primary btn--sm" id="modal-save-session">Save Changes</button>`
      });
      document.getElementById("modal-cancel")?.addEventListener("click", () => UI.modal.close());
      document.getElementById("modal-save-session")?.addEventListener("click", () => this.save(id));
    },

    _formHTML(s = {}) {
      return `
        <div class="form-group">
          <label for="s-name" class="form-label">Session Name <span class="form-label__required" aria-hidden="true">*</span></label>
          <input id="s-name" type="text" class="admin-input" value="${esc(s.name||"")}" placeholder="e.g. DevOps Fundamentals" maxlength="120" required />
        </div>
        <div class="form-group">
          <label for="s-desc" class="form-label">Description <span class="form-label__optional">(Optional)</span></label>
          <input id="s-desc" type="text" class="admin-input" value="${esc(s.description||"")}" placeholder="Brief description" maxlength="250" />
        </div>
        <div class="form-group">
          <label for="s-order" class="form-label">Display Order</label>
          <input id="s-order" type="number" class="admin-input" value="${s.display_order ?? 0}" min="0" max="999" />
        </div>
        <div class="form-group">
          <label class="form-label" style="gap:12px;cursor:pointer">
            <input type="checkbox" id="s-active" ${s.is_active !== false ? "checked" : ""} style="width:18px;height:18px;cursor:pointer;accent-color:var(--primary)" />
            <span>Active (visible on public form)</span>
          </label>
        </div>`;
    },

    async save(id) {
      const name  = document.getElementById("s-name")?.value?.trim();
      const desc  = document.getElementById("s-desc")?.value?.trim() || null;
      const order = parseInt(document.getElementById("s-order")?.value || "0", 10);
      const active= document.getElementById("s-active")?.checked ?? true;

      if (!name) { UI.toast("Session name is required.", "error"); return; }

      const payload = { name, description: desc, display_order: order, is_active: active };
      try {
        if (id) {
          const { error } = await sb.from("sessions").update(payload).eq("id", id);
          if (error) throw error;
          UI.toast("Session updated.", "success");
        } else {
          const { error } = await sb.from("sessions").insert([payload]);
          if (error) throw error;
          UI.toast("Session created.", "success");
        }
        UI.modal.close();
        Overview.invalidate();
        await this.render();
      } catch (err) {
        UI.toast("Error: " + err.message, "error");
      }
    },

    confirmToggle(id, currentlyActive) {
      const label = currentlyActive ? "Deactivate" : "Activate";
      const msg   = currentlyActive
        ? "Deactivating this session will hide it from the public feedback form. Existing responses are preserved."
        : "This session will become visible on the public feedback form.";
      UI.confirm(`${label} Session`, msg, () => this.toggle(id, !currentlyActive), label);
    },

    async toggle(id, newActive) {
      try {
        const { error } = await sb.from("sessions").update({ is_active: newActive }).eq("id", id);
        if (error) throw error;
        UI.toast(`Session ${newActive ? "activated" : "deactivated"}.`, "success");
        Overview.invalidate();
        await this.render();
      } catch (err) { UI.toast("Error: " + err.message, "error"); }
    },

    confirmDelete(id, name) {
      UI.confirm(
        "Delete Session",
        `Are you sure you want to delete "${name}"? Sessions with associated feedback will be deactivated instead of deleted to preserve data integrity.`,
        () => this.delete(id, name),
        "Delete"
      );
    },

    async delete(id, name) {
      // Check if any feedback is linked
      const { count } = await sb.from("feedback").select("id", { count: "exact", head: true }).eq("session_id", id);
      if (count > 0) {
        // Soft delete — deactivate instead
        await this.toggle(id, false);
        UI.toast(`Session "${name}" has ${count} response(s) — deactivated instead of deleted to preserve data.`, "info", 5000);
        return;
      }
      try {
        const { error } = await sb.from("sessions").delete().eq("id", id);
        if (error) throw error;
        UI.toast("Session deleted.", "success");
        Overview.invalidate();
        await this.render();
      } catch (err) { UI.toast("Error: " + err.message, "error"); }
    }
  };

  /* ────────────────────────────────────────────────────────────
     QUESTIONS MODULE
  ──────────────────────────────────────────────────────────── */
  const Questions = {
    data: [],

    async load() {
      const { data, error } = await sb
        .from("questions")
        .select("*")
        .order("display_order");
      if (error) throw error;
      this.data = data || [];
    },

    async render() {
      const container = document.getElementById("questions-content");
      if (!container) return;
      container.innerHTML = UI.loadingHTML;
      try {
        await this.load();
        container.innerHTML = this._buildHTML();
        this._bindEvents(container);
      } catch (err) {
        console.error("[admin/questions]", err);
        container.innerHTML = UI.errorHTML("Failed to load questions. " + err.message);
      }
    },

    _buildHTML() {
      if (this.data.length === 0) {
        return UI.emptyHTML(`No questions yet. Click “Add Question” to create one.`);
      }

      const rows = this.data.map((q, idx) => `
        <tr data-id="${esc(q.id)}">
          <td>
            <div class="table-reorder">
              <button class="btn btn--ghost btn--sm reorder-btn" data-action="move-up" data-id="${esc(q.id)}" ${idx === 0 ? "disabled" : ""} title="Move up" aria-label="Move question up">↑</button>
              <button class="btn btn--ghost btn--sm reorder-btn" data-action="move-down" data-id="${esc(q.id)}" ${idx === this.data.length - 1 ? "disabled" : ""} title="Move down" aria-label="Move question down">↓</button>
            </div>
          </td>
          <td class="mono text-2">${q.display_order}</td>
          <td>${esc(q.question)}</td>
          <td>${typeBadge(q.type)}</td>
          <td>${q.is_required ? badge("Required","blue") : badge("Optional","gray")}</td>
          <td>${q.is_active ? badge("Active","green") : badge("Inactive","gray")}</td>
          <td>
            <div class="table-actions">
              <button class="btn btn--ghost btn--sm" data-action="edit-question" data-id="${esc(q.id)}" title="Edit">Edit</button>
              <button class="btn btn--ghost btn--sm" data-action="toggle-question" data-id="${esc(q.id)}" data-active="${q.is_active}" title="${q.is_active ? "Deactivate" : "Activate"}">
                ${q.is_active ? "Deactivate" : "Activate"}
              </button>
              <button class="btn btn--ghost btn--sm admin-btn--danger-ghost" data-action="delete-question" data-id="${esc(q.id)}" title="Delete">Delete</button>
            </div>
          </td>
        </tr>`).join("");

      return `
        <p class="text-2" style="margin-bottom:12px;font-size:.875rem">Questions are displayed on the public form in the order shown. Use ↑ ↓ to reorder.</p>
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead><tr>
              <th>Order</th><th>#</th><th>Question</th><th>Type</th><th>Required</th><th>Status</th><th>Actions</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`;
    },

    _bindEvents(container) {
      container.addEventListener("click", async (e) => {
        const btn = e.target.closest("[data-action]");
        if (!btn) return;
        const action = btn.dataset.action;
        const id     = btn.dataset.id;

        if (action === "edit-question")   this.openEditModal(id);
        if (action === "toggle-question") this.confirmToggle(id, btn.dataset.active === "true");
        if (action === "delete-question") this.confirmDelete(id);
        if (action === "move-up")         await this.reorder(id, "up");
        if (action === "move-down")       await this.reorder(id, "down");
      });
    },

    openCreateModal() {
      UI.modal.open({
        title: "Add Question",
        body: this._formHTML(),
        footer: `
          <button class="btn btn--ghost btn--sm" id="modal-cancel">Cancel</button>
          <button class="btn btn--primary btn--sm" id="modal-save-question">Create Question</button>`
      });
      document.getElementById("modal-cancel")?.addEventListener("click", () => UI.modal.close());
      document.getElementById("modal-save-question")?.addEventListener("click", () => this.save(null));
    },

    openEditModal(id) {
      const q = this.data.find(x => x.id === id);
      if (!q) return;
      UI.modal.open({
        title: "Edit Question",
        body: this._formHTML(q),
        footer: `
          <button class="btn btn--ghost btn--sm" id="modal-cancel">Cancel</button>
          <button class="btn btn--primary btn--sm" id="modal-save-question">Save Changes</button>`
      });
      document.getElementById("modal-cancel")?.addEventListener("click", () => UI.modal.close());
      document.getElementById("modal-save-question")?.addEventListener("click", () => this.save(id));
    },

    _formHTML(q = {}) {
      const types = ["rating", "textarea", "text", "select"];
      const typeOptions = types.map(t =>
        `<option value="${t}" ${q.type === t ? "selected" : ""}>${t.charAt(0).toUpperCase() + t.slice(1)}</option>`
      ).join("");

      return `
        <div class="form-group">
          <label for="q-text" class="form-label">Question Text <span class="form-label__required" aria-hidden="true">*</span></label>
          <textarea id="q-text" class="form-textarea" rows="2" maxlength="500" placeholder="e.g. How would you rate this session?">${esc(q.question||"")}</textarea>
        </div>
        <div class="form-group">
          <label for="q-desc" class="form-label">Description / Help Text <span class="form-label__optional">(Optional)</span></label>
          <input id="q-desc" type="text" class="admin-input" value="${esc(q.description||"")}" placeholder="Help text shown below the question" maxlength="250" />
          <p class="form-hint">For "select" type questions, enter comma-separated options here (e.g. "Beginner, Intermediate, Advanced").</p>
        </div>
        <div class="form-group">
          <label for="q-type" class="form-label">Question Type <span class="form-label__required" aria-hidden="true">*</span></label>
          <div class="select-wrapper">
            <select id="q-type" class="form-select">
              ${typeOptions}
            </select>
            <div class="select-chevron" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label for="q-order" class="form-label">Display Order</label>
          <input id="q-order" type="number" class="admin-input" value="${q.display_order ?? (this.data.length + 1)}" min="0" max="999" />
        </div>
        <div class="form-group" style="display:flex;gap:24px;flex-wrap:wrap">
          <label class="form-label" style="gap:12px;cursor:pointer">
            <input type="checkbox" id="q-required" ${q.is_required ? "checked" : ""} style="width:18px;height:18px;cursor:pointer;accent-color:var(--primary)" />
            <span>Required</span>
          </label>
          <label class="form-label" style="gap:12px;cursor:pointer">
            <input type="checkbox" id="q-active" ${q.is_active !== false ? "checked" : ""} style="width:18px;height:18px;cursor:pointer;accent-color:var(--primary)" />
            <span>Active</span>
          </label>
        </div>`;
    },

    async save(id) {
      const question = document.getElementById("q-text")?.value?.trim();
      const desc     = document.getElementById("q-desc")?.value?.trim() || null;
      const type     = document.getElementById("q-type")?.value;
      const order    = parseInt(document.getElementById("q-order")?.value || "0", 10);
      const required = document.getElementById("q-required")?.checked ?? false;
      const active   = document.getElementById("q-active")?.checked ?? true;

      if (!question) { UI.toast("Question text is required.", "error"); return; }
      const payload = { question, description: desc, type, display_order: order, is_required: required, is_active: active };
      try {
        if (id) {
          const { error } = await sb.from("questions").update(payload).eq("id", id);
          if (error) throw error;
          UI.toast("Question updated.", "success");
        } else {
          const { error } = await sb.from("questions").insert([payload]);
          if (error) throw error;
          UI.toast("Question created.", "success");
        }
        UI.modal.close();
        Overview.invalidate();
        await this.render();
      } catch (err) { UI.toast("Error: " + err.message, "error"); }
    },

    async reorder(id, direction) {
      const idx = this.data.findIndex(q => q.id === id);
      if (idx < 0) return;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= this.data.length) return;

      const a = this.data[idx];
      const b = this.data[swapIdx];
      const orderA = a.display_order;
      const orderB = b.display_order;

      try {
        // Swap using a temp value to avoid unique constraint issues
        await sb.from("questions").update({ display_order: orderB }).eq("id", a.id);
        await sb.from("questions").update({ display_order: orderA }).eq("id", b.id);
        await this.render();
      } catch (err) { UI.toast("Reorder failed: " + err.message, "error"); }
    },

    confirmToggle(id, currentlyActive) {
      const label = currentlyActive ? "Deactivate" : "Activate";
      const msg   = currentlyActive
        ? "This question will be hidden from the public form. Existing responses are preserved."
        : "This question will appear on the public form.";
      UI.confirm(`${label} Question`, msg, () => this.toggle(id, !currentlyActive), label);
    },

    async toggle(id, newActive) {
      try {
        const { error } = await sb.from("questions").update({ is_active: newActive }).eq("id", id);
        if (error) throw error;
        UI.toast(`Question ${newActive ? "activated" : "deactivated"}.`, "success");
        Overview.invalidate();
        await this.render();
      } catch (err) { UI.toast("Error: " + err.message, "error"); }
    },

    confirmDelete(id) {
      UI.confirm(
        "Delete Question",
        "Are you sure? If this question has existing responses, it will be deactivated instead to preserve historical data.",
        () => this.delete(id)
      );
    },

    async delete(id) {
      // Check for existing responses
      const { count } = await sb.from("feedback_responses").select("id", { count: "exact", head: true }).eq("question_id", id);
      if (count > 0) {
        await this.toggle(id, false);
        UI.toast(`Question has ${count} response(s) — deactivated to preserve data.`, "info", 5000);
        return;
      }
      try {
        const { error } = await sb.from("questions").delete().eq("id", id);
        if (error) throw error;
        UI.toast("Question deleted.", "success");
        Overview.invalidate();
        await this.render();
      } catch (err) { UI.toast("Error: " + err.message, "error"); }
    }
  };

  /* ────────────────────────────────────────────────────────────
     RESPONSES MODULE
  ──────────────────────────────────────────────────────────── */
  const Responses = {
    sessions: [],
    PAGE_SIZE: 20,
    _filters: { session: "", search: "", dateFrom: "", dateTo: "", rating: "" },
    _page: 0,
    _total: 0,

    async loadSessions() {
      const { data } = await sb.from("sessions").select("id, name").order("display_order");
      this.sessions = data || [];
    },

    async render() {
      const container = document.getElementById("responses-content");
      if (!container) return;
      container.innerHTML = UI.loadingHTML;
      try {
        await this.loadSessions();
        this._page = 0;
        container.innerHTML = this._buildHTML();
        this._bindEvents(container);
        await this.loadList(container);
      } catch (err) {
        console.error("[admin/responses]", err);
        container.innerHTML = UI.errorHTML("Failed to load responses. " + err.message);
      }
    },

    _buildHTML() {
      const sessionOptions = this.sessions.map(s =>
        `<option value="${esc(s.id)}">${esc(s.name)}</option>`
      ).join("");

      return `
        <!-- Filters -->
        <div class="filter-bar card" style="margin-bottom:20px">
          <div class="filter-group">
            <label class="form-label" for="filter-session">Session</label>
            <div class="select-wrapper">
              <select id="filter-session" class="form-select" style="min-width:180px">
                <option value="">All Sessions</option>
                ${sessionOptions}
              </select>
              <div class="select-chevron" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </div>
          </div>
          <div class="filter-group">
            <label class="form-label" for="filter-rating">Min Rating</label>
            <div class="select-wrapper">
              <select id="filter-rating" class="form-select">
                <option value="">Any</option>
                <option value="5">★★★★★ (5)</option>
                <option value="4">★★★★ (4+)</option>
                <option value="3">★★★ (3+)</option>
                <option value="2">★★ (2+)</option>
                <option value="1">★ (1+)</option>
              </select>
              <div class="select-chevron" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </div>
          </div>
          <div class="filter-group">
            <label class="form-label" for="filter-date-from">From</label>
            <input type="date" id="filter-date-from" class="admin-input" />
          </div>
          <div class="filter-group">
            <label class="form-label" for="filter-date-to">To</label>
            <input type="date" id="filter-date-to" class="admin-input" />
          </div>
          <div class="filter-group filter-group--search">
            <label class="form-label" for="filter-search">Search</label>
            <input type="search" id="filter-search" class="admin-input" placeholder="Search responses…" />
          </div>
          <button class="btn btn--ghost btn--sm" id="filter-reset">Reset</button>
        </div>

        <!-- Results info -->
        <p class="text-2" id="responses-count" style="margin-bottom:12px;font-size:.875rem"></p>

        <!-- List -->
        <div id="responses-list"></div>

        <!-- Pagination -->
        <div id="responses-pagination" class="admin-pagination"></div>`;
    },

    _bindEvents(container) {
      let searchTimer;
      const applyFilters = async () => {
        this._page = 0;
        this._filters = {
          session:  container.querySelector("#filter-session")?.value || "",
          rating:   container.querySelector("#filter-rating")?.value || "",
          dateFrom: container.querySelector("#filter-date-from")?.value || "",
          dateTo:   container.querySelector("#filter-date-to")?.value || "",
          search:   container.querySelector("#filter-search")?.value?.trim() || ""
        };
        await this.loadList(container);
      };

      container.querySelector("#filter-session")?.addEventListener("change", applyFilters);
      container.querySelector("#filter-rating")?.addEventListener("change", applyFilters);
      container.querySelector("#filter-date-from")?.addEventListener("change", applyFilters);
      container.querySelector("#filter-date-to")?.addEventListener("change", applyFilters);
      container.querySelector("#filter-search")?.addEventListener("input", () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(applyFilters, 350);
      });
      container.querySelector("#filter-reset")?.addEventListener("click", async () => {
        container.querySelector("#filter-session").value = "";
        container.querySelector("#filter-rating").value = "";
        container.querySelector("#filter-date-from").value = "";
        container.querySelector("#filter-date-to").value = "";
        container.querySelector("#filter-search").value = "";
        this._filters = { session: "", search: "", dateFrom: "", dateTo: "", rating: "" };
        this._page = 0;
        await this.loadList(container);
      });

      // Pagination + response click events bubble to container
      container.addEventListener("click", async (e) => {
        const btn = e.target.closest("[data-action]");
        if (!btn) return;
        if (btn.dataset.action === "page") {
          this._page = parseInt(btn.dataset.page, 10);
          await this.loadList(container);
        }
        if (btn.dataset.action === "view-response") {
          await this.viewDetail(btn.dataset.id);
        }
      });
    },

    async loadList(container) {
      const listEl  = container.querySelector("#responses-list");
      const countEl = container.querySelector("#responses-count");
      const pagEl   = container.querySelector("#responses-pagination");
      if (!listEl) return;
      listEl.innerHTML = UI.loadingHTML;

      let query = sb.from("feedback")
        .select("id, session_name, session_id, overall_rating, created_at", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(this._page * this.PAGE_SIZE, (this._page + 1) * this.PAGE_SIZE - 1);

      const f = this._filters;
      if (f.session)  query = query.eq("session_id", f.session);
      if (f.rating)   query = query.gte("overall_rating", parseInt(f.rating, 10));
      if (f.dateFrom) query = query.gte("created_at", f.dateFrom);
      if (f.dateTo)   query = query.lte("created_at", f.dateTo + "T23:59:59");

      try {
        const { data, count, error } = await query;
        if (error) throw error;
        this._total = count || 0;

        if (countEl) countEl.textContent = `${this._total} response${this._total !== 1 ? "s" : ""} found`;

        let filtered = data || [];
        if (f.search) {
          // Client-side text search on the subset (for simplicity)
          const s = f.search.toLowerCase();
          filtered = filtered.filter(r =>
            r.session_name?.toLowerCase().includes(s)
          );
        }

        if (filtered.length === 0) {
          listEl.innerHTML = UI.emptyHTML("No responses match the current filters.");
          pagEl.innerHTML = "";
          return;
        }

        const rows = filtered.map(r => `
          <div class="response-row card" style="margin-bottom:8px;padding:16px 20px;cursor:pointer" data-action="view-response" data-id="${esc(r.id)}" role="button" tabindex="0" aria-label="View response from ${esc(r.session_name || "Unknown session")}">
            <div class="response-row__main">
              <span class="response-row__session">${esc(r.session_name || "Unknown")}</span>
              <span class="response-row__rating">${r.overall_rating ? stars(r.overall_rating) + ` (${r.overall_rating}/5)` : "—"}</span>
              <span class="response-row__date text-2">${fmtDateTime(r.created_at)}</span>
            </div>
            <div class="response-row__caret text-2" aria-hidden="true">→</div>
          </div>`).join("");

        listEl.innerHTML = `<div class="responses-list">${rows}</div>`;

        // Keyboard navigation for response rows
        listEl.querySelectorAll("[data-action='view-response']").forEach(el => {
          el.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              this.viewDetail(el.dataset.id);
            }
          });
        });

        // Pagination
        const totalPages = Math.ceil(this._total / this.PAGE_SIZE);
        if (totalPages > 1) {
          const pages = Array.from({ length: totalPages }, (_, i) => `
            <button class="btn btn--ghost btn--sm ${i === this._page ? "admin-pagination__btn--active" : ""}"
                    data-action="page" data-page="${i}">${i + 1}</button>`).join("");
          pagEl.innerHTML = `<div class="admin-pagination__wrap">${pages}</div>`;
        } else {
          pagEl.innerHTML = "";
        }

      } catch (err) {
        listEl.innerHTML = UI.errorHTML("Failed to load responses: " + err.message);
      }
    },

    async viewDetail(id) {
      UI.modal.open({ title: "Loading response…", body: UI.loadingHTML, footer: "" });

      try {
        // Fetch the feedback row
        const { data: fb, error: fbErr } = await sb
          .from("feedback")
          .select("*")
          .eq("id", id)
          .single();
        if (fbErr) throw fbErr;

        // Fetch responses with question text
        const { data: responses, error: respErr } = await sb
          .from("feedback_responses")
          .select("answer, question_id, questions(question, type, display_order)")
          .eq("feedback_id", id)
          .order("question_id");
        if (respErr) {
          // Non-fatal: Phase 1 submissions have no responses
          console.warn("[admin] No responses found for this submission.");
        }

        const answersHTML = this._buildDetailAnswers(fb, responses || []);

        UI.modal.open({
          title: `Feedback — ${esc(fb.session_name || "Unknown Session")}`,
          body: `
            <p class="text-2" style="margin-bottom:16px;font-size:.875rem">Submitted: ${fmtDateTime(fb.created_at)}</p>
            ${answersHTML}`,
          footer: `<button class="btn btn--ghost btn--sm" id="modal-cancel">Close</button>`
        });
        document.getElementById("modal-cancel")?.addEventListener("click", () => UI.modal.close());

      } catch (err) {
        UI.modal.open({
          title: "Error",
          body: UI.errorHTML("Could not load response: " + err.message),
          footer: `<button class="btn btn--ghost btn--sm" id="modal-cancel">Close</button>`
        });
        document.getElementById("modal-cancel")?.addEventListener("click", () => UI.modal.close());
      }
    },

    _buildDetailAnswers(fb, responses) {
      const items = [];

      // Phase 2 dynamic responses (from feedback_responses table)
      if (responses.length > 0) {
        responses
          .sort((a, b) => (a.questions?.display_order ?? 0) - (b.questions?.display_order ?? 0))
          .forEach(r => {
            if (!r.answer) return;
            const q = r.questions;
            items.push({ label: q?.question || "Question", value: r.answer, type: q?.type });
          });
      }

      // Phase 1 flat columns (always present for backwards compat)
      const phase1 = [
        { label: "Overall Rating",     value: fb.overall_rating     ? `${stars(fb.overall_rating)} (${fb.overall_rating}/5)` : null, raw: true },
        { label: "Explanation Rating", value: fb.explanation_rating  ? `${stars(fb.explanation_rating)} (${fb.explanation_rating}/5)` : null, raw: true },
        { label: "Content Rating",     value: fb.content_rating      ? `${stars(fb.content_rating)} (${fb.content_rating}/5)` : null, raw: true },
        { label: "What did you like?", value: fb.liked                || null },
        { label: "Improvements",       value: fb.improvements         || null },
        { label: "Future Topics",      value: fb.future_topics        || null },
        { label: "Additional Feedback",value: fb.additional_feedback  || null }
      ].filter(x => x.value);

      // If no Phase 2 responses, fall back to Phase 1 data display
      const displayItems = responses.length > 0 ? items : phase1;

      if (displayItems.length === 0) return `<p class="text-2">No answer data recorded for this submission.</p>`;

      return displayItems.map(item => `
        <div class="response-detail-item">
          <p class="response-detail-item__label mono">${esc(item.label)}</p>
          <p class="response-detail-item__value">${item.raw ? item.value : esc(item.value)}</p>
        </div>`).join("");
    }
  };

  /* ────────────────────────────────────────────────────────────
     DASHBOARD MOUNT & INIT (Post-Authorization Only)
  ──────────────────────────────────────────────────────────── */
  function mountDashboard(authUser) {
    const mount = document.getElementById("admin-dashboard-mount");
    if (!mount) return;

    mount.innerHTML = `
      <div class="admin-layout" id="admin-main" aria-label="Admin dashboard">
        <aside class="admin-sidebar" id="admin-sidebar" role="navigation" aria-label="Admin navigation">
          <div class="admin-sidebar__header">
            <a href="/" class="admin-sidebar__brand" aria-label="Return to portfolio">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span class="mono">Feedback Admin</span>
            </a>
          </div>

          <nav class="admin-nav" aria-label="Dashboard sections">
            <a href="#overview"   class="admin-nav__item" data-tab="overview"   aria-current="false">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <span>Overview</span>
            </a>
            <a href="#sessions"   class="admin-nav__item" data-tab="sessions"   aria-current="false">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
              <span>Sessions</span>
            </a>
            <a href="#questions"  class="admin-nav__item" data-tab="questions"  aria-current="false">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <span>Questions</span>
            </a>
            <a href="#responses"  class="admin-nav__item" data-tab="responses"  aria-current="false">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
              <span>Responses</span>
            </a>
          </nav>

          <div class="admin-sidebar__footer">
            <div class="admin-user-info" id="admin-user-info" aria-live="polite">
              <div class="admin-user-email mono" title="${esc(authUser.user?.email || "Admin")}">${esc(authUser.user?.email || "Admin")}</div>
            </div>
            <button class="btn btn--ghost btn--sm admin-signout-btn" id="admin-signout-btn" type="button">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Sign out
            </button>
          </div>
        </aside>

        <!-- Mobile sidebar toggle -->
        <button class="admin-sidebar-toggle" id="admin-sidebar-toggle" aria-expanded="false" aria-controls="admin-sidebar" aria-label="Toggle navigation">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <!-- Main Content -->
        <main class="admin-content" id="admin-content" tabindex="-1">
          <!-- Overview Tab -->
          <section id="tab-overview" class="admin-tab" role="tabpanel" aria-labelledby="nav-overview" hidden>
            <div class="admin-tab-header">
              <h1 class="admin-tab-title">Overview</h1>
            </div>
            <div id="overview-content"></div>
          </section>

          <!-- Sessions Tab -->
          <section id="tab-sessions" class="admin-tab" role="tabpanel" aria-labelledby="nav-sessions" hidden>
            <div class="admin-tab-header">
              <h1 class="admin-tab-title">Sessions</h1>
              <button class="btn btn--primary btn--sm" id="add-session-btn" type="button">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add Session
              </button>
            </div>
            <div id="sessions-content"></div>
          </section>

          <!-- Questions Tab -->
          <section id="tab-questions" class="admin-tab" role="tabpanel" aria-labelledby="nav-questions" hidden>
            <div class="admin-tab-header">
              <h1 class="admin-tab-title">Questions</h1>
              <button class="btn btn--primary btn--sm" id="add-question-btn" type="button">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add Question
              </button>
            </div>
            <div id="questions-content"></div>
          </section>

          <!-- Responses Tab -->
          <section id="tab-responses" class="admin-tab" role="tabpanel" aria-labelledby="nav-responses" hidden>
            <div class="admin-tab-header">
              <h1 class="admin-tab-title">Responses</h1>
            </div>
            <div id="responses-content"></div>
          </section>
        </main>
      </div>

      <!-- Global Modal -->
      <div class="admin-modal" id="admin-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" hidden>
        <div class="admin-modal__backdrop" id="modal-backdrop"></div>
        <div class="admin-modal__box">
          <div class="admin-modal__header">
            <h2 class="admin-modal__title" id="modal-title">Modal</h2>
            <button class="admin-modal__close" id="modal-close-btn" aria-label="Close dialog">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="admin-modal__body" id="modal-body"></div>
          <div class="admin-modal__footer" id="modal-footer"></div>
        </div>
      </div>

      <!-- Toast container -->
      <div class="toast-container" id="toast-container" aria-live="polite" aria-atomic="false"></div>
    `;

    // Remove loading screen from view
    document.getElementById("admin-auth-loading")?.remove();
  }

  async function initDashboard() {
    // 1. Strict Cryptographic & RLS Auth Guard
    const authUser = await Auth.guard();
    if (!authUser) return; // Immediate rejection & redirect

    // 2. Mount Privileged UI to DOM only after authorization verified
    mountDashboard(authUser);

    // 3. Bind sign out with storage clearing
    document.getElementById("admin-signout-btn")?.addEventListener("click", async () => {
      await Auth.signOut();
    });

    // 4. Mobile sidebar toggle
    const sidebarToggle = document.getElementById("admin-sidebar-toggle");
    const sidebar = document.getElementById("admin-sidebar");
    sidebarToggle?.addEventListener("click", () => {
      const isOpen = sidebar.classList.toggle("admin-sidebar--open");
      sidebarToggle.setAttribute("aria-expanded", String(isOpen));
    });

    // 5. Add session / question buttons
    document.getElementById("add-session-btn")?.addEventListener("click", () => Sessions.openCreateModal());
    document.getElementById("add-question-btn")?.addEventListener("click", () => Questions.openCreateModal());

    // 6. Initialize modal
    UI.modal.init();

    // 7. Register tab handlers
    Router.register("overview",   () => Overview.render());
    Router.register("sessions",   () => Sessions.render());
    Router.register("questions",  () => Questions.render());
    Router.register("responses",  () => Responses.render());

    // 8. Start router
    Router.init();
  }

  /* ────────────────────────────────────────────────────────────
     BOOTSTRAP
  ──────────────────────────────────────────────────────────── */
  if (isLoginPage)     initLoginPage();
  if (isDashboardPage) initDashboard();

})();
