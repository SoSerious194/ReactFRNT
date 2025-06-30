'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import { UserRoleType } from '@/types'
import { jwtDecode, JwtPayload } from 'jwt-decode'
import { USER_ROLES } from '@/lib/constant'


type CustomJwtType = JwtPayload & {
  user_role: string;
};


export async function login(formData: FormData) {

  try {
    const supabase = await createClient()

  
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: {session}, error } = await supabase.auth.signInWithPassword(data)

  if(!session) {
    await supabase.auth.signOut()
    return { success: false, message: 'Invalid credentials' }
  }

  const jwt: CustomJwtType = jwtDecode(session.access_token);
  const user_role = jwt.user_role ?? null;

 if(user_role === USER_ROLES.CLIENT) {
   await supabase.auth.signOut()
   return { success: false, message: 'Invalid credentials' }
 }

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  
  return { success: true, message: 'Login successful',  }
} catch (error) {
  console.error(error)
  return { success: false, message: 'Login failed' }
}
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  try {

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    role: formData.get('user_role') as UserRoleType,
    full_name: formData.get('full_name') as string,
  }

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        role: data.role,
        full_name: data.full_name,
      },
    },
  })

  if (error) {
   throw new Error(error.message)
  }

    revalidatePath('/', 'layout')
  return { success: true, message: 'Signup successful' }
} catch (error) {
  console.error(error)
  return { success: false, message: error instanceof Error ? error.message : 'An unknown error occurred' }
}
}


export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}


export async function getUser() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  return data
}