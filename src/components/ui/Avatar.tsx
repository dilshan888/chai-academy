"use client"

import styles from './avatar.module.css'

function hashName(name: string): number {
    let hash = 0
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return Math.abs(hash)
}

const COLORS = [
    '#9d2447', '#e74c3c', '#e67e22', '#f1c40f',
    '#2ecc71', '#1abc9c', '#3498db', '#9b59b6',
    '#34495e', '#16a085', '#c0392b', '#8e44ad',
]

export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
    const initials = name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    const color = COLORS[hashName(name) % COLORS.length]

    return (
        <div
            className={`${styles.avatar} ${styles[size]}`}
            style={{ backgroundColor: color }}
        >
            {initials}
        </div>
    )
}
