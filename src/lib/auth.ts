import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const supabase = createClientComponentClient();

/** Get the current logged-in user + their clinic_id from the users table */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('users')
    .select('id, full_name, role, specialty, clinic_id, clinics(name)')
    .eq('auth_id', user.id)
    .single();

  return profile;
}

/** Sign out */
export async function signOut() {
  await supabase.auth.signOut();
  window.location.href = '/login';
}
