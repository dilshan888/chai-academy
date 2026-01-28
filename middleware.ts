import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // Admin-only routes
        if (path.startsWith("/admin") && token?.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/unauthorized", req.url));
        }

        // Instructor and Admin routes
        if (
            path.startsWith("/instructor") &&
            token?.role !== "ADMIN" &&
            token?.role !== "INSTRUCTOR"
        ) {
            return NextResponse.redirect(new URL("/unauthorized", req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

// Protect these routes
export const config = {
    matcher: [
        "/dashboard/:path*",
        "/admin/:path*",
        "/instructor/:path*",
        "/profile/:path*",
    ],
};
