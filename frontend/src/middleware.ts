import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const AUTH_TOKEN_COOKIE = 'auth_token';

export function middleware(request: NextRequest) {
    const authToken = request.cookies.get(AUTH_TOKEN_COOKIE)?.value
    const { pathname } = request.nextUrl

    const publicPaths = ['/login', '/register'];

    if (!authToken && !publicPaths.includes(pathname)) {
        const loginUrl = new URL('/login', request.url)
        return NextResponse.redirect(loginUrl)
    }

    if (authToken && publicPaths.includes(pathname)) {
        const dashboardUrl = new URL('/', request.url)
        return NextResponse.redirect(dashboardUrl)
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|.*\\.png$|favicon.ico).*)',
    ],
}
