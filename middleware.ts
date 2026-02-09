import { NextRequest, NextResponse } from "next/server"

const protectedRoutes = ["/dashboard", "/my-applications", "/admin"]

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Check if the route is protected
    const isProtected = protectedRoutes.some(
        (route) => pathname === route || pathname.startsWith(route + "/")
    )

    if (!isProtected) {
        return NextResponse.next()
    }

    // Check for Better Auth session cookie
    const sessionCookie =
        request.cookies.get("better-auth.session_token") ||
        request.cookies.get("__Secure-better-auth.session_token")

    if (!sessionCookie) {
        const loginUrl = new URL("/login", request.url)
        loginUrl.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/dashboard/:path*", "/my-applications/:path*", "/admin/:path*"],
}
