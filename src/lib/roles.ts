'use server';

import { jwtDecode, JwtPayload } from 'jwt-decode';
import { createClient } from '@/utils/supabase/server';

// Utility function to get Supabase session
const getSupabaseSession = async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
};

type CustomJwtType = JwtPayload & {
  user_role: string;
};

// Utility function to get user role
export const getUserRole = async () => {
  const session = await getSupabaseSession();
  if (!session) return null;

  const jwt: CustomJwtType = jwtDecode(session.access_token);
  console.log("🚀 ~ getUserRole ~ jwt:", jwt)
  return jwt.user_role ?? null;
};
