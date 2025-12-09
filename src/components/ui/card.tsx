import { HTMLAttributes, ReactNode } from 'react'
import styles from './card.module.css'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode
    hoverable?: boolean
}

export function Card({ children, hoverable, className, ...props }: CardProps) {
    const classes = [
        styles.card,
        hoverable ? styles.hoverable : '',
        className
    ].filter(Boolean).join(' ')

    return (
        <div className={classes} {...props}>
            {children}
        </div>
    )
}
