import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://xlzrnllvxpwvioybpznq.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsenJubGx2eHB3dmlveWJwem5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NDA5NzAsImV4cCI6MjA5NTExNjk3MH0.ur7mF_sU6LisKFlu2dq6KgBseOoDx8zqS_JfRoWitAs'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
export default supabase
window.supabase = supabase