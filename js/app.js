/* ==========================================================================
   AgriSeniorJuniorGuide — Main App Logic
   Handles global UI (Nav, Mobile Drawer, Modals) and specific sections 
   like Counseling and Partners.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initCounselingSection();
  initPartnersMarquee();
});

/* ── Navigation & Scroll ─────────────────────────────────────────────────── */
function initNavigation() {
  const header = document.getElementById('header');
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const drawer = document.getElementById('mobile-drawer');
  const overlay = document.getElementById('mobile-drawer-overlay');
  const closeBtn = document.getElementById('mobile-drawer-close');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

  // Sticky header background on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    // Active state based on scroll position (simple version)
    let current = '';
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      if (scrollY >= sectionTop - 100) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').includes(current) && current !== null) {
        link.classList.add('active');
      }
    });
  });

  // Mobile Drawer toggles
  function openDrawer() {
    drawer.classList.add('active');
    overlay.classList.add('active');
    mobileBtn.classList.add('active');
    document.body.classList.add('drawer-open');
  }

  function closeDrawer() {
    drawer.classList.remove('active');
    overlay.classList.remove('active');
    mobileBtn.classList.remove('active');
    document.body.classList.remove('drawer-open');
  }

  mobileBtn.addEventListener('click', () => {
    if (drawer.classList.contains('active')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  // Close drawer when clicking a link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 1024) {
        closeDrawer();
      }
    });
  });
}

/* ── Counseling Timeline & Rank Advisor ──────────────────────────────────── */
function initCounselingSection() {
  const stepsContainer = document.getElementById('counseling-steps');
  const detailsContainer = document.getElementById('counseling-details-container');
  
  if (!stepsContainer || !detailsContainer || !window.APP_DATA) return;

  const steps = window.APP_DATA.counselingSteps;
  
  // Render steps
  steps.forEach((step, index) => {
    // 1. Create top wizard item
    const wizardItem = document.createElement('div');
    wizardItem.className = `step-wizard__item ${index === 0 ? 'active' : ''}`;
    wizardItem.dataset.step = index;
    
    wizardItem.innerHTML = `
      ${index < steps.length - 1 ? '<div class="step-wizard__connector"></div>' : ''}
      <div class="step-wizard__circle">${step.stepNumber}</div>
      <div class="step-wizard__label">${step.title}</div>
    `;
    
    stepsContainer.appendChild(wizardItem);

    // 2. Create detail panel
    const detailPanel = document.createElement('div');
    detailPanel.className = `step-detail ${index === 0 ? 'active' : ''}`;
    detailPanel.id = `step-detail-${index}`;
    
    // Build checklist HTML
    const checklistHtml = step.checklist.map(item => `
      <div class="step-detail__checklist-item">
        <i data-lucide="check-circle-2"></i>
        <span>${item}</span>
      </div>
    `).join('');

    // Build mistakes HTML
    const mistakesHtml = step.commonMistakes.map(item => `
      <li>${item}</li>
    `).join('');

    detailPanel.innerHTML = `
      <h3 class="step-detail__title">${step.title}</h3>
      <p class="step-detail__description">${step.description}</p>
      
      <div class="step-detail__checklist">
        <h4 class="step-detail__checklist-title">Checklist</h4>
        ${checklistHtml}
      </div>

      <div class="callout callout--warning mt-3">
        <div class="callout__title">Common Mistakes to Avoid:</div>
        <ul style="padding-left: 20px; margin-top: 4px;">
          ${mistakesHtml}
        </ul>
      </div>
    `;
    
    detailsContainer.appendChild(detailPanel);

    // Click event to change tabs
    wizardItem.addEventListener('click', () => {
      // Update wizard UI
      document.querySelectorAll('.step-wizard__item').forEach((item, i) => {
        item.classList.remove('active');
        if (i < index) {
          item.classList.add('completed');
        } else {
          item.classList.remove('completed');
        }
      });
      wizardItem.classList.add('active');

      // Update panels
      document.querySelectorAll('.step-detail').forEach(panel => {
        panel.classList.remove('active');
      });
      document.getElementById(`step-detail-${index}`).classList.add('active');
      
      // Re-init lucide icons in the newly shown panel
      if(window.lucide) {
         window.lucide.createIcons();
      }
    });
  });

  // Rank Advisor Logic
  const checkRankBtn = document.getElementById('check-rank-btn');
  const rankInput = document.getElementById('rank-input');
  const resultsContainer = document.getElementById('rank-results');
  const tableBody = document.querySelector('#rank-table tbody');
  
  if (checkRankBtn && rankInput && resultsContainer && tableBody) {
    checkRankBtn.addEventListener('click', () => {
      const rank = parseInt(rankInput.value, 10);
      if (isNaN(rank) || rank <= 0) {
        alert("Please enter a valid rank.");
        return;
      }
      
      // Filter universities where general cutoff >= entered rank
      const eligible = window.APP_DATA.universities.filter(u => u.rankCutoff.general >= rank);
      
      tableBody.innerHTML = ''; // Clear previous
      
      if (eligible.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align: center; padding: 24px;">
              Based on historical data, this rank might require targeting state counseling rather than ICAR quota.
            </td>
          </tr>
        `;
      } else {
        eligible.sort((a, b) => a.rankCutoff.general - b.rankCutoff.general).forEach(u => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>
              <strong>${u.name}</strong>
              <div style="font-size: 12px; color: var(--color-gray-mid); margin-top: 2px;">
                ${u.programs.slice(0, 2).join(', ')} ${u.programs.length > 2 ? `+${u.programs.length - 2} more` : ''}
              </div>
            </td>
            <td>${u.location}</td>
            <td class="text-mono" style="color: var(--color-primary); font-weight: 600;">Up to ${u.rankCutoff.general}</td>
            <td class="text-mono text-muted">Up to ${u.rankCutoff.obc}</td>
            <td>${u.stipend}</td>
          `;
          tableBody.appendChild(row);
        });
      }
      
      resultsContainer.classList.add('active');
    });
  }
}

/* ── University Partners Marquee ─────────────────────────────────────────── */
function initPartnersMarquee() {
  const track = document.getElementById('partners-track');
  if (!track || !window.APP_DATA) return;
  
  const universities = window.APP_DATA.universities;
  
  // Create badges
  let html = '';
  universities.forEach(u => {
    html += `
      <div class="partner-badge">
        <div>
          ${u.name.split(' ')[0]}
          <span class="partner-badge__short">${u.shortName}</span>
        </div>
      </div>
    `;
  });
  
  // Duplicate for seamless looping
  track.innerHTML = html + html + html;
}

/* ── Global Modal Helper ─────────────────────────────────────────────────── */
window.openModal = function(modalId) {
  const overlay = document.getElementById(modalId);
  if (overlay) {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};

window.closeModal = function(modalId) {
  const overlay = document.getElementById(modalId);
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    
    // Stop video if it's the video modal
    if (modalId === 'video-modal-overlay') {
      const container = document.getElementById('video-container');
      if (container) container.innerHTML = '';
    }
  }
};

// Global close listeners for modals
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.modal__close, [id$="-cancel"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const overlay = e.target.closest('.modal-overlay');
      if (overlay) {
        window.closeModal(overlay.id);
      }
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        window.closeModal(overlay.id);
      }
    });
  });
});
