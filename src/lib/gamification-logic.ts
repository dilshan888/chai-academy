// === Level Thresholds ===
export const LEVEL_THRESHOLDS = [
    { level: 1, xp: 0, title: 'Novice' },
    { level: 2, xp: 100, title: 'Apprentice' },
    { level: 3, xp: 300, title: 'Practitioner' },
    { level: 4, xp: 600, title: 'Specialist' },
    { level: 5, xp: 1000, title: 'Expert' },
    { level: 6, xp: 1500, title: 'Master' },
    { level: 7, xp: 2500, title: 'Champion' },
]

export function calculateLevel(totalXP: number): number {
    let level = 1
    for (const threshold of LEVEL_THRESHOLDS) {
        if (totalXP >= threshold.xp) {
            level = threshold.level
        }
    }
    return level
}

export function getLevelTitle(level: number): string {
    const entry = LEVEL_THRESHOLDS.find((t) => t.level === level)
    return entry?.title ?? 'Novice'
}

export function getNextLevelXP(level: number): number | null {
    const next = LEVEL_THRESHOLDS.find((t) => t.level === level + 1)
    return next?.xp ?? null
}
