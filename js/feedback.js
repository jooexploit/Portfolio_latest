/* ============================================================
   jooexploit — feedback.js  v1.0
   Session Feedback System — Phase 1
   Handles:
     • Supabase client initialization
     • Query param session pre-selection
     • Form validation (client-side)
     • Anti-double-submit guard
     • Loading / success / error UI states
     • RLS-safe INSERT-only submission
   ============================================================ */

(function () {
  "use strict";

  /* ── Config & Supabase client ─────────────────────────────────── */
  const SUPABASE_URL = window.__SUPABASE_URL__ || "";
  const SUPABASE_ANON_KEY = window.__SUPABASE_ANON_KEY__ || "";

  let supabase = null;
  const supabaseLoaded = typeof window.supabase !== "undefined";

  if (supabaseLoaded && SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (err) {
      console.error("[feedback] Supabase init error:", err);
    }
  } else if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn("[feedback] SUPABASE_URL or SUPABASE_ANON_KEY is not set. Submissions will fail.");
  }

  /* ── DOM refs ─────────────────────────────────────────────────── */
  const form         = document.getElementById("feedback-form");
  const formCard     = document.getElementById("feedback-form-card");
  const submitBtn    = document.getElementById("feedback-submit-btn");
  const btnLabel     = submitBtn ? submitBtn.querySelector(".btn-label") : null;
  const globalError  = document.getElementById("feedback-global-error");
  const errorBanner  = document.getElementById("feedback-error-banner");
  const errorMsg     = document.getElementById("feedback-error-msg");
  const errorDismiss = document.getElementById("feedback-error-dismiss");
  const successCard  = document.getElementById("feedback-success-card");
  const resetBtn     = document.getElementById("feedback-reset-btn");
  const sessionSelect = document.getElementById("session_name");

  if (!form) return; // Only run on feedback page

  /* ── Required fields ─────────────────────────────────────────── */
  const REQUIRED_FIELDS = [
    { id: "session_name",       errorId: "session-error",      label: "Session" },
    { id: "overall_rating",     errorId: "overall_rating-error",     label: "Overall Experience" },
    { id: "explanation_rating", errorId: "explanation_rating-error", label: "Explanation clarity" },
    { id: "content_rating",     errorId: "content_rating-error",     label: "Content usefulness" }
  ];

  /* ── Pre-select session from ?session= query param ───────────── */
  (function preSelectSession() {
    if (!sessionSelect) return;
    const params = new URLSearchParams(window.location.search);
    const rawSession = params.get("session");
    if (!rawSession) return;
    const normalized = rawSession.trim();
    // Try matching value (exact) or label (case-insensitive)
    Array.from(sessionSelect.options).forEach((opt) => {
      if (
        opt.value === normalized ||
        opt.value.toLowerCase() === normalized.toLowerCase()
      ) {
        opt.selected = true;
      }
    });
  })();

  /* ── Validation helpers ───────────────────────────────────────── */
  function getFieldError(id) {
    return document.getElementById(`${id}-error`) || document.getElementById(`${id.split("_")[0]}-error`);
  }

  function showFieldError(errorId, message) {
    const el = document.getElementById(errorId);
    if (!el) return;
    el.textContent = message;
    el.removeAttribute("hidden");
  }

  function clearFieldError(errorId) {
    const el = document.getElementById(errorId);
    if (!el) return;
    el.textContent = "";
    el.setAttribute("hidden", "");
  }

  function highlightGroupError(groupId, hasError) {
    const group = document.getElementById(groupId);
    if (!group) return;
    if (hasError) {
      group.classList.add("has-error");
    } else {
      group.classList.remove("has-error");
    }
  }

  function validateForm() {
    let valid = true;
    const errors = [];

    for (const field of REQUIRED_FIELDS) {
      let value = null;

      if (field.id === "session_name") {
        const el = document.getElementById("session_name");
        value = el ? el.value.trim() : "";
      } else {
        // Radio group — check if any is checked
        const radios = form.querySelectorAll(`input[name="${field.id}"]`);
        const checked = Array.from(radios).find((r) => r.checked);
        value = checked ? checked.value : "";
      }

      if (!value) {
        showFieldError(field.errorId, `${field.label} is required.`);
        highlightGroupError(`group-${field.id}`, true);
        errors.push(field.label);
        valid = false;
      } else {
        clearFieldError(field.errorId);
        highlightGroupError(`group-${field.id}`, false);
      }
    }

    if (!valid) {
      if (globalError) {
        globalError.textContent = `Please rate the following: ${errors.join(", ")}.`;
        globalError.removeAttribute("hidden");
      }
    } else {
      if (globalError) {
        globalError.setAttribute("hidden", "");
      }
    }

    return valid;
  }

  /* ── Clear field error on change ─────────────────────────────── */
  REQUIRED_FIELDS.forEach((field) => {
    if (field.id === "session_name") {
      const el = document.getElementById("session_name");
      if (el) {
        el.addEventListener("change", () => {
          clearFieldError(field.errorId);
          highlightGroupError(`group-${field.id}`, false);
          if (globalError) globalError.setAttribute("hidden", "");
        });
      }
    } else {
      const radios = form.querySelectorAll(`input[name="${field.id}"]`);
      radios.forEach((radio) => {
        radio.addEventListener("change", () => {
          clearFieldError(field.errorId);
          highlightGroupError(`group-${field.id}`, false);
          if (globalError) globalError.setAttribute("hidden", "");
        });
      });
    }
  });

  /* ── Loading state helpers ────────────────────────────────────── */
  let isSubmitting = false;

  function setLoadingState(loading) {
    isSubmitting = loading;
    if (!submitBtn) return;
    submitBtn.disabled = loading;
    submitBtn.classList.toggle("is-loading", loading);
    if (btnLabel) btnLabel.textContent = loading ? "Submitting..." : "Submit Feedback";
  }

  /* ── Error banner helpers ─────────────────────────────────────── */
  function showErrorBanner(message) {
    if (!errorBanner) return;
    if (errorMsg) errorMsg.textContent = message || "Something went wrong while submitting your feedback. Please try again.";
    errorBanner.removeAttribute("hidden");
    errorBanner.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function hideErrorBanner() {
    if (!errorBanner) return;
    errorBanner.setAttribute("hidden", "");
  }

  if (errorDismiss) {
    errorDismiss.addEventListener("click", hideErrorBanner);
  }

  /* ── Show success state ───────────────────────────────────────── */
  function showSuccess() {
    if (formCard) {
      formCard.style.opacity = "0";
      formCard.style.transition = "opacity 0.25s ease";
      setTimeout(() => formCard.setAttribute("hidden", ""), 250);
    }
    if (successCard) {
      setTimeout(() => {
        successCard.removeAttribute("hidden");
        successCard.style.opacity = "0";
        successCard.style.transform = "translateY(16px)";
        requestAnimationFrame(() => {
          successCard.style.transition = "opacity 0.35s ease, transform 0.35s ease";
          successCard.style.opacity = "1";
          successCard.style.transform = "none";
          successCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
          successCard.focus({ preventScroll: true });
        });
      }, 280);
    }
  }

  /* ── Reset form ───────────────────────────────────────────────── */
  function resetFeedbackForm() {
    if (successCard) {
      successCard.style.transition = "opacity 0.2s ease";
      successCard.style.opacity = "0";
      setTimeout(() => successCard.setAttribute("hidden", ""), 200);
    }
    if (formCard) {
      setTimeout(() => {
        formCard.removeAttribute("hidden");
        formCard.style.opacity = "0";
        form.reset();
        REQUIRED_FIELDS.forEach((f) => {
          clearFieldError(f.errorId);
          highlightGroupError(`group-${f.id}`, false);
        });
        hideErrorBanner();
        if (globalError) globalError.setAttribute("hidden", "");
        setLoadingState(false);
        requestAnimationFrame(() => {
          formCard.style.transition = "opacity 0.3s ease";
          formCard.style.opacity = "1";
        });
      }, 220);
    }
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", resetFeedbackForm);
  }

  /* ── Get form data ────────────────────────────────────────────── */
  function collectFormData() {
    const getRadio = (name) => {
      const checked = form.querySelector(`input[name="${name}"]:checked`);
      return checked ? parseInt(checked.value, 10) : null;
    };
    const getText = (id) => {
      const el = document.getElementById(id);
      return el ? el.value.trim() || null : null;
    };

    return {
      session_name: document.getElementById("session_name")?.value?.trim() || null,
      overall_rating: getRadio("overall_rating"),
      explanation_rating: getRadio("explanation_rating"),
      content_rating: getRadio("content_rating"),
      liked: getText("liked"),
      improvements: getText("improvements"),
      future_topics: getText("future_topics"),
      additional_feedback: getText("additional_feedback")
    };
  }

  /* ── Submit to Supabase ───────────────────────────────────────── */
  async function submitFeedback(data) {
    if (!supabase) {
      throw new Error("Feedback service is not available. Contact the site owner.");
    }

    const { error } = await supabase
      .from("feedback")
      .insert([data]);

    if (error) {
      console.error("[feedback] Supabase insert error:", error);
      throw new Error(error.message || "Insert failed");
    }
  }

  /* ── Form submit handler ──────────────────────────────────────── */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Anti-double-submit guard
    if (isSubmitting) return;

    // Validate
    const valid = validateForm();
    if (!valid) {
      // Focus first error
      const firstErrorGroup = form.querySelector(".has-error");
      if (firstErrorGroup) {
        const firstField = firstErrorGroup.querySelector("input, select, textarea");
        if (firstField) firstField.focus();
      }
      return;
    }

    // Hide any previous error banner
    hideErrorBanner();

    // Start loading
    setLoadingState(true);

    try {
      const data = collectFormData();
      await submitFeedback(data);
      showSuccess();
    } catch (err) {
      console.error("[feedback] Submission failed:", err);
      setLoadingState(false);
      showErrorBanner(
        "Something went wrong while submitting your feedback. Please try again."
      );
    }
  });

  /* ── Focus-visible polyfill for older browsers ────────────────── */
  // CSS :focus-visible handles this in modern browsers natively.

})();
