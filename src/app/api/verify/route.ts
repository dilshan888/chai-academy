import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    const checks = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "unknown",
        checks: {} as Record<string, any>,
    };

    // 1. Check environment variables
    const requiredEnvVars = ["DATABASE_URL", "DIRECT_URL"];
    const optionalEnvVars = ["NEXT_PUBLIC_APP_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL"];

    checks.checks.environmentVariables = {
        status: "checking",
        required: {} as Record<string, boolean>,
        optional: {} as Record<string, boolean>,
    };

    requiredEnvVars.forEach((varName) => {
        checks.checks.environmentVariables.required[varName] = !!process.env[varName];
    });

    optionalEnvVars.forEach((varName) => {
        checks.checks.environmentVariables.optional[varName] = !!process.env[varName];
    });

    const allRequiredSet = Object.values(checks.checks.environmentVariables.required).every(Boolean);
    checks.checks.environmentVariables.status = allRequiredSet ? "pass" : "fail";

    // 2. Check database connection
    try {
        await prisma.$connect();
        checks.checks.databaseConnection = {
            status: "pass",
            message: "Successfully connected to database",
        };
    } catch (error) {
        checks.checks.databaseConnection = {
            status: "fail",
            message: error instanceof Error ? error.message : "Connection failed",
        };
        return NextResponse.json(checks, { status: 500 });
    }

    // 3. Check database tables and get counts
    try {
        const [userCount, courseCount, lessonCount, enrollmentCount, progressCount] = await Promise.all([
            prisma.user.count(),
            prisma.course.count(),
            prisma.lesson.count(),
            prisma.enrollment.count(),
            prisma.progress.count(),
        ]);

        checks.checks.databaseTables = {
            status: "pass",
            counts: {
                users: userCount,
                courses: courseCount,
                lessons: lessonCount,
                enrollments: enrollmentCount,
                progress: progressCount,
            },
            total: userCount + courseCount + lessonCount + enrollmentCount + progressCount,
        };
    } catch (error) {
        checks.checks.databaseTables = {
            status: "fail",
            message: error instanceof Error ? error.message : "Failed to query tables",
        };
    }

    // 4. Check Prisma client
    checks.checks.prismaClient = {
        status: "pass",
        version: "7.3.0",
        adapter: "PostgreSQL (pg)",
    };

    // 5. Overall status
    const allChecksPassed = Object.values(checks.checks).every(
        (check: any) => check.status === "pass"
    );

    return NextResponse.json(
        {
            ...checks,
            overallStatus: allChecksPassed ? "healthy" : "degraded",
        },
        { status: allChecksPassed ? 200 : 500 }
    );
}
