"use client";

import { useEffect, useState } from "react";

interface VerificationResult {
    timestamp: string;
    environment: string;
    overallStatus: string;
    checks: {
        environmentVariables: {
            status: string;
            required: Record<string, boolean>;
            optional: Record<string, boolean>;
        };
        databaseConnection: {
            status: string;
            message: string;
        };
        databaseTables: {
            status: string;
            counts: {
                users: number;
                courses: number;
                lessons: number;
                enrollments: number;
                progress: number;
            };
            total: number;
        };
        prismaClient: {
            status: string;
            version: string;
            adapter: string;
        };
    };
}

export default function TestPage() {
    const [result, setResult] = useState<VerificationResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/verify")
            .then((res) => res.json())
            .then((data) => {
                setResult(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Running system checks...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl">
                    <h1 className="text-2xl font-bold text-red-800 mb-2">Error</h1>
                    <p className="text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    if (!result) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pass":
            case "healthy":
                return "text-green-600 bg-green-50 border-green-200";
            case "fail":
            case "degraded":
                return "text-red-600 bg-red-50 border-red-200";
            default:
                return "text-yellow-600 bg-yellow-50 border-yellow-200";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "pass":
            case "healthy":
                return "✅";
            case "fail":
            case "degraded":
                return "❌";
            default:
                return "⚠️";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        ChAI Academy - System Test
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Environment: <strong>{result.environment}</strong></span>
                        <span>•</span>
                        <span>Time: {new Date(result.timestamp).toLocaleString()}</span>
                    </div>
                </div>

                {/* Overall Status */}
                <div className={`rounded-lg border p-6 mb-6 ${getStatusColor(result.overallStatus)}`}>
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">{getStatusIcon(result.overallStatus)}</span>
                        <div>
                            <h2 className="text-xl font-bold">
                                Overall Status: {result.overallStatus.toUpperCase()}
                            </h2>
                            <p className="text-sm opacity-80">
                                {result.overallStatus === "healthy"
                                    ? "All systems operational"
                                    : "Some checks failed - see details below"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Environment Variables */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">{getStatusIcon(result.checks.environmentVariables.status)}</span>
                        <h2 className="text-xl font-bold text-gray-900">Environment Variables</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-gray-700 mb-2">Required</h3>
                            <div className="space-y-1">
                                {Object.entries(result.checks.environmentVariables.required).map(([key, value]) => (
                                    <div key={key} className="flex items-center gap-2 text-sm">
                                        <span>{value ? "✅" : "❌"}</span>
                                        <code className="bg-gray-100 px-2 py-1 rounded">{key}</code>
                                        <span className={value ? "text-green-600" : "text-red-600"}>
                                            {value ? "Set" : "Missing"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-700 mb-2">Optional</h3>
                            <div className="space-y-1">
                                {Object.entries(result.checks.environmentVariables.optional).map(([key, value]) => (
                                    <div key={key} className="flex items-center gap-2 text-sm">
                                        <span>{value ? "✅" : "⚪"}</span>
                                        <code className="bg-gray-100 px-2 py-1 rounded">{key}</code>
                                        <span className={value ? "text-green-600" : "text-gray-400"}>
                                            {value ? "Set" : "Not set"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Database Connection */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">{getStatusIcon(result.checks.databaseConnection.status)}</span>
                        <h2 className="text-xl font-bold text-gray-900">Database Connection</h2>
                    </div>
                    <p className="text-gray-700">{result.checks.databaseConnection.message}</p>
                </div>

                {/* Database Tables */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">{getStatusIcon(result.checks.databaseTables.status)}</span>
                        <h2 className="text-xl font-bold text-gray-900">Database Tables</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(result.checks.databaseTables.counts).map(([table, count]) => (
                            <div key={table} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="text-2xl font-bold text-blue-600">{count}</div>
                                <div className="text-sm text-gray-600 capitalize">{table}</div>
                            </div>
                        ))}
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <div className="text-2xl font-bold text-blue-700">
                                {result.checks.databaseTables.total}
                            </div>
                            <div className="text-sm text-blue-600 font-semibold">Total Records</div>
                        </div>
                    </div>
                </div>

                {/* Prisma Client */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">{getStatusIcon(result.checks.prismaClient.status)}</span>
                        <h2 className="text-xl font-bold text-gray-900">Prisma Client</h2>
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="flex gap-2">
                            <span className="text-gray-600">Version:</span>
                            <code className="bg-gray-100 px-2 py-1 rounded">{result.checks.prismaClient.version}</code>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-gray-600">Adapter:</span>
                            <code className="bg-gray-100 px-2 py-1 rounded">{result.checks.prismaClient.adapter}</code>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            🔄 Refresh Tests
                        </button>
                        <a
                            href="/api/health"
                            target="_blank"
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition inline-block"
                        >
                            🏥 Health Check API
                        </a>
                        <a
                            href="/api/verify"
                            target="_blank"
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition inline-block"
                        >
                            📊 Verification API
                        </a>
                        <a
                            href="/"
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition inline-block"
                        >
                            🏠 Home
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
