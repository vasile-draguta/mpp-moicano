import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === '/login' || path === '/register';

  // Get the authentication token from the cookies
  const token = request.cookies.get('auth_token')?.value || '';

  // If the path is public and the user is logged in, redirect to the dashboard
  if (isPublicPath && token) {
    try {
      // Verify the token (this will throw if the token is invalid)
      await jwtVerify(
        token,
        new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key'),
      );
      return NextResponse.redirect(new URL('/', request.url));
    } catch (error) {
      console.log(error);
    }
  }

  // If the path is not public and the user is not logged in, redirect to login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// Define which paths this middleware should run for
export const config = {
  matcher: [
    '/', // Homepage
    '/login', // Login page
    '/register', // Register page
    '/expenses', // Expenses list page
    '/expenses/new', // New expense page
    '/expenses/edit/:path*', // Edit expense pages
  ],
};
