"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './cookie-consent.module.css'

const CONSENT_KEY = 'chai-cookie-consent'

export function CookieConsent() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        // Only show if user hasn't already responded
        const consent = localStorage.getItem(CONSENT_KEY)
        if (!consent) {
            setVisible(true)
        }
    }, [])

    const handleAccept = () => {
        localStorage.setItem(CONSENT_KEY, 'accepted')
        setVisible(false)
    }

    const handleReject = () => {
        localStorage.setItem(CONSENT_KEY, 'rejected')
        setVisible(false)
    }

    if (!visible) return null

    return (
        <div className={styles.banner} role="dialog" aria-label="Cookie consent">
            <div className={styles.content}>
                <p className={styles.text}>
                    We use <strong>essential cookies</strong> for authentication and a
                    functional cookie for your theme preference. We do not use tracking
                    or advertising cookies.{' '}
                    <Link href="/privacy" className={styles.link}>
                        Privacy Policy
                    </Link>
                </p>
                <div className={styles.actions}>
                    <button className={styles.rejectBtn} onClick={handleReject}>
                        Reject Non-Essential
                    </button>
                    <button className={styles.acceptBtn} onClick={handleAccept}>
                        Accept All
                    </button>
                </div>
            </div>
        </div>
    )
}
