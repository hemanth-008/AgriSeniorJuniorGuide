/* ==========================================================================
   AgriSeniorJuniorGuide — Authentication & Role System
   Frontend-only auth simulation using localStorage.
   Roles: ADMIN, SENIOR, JUNIOR (default).
   ========================================================================== */

const AuthStore = {
  // Key for localStorage
  KEY: 'agri_guide_user',
  
  // Get current user
  getUser() {
    try {
      const data = localStorage.getItem(this.KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },
  
  // Login simulated
  login(email, password) {
    // In a real app, this hits an API.
    // For v1 simulation, we'll assign roles based on email domain/keyword
    
    let role = 'JUNIOR'; // Default role
    
    if (email.includes('admin')) {
      role = 'ADMIN';
    } else if (email.includes('senior') || email.includes('researcher')) {
      role = 'SENIOR';
    }
    
    const user = {
      id: 'u_' + Date.now(),
      name: email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' '),
      email: email,
      role: role,
      token: 'simulated_token_' + Date.now()
    };
    
    localStorage.setItem(this.KEY, JSON.stringify(user));
    return user;
  },
  
  // Signup simulated
  signup(name, email, password) {
    // New signups ALWAYS default to JUNIOR as per Master Prompt constraint
    const user = {
      id: 'u_' + Date.now(),
      name: name,
      email: email,
      role: 'JUNIOR',
      token: 'simulated_token_' + Date.now()
    };
    
    localStorage.setItem(this.KEY, JSON.stringify(user));
    return user;
  },
  
  // Logout
  logout() {
    localStorage.removeItem(this.KEY);
    window.location.href = '/index.html';
  },
  
  // Check auth & redirect if not logged in
  requireAuth() {
    const user = this.getUser();
    // Assuming we might be in /pages/ or /admin/
    const isLocal = window.location.href.includes('file://');
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
    // Adjust paths depending on where we are
    const prefix = window.location.pathname.includes('/pages/') || window.location.pathname.includes('/admin/') ? '../' : './';
    
    if (user.role === 'ADMIN') {
      window.location.href = prefix + 'admin/index.html';
    } else if (user.role === 'SENIOR') {
      window.location.href = prefix + 'pages/senior-submit.html';
    } else {
      window.location.href = prefix + 'pages/junior-dashboard.html';
    }
  }
};

// Expose globally
window.AuthStore = AuthStore;

// Logic for Login/Signup forms if they exist on the page
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const logoutBtns = document.querySelectorAll('.logout-btn');
  
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      const user = AuthStore.login(email, password);
      AuthStore.redirectBasedOnRole(user);
    });
  }
  
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      const user = AuthStore.signup(name, email, password);
      // Signup always goes to junior dashboard
      AuthStore.redirectBasedOnRole(user);
    });
  }
  
  if (logoutBtns.length > 0) {
    logoutBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        AuthStore.logout();
      });
    });
  }
});
