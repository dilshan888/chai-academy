import bcrypt from "bcryptjs";
import { getServerSession as nextAuthGetServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a hash
 * @param password - Plain text password
 * @param hashedPassword - Hashed password from database
 * @returns True if password matches
 */
export async function verifyPassword(
    password: string,
    hashedPassword: string
): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

/**
 * Get the current session on the server
 * @returns Session object or null
 */
export async function getServerSession() {
    return nextAuthGetServerSession(authOptions);
}

/**
 * Require authentication - throws if not authenticated
 * Use in Server Actions and API routes
 */
export async function requireAuth() {
    const session = await getServerSession();

    if (!session || !session.user) {
        throw new Error("Unauthorized - Please sign in");
    }

    return session;
}

/**
 * Require specific role - throws if user doesn't have required role
 * @param allowedRoles - Array of allowed roles
 */
export async function requireRole(allowedRoles: string[]) {
    const session = await requireAuth();

    if (!session.user.role || !allowedRoles.includes(session.user.role)) {
        throw new Error(`Unauthorized - Required role: ${allowedRoles.join(" or ")}`);
    }

    return session;
}

/**
 * Check if user is admin
 */
export async function requireAdmin() {
    return requireRole(["ADMIN"]);
}

/**
 * Check if user is admin or instructor
 */
export async function requireInstructor() {
    return requireRole(["ADMIN", "INSTRUCTOR"]);
}
