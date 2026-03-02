import s from '@/components/ui/skeleton.module.css'

export default function AdminAnalyticsLoading() {
    return (
        <div className={s.container} style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            {/* Header */}
            <div className={s.header}>
                <div className={s.headerContent}>
                    <div className={`${s.skeleton} ${s.title}`} />
                    <div className={`${s.skeleton} ${s.subtitle}`} />
                </div>
                <div className={s.flexRow}>
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`${s.skeleton} ${s.button}`} style={{ width: '60px' }} />
                    ))}
                </div>
            </div>

            {/* Stats row */}
            <div className={s.statsRowFour}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className={s.statCard}>
                        <div className={`${s.skeleton} ${s.textShort}`} />
                        <div className={`${s.skeleton} ${s.title}`} style={{ width: '45%' }} />
                        <div className={`${s.skeleton} ${s.text}`} style={{ width: '60%' }} />
                    </div>
                ))}
            </div>

            {/* Chart area */}
            <div className={s.chartArea}>
                <div className={s.chartHeader}>
                    <div className={`${s.skeleton} ${s.subtitle}`} style={{ width: '30%' }} />
                </div>
                <div className={s.chartBody}>
                    {[40, 65, 50, 80, 55, 70, 45, 60, 75, 50, 85, 55].map((h, i) => (
                        <div
                            key={i}
                            className={`${s.skeleton} ${s.chartBar}`}
                            style={{ height: `${h}%` }}
                        />
                    ))}
                </div>
            </div>

            {/* Two column — table + sidebar */}
            <div className={s.twoColumnEqual}>
                <div className={s.tableCard}>
                    <div className={s.tableHeader}>
                        <div className={`${s.skeleton} ${s.subtitle}`} style={{ width: '40%' }} />
                    </div>
                    <div className={s.tableRows}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={s.tableRow}>
                                <div className={s.flex1}>
                                    <div className={`${s.skeleton} ${s.text}`} style={{ marginBottom: '0.35rem' }} />
                                </div>
                                <div className={`${s.skeleton}`} style={{ width: '60px', height: '6px', borderRadius: '3px' }} />
                                <div className={`${s.skeleton}`} style={{ width: '35px', height: '1rem' }} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className={s.tableCard}>
                    <div className={s.tableHeader}>
                        <div className={`${s.skeleton} ${s.subtitle}`} style={{ width: '40%' }} />
                    </div>
                    <div className={s.tableRows}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={s.tableRow}>
                                <div className={s.flex1}>
                                    <div className={`${s.skeleton} ${s.text}`} style={{ marginBottom: '0.35rem' }} />
                                    <div className={`${s.skeleton}`} style={{ height: '6px', borderRadius: '3px', width: '80%' }} />
                                </div>
                                <div className={`${s.skeleton}`} style={{ width: '40px', height: '1.2rem' }} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
