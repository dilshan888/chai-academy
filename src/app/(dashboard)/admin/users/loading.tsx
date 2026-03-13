import s from '@/components/ui/skeleton.module.css'

export default function AdminUsersLoading() {
    return (
        <div className={s.container} style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div className={s.header}>
                <div className={s.headerContent}>
                    <div className={`${s.skeleton} ${s.title}`} />
                    <div className={`${s.skeleton} ${s.subtitle}`} />
                </div>
            </div>

            {/* Stats row — 5 columns */}
            <div className={s.statsRowFive}>
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={s.statCard}>
                        <div className={`${s.skeleton} ${s.textShort}`} />
                        <div className={`${s.skeleton} ${s.title}`} style={{ width: '50%' }} />
                        <div className={`${s.skeleton} ${s.text}`} style={{ width: '60%' }} />
                    </div>
                ))}
            </div>

            {/* Two column — table + sidebar */}
            <div className={s.twoColumn}>
                <div className={s.tableCard}>
                    <div className={s.tableHeader}>
                        <div className={`${s.skeleton} ${s.subtitle}`} style={{ width: '30%' }} />
                        <div className={`${s.skeleton} ${s.textShort}`} style={{ width: '15%' }} />
                    </div>
                    <div className={s.tableRows}>
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className={s.tableRow}>
                                <div className={`${s.skeleton} ${s.avatar}`} />
                                <div className={s.flex1}>
                                    <div className={`${s.skeleton} ${s.text}`} style={{ marginBottom: '0.35rem' }} />
                                    <div className={`${s.skeleton} ${s.textShort}`} />
                                </div>
                                <div className={`${s.skeleton}`} style={{ width: '80px', height: '6px', borderRadius: '3px' }} />
                                <div className={`${s.skeleton}`} style={{ width: '50px', height: '1rem' }} />
                                <div className={`${s.skeleton}`} style={{ width: '45px', height: '1rem' }} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Department sidebar */}
                <div className={s.statCard} style={{ minHeight: '300px' }}>
                    <div className={`${s.skeleton} ${s.subtitle}`} />
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div className={`${s.skeleton} ${s.text}`} style={{ width: '55%' }} />
                                <div className={`${s.skeleton} ${s.text}`} style={{ width: '25%' }} />
                            </div>
                            <div className={`${s.skeleton}`} style={{ height: '5px', borderRadius: '3px' }} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
