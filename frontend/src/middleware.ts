import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const AUTH_TOKEN_COOKIE = 'auth_token';

export function middleware(request: NextRequest) {
    const authToken = request.cookies.get(AUTH_TOKEN_COOKIE)?.value

    if (!authToken && request.nextUrl.pathname.startsWith('/dashboard')) {
        const loginUrl = new URL('/login', request.url)
        return NextResponse.redirect(loginUrl)
    }

    if (authToken && (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register'))) {
        const dashboardUrl = new URL('/dashboard', request.url)
        return NextResponse.redirect(dashboardUrl)
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
