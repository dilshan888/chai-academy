import s from '@/components/ui/skeleton.module.css'

export default function ProfileLoading() {
    return (
        <div className={s.container}>
            {/* Profile header */}
            <div className={s.profileHeader}>
                <div className={`${s.skeleton} ${s.profileAvatar}`} />
                <div className={s.profileInfo}>
                    <div className={`${s.skeleton} ${s.title}`} style={{ width: '35%' }} />
                    <div className={`${s.skeleton} ${s.text}`} style={{ width: '50%' }} />
                    <div className={`${s.skeleton} ${s.textShort}`} style={{ width: '30%' }} />
                </div>
            </div>

            {/* Stats row */}
            <div className={s.statsRowFour}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className={s.statCard}>
                        <div className={`${s.skeleton} ${s.textShort}`} />
                        <div className={`${s.skeleton} ${s.title}`} style={{ width: '50%' }} />
                    </div>
                ))}
            </div>

            {/* Learning path timeline */}
            <div className={s.tableCard}>
                <div className={s.tableHeader}>
                    <div className={`${s.skeleton} ${s.subtitle}`} style={{ width: '35%' }} />
                </div>
                <div className={s.tableRows}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className={s.tableRow}>
                            <div className={`${s.skeleton}`} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                            <div className={s.flex1}>
                                <div className={`${s.skeleton} ${s.text}`} style={{ marginBottom: '0.35rem' }} />
                                <div className={`${s.skeleton} ${s.textShort}`} />
                            </div>
                            <div className={`${s.skeleton} ${s.button}`} style={{ width: '70px' }} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
