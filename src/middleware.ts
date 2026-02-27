import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard");
    const isOnAuth = req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register";
    const isOnApi = req.nextUrl.pathname.startsWith("/api");

    // Skip API routes
    if (isOnApi) return NextResponse.next();

    // Redirect logged-in users away from auth pages
    if (isOnAuth && isLoggedIn) {
        return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }

    // Protect dashboard routes — redirect to login if not logged in
    if (isOnDashboard && !isLoggedIn) {
        return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/dashboard/:path*", "/login", "/register"],
};
