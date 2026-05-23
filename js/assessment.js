/* ==========================================================================
   AgriSeniorJuniorGuide — Assessment Hub & Test Engine
   Handles rendering the tests grid on the landing page, and the core 
   MCQ logic (timer, scoring) for the dedicated test page.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initTestsGrid();
});

/* ── Tests Grid on Landing Page ──────────────────────────────────────────── */
function initTestsGrid() {
  const container = document.getElementById('tests-container');
  
  if (!container || !window.APP_DATA) return;
  
  const tests = window.APP_DATA.tests || [];
  
  if (tests.length === 0) {
    // HONEST EMPTY STATE
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <i data-lucide="file-check" class="empty-state__icon"></i>
        <h3 class="empty-state__title">Mock Tests Preparing</h3>
        <p class="empty-state__text">
          Seniors are carefully crafting strictly ICAR-pattern mock tests. The first set of unit tests will be published here soon.
        </p>
      </div>
    `;
    return;
  }
}

/* 
  NOTE: 
  The actual test engine logic (Timer, MCQ rendering, Scoring) 
  will be executed on pages/test.html. We will write that logic directly 
  into pages/test.html (or a separate script loaded only there) to keep 
  the landing page lightweight.
*/
