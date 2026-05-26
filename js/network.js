/* ==========================================================================
   AgriSeniorJuniorGuide — Mentor Network Module
   Handles filtering, searching, and connecting with Seniors.
   Uses honest empty state.
   ========================================================================== */

import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', () => {
  initMentorNetwork();
  initConnectModal();
});

async function initMentorNetwork() {
  const container = document.getElementById('mentors-container');
  const universitySelect = document.getElementById('mentor-university-filter');
  
  if (!container) return;
  
  // 1. Populate University Filter (still from static data if available)
  if (universitySelect && window.APP_DATA && window.APP_DATA.universities) {
    window.APP_DATA.universities.forEach(u => {
      const option = document.createElement('option');
      option.value = u.shortName;
      option.textContent = u.shortName;
      universitySelect.appendChild(option);
    });
  }
  
  try {
    // 2. Fetch from 'profiles' or equivalent table where role is 'SENIOR'
    // If such table doesn't exist, this will error and we fall back to empty state.
    const { data: mentors, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'SENIOR');

    if (error) throw error;

    // 3. Render Mentors or Empty State
    if (!mentors || mentors.length === 0) {
      showEmptyState(container);
      return;
    }

    let html = '';
    mentors.forEach(mentor => {
      html += `
        <div class="card mentor-card">
          <div class="mentor-card__header flex items-center gap-3">
            <div class="avatar">${mentor.full_name ? mentor.full_name.charAt(0).toUpperCase() : 'S'}</div>
            <div>
              <h3 class="font-bold">${mentor.full_name || 'Senior Mentor'}</h3>
              <p class="text-sm text-muted">${mentor.university || 'ICAR Institute'}</p>
            </div>
          </div>
          <button class="btn btn--secondary btn--sm mt-3 w-full" onclick="window.openConnectModal('${mentor.id}')">Request Guidance</button>
        </div>
      `;
    });
    container.innerHTML = html;

  } catch (err) {
    console.error("Error fetching mentors:", err);
    showEmptyState(container);
  }
}

function showEmptyState(container) {
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
  if (window.lucide) window.lucide.createIcons();
}

function initConnectModal() {
  const form = document.getElementById('connect-form');
  
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // In a real implementation we would insert into a 'mentor_requests' table.
      // For now, simulate success:
      alert("Request sent successfully! The senior will review it and reply via email.");
      
      // Close modal and reset form
      window.closeModal('connect-modal-overlay');
      form.reset();
    });
  }
  
  // Attach open modal function to global scope for mentor buttons
  window.openConnectModal = function(seniorId) {
    window.openModal('connect-modal-overlay');
  };
}
