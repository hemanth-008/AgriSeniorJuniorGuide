/* ==========================================================================
   AgriSeniorJuniorGuide — Assessment Hub & Test Engine
   Handles rendering the tests grid on the landing page.
   ========================================================================== */

import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', () => {
  initTestsGrid();
});

/* ── Tests Grid on Landing Page ──────────────────────────────────────────── */
async function initTestsGrid() {
  const container = document.getElementById('tests-container');
  
  if (!container) return;
  
  try {
    const { data: tests, error } = await supabase
      .from('tests')
      .select('*')
      .eq('status', 'published');
      
    if (error) throw error;

    if (!tests || tests.length === 0) {
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
      if (window.lucide) window.lucide.createIcons();
      return;
    }
    
    // Render actual tests if they exist
    let html = '';
    tests.forEach(test => {
      html += `
        <div class="card test-card">
          <div class="test-card__content">
            <h3 class="test-card__title">${test.title}</h3>
            <p class="text-sm text-muted">${test.subject || 'General'} • ${test.duration_minutes || 30} mins</p>
            <p class="mt-2 text-sm">${test.question_count || 30} Questions</p>
            <a href="pages/test.html?test_id=${test.id}" class="btn btn--primary btn--sm mt-3">Start Test</a>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;

  } catch (err) {
    console.error("Error fetching tests:", err);
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <i data-lucide="file-check" class="empty-state__icon"></i>
        <h3 class="empty-state__title">Mock Tests Preparing</h3>
        <p class="empty-state__text">
          Seniors are carefully crafting strictly ICAR-pattern mock tests. The first set of unit tests will be published here soon.
        </p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
  }
}
