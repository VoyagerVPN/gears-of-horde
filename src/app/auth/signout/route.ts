import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET(request: Request) {
  const supabase = await createClient();

  // Check if a user's session exists
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    await supabase.auth.signOut();
  }

  revalidatePath('/', 'layout');
  return NextResponse.redirect(new URL('/', request.url));
}
