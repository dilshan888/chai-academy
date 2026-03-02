import s from '@/components/ui/skeleton.module.css'

export default function CoursesLoading() {
    return (
        <div className={s.container}>
            {/* Header */}
            <div className={s.header}>
                <div className={s.headerContent}>
                    <div className={`${s.skeleton} ${s.title}`} />
                    <div className={`${s.skeleton} ${s.subtitle}`} />
                </div>
            </div>

            {/* Course cards grid */}
            <div className={s.courseGrid}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className={s.courseCard}>
                        <div className={`${s.skeleton} ${s.textShort}`} />
                        <div className={`${s.skeleton} ${s.title}`} style={{ width: '70%' }} />
                        <div className={`${s.skeleton} ${s.text}`} />
                        <div className={`${s.skeleton} ${s.text}`} style={{ width: '85%' }} />
                        <div className={`${s.skeleton}`} style={{ height: '8px', borderRadius: '4px' }} />
                        <div className={s.flexRow}>
                            <div className={`${s.skeleton} ${s.button}`} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
