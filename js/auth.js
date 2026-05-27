import { supabase } from './supabase.js';

export const AuthStore = {
  // Get current user session
  async getUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        return null;
      }
      return user;
    } catch (e) {
      console.error(e);
      return null;
    }
  },
  
  // Login via Supabase
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    if (error) throw error;
    
    // Redirect logic
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name, university, avatar_url')
        .eq('id', session.user.id)
        .single();

      if (!profile) {
        window.location.href = '../pages/junior-dashboard.html';
        return;
      }

      if (profile.role === 'admin' || profile.role === 'ADMIN') {
        window.location.href = '../admin/index.html';
      } else if (profile.role === 'senior' || profile.role === 'SENIOR') {
        window.location.href = '../pages/senior-dashboard.html';
      } else {
        window.location.href = '../pages/junior-dashboard.html';
      }
    }
    return data.user;
  },
  
  // Signup via Supabase
  async signup(name, email, password) {
    let role = 'JUNIOR';
    if (email.includes('admin')) {
      role = 'ADMIN';
    } else if (email.includes('senior') || email.includes('researcher')) {
      role = 'SENIOR';
    }

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: name,
          role: role
        }
      }
    });
    
    if (error) throw error;

    // After signup, we also want to redirect based on the role logic if session exists
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name, university, avatar_url')
        .eq('id', session.user.id)
        .single();

      if (!profile) {
        window.location.href = '../pages/junior-dashboard.html';
        return;
      }

      if (profile.role === 'admin' || profile.role === 'ADMIN') {
        window.location.href = '../admin/index.html';
      } else if (profile.role === 'senior' || profile.role === 'SENIOR') {
        window.location.href = '../pages/senior-dashboard.html';
      } else {
        window.location.href = '../pages/junior-dashboard.html';
      }
    }

    return data.user;
  },
  
  // Logout
  async logout() {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userProfile');
    await supabase.auth.signOut();
    const prefix = window.location.pathname.includes('/pages/') || window.location.pathname.includes('/admin/') ? '../' : './';
    window.location.href = prefix + 'index.html';
  },
  
  // Check auth & redirect if not logged in
  async requireAuth() {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    let loginPath = 'login.html';
    if (window.location.pathname.includes('/admin/')) {
       loginPath = '../admin/login.html';
    } else if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html') && !window.location.pathname.includes('/admin/')) {
       loginPath = 'pages/login.html';
    }
    
    if (error || !session) {
      window.location.href = loginPath;
      return null;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name, university, avatar_url')
      .eq('id', session.user.id)
      .single();
      
    // Expose role to the caller if needed
    const user = session.user;
    if (profile) {
       user.role = profile.role?.toLowerCase() || 'junior';
    } else {
       user.role = 'junior';
    }

    // Role Enforcement: If they are on the wrong page, kick them to the right one
    const path = window.location.pathname;
    const isJuniorPage = path.includes('junior-dashboard.html') || path.includes('courses.html') || path.includes('network.html') || path.includes('test-list.html') || path.includes('test.html');
    const isSeniorPage = path.includes('senior-dashboard.html') || path.includes('senior-submit.html');
    
    if (user.role === 'admin' && !path.includes('admin/index.html')) {
        window.location.href = '../admin/index.html';
    } else if (user.role === 'senior' && isJuniorPage) {
        window.location.href = 'senior-dashboard.html';
    } else if (user.role === 'junior' && isSeniorPage) {
        window.location.href = 'junior-dashboard.html';
    }
    
    return user;
  }
};

// Global expose for inline scripts (only in modules context)
window.AuthStore = AuthStore;

// Logic for Login/Signup forms if they exist on the page
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const logoutBtns = document.querySelectorAll('.logout-btn');
  
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const btn = loginForm.querySelector('button[type="submit"]');
      btn.textContent = "Logging in...";
      btn.disabled = true;

      try {
        await AuthStore.login(email, password);
      } catch (err) {
        alert("Login failed: " + err.message);
        btn.textContent = "Login";
        btn.disabled = false;
      }
    });
  }
  
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const btn = signupForm.querySelector('button[type="submit"]');
      btn.textContent = "Creating Account...";
      btn.disabled = true;

      try {
        await AuthStore.signup(name, email, password);
      } catch (err) {
        alert("Signup failed: " + err.message);
        btn.textContent = "Create Account";
        btn.disabled = false;
      }
    });
  }
  
  if (logoutBtns.length > 0) {
    logoutBtns.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        await AuthStore.logout();
      });
    });
  }
});
