import s from '@/components/ui/skeleton.module.css'

export default function AdminLessonsLoading() {
    return (
        <div className={s.container}>
            {/* Tabs */}
            <div className={s.tabs}>
                {[1, 2, 3].map(i => (
                    <div key={i} className={`${s.skeleton} ${s.tab}`} />
                ))}
            </div>

            {/* Stats row */}
            <div className={s.statsRow}>
                {[1, 2, 3].map(i => (
                    <div key={i} className={s.statCard}>
                        <div className={`${s.skeleton} ${s.textShort}`} />
                        <div className={`${s.skeleton} ${s.title}`} style={{ width: '40%' }} />
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className={s.tableCard}>
                <div className={s.tableHeader}>
                    <div className={`${s.skeleton} ${s.subtitle}`} style={{ width: '25%' }} />
                    <div className={`${s.skeleton} ${s.textShort}`} style={{ width: '10%' }} />
                </div>
                <div className={s.tableRows}>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className={s.tableRow}>
                            <div className={s.flex1}>
                                <div className={`${s.skeleton} ${s.text}`} style={{ marginBottom: '0.35rem' }} />
                                <div className={`${s.skeleton} ${s.textShort}`} />
                            </div>
                            <div className={`${s.skeleton}`} style={{ width: '70px', height: '1.2rem', borderRadius: '4px' }} />
                            <div className={`${s.skeleton}`} style={{ width: '80px', height: '1rem' }} />
                            <div className={s.flexRow}>
                                <div className={`${s.skeleton} ${s.button}`} style={{ width: '60px' }} />
                                <div className={`${s.skeleton} ${s.button}`} style={{ width: '60px' }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
