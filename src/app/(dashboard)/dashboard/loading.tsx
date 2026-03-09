import s from '@/components/ui/skeleton.module.css'

export default function DashboardLoading() {
    return (
        <div className={s.container}>
            {/* Header skeleton */}
            <div className={s.header}>
                <div className={s.headerContent}>
                    <div className={`${s.skeleton} ${s.title}`} />
                    <div className={`${s.skeleton} ${s.subtitle}`} />
                </div>
            </div>

            {/* Stats row */}
            <div className={s.statsRow}>
                {[1, 2, 3].map(i => (
                    <div key={i} className={s.statCard}>
                        <div className={`${s.skeleton} ${s.textShort}`} />
                        <div className={`${s.skeleton} ${s.title}`} style={{ width: '50%' }} />
                        <div className={`${s.skeleton} ${s.text}`} style={{ width: '70%' }} />
                    </div>
                ))}
            </div>

            {/* Two column layout */}
            <div className={s.twoColumn}>
                {/* Main content — course cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} className={s.courseCard}>
                            <div className={`${s.skeleton} ${s.textShort}`} />
                            <div className={`${s.skeleton} ${s.text}`} />
                            <div className={`${s.skeleton} ${s.text}`} style={{ width: '80%' }} />
                        </div>
                    ))}
                </div>

                {/* Sidebar — achievements / activity */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className={s.statCard}>
                        <div className={`${s.skeleton} ${s.subtitle}`} />
                        <div className={`${s.skeleton} ${s.text}`} />
                        <div className={`${s.skeleton} ${s.text}`} style={{ width: '70%' }} />
                    </div>
                    <div className={s.statCard}>
                        <div className={`${s.skeleton} ${s.subtitle}`} />
                        <div className={`${s.skeleton} ${s.text}`} />
                    </div>
                </div>
            </div>
        </div>
    )
}
