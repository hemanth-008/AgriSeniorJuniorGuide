










































































































import { supabase } from '../js/supabase.js';
    window.supabase = supabase;

    async function initAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = '../admin/login.html'; return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        alert('Access denied');
        window.location.href = '../index.html';
        return;
      }
    }
    initAuth();