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
    return data.user;
  },
  
  // Signup via Supabase
  async signup(name, email, password) {
    // Determine initial role via domain check if admin/senior logic applies
    // as per previous hardcoded logic, OR default to JUNIOR.
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
    return data.user;
  },
  
  // Logout
  async logout() {
    await supabase.auth.signOut();
    const prefix = window.location.pathname.includes('/pages/') || window.location.pathname.includes('/admin/') ? '../' : './';
    window.location.href = prefix + 'index.html';
  },
  
  // Check auth & redirect if not logged in
  async requireAuth() {
    const user = await this.getUser();
    
    let loginPath = 'login.html';
    if (window.location.pathname.includes('/admin/')) {
       loginPath = '../pages/login.html';
    } else if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html') && !window.location.pathname.includes('/admin/')) {
       loginPath = 'pages/login.html';
    }
    
    if (!user) {
      window.location.href = loginPath;
      return null;
    }
    return user;
  },
  
  // Role based redirect helper
  redirectBasedOnRole(user) {
    const prefix = window.location.pathname.includes('/pages/') || window.location.pathname.includes('/admin/') ? '../' : './';
    
    const role = user?.user_metadata?.role || 'JUNIOR';
    
    if (role === 'ADMIN') {
      window.location.href = prefix + 'admin/index.html';
    } else if (role === 'SENIOR') {
      window.location.href = prefix + 'pages/senior-submit.html';
    } else {
      window.location.href = prefix + 'pages/junior-dashboard.html';
    }
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
        const user = await AuthStore.login(email, password);
        AuthStore.redirectBasedOnRole(user);
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
        const user = await AuthStore.signup(name, email, password);
        AuthStore.redirectBasedOnRole(user);
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
