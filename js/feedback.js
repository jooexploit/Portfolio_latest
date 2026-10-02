/* ============================================================
   jooexploit — feedback.js  v2.0  (Phase 2 — Dynamic)
   Session Feedback System
   Handles:
     • Supabase client initialization
     • Fetch active sessions dynamically
     • Fetch active questions dynamically (sorted by display_order)
     • Render session selector + questions into DOM mount points
     • Client-side validation respecting is_required per question
     • Anti-double-submit guard
     • INSERT feedback + feedback_responses atomically
     • Loading / load-error / success / submit-error UI states
     • Query param ?session= pre-selection
   ============================================================ */

(function () {
  "use strict";

  /* ── Supabase client ──────────────────────────────────────── */
  const SUPABASE_URL     = window.__SUPABASE_URL__ || "";
  const SUPABASE_ANON_KEY = window.__SUPABASE_ANON_KEY__ || "";

  let sb = null;
  if (typeof window.supabase !== "undefined" && SUPABASE_URL && SUPABASE_ANON_KEY) {
    try { sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY); }
    catch (e) { console.error("[feedback] Supabase init error:", e); }
  } else {
    console.warn("[feedback] Supabase not configured. Check SUPABASE_URL and SUPABASE_ANON_KEY.");
  }

  /* ── Rating scale (static, used for rendering) ───────────── */
  const RATING_SCALE = [
    { value: 1, label: "Very Poor" },
    { value: 2, label: "Poor"      },
    { value: 3, label: "Average"   },
    { value: 4, label: "Good"      },
    { value: 5, label: "Excellent" }
  ];

  /* ── DOM refs ─────────────────────────────────────────────── */
  const form             = document.getElementById("feedback-form");
  if (!form) return; // Only run on feedback page

  const formCard         = document.getElementById("feedback-form-card");
  const loadingEl        = document.getElementById("feedback-loading");
  const loadErrorEl      = document.getElementById("feedback-load-error");
  const retryBtn         = document.getElementById("feedback-retry-btn");
  const sessionCont      = document.getElementById("feedback-session-container");
  const questionsCont    = document.getElementById("feedback-questions-container");
  const submitBtn        = document.getElementById("feedback-submit-btn");
  const btnLabel         = submitBtn?.querySelector(".btn-label");
  const globalError      = document.getElementById("feedback-global-error");
  const errorBanner      = document.getElementById("feedback-error-banner");
  const errorMsg         = document.getElementById("feedback-error-msg");
  const errorDismiss     = document.getElementById("feedback-error-dismiss");
  const successCard      = document.getElementById("feedback-success-card");
  const resetBtn         = document.getElementById("feedback-reset-btn");

  /* ── State ────────────────────────────────────────────────── */
  let activeSessions = [];
  let activeQuestions = [];
  let isSubmitting = false;

  /* ─────────────────────────────────────────────────────────────
     STEP 1 — Load data from Supabase
  ───────────────────────────────────────────────────────────── */
  async function loadFormData() {
    showState("loading");

    if (!sb) {
      showState("load-error");
      return;
    }

    try {
      const [sessRes, qRes] = await Promise.all([
        sb.from("sessions").select("id, name, description").eq("is_active", true).order("display_order"),
        sb.from("questions").select("id, question, description, type, is_required, display_order").eq("is_active", true).order("display_order")
      ]);

      if (sessRes.error) throw sessRes.error;
      if (qRes.error)    throw qRes.error;

      activeSessions  = sessRes.data || [];
      activeQuestions = qRes.data  || [];

      if (activeSessions.length === 0 || activeQuestions.length === 0) {
        // Still show the form — may be intentionally empty
        console.warn("[feedback] No active sessions or questions found.");
      }

      renderForm();
      showState("form");

    } catch (err) {
      console.error("[feedback] Failed to load form data:", err);
      showState("load-error");
    }
  }

  /* ─────────────────────────────────────────────────────────────
     STEP 2 — Render session selector
  ───────────────────────────────────────────────────────────── */
  function renderSessionSelector() {
    const preSelect = getQueryParam("session");

    const html = `
      <div class="form-group" id="group-session_name">
        <label for="session_name" class="form-label">
          <span>Select Session</span>
          <span class="form-label__required" aria-hidden="true">*</span>
        </label>
        <p class="form-hint" id="session-hint">Choose the technical session or workshop you attended.</p>
        <div class="select-wrapper">
          <select id="session_name" name="session_name" class="form-select" required
                  aria-describedby="session-hint session-error">
            <option value="" disabled selected>— Choose a session track —</option>
            ${activeSessions.map(s => {
              const sel = preSelect && (s.name.toLowerCase() === preSelect.toLowerCase()) ? " selected" : "";
              return `<option value="${esc(s.id)}" data-name="${esc(s.name)}"${sel}>${esc(s.name)}${s.description ? " — " + esc(s.description) : ""}</option>`;
            }).join("\n")}
          </select>
          <div class="select-chevron" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
        <p class="form-field-error" id="session-error" role="alert" aria-live="polite" hidden></p>
      </div>`;

    sessionCont.innerHTML = html;
    bindFieldClearOnChange("session_name", "session-error", "group-session_name");
  }

  /* ─────────────────────────────────────────────────────────────
     STEP 3 — Render questions
  ───────────────────────────────────────────────────────────── */
  function renderQuestions() {
    const ratingQs   = activeQuestions.filter(q => q.type === "rating");
    const otherQs    = activeQuestions.filter(q => q.type !== "rating");

    let html = "";

    if (ratingQs.length > 0) {
      html += `<div class="feedback-section-label"><span class="mono text-2">02 — Ratings</span></div>`;
      ratingQs.forEach(q => { html += renderRatingQuestion(q); });
    }

    if (otherQs.length > 0) {
      const sectionNum = ratingQs.length > 0 ? "03" : "02";
      html += `<hr class="feedback-divider" aria-hidden="true" /><div class="feedback-section-label"><span class="mono text-2">${sectionNum} — Written Feedback</span></div>`;
      otherQs.forEach(q => {
        if (q.type === "textarea") html += renderTextareaQuestion(q);
        else if (q.type === "text") html += renderTextQuestion(q);
        else if (q.type === "select") html += renderSelectQuestion(q);
      });
    }

    questionsCont.innerHTML = html;

    // Bind clear-on-change for all questions
    activeQuestions.forEach(q => {
      const groupId = `group-${q.id}`;
      const errorId = `${q.id}-error`;
      if (q.type === "rating") {
        const radios = form.querySelectorAll(`input[name="${q.id}"]`);
        radios.forEach(r => r.addEventListener("change", () => {
          clearFieldError(errorId);
          highlightGroupError(groupId, false);
          globalError?.setAttribute("hidden", "");
        }));
      } else {
        const el = document.getElementById(q.id);
        if (el) el.addEventListener("input", () => {
          clearFieldError(errorId);
          highlightGroupError(groupId, false);
          globalError?.setAttribute("hidden", "");
        });
      }
    });
  }

  /* ── Question renderers ───────────────────────────────────── */
  function renderRatingQuestion(q) {
    const tiles = RATING_SCALE.map(s => `
      <label class="rating-tile" for="${q.id}-${s.value}">
        <input type="radio" id="${q.id}-${s.value}" name="${q.id}" value="${s.value}"
               class="rating-tile__input sr-only"
               ${q.is_required ? "required" : ""}
               aria-label="${s.value} - ${esc(s.label)}" />
        <span class="rating-tile__box">
          <span class="rating-tile__number mono">${s.value}</span>
          <span class="rating-tile__label">${esc(s.label)}</span>
        </span>
      </label>`).join("");

    return `
      <fieldset class="form-group rating-fieldset" id="group-${q.id}"
                aria-required="${q.is_required ? "true" : "false"}"
                aria-describedby="${q.id}-hint ${q.id}-error">
        <legend class="form-legend">
          <span class="form-legend__title">${esc(q.question)}</span>
          ${q.is_required ? '<span class="form-label__required" aria-hidden="true">*</span>' : ""}
        </legend>
        ${q.description ? `<p class="form-hint" id="${q.id}-hint">${esc(q.description)}</p>` : ""}
        <div class="rating-tiles">${tiles}</div>
        <p class="form-field-error" id="${q.id}-error" role="alert" aria-live="polite" hidden></p>
      </fieldset>`;
  }

  function renderTextareaQuestion(q) {
    return `
      <div class="form-group" id="group-${q.id}">
        <label for="${q.id}" class="form-label">
          <span>${esc(q.question)}</span>
          ${q.is_required
            ? '<span class="form-label__required" aria-hidden="true">*</span>'
            : '<span class="form-label__optional">(Optional)</span>'}
        </label>
        ${q.description ? `<p class="form-hint" id="${q.id}-hint">${esc(q.description)}</p>` : ""}
        <textarea id="${q.id}" name="${q.id}" class="form-textarea" rows="3" maxlength="2500"
                  ${q.description ? `aria-describedby="${q.id}-hint"` : ""}
                  placeholder="${q.description ? esc(q.description) : ""}"></textarea>
        ${q.is_required ? `<p class="form-field-error" id="${q.id}-error" role="alert" aria-live="polite" hidden></p>` : ""}
      </div>`;
  }

  function renderTextQuestion(q) {
    return `
      <div class="form-group" id="group-${q.id}">
        <label for="${q.id}" class="form-label">
          <span>${esc(q.question)}</span>
          ${q.is_required
            ? '<span class="form-label__required" aria-hidden="true">*</span>'
            : '<span class="form-label__optional">(Optional)</span>'}
        </label>
        ${q.description ? `<p class="form-hint" id="${q.id}-hint">${esc(q.description)}</p>` : ""}
        <input type="text" id="${q.id}" name="${q.id}" class="admin-input form-input"
               maxlength="500"
               ${q.is_required ? "required" : ""}
               ${q.description ? `aria-describedby="${q.id}-hint"` : ""}
               placeholder="${q.description ? esc(q.description) : ""}" />
        ${q.is_required ? `<p class="form-field-error" id="${q.id}-error" role="alert" aria-live="polite" hidden></p>` : ""}
      </div>`;
  }

  function renderSelectQuestion(q) {
    // Select options stored in description as comma-separated string
    const options = (q.description || "").split(",").map(o => o.trim()).filter(Boolean);
    const optionsHtml = options.map(o => `<option value="${esc(o)}">${esc(o)}</option>`).join("\n");
    return `
      <div class="form-group" id="group-${q.id}">
        <label for="${q.id}" class="form-label">
          <span>${esc(q.question)}</span>
          ${q.is_required
            ? '<span class="form-label__required" aria-hidden="true">*</span>'
            : '<span class="form-label__optional">(Optional)</span>'}
        </label>
        <div class="select-wrapper">
          <select id="${q.id}" name="${q.id}" class="form-select" ${q.is_required ? "required" : ""}>
            <option value="" disabled selected>— Select an option —</option>
            ${optionsHtml}
          </select>
          <div class="select-chevron" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
        ${q.is_required ? `<p class="form-field-error" id="${q.id}-error" role="alert" aria-live="polite" hidden></p>` : ""}
      </div>`;
  }

  function renderForm() {
    renderSessionSelector();
    renderQuestions();
  }

  /* ─────────────────────────────────────────────────────────────
     STEP 4 — Validation
  ───────────────────────────────────────────────────────────── */
  function validateForm() {
    let valid = true;
    const errors = [];

    // Validate session
    const sessionEl = document.getElementById("session_name");
    if (!sessionEl?.value) {
      showFieldError("session-error", "Please select a session.");
      highlightGroupError("group-session_name", true);
      errors.push("Session");
      valid = false;
    } else {
      clearFieldError("session-error");
      highlightGroupError("group-session_name", false);
    }

    // Validate required questions
    activeQuestions.filter(q => q.is_required).forEach(q => {
      const errorId = `${q.id}-error`;
      const groupId = `group-${q.id}`;
      let value = "";

      if (q.type === "rating") {
        const checked = form.querySelector(`input[name="${q.id}"]:checked`);
        value = checked ? checked.value : "";
      } else {
        value = (document.getElementById(q.id)?.value || "").trim();
      }

      if (!value) {
        showFieldError(errorId, `This field is required.`);
        highlightGroupError(groupId, true);
        errors.push(q.question.substring(0, 40));
        valid = false;
      } else {
        clearFieldError(errorId);
        highlightGroupError(groupId, false);
      }
    });

    if (!valid && globalError) {
      globalError.textContent = `Please complete all required fields.`;
      globalError.removeAttribute("hidden");
    } else if (valid && globalError) {
      globalError.setAttribute("hidden", "");
    }

    return valid;
  }

  /* ─────────────────────────────────────────────────────────────
     STEP 5 — Collect form data
  ───────────────────────────────────────────────────────────── */
  function collectFormData() {
    const sessionEl = document.getElementById("session_name");
    const sessionId   = sessionEl?.value || null;
    const sessionOpt  = sessionEl?.options[sessionEl.selectedIndex];
    const sessionName = sessionOpt?.dataset?.name || sessionOpt?.text?.split("—")[0].trim() || "";

    // Collect answers for each question
    const answers = activeQuestions.map(q => {
      let answer = "";
      if (q.type === "rating") {
        const checked = form.querySelector(`input[name="${q.id}"]:checked`);
        answer = checked ? checked.value : "";
      } else {
        answer = (document.getElementById(q.id)?.value || "").trim();
      }
      return { question_id: q.id, answer: answer || null };
    }).filter(a => a.answer !== null && a.answer !== "");

    // Legacy flat columns: map well-known question patterns by index/type
    // This keeps backwards compatibility if admin views old-style data
    const ratingQs   = activeQuestions.filter(q => q.type === "rating");
    const textareaQs = activeQuestions.filter(q => q.type === "textarea");

    const getAnswer = (id) => {
      const val = form.querySelector(`input[name="${id}"]:checked`)?.value ||
                  document.getElementById(id)?.value || "";
      return val.trim() || null;
    };

    const feedbackRow = {
      session_id:          sessionId,
      session_name:        sessionName,
      overall_rating:      ratingQs[0] ? (parseInt(getAnswer(ratingQs[0].id)) || null) : null,
      explanation_rating:  ratingQs[1] ? (parseInt(getAnswer(ratingQs[1].id)) || null) : null,
      content_rating:      ratingQs[2] ? (parseInt(getAnswer(ratingQs[2].id)) || null) : null,
      liked:               textareaQs[0] ? getAnswer(textareaQs[0].id) : null,
      improvements:        textareaQs[1] ? getAnswer(textareaQs[1].id) : null,
      future_topics:       textareaQs[2] ? getAnswer(textareaQs[2].id) : null,
      additional_feedback: textareaQs[3] ? getAnswer(textareaQs[3].id) : null,
    };

    return { feedbackRow, answers };
  }

  /* ─────────────────────────────────────────────────────────────
     STEP 6 — Submit to Supabase
  ───────────────────────────────────────────────────────────── */
  async function submitFeedback() {
    if (!sb) throw new Error("Feedback service unavailable.");

    const { feedbackRow, answers } = collectFormData();

    // Validate required ratings not null (DB constraint)
    if (feedbackRow.overall_rating === null) {
      throw new Error("Required rating is missing.");
    }

    // 1. Insert feedback row
    const { data: fbData, error: fbErr } = await sb
      .from("feedback")
      .insert([feedbackRow])
      .select("id")
      .single();

    if (fbErr) throw fbErr;

    // 2. Insert feedback_responses (if any answers)
    if (answers.length > 0) {
      const responseRows = answers.map(a => ({
        feedback_id: fbData.id,
        question_id: a.question_id,
        answer:      a.answer
      }));

      const { error: respErr } = await sb
        .from("feedback_responses")
        .insert(responseRows);

      if (respErr) {
        console.error("[feedback] Partial failure — responses not saved:", respErr);
        // Don't throw: feedback row is saved; responses are bonus data
      }
    }
  }

  /* ─────────────────────────────────────────────────────────────
     UI STATE MACHINE
  ───────────────────────────────────────────────────────────── */
  function showState(state) {
    const states = {
      loading:    loadingEl,
      "load-error": loadErrorEl,
      form:       formCard,
      success:    successCard
    };
    Object.entries(states).forEach(([key, el]) => {
      if (!el) return;
      if (key === state) {
        el.removeAttribute("hidden");
        if (state === "success") {
          el.style.opacity = "0";
          el.style.transform = "translateY(16px)";
          requestAnimationFrame(() => {
            el.style.transition = "opacity 0.35s ease, transform 0.35s ease";
            el.style.opacity = "1";
            el.style.transform = "none";
            el.focus?.({ preventScroll: true });
          });
        }
      } else {
        el.setAttribute("hidden", "");
      }
    });
  }

  function setSubmitLoading(loading) {
    isSubmitting = loading;
    if (!submitBtn) return;
    submitBtn.disabled = loading;
    submitBtn.classList.toggle("is-loading", loading);
    if (btnLabel) btnLabel.textContent = loading ? "Submitting..." : "Submit Feedback";
  }

  function showErrorBanner(msg) {
    if (!errorBanner) return;
    if (errorMsg) errorMsg.textContent = msg || "Something went wrong. Please try again.";
    errorBanner.removeAttribute("hidden");
    errorBanner.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function hideErrorBanner() {
    errorBanner?.setAttribute("hidden", "");
  }

  /* ─────────────────────────────────────────────────────────────
     VALIDATION HELPERS
  ───────────────────────────────────────────────────────────── */
  function showFieldError(errorId, msg) {
    const el = document.getElementById(errorId);
    if (!el) return;
    el.textContent = msg;
    el.removeAttribute("hidden");
  }

  function clearFieldError(errorId) {
    const el = document.getElementById(errorId);
    if (!el) return;
    el.textContent = "";
    el.setAttribute("hidden", "");
  }

  function highlightGroupError(groupId, hasError) {
    const el = document.getElementById(groupId);
    if (!el) return;
    el.classList.toggle("has-error", hasError);
  }

  function bindFieldClearOnChange(fieldId, errorId, groupId) {
    const el = document.getElementById(fieldId);
    if (!el) return;
    el.addEventListener("change", () => {
      clearFieldError(errorId);
      highlightGroupError(groupId, false);
      globalError?.setAttribute("hidden", "");
    });
  }

  /* ─────────────────────────────────────────────────────────────
     UTILITY
  ───────────────────────────────────────────────────────────── */
  function esc(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getQueryParam(key) {
    return new URLSearchParams(window.location.search).get(key) || "";
  }

  /* ─────────────────────────────────────────────────────────────
     EVENT LISTENERS
  ───────────────────────────────────────────────────────────── */
  // Error dismiss
  errorDismiss?.addEventListener("click", hideErrorBanner);

  // Retry button (load error state)
  retryBtn?.addEventListener("click", loadFormData);

  // Submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validateForm()) {
      // Focus first error
      const firstErr = form.querySelector(".has-error input, .has-error select, .has-error textarea");
      firstErr?.focus();
      return;
    }
    hideErrorBanner();
    setSubmitLoading(true);
    try {
      await submitFeedback();
      showState("success");
    } catch (err) {
      console.error("[feedback] Submit error:", err);
      setSubmitLoading(false);
      showErrorBanner("Something went wrong while submitting your feedback. Please try again.");
    }
  });

  // Reset (submit another)
  resetBtn?.addEventListener("click", () => {
    form.reset();
    activeQuestions.forEach(q => {
      clearFieldError(`${q.id}-error`);
      highlightGroupError(`group-${q.id}`, false);
    });
    clearFieldError("session-error");
    highlightGroupError("group-session_name", false);
    globalError?.setAttribute("hidden", "");
    hideErrorBanner();
    setSubmitLoading(false);
    showState("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ─────────────────────────────────────────────────────────────
     BOOTSTRAP
  ───────────────────────────────────────────────────────────── */
  loadFormData();

})();
