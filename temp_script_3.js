



























































































































































































































































































































































































































































































































































































































































































































































































































import { supabase } from '../js/supabase.js';
    
    // Core state
    let activeTestId = null;
    let questionsAdded = 0;
    
    document.addEventListener('DOMContentLoaded', async () => {
      lucide.createIcons();

      // Logout handler
      document.getElementById('logout-btn').addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = '../index.html';
      });

      // Tabs Logic
      const tabs = document.querySelectorAll('.dashboard-sidebar__link, .mobile-tab-link');
      const contents = document.querySelectorAll('.tab-content');
      const titleEl = document.getElementById('topbar-title');

      tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
          e.preventDefault();
          const target = tab.getAttribute('data-tab');
          
          tabs.forEach(t => t.classList.remove('active'));
          // Make both sidebar and mobile tabs active
          document.querySelectorAll(`[data-tab="${target}"]`).forEach(el => el.classList.add('active'));
          
          contents.forEach(c => c.classList.remove('active'));
          document.getElementById('tab-' + target).classList.add('active');
          
          titleEl.textContent = tab.textContent.trim();

          // Load data based on tab
          if (target === 'upload') loadContentTable();
          if (target === 'submissions') loadSubmissions();
          if (target === 'tests') loadTestsTable();
          if (target === 'users') loadUsers();
          if (target === 'analytics') loadAnalytics();
          if (target === 'results') loadResultsTab();
        });
      });

      // Initialize defaults
      bindUploadForms();
      bindTestBuilder();
      bindAIBuilder();
      
      // Load initial data for badge and default tab
      loadSubCount();
      loadContentTable();
    });

    /* --- GLOBALS FOR INLINE ONCLICK --- */
    window.togglePublish = async (id, table, currentStatus) => {
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      try {
        await supabase.from(table).update({ status: newStatus }).eq('id', id);
        loadContentTable();
      } catch (e) { alert(e.message); }
    };
    
    window.deleteItem = async (id, table) => {
      if(!confirm("Are you sure you want to delete this?")) return;
      try {
        await supabase.from(table).delete().eq('id', id);
        loadContentTable();
        loadTestsTable(); // Re-use for tests
      } catch (e) { alert(e.message); }
    };

    window.updateUserRole = async (id) => {
      const selectedRole = document.getElementById(`role-${id}`).value;
      const newRole = selectedRole.toLowerCase().trim();

      if (!['junior', 'senior', 'admin'].includes(newRole)) {
        alert('Invalid role selected');
        return;
      }

      if(newRole === 'admin' && !confirm("Promoting to Admin gives full access. Continue?")) {
        loadUsers(); // Reset
        return;
      }
      try {
        const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', id);
        if (error) {
          console.error('Role update failed:', error);
          alert('Failed to update role: ' + error.message);
          return;
        }
        // Only show success AFTER confirming no error
        alert('Role updated to ' + newRole + ' successfully');
      } catch (e) {
        console.error('Role update exception:', e);
        alert('Failed to update role: ' + e.message);
      }
    };

    window.handleSubmission = async (id, action) => {
      if(action === 'approve') {
        try {
          const { data: sub } = await supabase.from('submissions').select('*').eq('id', id).single();
          if(sub) {
            if(sub.content_type === 'course') {
              await supabase.from('courses').insert({
                title: sub.title,
                subject: sub.subject,
                youtube_url: sub.youtube_url,
                description: sub.description,
                status: 'published'
              });
            } else if(sub.content_type === 'file') {
               await supabase.from('files').insert({
                 title: sub.title,
                 file_url: sub.file_url,
                 status: 'published'
               });
            }
          }
          await supabase.from('submissions').update({ status: 'approved' }).eq('id', id);
          loadSubmissions();
          loadSubCount();
        } catch(e) { alert(e.message); }
      } else {
        const note = prompt("Reason for rejection:");
        if(note !== null) {
          await supabase.from('submissions').update({ status: 'rejected', admin_note: note }).eq('id', id);
          loadSubmissions();
          loadSubCount();
        }
      }
    };

    /* --- DATA LOADERS --- */
    
    async function loadSubCount() {
      try {
        const { count } = await supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending');
        const c = count || 0;
        document.getElementById('nav-sub-count').textContent = c;
        document.getElementById('tab-sub-count').textContent = c;
      } catch(e) {}
    }

    async function loadContentTable() {
      const tbody = document.getElementById('content-tbody');
      tbody.innerHTML = '<tr><td colspan="5" class="text-center"><div class="spinner mx-auto"></div></td></tr>';
      
      try {
        // Fetch courses
        const { data: courses } = await supabase.from('courses').select('*').order('created_at', {ascending: false});
        
        let html = '';
        if(courses) {
          courses.forEach(c => {
            html += `<tr>
              <td>${c.title}</td>
              <td>${c.subject || '-'}</td>
              <td>Video Course</td>
              <td><span class="badge ${c.status === 'published' ? 'badge--success' : 'badge--warning'}">${c.status}</span></td>
              <td>
                <button class="btn btn--sm btn--secondary" onclick="window.togglePublish('${c.id}', 'courses', '${c.status}')">${c.status === 'published' ? 'Unpublish' : 'Publish'}</button>
                <button class="btn btn--sm btn--danger" onclick="window.deleteItem('${c.id}', 'courses')">Delete</button>
              </td>
            </tr>`;
          });
        }
        
        // Try fetching files (might fail if table doesn't exist, wrap safely)
        try {
          const { data: files } = await supabase.from('files').select('*').order('created_at', {ascending: false});
          if(files) {
            files.forEach(f => {
              html += `<tr>
                <td>${f.title}</td>
                <td>-</td>
                <td>PDF File</td>
                <td><span class="badge ${f.status === 'published' ? 'badge--success' : 'badge--warning'}">${f.status}</span></td>
                <td>
                  <button class="btn btn--sm btn--secondary" onclick="window.togglePublish('${f.id}', 'files', '${f.status}')">${f.status === 'published' ? 'Unpublish' : 'Publish'}</button>
                  <button class="btn btn--sm btn--danger" onclick="window.deleteItem('${f.id}', 'files')">Delete</button>
                </td>
              </tr>`;
            });
          }
        } catch(e) { console.log('Files table query issue', e); }

        tbody.innerHTML = html || '<tr><td colspan="5" class="text-center">No content found</td></tr>';
      } catch(e) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-error">Error loading content: ${e.message}</td></tr>`;
      }
    }

    async function loadSubmissions() {
      const tbody = document.getElementById('queue-tbody');
      tbody.innerHTML = '<tr><td colspan="6" class="text-center"><div class="spinner mx-auto"></div></td></tr>';
      try {
        const { data: subs } = await supabase.from('submissions').select('*, profiles(full_name)').eq('status', 'pending');
        
        if(!subs || subs.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">No pending submissions</td></tr>';
          return;
        }

        let html = '';
        subs.forEach(s => {
          const name = s.profiles?.full_name || 'Senior';
          const link = s.youtube_url || s.file_url || '#';
          html += `<tr>
            <td>${name}</td>
            <td><span class="badge badge--university">${s.content_type}</span></td>
            <td>${s.title}</td>
            <td class="text-xs">${new Date(s.created_at).toLocaleDateString()}</td>
            <td><a href="${link}" target="_blank" class="text-primary text-sm">Preview</a></td>
            <td>
              <button class="btn btn--sm btn--success" onclick="window.handleSubmission('${s.id}', 'approve')">Approve</button>
              <button class="btn btn--sm btn--danger" onclick="window.handleSubmission('${s.id}', 'reject')">Reject</button>
            </td>
          </tr>`;
        });
        tbody.innerHTML = html;
      } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-error">Error loading queue.</td></tr>`;
      }
    }

    async function loadUsers() {
      const tbody = document.getElementById('users-tbody');
      tbody.innerHTML = '<tr><td colspan="6" class="text-center"><div class="spinner mx-auto"></div></td></tr>';
      try {
        let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });
        
        const search = document.getElementById('user-search').value.toLowerCase();
        if (search) {
          query = query.or(`full_name.ilike.%${search}%,university.ilike.%${search}%`);
        }

        const { data: users } = await query;
        if(!users || users.length === 0) {
           tbody.innerHTML = '<tr><td colspan="6" class="text-center">No users found</td></tr>';
           return;
        }

        let html = '';
        users.forEach(u => {
          html += `<tr>
            <td><strong>${u.full_name || 'N/A'}</strong></td>
            <td class="text-xs text-muted">${u.email || ''}</td>
            <td class="text-xs">${u.university || '-'}</td>
            <td>
              <select class="form-input text-xs py-1 px-2" id="role-${u.id}" onchange="window.updateUserRole('${u.id}')">
                <option value="junior" ${(u.role||'').toLowerCase()==='junior'?'selected':''}>Junior</option>
                <option value="senior" ${(u.role||'').toLowerCase()==='senior'?'selected':''}>Senior</option>
                <option value="admin" ${(u.role||'').toLowerCase()==='admin'?'selected':''}>Admin</option>
              </select>
            </td>
            <td class="text-xs">${new Date(u.created_at).toLocaleDateString()}</td>
            <td><button class="btn btn--sm btn--danger" onclick="window.deleteItem('${u.id}', 'profiles')">Delete</button></td>
          </tr>`;
        });
        tbody.innerHTML = html;
      } catch (e) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-error">Error loading users.</td></tr>`;
      }
    }
    
    document.getElementById('user-search').addEventListener('input', () => {
      // Debounce basic
      clearTimeout(window.userSearchTimeout);
      window.userSearchTimeout = setTimeout(loadUsers, 300);
    });

    async function loadAnalytics() {
      try {
        const fetchCount = async (table, filterCol, filterVal) => {
          let q = supabase.from(table).select('*', { count: 'exact', head: true });
          if(filterCol) q = q.eq(filterCol, filterVal);
          const { count } = await q;
          return count || 0;
        };

        document.getElementById('stat-juniors').textContent = await fetchCount('profiles', 'role', 'JUNIOR');
        document.getElementById('stat-seniors').textContent = await fetchCount('profiles', 'role', 'SENIOR');
        document.getElementById('stat-courses').textContent = await fetchCount('courses', 'status', 'published');
        document.getElementById('stat-attempts').textContent = await fetchCount('test_attempts');
        document.getElementById('stat-pending').textContent = await fetchCount('submissions', 'status', 'pending');
        
        try {
          document.getElementById('stat-files').textContent = await fetchCount('files', 'status', 'published');
        } catch(e) { document.getElementById('stat-files').textContent = 0; }

      } catch (e) { console.error("Analytics error", e); }
    }

    async function loadTestsTable() {
      const tbody = document.getElementById('tests-tbody');
      try {
        const { data: tests } = await supabase.from('tests').select('*').order('created_at', { ascending: false });
        if(!tests || tests.length === 0) {
           tbody.innerHTML = '<tr><td colspan="4" class="text-center">No tests created yet</td></tr>';
           return;
        }
        let html = '';
        tests.forEach(t => {
          html += `<tr>
            <td>${t.title}</td>
            <td>${t.test_type || 'General'}</td>
            <td><span class="badge ${t.status === 'published' ? 'badge--success' : 'badge--warning'}">${t.status}</span></td>
            <td>
              <button class="btn btn--sm btn--danger" onclick="window.deleteItem('${t.id}', 'tests')">Delete</button>
            </td>
          </tr>`;
        });
        tbody.innerHTML = html;
      } catch (e) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-error">Error loading tests</td></tr>';
      }
    }

    /* --- FORM BINDINGS --- */
    function bindUploadForms() {
      // YT Preview
      document.getElementById('yt-url').addEventListener('input', (e) => {
        const val = e.target.value;
        const container = document.getElementById('yt-preview');
        let vId = '';
        if(val.includes('v=')) vId = val.split('v=')[1].split('&')[0];
        else if(val.includes('youtu.be/')) vId = val.split('youtu.be/')[1].split('?')[0];
        
        if(vId) {
          container.innerHTML = `<iframe src="https://www.youtube.com/embed/${vId}" allowfullscreen></iframe>`;
          container.classList.remove('hidden');
        } else {
          container.innerHTML = '';
          container.classList.add('hidden');
        }
      });

      // Submit YT Form
      document.getElementById('form-yt').addEventListener('submit', async (e) => {
        e.preventDefault();
        const status = e.submitter.id === 'btn-yt-draft' ? 'draft' : 'published';
        
        try {
          await supabase.from('courses').insert({
            title: document.getElementById('yt-title').value,
            subject: document.getElementById('yt-subject').value,
            youtube_url: document.getElementById('yt-url').value,
            description: document.getElementById('yt-desc').value,
            status: status
          });
          
          // Note: Prompt mentions inserting into videos table as well. Assuming fields match.
          try {
            await supabase.from('videos').insert({
              title: document.getElementById('yt-title').value,
              youtube_url: document.getElementById('yt-url').value,
              status: status
            });
          } catch(err) { console.log('Videos table insert failed, might not exist', err); }

          alert("Course saved successfully!");
          e.target.reset();
          document.getElementById('yt-preview').classList.add('hidden');
          loadContentTable();
        } catch(err) { alert(err.message); }
      });

      // Submit PDF Form
      document.getElementById('form-pdf').addEventListener('submit', async (e) => {
        e.preventDefault();
        const file = document.getElementById('pdf-file').files[0];
        if(!file) return;

        const progressContainer = document.getElementById('pdf-progress-container');
        const progressBar = document.getElementById('pdf-progress-bar');
        const progressText = document.getElementById('pdf-progress-text');
        
        progressContainer.classList.remove('hidden');
        progressBar.style.width = '50%';
        progressText.textContent = 'Uploading to storage...';

        try {
          const path = `materials/${Date.now()}_${file.name}`;
          const { error: upErr } = await supabase.storage.from('pdfs').upload(path, file);
          if(upErr) throw upErr;

          progressBar.style.width = '80%';
          progressText.textContent = 'Generating link...';

          const { data: urlData } = supabase.storage.from('pdfs').getPublicUrl(path);

          progressBar.style.width = '100%';
          progressText.textContent = 'Saving database record...';

          await supabase.from('files').insert({
            title: document.getElementById('pdf-title').value,
            file_url: urlData.publicUrl,
            status: 'published'
          });

          progressText.innerHTML = `Success! <a href="${urlData.publicUrl}" target="_blank" class="text-primary">View File</a>`;
          e.target.reset();
          loadContentTable();
        } catch(err) {
          progressText.textContent = 'Error: ' + err.message;
          progressText.classList.add('text-error');
        }
      });
    }

    function bindTestBuilder() {
      // Auto-fill duration and total questions based on test type
      document.getElementById('test-type').addEventListener('change', function() {
        const configs = {
          'unit_30_40': { questions: 30, duration: 40 },
          'unit_40_40': { questions: 40, duration: 40 },
          'unit_45_40': { questions: 45, duration: 40 },
          'grand':      { questions: 120, duration: 120 },
          'numerical':  { questions: 30, duration: 40 }
        };
        const config = configs[this.value];
        if (config) {
          document.getElementById('test-duration').value = config.duration;
          document.getElementById('test-total-q').value = config.questions;
        }
      });

      // Step 1: Create Test
      document.getElementById('form-create-test').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          const testType = document.getElementById('test-type').value.toLowerCase().trim();
          const { data, error } = await supabase.from('tests').insert({
            title: document.getElementById('test-title').value,
            subject: document.getElementById('test-subject').value,
            test_type: testType,
            duration_minutes: document.getElementById('test-duration').value,
            status: 'draft'
          }).select().single();

          if(error) throw error;
          
          activeTestId = data.id;
          questionsAdded = 0;
          
          document.getElementById('test-step-1').classList.add('opacity-50');
          document.getElementById('test-step-1').style.pointerEvents = 'none';
          
          document.getElementById('test-step-2').classList.remove('opacity-50');
          document.getElementById('test-step-2').style.pointerEvents = 'auto';
          
          document.getElementById('test-step-3').classList.remove('hidden');
          document.getElementById('current-test-title').textContent = data.title;
          
          loadTestsTable();
        } catch (e) { alert(e.message); }
      });

      // Step 2: Add Q
      document.getElementById('form-add-q').addEventListener('submit', async (e) => {
        e.preventDefault();
        if(!activeTestId) return;

        const optA = document.getElementById('q-optA').value;
        const optB = document.getElementById('q-optB').value;
        const optC = document.getElementById('q-optC').value;
        const optD = document.getElementById('q-optD').value;
        const correctChar = document.getElementById('q-correct').value.toLowerCase();

        try {
          await supabase.from('questions').insert({
            test_id: activeTestId,
            question_text: document.getElementById('q-text').value,
            option_a: optA,
            option_b: optB,
            option_c: optC,
            option_d: optD,
            correct_option: correctChar,
            explanation: document.getElementById('q-exp').value,
            subject: document.getElementById('test-subject').value,
            difficulty: document.getElementById('q-diff').value
          });

          questionsAdded++;
          document.getElementById('current-test-q-count').textContent = questionsAdded + ' questions added so far';
          e.target.reset();
        } catch (e) { alert(e.message); }
      });

      // Step 3: Publish
      document.getElementById('btn-publish-test').addEventListener('click', async () => {
        if(!activeTestId) return;
        try {
          await supabase.from('tests').update({ status: 'published' }).eq('id', activeTestId);
          alert('Test published successfully!');
          window.location.reload(); // reset state
        } catch (e) { alert(e.message); }
      });
    }

    /* ================================================
       AI SMART TEST BUILDER
       ================================================ */
    function bindAIBuilder() {
      // --- API Key Management ---
      const keyInput = document.getElementById('ai-api-key');
      const keyStatus = document.getElementById('ai-key-status');
      const savedKey = localStorage.getItem('gemini_api_key');
      
      if (savedKey) {
        keyInput.value = savedKey;
        keyStatus.textContent = '✓ Key saved';
        keyStatus.className = 'key-status saved';
      } else {
        keyStatus.textContent = '✗ No key';
        keyStatus.className = 'key-status missing';
      }

      document.getElementById('ai-save-key').addEventListener('click', () => {
        const key = keyInput.value.trim();
        if (!key || key.length < 10) {
          alert('Please enter a valid Gemini API key.');
          return;
        }
        localStorage.setItem('gemini_api_key', key);
        keyStatus.textContent = '✓ Key saved';
        keyStatus.className = 'key-status saved';
      });

      // --- PDF Toggle ---
      document.getElementById('ai-pdf-toggle').addEventListener('change', function() {
        document.getElementById('ai-pdf-section').style.display = this.checked ? 'block' : 'none';
      });

      const dropzone = document.getElementById('ai-pdf-dropzone');
      const pdfFileInput = document.getElementById('ai-pdf-file');
      let pdfExtractedText = '';

      dropzone.addEventListener('click', () => pdfFileInput.click());
      dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = '#2E7D32'; });
      dropzone.addEventListener('dragleave', () => { dropzone.style.borderColor = '#D1D5DB'; });
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = '#D1D5DB';
        if (e.dataTransfer.files.length) {
          pdfFileInput.files = e.dataTransfer.files;
          handlePdfSelect(e.dataTransfer.files[0]);
        }
      });
      pdfFileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) handlePdfSelect(e.target.files[0]);
      });

      async function handlePdfSelect(file) {
        const statusEl = document.getElementById('ai-pdf-status');
        statusEl.textContent = 'Extracting text from ' + file.name + '...';
        
        try {
          // Load PDF.js from CDN
          if (!window.pdfjsLib) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            document.head.appendChild(script);
            await new Promise((res, rej) => { script.onload = res; script.onerror = rej; });
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          }
          
          const arrayBuf = await file.arrayBuffer();
          const pdf = await window.pdfjsLib.getDocument({ data: arrayBuf }).promise;
          let text = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(item => item.str).join(' ') + '\n';
          }
          pdfExtractedText = text.trim();
          const wordCount = pdfExtractedText.split(/\s+/).length;
          statusEl.innerHTML = `✓ Extracted <strong>${wordCount.toLocaleString()}</strong> words from <strong>${file.name}</strong> (${pdf.numPages} pages)`;
        } catch (err) {
          console.error(err);
          statusEl.textContent = '✗ Failed to read PDF: ' + err.message;
          pdfExtractedText = '';
        }
      }

      // --- Loading Messages ---
      const loadingMessages = [
        'Warming up Gemini...',
        'Crafting ICAR-pattern questions...',
        'Analyzing difficulty distribution...',
        'Adding detailed explanations...',
        'Formatting options...',
        'Validating answer keys...',
        'Almost done...',
        'Polishing final questions...'
      ];

      // --- Generation State ---
      let generatedQuestions = [];

      // --- Generate Questions ---
      document.getElementById('ai-gen-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const GEMINI_API_KEY = localStorage.getItem('gemini_api_key');
        if (!GEMINI_API_KEY) {
          alert('Please save your Gemini API key first.');
          return;
        }

        const topic = document.getElementById('ai-topic').value.trim();
        const subject = document.getElementById('ai-subject').value;
        const difficulty = document.getElementById('ai-difficulty').value;
        const count = document.getElementById('ai-count').value;
        const focusArea = document.getElementById('ai-focus').value.trim();
        const usePdf = document.getElementById('ai-pdf-toggle').checked;
        const sourceText = usePdf ? pdfExtractedText : '';

        if (usePdf && !sourceText) {
          alert('Please upload a PDF first or uncheck the PDF option.');
          return;
        }

        // Show loading
        document.getElementById('ai-empty-state').style.display = 'none';
        document.getElementById('ai-preview-container').style.display = 'none';
        const loadingEl = document.getElementById('ai-loading');
        const loadingMsg = document.getElementById('ai-loading-msg');
        loadingEl.classList.add('active');
        
        let msgIdx = 0;
        const msgInterval = setInterval(() => {
          msgIdx = (msgIdx + 1) % loadingMessages.length;
          loadingMsg.textContent = loadingMessages[msgIdx];
        }, 2500);

        const genBtn = document.getElementById('ai-gen-btn');
        genBtn.disabled = true;
        genBtn.textContent = 'Generating...';

        try {
          // Truncate source text if too long (keep under ~6000 words for token limits)
          let truncatedSource = sourceText;
          if (sourceText && sourceText.split(/\s+/).length > 6000) {
            truncatedSource = sourceText.split(/\s+/).slice(0, 6000).join(' ') + '\n[... truncated for API limits]';
          }

          const prompt = `You are an expert question paper setter for ICAR JRF agricultural examinations in India. You have deep knowledge of all agriculture subjects including ${subject}.

Generate ${count} MCQ questions on: ${topic}
Difficulty: ${difficulty}
${focusArea ? 'Focus on: ' + focusArea : ''}
${truncatedSource ? 'Based ONLY on this source material:\n' + truncatedSource : ''}

Return ONLY a valid JSON array in this exact format:
[
  {
    "question": "question text here",
    "option_a": "first option",
    "option_b": "second option",
    "option_c": "third option",
    "option_d": "fourth option",
    "correct_option": "a",
    "explanation": "detailed explanation here",
    "subject": "${subject}",
    "difficulty": "easy or medium or hard"
  }
]
Do NOT use an "options" array. Each option MUST be a separate field: option_a, option_b, option_c, option_d.
The correct_option field must be exactly one of: a, b, c, or d (lowercase letter only).`;

          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 8192
                }
              })
            }
          );

          if (!response.ok) {
            const errBody = await response.json().catch(() => ({}));
            throw new Error(errBody?.error?.message || `API returned ${response.status}`);
          }

          const data = await response.json();
          
          if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
            throw new Error('Gemini returned an empty or blocked response. Try a different topic.');
          }
          
          const rawText = data.candidates[0].content.parts[0].text;

          // Clean markdown fences if present
          const cleaned = rawText
            .replace(/```json\s*/gi, '')
            .replace(/```\s*/g, '')
            .trim();

          generatedQuestions = JSON.parse(cleaned);

          if (!Array.isArray(generatedQuestions) || generatedQuestions.length === 0) {
            throw new Error('No questions were generated. Please try again.');
          }

          // Mark all as selected by default
          generatedQuestions.forEach((q, i) => { q._selected = true; q._index = i; });

          renderPreview();

        } catch (err) {
          console.error('AI Generation Error:', err);
          alert('Generation failed: ' + err.message);
          document.getElementById('ai-empty-state').style.display = 'block';
        } finally {
          clearInterval(msgInterval);
          loadingEl.classList.remove('active');
          genBtn.disabled = false;
          genBtn.innerHTML = '<i data-lucide="sparkles" style="width:16px;height:16px;display:inline-block;vertical-align:text-bottom;margin-right:4px;"></i> Generate Questions with AI';
          lucide.createIcons();
        }
      });

      // --- Render Preview ---
      function renderPreview() {
        document.getElementById('ai-preview-container').style.display = 'block';
        document.getElementById('ai-empty-state').style.display = 'none';
        
        const list = document.getElementById('ai-questions-list');
        let html = '';
        
        generatedQuestions.forEach((q, i) => {
          const optMap = { a: q.option_a, b: q.option_b, c: q.option_c, d: q.option_d };
          const correct = (q.correct_option || 'a').toLowerCase();
          const diffBadge = q.difficulty === 'hard' ? 'badge--error' : q.difficulty === 'easy' ? 'badge--success' : 'badge--warning';
          
          html += `
            <div class="ai-q-card ${q._selected ? 'selected' : ''}" data-idx="${i}">
              <span class="q-number">Q${i+1}</span>
              <input type="checkbox" class="q-select" ${q._selected ? 'checked' : ''} data-idx="${i}">
              <div class="q-text">${escapeHtml(q.question)}</div>
              <div class="q-options">
                <div class="q-opt ${correct === 'a' ? 'correct' : ''}">A. ${escapeHtml(q.option_a)}</div>
                <div class="q-opt ${correct === 'b' ? 'correct' : ''}">B. ${escapeHtml(q.option_b)}</div>
                <div class="q-opt ${correct === 'c' ? 'correct' : ''}">C. ${escapeHtml(q.option_c)}</div>
                <div class="q-opt ${correct === 'd' ? 'correct' : ''}">D. ${escapeHtml(q.option_d)}</div>
              </div>
              <div class="q-meta">
                <span class="badge ${diffBadge}">${q.difficulty || 'medium'}</span>
                <span class="badge badge--university">${q.subject || ''}</span>
              </div>
              ${q.explanation ? '<div class="q-explanation">💡 ' + escapeHtml(q.explanation) + '</div>' : ''}
              <button class="q-edit-btn" data-idx="${i}">✏️ Edit this question</button>
              <div class="q-edit-form" id="ai-edit-${i}">
                <textarea placeholder="Question">${escapeHtml(q.question)}</textarea>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
                  <input value="${escapeHtml(q.option_a)}" placeholder="Option A">
                  <input value="${escapeHtml(q.option_b)}" placeholder="Option B">
                  <input value="${escapeHtml(q.option_c)}" placeholder="Option C">
                  <input value="${escapeHtml(q.option_d)}" placeholder="Option D">
                </div>
                <div style="display:flex;gap:8px;align-items:center;">
                  <label style="font-size:12px;">Correct:</label>
                  <select>
                    <option value="a" ${correct==='a'?'selected':''}>A</option>
                    <option value="b" ${correct==='b'?'selected':''}>B</option>
                    <option value="c" ${correct==='c'?'selected':''}>C</option>
                    <option value="d" ${correct==='d'?'selected':''}>D</option>
                  </select>
                  <label style="font-size:12px;">Difficulty:</label>
                  <select>
                    <option value="easy" ${q.difficulty==='easy'?'selected':''}>Easy</option>
                    <option value="medium" ${q.difficulty==='medium'?'selected':''}>Medium</option>
                    <option value="hard" ${q.difficulty==='hard'?'selected':''}>Hard</option>
                  </select>
                </div>
                <textarea placeholder="Explanation">${escapeHtml(q.explanation || '')}</textarea>
                <div class="edit-actions">
                  <button class="btn btn--sm btn--primary" style="background:#2E7D32;" onclick="window._aiApplyEdit(${i})">Apply</button>
                  <button class="btn btn--sm btn--ghost" onclick="document.getElementById('ai-edit-${i}').classList.remove('active')">Cancel</button>
                </div>
              </div>
            </div>`;
        });
        
        list.innerHTML = html;
        updateSelectedCount();
        
        // Bind checkbox events
        list.querySelectorAll('.q-select').forEach(cb => {
          cb.addEventListener('change', function() {
            const idx = parseInt(this.dataset.idx);
            generatedQuestions[idx]._selected = this.checked;
            this.closest('.ai-q-card').classList.toggle('selected', this.checked);
            updateSelectedCount();
          });
        });
        
        // Bind edit buttons
        list.querySelectorAll('.q-edit-btn').forEach(btn => {
          btn.addEventListener('click', function() {
            const idx = this.dataset.idx;
            document.getElementById('ai-edit-' + idx).classList.toggle('active');
          });
        });
      }

      // Expose edit apply globally
      window._aiApplyEdit = function(idx) {
        const form = document.getElementById('ai-edit-' + idx);
        const textareas = form.querySelectorAll('textarea');
        const inputs = form.querySelectorAll('input');
        const selects = form.querySelectorAll('select');
        
        generatedQuestions[idx].question = textareas[0].value;
        generatedQuestions[idx].option_a = inputs[0].value;
        generatedQuestions[idx].option_b = inputs[1].value;
        generatedQuestions[idx].option_c = inputs[2].value;
        generatedQuestions[idx].option_d = inputs[3].value;
        generatedQuestions[idx].correct_option = selects[0].value;
        generatedQuestions[idx].difficulty = selects[1].value;
        generatedQuestions[idx].explanation = textareas[1].value;
        
        renderPreview();
      };

      function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      }

      function updateSelectedCount() {
        const selected = generatedQuestions.filter(q => q._selected).length;
        document.getElementById('ai-selected-count').textContent = `${selected} / ${generatedQuestions.length} selected`;
      }

      // --- Select / Deselect All ---
      document.getElementById('ai-select-all').addEventListener('click', () => {
        generatedQuestions.forEach(q => q._selected = true);
        renderPreview();
      });
      document.getElementById('ai-deselect-all').addEventListener('click', () => {
        generatedQuestions.forEach(q => q._selected = false);
        renderPreview();
      });

      // --- Save as Draft ---
      document.getElementById('ai-save-draft').addEventListener('click', async () => {
        await saveAITest('draft');
      });

      // --- Publish ---
      document.getElementById('ai-publish').addEventListener('click', async () => {
        await saveAITest('published');
      });

      async function saveAITest(status) {
        const selected = generatedQuestions.filter(q => q._selected);
        if (selected.length === 0) {
          alert('Please select at least one question.');
          return;
        }

        const topic = document.getElementById('ai-topic').value.trim();
        const subject = document.getElementById('ai-subject').value;
        const testType = document.getElementById('ai-test-type').value;
        
        const configs = {
          'unit_30_40': { duration: 40 },
          'unit_40_40': { duration: 40 },
          'unit_45_40': { duration: 40 },
          'grand':      { duration: 120 },
          'numerical':  { duration: 40 }
        };
        const duration = configs[testType]?.duration || 40;

        const saveBtn = status === 'draft' ? document.getElementById('ai-save-draft') : document.getElementById('ai-publish');
        const origText = saveBtn.innerHTML;
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';

        try {
          // 1. Create test
          const { data: test, error: testErr } = await supabase.from('tests').insert({
            title: 'AI: ' + topic,
            subject: subject,
            test_type: testType,
            duration_minutes: duration,
            total_questions: selected.length,
            status: status
          }).select().single();

          if (testErr) throw testErr;

          // 2. Insert questions one by one for better error handling
          for (const question of selected) {
            const { error } = await supabase
              .from('questions')
              .insert({
                test_id: test.id,
                question_text: question.question,
                option_a: question.option_a,
                option_b: question.option_b,
                option_c: question.option_c,
                option_d: question.option_d,
                correct_option: question.correct_option,
                explanation: question.explanation,
                subject: question.subject,
                difficulty: question.difficulty
              });
            if (error) {
              console.error('Question insert failed:', error);
              alert('Save failed: ' + error.message);
              return;
            }
          }

          alert(`Test ${status === 'published' ? 'published' : 'saved as draft'} with ${selected.length} questions!`);
          
          // Reset
          generatedQuestions = [];
          document.getElementById('ai-preview-container').style.display = 'none';
          document.getElementById('ai-empty-state').style.display = 'block';
          document.getElementById('ai-gen-form').reset();
          loadTestsTable();

        } catch (err) {
          console.error(err);
          alert('Save failed: ' + err.message);
        } finally {
          saveBtn.disabled = false;
          saveBtn.innerHTML = origText;
          lucide.createIcons();
        }
      }
    }

    // --- RESULTS & STATS TAB ---

    let allAttempts = [];

    async function loadResultsTab() {
      try {
        const { data: attempts, error: attErr } = await supabase
          .from('test_attempts')
          .select('*, tests (id, title), profiles (id, full_name, university, email)')
          .order('completed_at', { ascending: false });

        if (attErr) throw attErr;
        allAttempts = attempts || [];

        // 1. Overall Stats
        document.getElementById('res-total-taken').textContent = allAttempts.length;
        
        let totalScore = 0, totalMax = 0;
        let juniorSet = new Set();
        let topWeekly = 0;
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        allAttempts.forEach(a => {
          totalScore += (a.score || 0);
          totalMax += (a.total || 1);
          juniorSet.add(a.junior_id);
          const compDate = new Date(a.completed_at);
          if (compDate > oneWeekAgo && (a.score || 0) > topWeekly) {
            topWeekly = a.score;
          }
        });

        const avgPerc = totalMax > 0 ? ((totalScore / totalMax) * 100).toFixed(1) : '0';
        document.getElementById('res-avg-score').textContent = avgPerc + '%';
        document.getElementById('res-juniors').textContent = juniorSet.size;
        document.getElementById('res-top-weekly').textContent = topWeekly;

        // 2. Populate Test Dropdown
        const { data: tests, error: testErr } = await supabase.from('tests').select('id, title').order('created_at', { ascending: false });
        if (!testErr && tests) {
          const select = document.getElementById('res-test-select');
          while (select.options.length > 1) { select.remove(1); }
          tests.forEach(t => { select.add(new Option(t.title, t.id)); });
        }

        renderLeaderboard(allAttempts);
      } catch (err) {
        console.error("Error loading results tab:", err);
      }
    }

    function renderLeaderboard(attempts) {
      let statsMap = {};
      attempts.forEach(a => {
        if (!statsMap[a.junior_id]) {
          statsMap[a.junior_id] = {
            id: a.junior_id, name: a.profiles?.full_name || 'Unknown', uni: a.profiles?.university || '-',
            tests: 0, totalScore: 0, totalMax: 0, bestPerc: 0
          };
        }
        let stat = statsMap[a.junior_id];
        stat.tests++;
        stat.totalScore += (a.score || 0);
        stat.totalMax += (a.total || 1);
        let perc = a.total > 0 ? (a.score / a.total) * 100 : 0;
        if (perc > stat.bestPerc) stat.bestPerc = perc;
      });

      let arr = Object.values(statsMap);
      arr.forEach(s => s.avgPerc = s.totalMax > 0 ? (s.totalScore / s.totalMax) * 100 : 0);
      arr.sort((a, b) => b.avgPerc - a.avgPerc);

      let tbody = document.getElementById('res-leaderboard-tbody');
      if (arr.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No data available.</td></tr>';
        return;
      }

      let html = '';
      arr.slice(0, 20).forEach((s, idx) => {
        let rankBadge = `${idx + 1}`;
        if (idx === 0) rankBadge = '🥇 1st';
        if (idx === 1) rankBadge = '🥈 2nd';
        if (idx === 2) rankBadge = '🥉 3rd';
        html += `
          <tr>
            <td><strong>${rankBadge}</strong></td>
            <td><div class="font-semibold">${s.name}</div><div class="text-xs text-muted">${s.uni}</div></td>
            <td>${s.tests}</td>
            <td>${s.avgPerc.toFixed(1)}%</td>
            <td class="text-primary font-bold">${s.bestPerc.toFixed(1)}%</td>
          </tr>
        `;
      });
      tbody.innerHTML = html;
    }

    function getGrade(perc) {
      if (perc >= 90) return { letter: 'A+', class: 'badge--success', desc: 'Excellent' };
      if (perc >= 75) return { letter: 'A', class: 'badge--success', desc: 'Very Good' };
      if (perc >= 60) return { letter: 'B', class: 'badge--primary', desc: 'Good' };
      if (perc >= 45) return { letter: 'C', class: 'badge--warning', desc: 'Average' };
      return { letter: 'D', class: 'badge--error', desc: 'Needs Improvement' };
    }

    document.getElementById('res-test-select').addEventListener('change', (e) => {
      const testId = e.target.value;
      const tbody = document.getElementById('res-test-breakdown-tbody');
      if (!testId) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">Select a test to view breakdown.</td></tr>';
        return;
      }
      const testAttempts = allAttempts.filter(a => a.test_id == testId);
      testAttempts.sort((a, b) => {
        let percA = a.total > 0 ? (a.score / a.total) : 0;
        let percB = b.total > 0 ? (b.score / b.total) : 0;
        return percB - percA;
      });

      if (testAttempts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">No attempts found for this test.</td></tr>';
        return;
      }

      let html = '';
      testAttempts.forEach((a, idx) => {
        let rank = idx + 1;
        let borderClass = '';
        if (rank === 1) borderClass = 'border-l-4 border-yellow-400';
        else if (rank === 2) borderClass = 'border-l-4 border-gray-400';
        else if (rank === 3) borderClass = 'border-l-4 border-yellow-600';

        const perc = a.total > 0 ? (a.score / a.total) * 100 : 0;
        const grade = getGrade(perc);
        const aJson = encodeURIComponent(JSON.stringify(a));
        const rankStr = `${rank} out of ${testAttempts.length}`;

        html += `
          <tr class="${borderClass} cursor-pointer hover:bg-gray-50" onclick="openJuniorModal('${aJson}', '${rankStr}')" style="${borderClass ? 'background: #fffdf5;' : ''}">
            <td>${rank}</td>
            <td><strong>${a.profiles?.full_name || 'Unknown'}</strong></td>
            <td class="text-muted text-sm">${a.profiles?.university || '-'}</td>
            <td>${a.score} / ${a.total}</td>
            <td>${perc.toFixed(1)}%</td>
            <td><span class="badge ${grade.class}">${grade.letter}</span></td>
            <td class="text-muted text-sm">${new Date(a.completed_at).toLocaleDateString()}</td>
          </tr>
        `;
      });
      tbody.innerHTML = html;
    });

    window.openJuniorModal = (encodedAttempt, rankStr) => {
      const a = JSON.parse(decodeURIComponent(encodedAttempt));
      document.getElementById('res-modal-name').textContent = a.profiles?.full_name || 'Unknown Junior';
      document.getElementById('res-modal-uni').textContent = a.profiles?.university || 'University not specified';
      document.getElementById('res-modal-test').textContent = a.tests?.title || 'Test';
      document.getElementById('res-modal-date').textContent = new Date(a.completed_at).toLocaleString();
      document.getElementById('res-modal-score').textContent = `${a.score} / ${a.total}`;
      const perc = a.total > 0 ? (a.score / a.total) * 100 : 0;
      document.getElementById('res-modal-perc').textContent = perc.toFixed(1) + '%';
      document.getElementById('res-modal-rank').textContent = `Ranked ${rankStr} on this test`;

      let sbHtml = '<tr><td colspan="5" class="text-center">Loading...</td></tr>';
      document.getElementById('res-modal-subjects-tbody').innerHTML = sbHtml;
      
      (async () => {
        try {
          const { data: questions } = await supabase.from('questions').select('id, subject, correct_option').eq('test_id', a.test_id);
          if (!questions) return;
          let subjStats = {};
          let answersObj = typeof a.answers === 'string' ? JSON.parse(a.answers) : a.answers;
          if (!answersObj) answersObj = {};
          
          questions.forEach(q => {
            const subj = q.subject || 'General';
            if (!subjStats[subj]) subjStats[subj] = { attempted: 0, correct: 0, wrong: 0, score: 0 };
            const ans = answersObj[q.id];
            if (ans) {
              subjStats[subj].attempted++;
              if (ans === q.correct_option) {
                subjStats[subj].correct++;
                subjStats[subj].score += 4;
              } else {
                subjStats[subj].wrong++;
                subjStats[subj].score -= 1;
              }
            }
          });
          
          sbHtml = '';
          for (const [subj, stats] of Object.entries(subjStats)) {
            sbHtml += `<tr>
              <td><strong>${subj}</strong></td>
              <td>${stats.attempted}</td>
              <td class="text-success">${stats.correct}</td>
              <td class="text-error">${stats.wrong}</td>
              <td><strong>${stats.score}</strong></td>
            </tr>`;
          }
          if (!sbHtml) sbHtml = '<tr><td colspan="5" class="text-center text-muted">No data</td></tr>';
          document.getElementById('res-modal-subjects-tbody').innerHTML = sbHtml;
        } catch(e) { console.error(e); }
      })();

      document.getElementById('res-junior-modal').style.display = 'flex';
    };

    document.getElementById('res-modal-close').addEventListener('click', () => {
      document.getElementById('res-junior-modal').style.display = 'none';
    });

    document.getElementById('res-export-csv').addEventListener('click', () => {
      const testId = document.getElementById('res-test-select').value;
      if (!testId) return alert('Please select a test first.');
      const testAttempts = allAttempts.filter(a => a.test_id == testId);
      testAttempts.sort((a, b) => {
        let percA = a.total > 0 ? (a.score / a.total) : 0;
        let percB = b.total > 0 ? (b.score / b.total) : 0;
        return percB - percA;
      });

      let csv = "Rank,Junior Name,University,Score,Total,Percentage,Grade,Date\n";
      testAttempts.forEach((a, idx) => {
        const perc = a.total > 0 ? (a.score / a.total) * 100 : 0;
        const grade = getGrade(perc).letter;
        const date = new Date(a.completed_at).toLocaleDateString();
        const name = (a.profiles?.full_name || 'Unknown').replace(/,/g, '');
        const uni = (a.profiles?.university || '-').replace(/,/g, '');
        csv += `${idx+1},${name},${uni},${a.score},${a.total},${perc.toFixed(1)}%,${grade},${date}\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const aElem = document.createElement('a');
      aElem.setAttribute('hidden', '');
      aElem.setAttribute('href', url);
      aElem.setAttribute('download', 'test_results.csv');
      document.body.appendChild(aElem);
      aElem.click();
      document.body.removeChild(aElem);
    });

    document.getElementById('res-junior-search').addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const tbody = document.getElementById('res-junior-search-tbody');
      
      if (!query || query.length < 2) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-muted">Enter search...</td></tr>';
        return;
      }
      
      let statsMap = {};
      allAttempts.forEach(a => {
        const name = (a.profiles?.full_name || 'Unknown').toLowerCase();
        const uni = (a.profiles?.university || '-').toLowerCase();
        if (name.includes(query) || uni.includes(query)) {
          if (!statsMap[a.junior_id]) {
            statsMap[a.junior_id] = { id: a.junior_id, name: a.profiles?.full_name, uni: a.profiles?.university, tests: 0, totalScore: 0, totalMax: 0 };
          }
          statsMap[a.junior_id].tests++;
          statsMap[a.junior_id].totalScore += a.score;
          statsMap[a.junior_id].totalMax += a.total;
        }
      });

      let arr = Object.values(statsMap);
      if (arr.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-muted">No matches found.</td></tr>';
        return;
      }

      let html = '';
      arr.forEach(s => {
        let perc = s.totalMax > 0 ? (s.totalScore / s.totalMax) * 100 : 0;
        html += `
          <tr>
            <td><div class="font-semibold">${s.name}</div><div class="text-xs text-muted">${s.uni}</div></td>
            <td>${s.tests}</td>
            <td>${perc.toFixed(1)}%</td>
            <td><button class="btn btn--sm btn--secondary" onclick="viewJuniorHistory('${s.id}')">View</button></td>
          </tr>
        `;
      });
      tbody.innerHTML = html;
    });

    window.viewJuniorHistory = (juniorId) => {
      const history = allAttempts.filter(a => a.junior_id === juniorId);
      if(history.length === 0) return;
      
      let html = `<tr><td colspan="4" class="p-0">
        <div style="background: #F9FAFB; padding: 12px; border-radius: 4px; border: 1px solid var(--color-border);">
          <div class="flex justify-between items-center mb-2">
            <h4 class="m-0 font-semibold">${history[0].profiles?.full_name}'s History</h4>
            <button class="btn btn--ghost btn--sm" onclick="document.getElementById('res-junior-search').dispatchEvent(new Event('input'))"><i data-lucide="x"></i> Close</button>
          </div>
          <table class="table w-full text-sm">
            <thead><tr><th>Test</th><th>Score</th><th>%</th><th>Date</th></tr></thead>
            <tbody>
      `;
      
      history.forEach(a => {
        const perc = a.total > 0 ? (a.score / a.total) * 100 : 0;
        html += `<tr>
          <td>${a.tests?.title || 'Unknown Test'}</td>
          <td>${a.score}/${a.total}</td>
          <td>${perc.toFixed(1)}%</td>
          <td>${new Date(a.completed_at).toLocaleDateString()}</td>
        </tr>`;
      });
      
      html += '</tbody></table></div></td></tr>';
      document.getElementById('res-junior-search-tbody').innerHTML = html;
      lucide.createIcons();
    };