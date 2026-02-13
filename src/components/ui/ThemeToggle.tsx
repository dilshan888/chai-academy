"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeContext";

export function ThemeToggle() {
    const { setTheme, theme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // While not mounted, render a placeholder
    if (!mounted) {
        return <div style={{ width: '36px', height: '36px' }} />;
    }

    const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="theme-toggle-btn"
            title="Toggle theme"
            style={{
                background: 'transparent',
                border: '1px solid hsl(var(--border))',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'hsl(var(--foreground))',
                padding: 0,
                flexShrink: 0
            }}
        >
            {isDark ? (
                <Moon size={20} style={{ color: 'hsl(var(--foreground))' }} />
            ) : (
                <Sun size={20} style={{ color: 'hsl(var(--foreground))' }} />
            )}
            <span style={{
                position: 'absolute',
                width: '1px',
                height: '1px',
                padding: 0,
                margin: '-1px',
                overflow: 'hidden',
                clip: 'rect(0, 0, 0, 0)',
                whiteSpace: 'nowrap',
                borderWidth: 0
            }}>
                Toggle theme
            </span>
        </button>
    );
}
