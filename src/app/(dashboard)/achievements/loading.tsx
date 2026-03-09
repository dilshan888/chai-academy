import s from '@/components/ui/skeleton.module.css'

export default function AchievementsLoading() {
    return (
        <div className={s.container}>
            {/* Header */}
            <div className={s.header}>
                <div className={s.headerContent}>
                    <div className={`${s.skeleton} ${s.title}`} />
                    <div className={`${s.skeleton} ${s.subtitle}`} />
                </div>
            </div>

            {/* Stats row */}
            <div className={s.statsRowFour}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className={s.statCard}>
                        <div className={`${s.skeleton} ${s.textShort}`} />
                        <div className={`${s.skeleton} ${s.title}`} style={{ width: '40%' }} />
                    </div>
                ))}
            </div>

            {/* Two column layout — leaderboard + badges */}
            <div className={s.twoColumnEqual}>
                {/* Leaderboard */}
                <div className={s.tableCard}>
                    <div className={s.tableHeader}>
                        <div className={`${s.skeleton} ${s.subtitle}`} style={{ width: '40%' }} />
                    </div>
                    <div className={s.tableRows}>
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className={s.tableRow}>
                                <div className={`${s.skeleton} ${s.avatar}`} />
                                <div className={s.flex1}>
                                    <div className={`${s.skeleton} ${s.text}`} style={{ marginBottom: '0.35rem' }} />
                                    <div className={`${s.skeleton} ${s.textShort}`} />
                                </div>
                                <div className={`${s.skeleton}`} style={{ width: '50px', height: '1.2rem' }} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Badges grid */}
                <div>
                    <div className={s.achievementGrid}>
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className={s.achievementCard}>
                                <div className={`${s.skeleton} ${s.achievementIcon}`} />
                                <div className={`${s.skeleton} ${s.text}`} style={{ width: '70%' }} />
                                <div className={`${s.skeleton} ${s.textShort}`} style={{ width: '50%' }} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
