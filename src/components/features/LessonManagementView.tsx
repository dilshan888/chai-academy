"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import styles from './admin/lesson-management.module.css'

interface LessonItem {
    id: string
    title: string
    slug: string
    description: string | null
    difficulty: string
    createdAt: string
    updatedAt: string
}

export function LessonManagementView() {
    const router = useRouter()
    const [lessons, setLessons] = useState<LessonItem[]>([])
    const [loading, setLoading] = useState(true)
    const [deleteTarget, setDeleteTarget] = useState<LessonItem | null>(null)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        loadLessons()
    }, [])

    async function loadLessons() {
        try {
            const res = await fetch('/api/lessons')
            if (res.ok) {
                const data = await res.json()
                setLessons(data)
            }
        } catch (error) {
            console.error('Failed to load lessons', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete() {
        if (!deleteTarget) return
        setDeleting(true)
        try {
            const res = await fetch(`/api/lessons/${deleteTarget.id}`, { method: 'DELETE' })
            if (res.ok) {
                setLessons(lessons.filter(l => l.id !== deleteTarget.id))
                setDeleteTarget(null)
            } else {
                const err = await res.json()
                alert('Delete failed: ' + (err.error || 'Unknown error'))
            }
        } catch (error) {
            alert('Delete failed: Network error')
        } finally {
            setDeleting(false)
        }
    }

    function getDifficultyClass(difficulty: string) {
        switch (difficulty) {
            case 'beginner': return styles.diffBeginner
            case 'intermediate': return styles.diffIntermediate
            case 'advanced': return styles.diffAdvanced
            default: return styles.diffBeginner
        }
    }

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
    }

    if (loading) {
        return <div className={styles.loading}>Loading lessons...</div>
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div>
                    <h1 className={styles.headerTitle}>Content Manager</h1>
                    <p className={styles.headerSub}>
                        Create, edit, and manage your lessons
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <Link href="/admin/lessons/create" style={{ textDecoration: 'none' }}>
                        <Button variant="primary">
                            <Plus size={16} style={{ marginRight: '0.25rem' }} />
                            Create Lesson
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Stats */}
            <div className={styles.statsRow}>
                <div className={styles.statCard}>
                    <span className={styles.statCardLabel}>Total Lessons</span>
                    <span className={styles.statCardValue}>{lessons.length}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statCardLabel}>Beginner</span>
                    <span className={styles.statCardValue}>
                        {lessons.filter(l => l.difficulty === 'beginner').length}
                    </span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statCardLabel}>Intermediate / Advanced</span>
                    <span className={styles.statCardValue}>
                        {lessons.filter(l => l.difficulty !== 'beginner').length}
                    </span>
                </div>
            </div>

            {/* Lesson Table */}
            {lessons.length === 0 ? (
                <div className={styles.tableCard}>
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}><BookOpen size={48} /></div>
                        <div className={styles.emptyTitle}>No lessons yet</div>
                        <p className={styles.emptyText}>
                            Create your first lesson to get started with content management.
                        </p>
                        <Link href="/admin/lessons/create" style={{ textDecoration: 'none' }}>
                            <Button variant="primary">
                                <Plus size={16} style={{ marginRight: '0.25rem' }} />
                                Create First Lesson
                            </Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className={styles.tableCard}>
                    <div className={styles.tableHeader}>
                        <span className={styles.tableTitle}>All Lessons</span>
                        <span className={styles.tableCount}>{lessons.length} lessons</span>
                    </div>
                    <div className={styles.tableScroll}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Lesson</th>
                                    <th>Difficulty</th>
                                    <th>Created</th>
                                    <th>Updated</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lessons.map((lesson) => (
                                    <tr key={lesson.id}>
                                        <td>
                                            <div className={styles.lessonTitle}>{lesson.title}</div>
                                            <div className={styles.lessonSlug}>/{lesson.slug}</div>
                                        </td>
                                        <td>
                                            <span className={`${styles.difficultyBadge} ${getDifficultyClass(lesson.difficulty)}`}>
                                                {lesson.difficulty}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={styles.dateCell}>{formatDate(lesson.createdAt)}</span>
                                        </td>
                                        <td>
                                            <span className={styles.dateCell}>{formatDate(lesson.updatedAt)}</span>
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button
                                                    className={styles.actionBtn}
                                                    onClick={() => router.push(`/admin/lessons/${lesson.id}/edit`)}
                                                >
                                                    <Pencil size={13} /> Edit
                                                </button>
                                                <button
                                                    className={styles.deleteBtn}
                                                    onClick={() => setDeleteTarget(lesson)}
                                                >
                                                    <Trash2 size={13} /> Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            {deleteTarget && (
                <div className={styles.dialogOverlay} onClick={() => !deleting && setDeleteTarget(null)}>
                    <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
                        <h3 className={styles.dialogTitle}>Delete Lesson</h3>
                        <p className={styles.dialogText}>
                            Are you sure you want to delete <strong>&quot;{deleteTarget.title}&quot;</strong>?
                            This will also remove all associated content and progress records. This action cannot be undone.
                        </p>
                        <div className={styles.dialogActions}>
                            <button
                                className={styles.dialogCancel}
                                onClick={() => setDeleteTarget(null)}
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.dialogDelete}
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting ? 'Deleting...' : 'Delete Lesson'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
