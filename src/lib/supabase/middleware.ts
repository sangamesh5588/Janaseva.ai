import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  // If credentials are placeholders (development without env setup), bypass strict blocking
  const isMock = supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder');

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  let user = null;
  if (!isMock) {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      user = authUser;
    } catch {
      user = null;
    }
  }

  const { pathname } = request.nextUrl;
  const isProtectedRoute = pathname.startsWith('/my-reports') || pathname.startsWith('/profile');
  const isAuthRoute = pathname === '/login' || pathname === '/signup';

  if (!isMock) {
    if (!user && isProtectedRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(url);
    }

    if (user && isAuthRoute) {
      const redirectTo = request.nextUrl.searchParams.get('redirectTo') || '/my-reports';
      const url = request.nextUrl.clone();
      url.pathname = redirectTo;
      url.search = '';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
