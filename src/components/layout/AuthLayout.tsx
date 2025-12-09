import { ReactNode } from 'react'
import styles from './layout.module.css'
import { Card } from '@/components/ui/card'

export function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}>
                <Card hoverable={false}>
                    {children}
                </Card>
            </div>
        </div>
    )
}
