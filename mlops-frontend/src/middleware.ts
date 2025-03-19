import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 로그인 페이지는 미들웨어 적용하지 않음
  if (request.nextUrl.pathname === '/login') {
    return NextResponse.next()
  }

  // 세션 토큰 확인 (next-auth.session-token 또는 __Secure-next-auth.session-token)
  const sessionToken = 
    request.cookies.get('next-auth.session-token') || 
    request.cookies.get('__Secure-next-auth.session-token')
  
  // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
  if (!sessionToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// 모든 경로에 대해 미들웨어 적용 (API 라우트, 정적 파일 등 제외)
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login).*)'
  ],
}
