import { Metadata } from "next";

export const metadata: Metadata = {
    title: "System Test - ChAI Academy",
    description: "System verification and diagnostics",
};

export default function TestLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
