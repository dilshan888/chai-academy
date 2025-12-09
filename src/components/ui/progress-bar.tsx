import styles from './progress-bar.module.css'

interface ProgressBarProps {
    progress: number // 0 to 100
    className?: string
}

export function ProgressBar({ progress, className }: ProgressBarProps) {
    // Clamp between 0 and 100
    const width = Math.min(Math.max(progress, 0), 100)

    return (
        <div className={`${styles.container} ${className || ''}`}>
            <div
                className={styles.fill}
                style={{ width: `${width}%` }}
            />
        </div>
    )
}
