/* ==========================================================================
   AgriSeniorJuniorGuide — Courses & Toppers Module
   Handles rendering the courses grid, topper vault, YouTube embeds,
   and honest empty states based on Supabase Data.
   ========================================================================== */

import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', () => {
  initCourses();
  initToppers();
  initResearchHub();
});

/* ── Courses Module ──────────────────────────────────────────────────────── */
async function initCourses() {
  const container = document.getElementById('courses-container');
  const filtersContainer = document.getElementById('course-filters');
  
  if (!container) return;
  
  // 1. Setup Filters
  if (filtersContainer) {
    filtersContainer.innerHTML = `
      <span class="filter-bar__label">Filter by:</span>
      <button class="chip active" data-filter="all">All Subjects</button>
      <button class="chip" data-filter="agronomy">Agronomy</button>
      <button class="chip" data-filter="soil_science">Soil Science</button>
      <button class="chip" data-filter="plant_pathology">Plant Pathology</button>
    `;
    
    const chips = filtersContainer.querySelectorAll('.chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        // We could re-fetch or filter DOM elements here.
      });
    });
  }

  try {
    const { data: courses, error } = await supabase
      .from('courses')
      .select('*')
      .eq('status', 'published');

    if (error) throw error;

    // 2. Render Courses or Empty State
    if (!courses || courses.length === 0) {
      // HONEST EMPTY STATE
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <i data-lucide="book-dashed" class="empty-state__icon"></i>
          <h3 class="empty-state__title">Courses Uploading Soon</h3>
          <p class="empty-state__text">
            Seniors are currently recording specialized crash courses and full syllabus modules. Check back shortly to be the first junior to join.
          </p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }
    
    // Render actual courses if they exist
    let html = '';
    courses.forEach(course => {
      html += `
        <div class="card course-card">
          <div class="course-card__content">
            <h3 class="course-card__title">${course.title}</h3>
            <p class="text-sm text-muted">${course.subject} • ${course.duration}</p>
            <p class="mt-2 text-sm">${course.description || ''}</p>
            <button class="btn btn--primary btn--sm mt-3" onclick="window.openVideo('${course.youtube_url}', '${course.title.replace(/'/g, "\\'")}')">Watch Now</button>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
    
  } catch (err) {
    console.error("Error fetching courses:", err);
    container.innerHTML = `<p class="text-error" style="grid-column: 1 / -1;">Failed to load courses.</p>`;
  }
}

/* ── Topper Vault Module ─────────────────────────────────────────────────── */
async function initToppers() {
  const container = document.getElementById('toppers-container');
  
  if (!container) return;
  
  try {
    const { data: toppers, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('content_type', 'topper')
      .eq('status', 'published');

    if (error) throw error;

    if (!toppers || toppers.length === 0) {
      // HONEST EMPTY STATE
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <i data-lucide="video" class="empty-state__icon"></i>
          <h3 class="empty-state__title">Interviews Coming Soon</h3>
          <p class="empty-state__text">
            We are compiling strategy interviews with top rankers from the latest ICAR JRF cycle.
          </p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    let html = '';
    toppers.forEach(topper => {
      html += `
        <div class="card topper-card">
          <div class="topper-card__content">
            <h3 class="topper-card__title">${topper.title}</h3>
            <p class="mt-2 text-sm">${topper.description || ''}</p>
            <button class="btn btn--primary btn--sm mt-3" onclick="window.openVideo('${topper.youtube_url}', '${topper.title.replace(/'/g, "\\'")}')">Watch Interview</button>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;

  } catch (err) {
    console.error("Error fetching toppers:", err);
  }
}

/* ── Research Hub Module ─────────────────────────────────────────────────── */
function initResearchHub() {
  const container = document.getElementById('research-container');
  
  if (!container || !window.APP_DATA) return;
  
  const resources = window.APP_DATA.researchResources || [];
  
  let html = '';
  resources.forEach(res => {
    html += `
      <div class="card research-card">
        <div class="research-card__icon">
          <i data-lucide="${res.icon}"></i>
        </div>
        <h3 class="research-card__title">${res.title}</h3>
        <p class="research-card__desc">${res.description}</p>
        <div class="research-card__resources mt-3">
          <i data-lucide="clock" style="width: 14px; height: 14px;"></i>
          Content in development
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

/* ── YouTube Embed Helper ────────────────────────────────────────────────── */
// Called when a user clicks a course or topper video
window.openVideo = function(youtubeUrl, title) {
  const container = document.getElementById('video-container');
  const titleEl = document.getElementById('video-title');
  
  if (!container) return;
  
  // Extract video ID from URL
  let videoId = '';
  try {
    if (youtubeUrl.includes('youtu.be/')) {
      videoId = youtubeUrl.split('youtu.be/')[1].split('?')[0];
    } else if (youtubeUrl.includes('youtube.com/watch')) {
      videoId = new URL(youtubeUrl).searchParams.get('v');
    }
  } catch (e) {
    console.error("Invalid YouTube URL");
    return;
  }
  
  if (videoId) {
    // Clean iframe embed (Correction 3)
    container.innerHTML = `
      <iframe 
        src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" 
        title="${title || 'Video Player'}" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen>
      </iframe>
    `;
    
    if (titleEl) titleEl.textContent = title || 'Video';
    
    window.openModal('video-modal-overlay');
  }
};
