import { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './button.module.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary'
    fullWidth?: boolean
    children: ReactNode
}

export function Button({
    variant = 'primary',
    fullWidth,
    className,
    children,
    disabled,
    ...props
}: ButtonProps) {
    const classes = [
        styles.button,
        styles[variant],
        fullWidth ? styles.fullWidth : '',
        disabled ? styles.disabled : '',
        className
    ].filter(Boolean).join(' ')

    return (
        <button
            className={classes}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    )
}
