import { NextAuthOptions } from "next-auth"
// import { PrismaAdapter } from "@next-auth/prisma-adapter"
// import { prisma } from "@/lib/prisma"
import CredentialsProvider from "next-auth/providers/credentials"
// import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
    // adapter: PrismaAdapter(prisma), // Disabled for MVP Demo (No DB)
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: '/login',
    },
    providers: [
        CredentialsProvider({
            name: "Sign in",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                // Mock Auth for MVP Demo
                if (!credentials?.email) return null

                // Return a mock user based on email domain or just default
                const role = credentials.email.includes("admin") ? "ADMIN" : "LEARNER"

                return {
                    id: "mock-user-id",
                    email: credentials.email,
                    name: "Demo User",
                    role: role,
                }
            }
        })
    ],
    callbacks: {
        session: ({ session, token }) => {
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.id,
                    role: token.role,
                },
            }
        },
        jwt: ({ token, user }) => {
            if (user) {
                token.id = user.id
                token.role = user.role
            }
            return token
        }
    }
}
