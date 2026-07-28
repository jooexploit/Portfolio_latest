/**
 * jooexploit — Results Search & Experience Controller
 * High School Results (نتيجة الثانوية العامة 2026)
 * Apple + Stripe + Linear design level experience.
 */

(function () {
  'use strict';

  const MAX_DEGREE = 320;
  const LOCAL_STORAGE_KEY = 'jooexploit_recent_results_searches';

  // Configurable Base URL
  const getBaseUrl = () => {
    if (typeof window !== 'undefined' && window.API_BASE_URL) {
      return window.API_BASE_URL.replace(/\/+$/, '');
    }
    return 'https://results-api.jooexploit.workers.dev';
  };

  // Local sample database for name searches
  let localStudentsSample = [];
  async function loadLocalSampleData() {
    try {
      const res = await fetch('/data/students-sample.json');
      if (res.ok) {
        localStudentsSample = await res.json();
      }
    } catch (e) {
      console.warn('Could not load local students sample:', e);
    }
  }
  loadLocalSampleData();

  /**
   * API Service: Fetch seat result from worker
   */
  async function fetchSeatResult(seatNumber) {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/search?seat=${encodeURIComponent(seatNumber)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      if (response.status === 404) throw new Error('NOT_FOUND');
      throw new Error(`HTTP_ERROR_${response.status}`);
    }

    return await response.json();
  }

  /**
   * Search local sample database by name
   */
  function searchByName(nameQuery) {
    const cleanQuery = nameQuery.trim().toLowerCase();
    if (!cleanQuery) return [];

    return localStudentsSample.filter(s => 
      s.name && s.name.toLowerCase().includes(cleanQuery)
    );
  }

  /**
   * Animate number count-up
   */
  function animateValue(obj, start, end, duration, decimals = 0, suffix = '') {
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const current = start + progress * (end - start);
      obj.textContent = `${current.toFixed(decimals)}${suffix}`;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }

  /**
   * Dynamic encouraging human message generator
   */
  function getDynamicMessage(percentage, isPassing) {
    if (!isPassing) {
      return {
        icon: '🌱',
        title: 'هذه ليست النهاية، بل البداية!',
        sub: 'لا تجعل امتحاناً واحداً يحدد قدراتك أو مستقبلك. المستقبل ملئ بفرص وطرق عديدة للنجاح والتميز.'
      };
    }

    if (percentage >= 95) {
      return {
        icon: '🏆',
        title: 'إنجاز استثنائي ومبهر!',
        sub: 'أنت ضمن نخب الطلاب المتفوقين هذا العام. جهدك وإصرارك أثمرا تفوقاً يفخر به الجميع.'
      };
    } else if (percentage >= 90) {
      return {
        icon: '🌟',
        title: 'عمل متميز ورائع!',
        sub: 'مجموعك العالي يعكس ساعات طويلة من الاجتهاد. حق لك أن تفخر بما حققته اليوم.'
      };
    } else if (percentage >= 80) {
      return {
        icon: '👏',
        title: 'أداء راقٍ ومشرّف!',
        sub: 'نتيجة ممتازة وخطوة واثقة نحو الكلية والهدف الذي تطمح إليه.'
      };
    } else if (percentage >= 70) {
      return {
        icon: '🎉',
        title: 'مبارك النجاح والتفوق!',
        sub: 'استمر بنفس الحماس والهمة في مرحلتك القادمة.'
      };
    } else {
      return {
        icon: '✅',
        title: 'تم بحمد الله مبارك النجاح!',
        sub: 'عبرت هذه المرحلة بنجاح، والقادم مليء بالطموحات والفرص الواعدة.'
      };
    }
  }

  function initResultsApp() {
    const form = document.getElementById('resultsSearchForm');
    const input = document.getElementById('seatInput');
    const submitBtn = document.getElementById('searchBtn');
    const searchBtnText = document.getElementById('searchBtnText');
    const searchModeBadge = document.getElementById('searchModeBadge');

    const skeletonContainer = document.getElementById('resultsSkeleton');
    const candidatesContainer = document.getElementById('resultsCandidates');
    const candidatesGrid = document.getElementById('candidatesGrid');
    const candidatesCount = document.getElementById('candidatesCount');

    const errorContainer = document.getElementById('resultsError');
    const errorMessage = document.getElementById('errorMessage');
    const errorTitle = document.getElementById('errorTitle');

    const resultContainer = document.getElementById('resultsSuccess');
    const mainResultCard = document.getElementById('mainResultCard');

    const studentNameEl = document.getElementById('resStudentName');
    const seatNumberEl = document.getElementById('resSeatNumber');
    const totalDegreeEl = document.getElementById('resTotalDegree');
    const percentageEl = document.getElementById('resPercentage');
    const statusEl = document.getElementById('resStatus');
    const statusBadgeEl = document.getElementById('resStatusBadge');

    const messageBoxIcon = document.getElementById('messageBoxIcon');
    const messageBoxTitle = document.getElementById('messageBoxTitle');
    const messageBoxSub = document.getElementById('messageBoxSub');

    // Share Modal Elements
    const shareModal = document.getElementById('shareModal');
    const openShareModalBtn = document.getElementById('openShareModalBtn');
    const closeShareModalBtn = document.getElementById('closeShareModalBtn');
    const shareCardElement = document.getElementById('shareCardElement');
    const downloadShareCardBtn = document.getElementById('downloadShareCardBtn');
    const nativeShareBtn = document.getElementById('nativeShareBtn');

    const shareStudentName = document.getElementById('shareStudentName');
    const sharePercentage = document.getElementById('sharePercentage');
    const shareTotalDegree = document.getElementById('shareTotalDegree');
    const shareStatusBadge = document.getElementById('shareStatusBadge');

    // Action Buttons
    const copyResultBtn = document.getElementById('copyResultBtn');
    const printResultBtn = document.getElementById('printResultBtn');

    // Recent Searches
    const recentSearchesContainer = document.getElementById('recentSearches');
    const recentChipsContainer = document.getElementById('recentChips');

    let currentStudentData = null;

    if (!form || !input || !submitBtn) return;

    // Reset UI states
    function resetStates() {
      if (skeletonContainer) skeletonContainer.hidden = true;
      if (candidatesContainer) candidatesContainer.hidden = true;
      if (errorContainer) errorContainer.hidden = true;
      if (resultContainer) resultContainer.hidden = true;
    }

    function showSkeleton(show) {
      if (skeletonContainer) skeletonContainer.hidden = !show;
    }

    // Input Detection (Seat Number vs Name)
    function detectSearchMode() {
      const val = input.value.trim();
      const isNumeric = /^\d+$/.test(val);
      if (searchModeBadge) {
        searchModeBadge.textContent = isNumeric ? 'رقم الجلوس' : (val.length > 0 ? 'اسم الطالب' : 'البحث الذكي');
      }
    }
    input.addEventListener('input', detectSearchMode);

    // Save & Render Recent Searches
    function getRecentSearches() {
      try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    }

    function saveRecentSearch(query) {
      if (!query || query.length < 2) return;
      let list = getRecentSearches();
      list = list.filter(q => q !== query);
      list.unshift(query);
      if (list.length > 5) list = list.slice(0, 5);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
        renderRecentSearches();
      } catch (e) {}
    }

    function renderRecentSearches() {
      const list = getRecentSearches();
      if (!recentSearchesContainer || !recentChipsContainer) return;
      if (list.length === 0) {
        recentSearchesContainer.style.display = 'none';
        return;
      }
      recentSearchesContainer.style.display = 'flex';
      recentChipsContainer.innerHTML = '';

      list.forEach(q => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'recent-chip mono';
        chip.textContent = q;
        chip.addEventListener('click', () => {
          input.value = q;
          detectSearchMode();
          handleSearch();
        });
        recentChipsContainer.appendChild(chip);
      });
    }
    renderRecentSearches();

    function showError(title, msg) {
      resetStates();
      if (errorTitle) errorTitle.textContent = title;
      if (errorMessage) errorMessage.textContent = msg;
      if (errorContainer) {
        errorContainer.hidden = false;
        errorContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    function showCandidates(list, query) {
      resetStates();
      if (!candidatesGrid || !candidatesContainer) return;
      candidatesGrid.innerHTML = '';
      if (candidatesCount) candidatesCount.textContent = `${list.length} نتائج`;

      list.forEach(student => {
        const pct = ((parseFloat(student.degree) / MAX_DEGREE) * 100).toFixed(1);
        const isPassed = String(student.status).includes('ناجح');

        const card = document.createElement('div');
        card.className = 'candidate-card';
        card.innerHTML = `
          <div class="candidate-card__info">
            <h4 class="candidate-card__name">${student.name}</h4>
            <div class="candidate-card__meta mono">
              <span>رقم الجلوس: <strong>${student.seat}</strong></span>
              <span>المجموع: <strong class="accent">${student.degree} / ${MAX_DEGREE} (${pct}%)</strong></span>
            </div>
          </div>
          <div class="candidate-card__action">
            <span class="status-badge ${isPassed ? 'status-badge--success' : 'status-badge--danger'}">${student.status}</span>
            <button type="button" class="btn btn--ghost btn--sm">عرض النتيجة &larr;</button>
          </div>
        `;
        card.addEventListener('click', () => {
          displayResult(student);
        });
        candidatesGrid.appendChild(card);
      });

      candidatesContainer.hidden = false;
      candidatesContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function displayResult(data) {
      resetStates();
      currentStudentData = data;

      let rawDegree = parseFloat(data.degree) || 0;
      let degreeNum = rawDegree;
      let percentage = 0;

      if (rawDegree <= 100) {
        // rawDegree is given as a percentage out of 100 (e.g. 99.5)
        percentage = rawDegree;
        degreeNum = Math.round((rawDegree / 100) * MAX_DEGREE * 10) / 10;
      } else {
        // rawDegree is given as a total score out of MAX_DEGREE (e.g. 290 out of 320)
        degreeNum = rawDegree;
        percentage = Math.round((rawDegree / MAX_DEGREE) * 100 * 10) / 10;
      }

      // Database Anomaly Correction: High scores (percentage >= 50% or degree >= 160) are ALWAYS Passed
      const isPassing = percentage >= 50 || String(data.status).includes('ناجح');
      const displayStatus = isPassing ? 'ناجح دور أول' : (data.status || 'راسب');

      // Populate text fields
      if (studentNameEl) studentNameEl.textContent = data.name || 'غير محدد';
      if (seatNumberEl) seatNumberEl.textContent = data.seat || '-';
      if (statusEl) statusEl.textContent = displayStatus;

      if (statusBadgeEl) {
        statusBadgeEl.textContent = displayStatus;
        statusBadgeEl.className = `status-badge ${isPassing ? 'status-badge--success' : 'status-badge--danger'}`;
      }

      // Animate Degree & Percentage Counters
      animateValue(totalDegreeEl, 0, degreeNum, 900, 1);
      animateValue(percentageEl, 0, percentage, 900, 1, '%');

      // Populate Dynamic Encouraging Human Message
      const msg = getDynamicMessage(percentage, isPassing);
      if (messageBoxIcon) messageBoxIcon.textContent = msg.icon;
      if (messageBoxTitle) messageBoxTitle.textContent = msg.title;
      if (messageBoxSub) messageBoxSub.textContent = msg.sub;

      // Card Fail vs Pass style class
      if (mainResultCard) {
        mainResultCard.className = `result-card ${isPassing ? 'result-card--pass' : 'result-card--fail'}`;
      }

      // Populate Share Modal Preview Data
      if (shareStudentName) shareStudentName.textContent = data.name;
      if (sharePercentage) sharePercentage.textContent = `${percentage.toFixed(1)}%`;
      if (shareTotalDegree) shareTotalDegree.textContent = `${degreeNum} / ${MAX_DEGREE} درجة`;
      if (shareStatusBadge) {
        shareStatusBadge.textContent = displayStatus;
        shareStatusBadge.className = `status-badge ${isPassing ? 'status-badge--success' : 'status-badge--danger'}`;
      }

      if (resultContainer) {
        resultContainer.hidden = false;
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        if (typeof gsap !== 'undefined') {
          gsap.fromTo(resultContainer, 
            { opacity: 0, scale: 0.96, y: 20 }, 
            { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'power2.out' }
          );
        }
      }

      // Trigger Confetti ONLY when student passed!
      if (isPassing && typeof confetti === 'function') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }

    async function handleSearch(e) {
      if (e) e.preventDefault();
      const query = input.value.trim();

      if (!query) {
        showError('حقل البحث فارغ', 'يرجى كتابة رقم الجلوس أو اسم الطالب للبحث.');
        input.focus();
        return;
      }

      resetStates();
      showSkeleton(true);
      submitBtn.disabled = true;
      if (searchBtnText) searchBtnText.textContent = 'جاري البحث...';

      saveRecentSearch(query);

      try {
        if (/^\d+$/.test(query)) {
          // Numeric -> Search by Seat Number via API
          const data = await fetchSeatResult(query);
          displayResult(data);
        } else {
          // Text -> Search by Name locally / indexed
          const candidates = searchByName(query);
          if (candidates.length === 0) {
            showError('لم يتم العثور على نتائج', `عفواً، لم نجد نتائج مطابقة للاسم "${query}". حاول كتابة الاسم الثلاثي أو استخدام رقم الجلوس.`);
          } else if (candidates.length === 1) {
            displayResult(candidates[0]);
          } else {
            showCandidates(candidates, query);
          }
        }
      } catch (err) {
        if (err.message === 'NOT_FOUND') {
          showError('نتيجة غير مسجلة', 'عفواً، لم نتمكن من العثور على نتيجة بهذا الرقم. يرجى التأكد من صحة رقم الجلوس.');
        } else {
          showError('خطأ في الاتصال', 'تعذر الاتصال بالخادم الرئيسي، يرجى المحاولة بعد لحظات.');
        }
      } finally {
        showSkeleton(false);
        submitBtn.disabled = false;
        if (searchBtnText) searchBtnText.textContent = 'عرض النتيجة';
      }
    }

    form.addEventListener('submit', handleSearch);

    // Keyboard Shortcuts (/ to focus, Esc to clear)
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== input) {
        e.preventDefault();
        input.focus();
        input.select();
      } else if (e.key === 'Escape') {
        if (shareModal && !shareModal.hidden) {
          shareModal.hidden = true;
        } else if (input.value) {
          input.value = '';
          detectSearchMode();
          resetStates();
        }
      }
    });

    // Close Result Card & New Search Handler
    const closeResultCardBtn = document.getElementById('closeResultCardBtn');
    if (closeResultCardBtn) {
      closeResultCardBtn.addEventListener('click', () => {
        resetStates();
        input.value = '';
        detectSearchMode();
        input.focus();
      });
    }

    // Copy Result Text
    if (copyResultBtn) {
      copyResultBtn.addEventListener('click', () => {
        if (!currentStudentData) return;
        const text = `نتيجة الثانوية العامة 2026 🎓\nاسم الطالب: ${currentStudentData.name}\nرقم الجلوس: ${currentStudentData.seat}\nالمجموع: ${currentStudentData.degree} من ${MAX_DEGREE}\nالنسبة المئوية: ${((currentStudentData.degree / MAX_DEGREE) * 100).toFixed(1)}%\nالحالة: ${currentStudentData.status}\nتم الاستعلام عبر: https://jooexploit.dev/results/`;
        navigator.clipboard.writeText(text).then(() => {
          const orig = copyResultBtn.querySelector('span').textContent;
          copyResultBtn.querySelector('span').textContent = 'تم النسخ! ✓';
          setTimeout(() => {
            copyResultBtn.querySelector('span').textContent = orig;
          }, 2000);
        });
      });
    }

    // Print Result
    if (printResultBtn) {
      printResultBtn.addEventListener('click', () => {
        window.print();
      });
    }

    // Share Modal Handlers
    if (openShareModalBtn && shareModal) {
      openShareModalBtn.addEventListener('click', () => {
        shareModal.hidden = false;
      });
    }
    if (closeShareModalBtn && shareModal) {
      closeShareModalBtn.addEventListener('click', () => {
        shareModal.hidden = true;
      });
    }
    if (shareModal) {
      shareModal.addEventListener('click', (e) => {
        if (e.target === shareModal) shareModal.hidden = true;
      });
    }

    // Export Instagram Share Card to PNG via html2canvas
    if (downloadShareCardBtn && shareCardElement) {
      downloadShareCardBtn.addEventListener('click', async () => {
        if (typeof html2canvas === 'undefined') {
          alert('جاري تحميل مكتبة حفظ الصور...');
          return;
        }
        try {
          downloadShareCardBtn.disabled = true;
          const canvas = await html2canvas(shareCardElement, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#09090B'
          });
          const link = document.createElement('a');
          link.download = `نتيجة_${currentStudentData ? currentStudentData.name.replace(/\s+/g, '_') : 'الثانوية'}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        } catch (err) {
          alert('حدث خطأ أثناء حفظ الصورة.');
        } finally {
          downloadShareCardBtn.disabled = false;
        }
      });
    }

    // Native Web Share API
    if (nativeShareBtn) {
      nativeShareBtn.addEventListener('click', () => {
        if (navigator.share && currentStudentData) {
          navigator.share({
            title: `نتيجة الثانوية العامة 2026 — ${currentStudentData.name}`,
            text: `حصل الطالب ${currentStudentData.name} على مجموع ${currentStudentData.degree} من ${MAX_DEGREE} (${((currentStudentData.degree / MAX_DEGREE) * 100).toFixed(1)}%) — ${currentStudentData.status}`,
            url: window.location.href
          }).catch(() => {});
        } else {
          alert('المشاركة عبر التطبيقات مدعومة على أجهزة الموبايل.');
        }
      });
    }

    // Animate Statistics count-up when scrolled into view
    function initStatsCounter() {
      const statElements = document.querySelectorAll('.stat-card__val[data-count]');
      if (!statElements.length) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const targetVal = parseFloat(el.getAttribute('data-count'));
            const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
            const isPct = el.textContent.includes('%');
            animateValue(el, 0, targetVal, 1200, decimals, isPct ? '%' : '');
            observer.unobserve(el);
          }
        });
      }, { threshold: 0.3 });

      statElements.forEach(el => observer.observe(el));
    }
    initStatsCounter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initResultsApp);
  } else {
    initResultsApp();
  }
})();
