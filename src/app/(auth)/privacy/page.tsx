import Link from 'next/link'

export const metadata = {
    title: 'Privacy Policy - ChAI Academy',
}

export default function PrivacyPolicyPage() {
    return (
        <div style={{
            minHeight: '100vh',
            background: 'hsl(var(--background))',
            padding: '2rem',
            display: 'flex',
            justifyContent: 'center',
        }}>
            <article style={{
                maxWidth: '720px',
                width: '100%',
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                padding: '2.5rem',
                lineHeight: 1.7,
                fontSize: '0.95rem',
                color: 'hsl(var(--foreground))',
            }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Privacy Policy</h1>
                <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '2rem', fontSize: '0.85rem' }}>
                    Last updated: March 2026 &middot; Version 1.0
                </p>

                <section style={{ marginBottom: '1.75rem' }}>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>1. Who We Are</h2>
                    <p>
                        ChAI Academy is an EU AI Act compliance training platform operated by your university.
                        We process personal data solely to deliver and improve the training experience.
                    </p>
                </section>

                <section style={{ marginBottom: '1.75rem' }}>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>2. Data We Collect</h2>
                    <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <li><strong>Account data:</strong> Name, email address, department, job title.</li>
                        <li><strong>Learning data:</strong> Lesson progress, quiz scores, scenario responses.</li>
                        <li><strong>Gamification data:</strong> XP, achievements, streak records (if opted in).</li>
                        <li><strong>Preferences:</strong> Learning pace, notification settings, theme preference.</li>
                        <li><strong>Technical data:</strong> Session tokens (cookie-based authentication).</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '1.75rem' }}>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>3. Legal Basis for Processing</h2>
                    <p>We process your data based on:</p>
                    <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <li><strong>Consent</strong> (Art. 6(1)(a) GDPR) &mdash; provided at registration.</li>
                        <li><strong>Legitimate interest</strong> (Art. 6(1)(f) GDPR) &mdash; to provide and secure the platform.</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '1.75rem' }}>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>4. How We Use Your Data</h2>
                    <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <li>To provide personalised training content and track your progress.</li>
                        <li>To power gamification features (XP, achievements, leaderboards).</li>
                        <li>To generate anonymised analytics for administrators.</li>
                        <li>To send optional weekly email summaries (if enabled).</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '1.75rem' }}>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>5. Data Storage & Security</h2>
                    <p>
                        Your data is stored in a PostgreSQL database hosted on Neon (EU region).
                        Passwords are hashed using bcrypt. Sessions use signed JWT tokens.
                        We do not sell or share your personal data with third parties.
                    </p>
                </section>

                <section style={{ marginBottom: '1.75rem' }}>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>6. Your Rights (GDPR Articles 15-22)</h2>
                    <p>You have the right to:</p>
                    <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <li><strong>Access</strong> your data &mdash; available via the &ldquo;Export My Data&rdquo; button in your Profile.</li>
                        <li><strong>Rectify</strong> your data &mdash; edit your profile at any time.</li>
                        <li><strong>Erase</strong> your data &mdash; use the &ldquo;Delete My Account&rdquo; button in your Profile.</li>
                        <li><strong>Withdraw consent</strong> at any time without affecting prior processing.</li>
                        <li><strong>Data portability</strong> &mdash; export your data as a JSON file.</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '1.75rem' }}>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>7. Cookies</h2>
                    <p>
                        We use only <strong>essential cookies</strong> for authentication (session token)
                        and a <strong>functional cookie</strong> to store your theme preference.
                        We do not use tracking, analytics, or advertising cookies.
                    </p>
                </section>

                <section style={{ marginBottom: '1.75rem' }}>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>8. Data Retention</h2>
                    <p>
                        Your data is retained as long as your account is active.
                        Upon account deletion, all personal data and associated records
                        are permanently removed within 24 hours.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>9. Contact</h2>
                    <p>
                        For any data protection queries, contact your university&apos;s Data Protection Officer
                        or email <strong>dpo@university.edu</strong>.
                    </p>
                </section>

                <div style={{
                    borderTop: '1px solid hsl(var(--border))',
                    paddingTop: '1.25rem',
                    display: 'flex',
                    gap: '1rem',
                    fontSize: '0.9rem',
                }}>
                    <Link href="/login" style={{ color: 'hsl(var(--primary))', fontWeight: 600 }}>
                        Back to Login
                    </Link>
                    <Link href="/register" style={{ color: 'hsl(var(--primary))', fontWeight: 600 }}>
                        Create Account
                    </Link>
                </div>
            </article>
        </div>
    )
}
