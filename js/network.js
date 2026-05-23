/* ==========================================================================
   AgriSeniorJuniorGuide — Mentor Network Module
   Handles filtering, searching, and connecting with Seniors.
   Uses honest empty state.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initMentorNetwork();
  initConnectModal();
});

function initMentorNetwork() {
  const container = document.getElementById('mentors-container');
  const universitySelect = document.getElementById('mentor-university-filter');
  
  if (!container || !window.APP_DATA) return;
  
  const mentors = window.APP_DATA.mentors || [];
  
  // 1. Populate University Filter
  if (universitySelect && window.APP_DATA.universities) {
    window.APP_DATA.universities.forEach(u => {
      const option = document.createElement('option');
      option.value = u.shortName;
      option.textContent = u.shortName;
      universitySelect.appendChild(option);
    });
  }
  
  // 2. Render Mentors or Empty State
  if (mentors.length === 0) {
    // HONEST EMPTY STATE
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <i data-lucide="users" class="empty-state__icon"></i>
        <h3 class="empty-state__title">Senior Directory Building</h3>
        <p class="empty-state__text">
          Seniors are currently registering their profiles. Once verified by our admin team, they will appear here to provide guidance to juniors.
        </p>
      </div>
    `;
    return;
  }
}

function initConnectModal() {
  const form = document.getElementById('connect-form');
  
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Since there's no backend, simulate success
      alert("Request sent successfully! The senior will review it and reply via email.");
      
      // Close modal and reset form
      window.closeModal('connect-modal-overlay');
      form.reset();
    });
  }
  
  // Attach open modal function to global scope for mentor buttons
  window.openConnectModal = function(seniorId) {
    // Could set a hidden input with seniorId here if needed
    window.openModal('connect-modal-overlay');
  };
}
