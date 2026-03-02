"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, BookOpen, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import styles from './admin/lesson-management.module.css'

interface PhaseItem {
    id: string
    title: string
}

interface ModuleItem {
    id: string
    title: string
    phaseId: string
}

interface LessonItem {
    id: string
    title: string
    slug: string
    description: string | null
    difficulty: string
    createdAt: string
    updatedAt: string
    moduleId: string | null
    module: { id: string; title: string; phase: { id: string; title: string } } | null
}

export function LessonManagementView({ showHeader = true }: { showHeader?: boolean }) {
    const router = useRouter()
    const [lessons, setLessons] = useState<LessonItem[]>([])
    const [loading, setLoading] = useState(true)
    const [deleteTarget, setDeleteTarget] = useState<LessonItem | null>(null)
    const [deleting, setDeleting] = useState(false)

    const [phases, setPhases] = useState<PhaseItem[]>([])
    const [modules, setModules] = useState<ModuleItem[]>([])
    const [selectedPhaseId, setSelectedPhaseId] = useState<string>('')
    const [selectedModuleId, setSelectedModuleId] = useState<string>('')

    useEffect(() => {
        loadLessons()
        loadPhases()
    }, [])

    useEffect(() => {
        if (selectedPhaseId) {
            loadModules(selectedPhaseId)
        } else {
            setModules([])
        }
        setSelectedModuleId('')
    }, [selectedPhaseId])

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

    async function loadPhases() {
        try {
            const res = await fetch('/api/phases')
            if (res.ok) {
                const data = await res.json()
                setPhases(data)
            }
        } catch (error) {
            console.error('Failed to load phases', error)
        }
    }

    async function loadModules(phaseId: string) {
        try {
            const res = await fetch(`/api/modules?phaseId=${phaseId}`)
            if (res.ok) {
                const data = await res.json()
                setModules(data)
            }
        } catch (error) {
            console.error('Failed to load modules', error)
        }
    }

    const filteredLessons = lessons.filter((lesson) => {
        if (selectedPhaseId && lesson.module?.phase?.id !== selectedPhaseId) {
            return false
        }
        if (selectedModuleId && lesson.moduleId !== selectedModuleId) {
            return false
        }
        return true
    })

    const assignedCount = lessons.filter(l => l.moduleId).length
    const unassignedCount = lessons.filter(l => !l.moduleId).length

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
            {showHeader ? (
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
            ) : (
                <div className={styles.noHeaderActions}>
                    <Link href="/admin/lessons/create" style={{ textDecoration: 'none' }}>
                        <Button variant="primary">
                            <Plus size={16} style={{ marginRight: '0.25rem' }} />
                            Create Lesson
                        </Button>
                    </Link>
                </div>
            )}

            {/* Stats */}
            <div className={styles.statsRow}>
                <div className={styles.statCard}>
                    <span className={styles.statCardLabel}>Total Lessons</span>
                    <span className={styles.statCardValue}>{lessons.length}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statCardLabel}>Assigned</span>
                    <span className={styles.statCardValue}>{assignedCount}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statCardLabel}>Unassigned</span>
                    <span className={styles.statCardValue}>{unassignedCount}</span>
                </div>
            </div>

            {/* Filter Row */}
            <div className={styles.filterRow}>
                <select
                    className={styles.filterSelect}
                    value={selectedPhaseId}
                    onChange={(e) => setSelectedPhaseId(e.target.value)}
                >
                    <option value="">All Phases</option>
                    {phases.map((phase) => (
                        <option key={phase.id} value={phase.id}>{phase.title}</option>
                    ))}
                </select>
                <select
                    className={styles.filterSelect}
                    value={selectedModuleId}
                    onChange={(e) => setSelectedModuleId(e.target.value)}
                    disabled={!selectedPhaseId}
                >
                    <option value="">All Modules</option>
                    {modules.map((mod) => (
                        <option key={mod.id} value={mod.id}>{mod.title}</option>
                    ))}
                </select>
            </div>

            {/* Lesson Table */}
            {filteredLessons.length === 0 ? (
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
                        <span className={styles.tableCount}>{filteredLessons.length} lessons</span>
                    </div>
                    <div className={styles.tableScroll}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Lesson</th>
                                    <th>Phase / Module</th>
                                    <th>Difficulty</th>
                                    <th>Created</th>
                                    <th>Updated</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLessons.map((lesson) => (
                                    <tr key={lesson.id}>
                                        <td>
                                            <div className={styles.lessonTitle}>{lesson.title}</div>
                                            <div className={styles.lessonSlug}>/{lesson.slug}</div>
                                        </td>
                                        <td>
                                            {lesson.module ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                    <span className={styles.phaseBadge}>{lesson.module.phase.title}</span>
                                                    <span className={styles.moduleBadge}>{lesson.module.title}</span>
                                                </div>
                                            ) : (
                                                <span className={styles.unassignedBadge}>Unassigned</span>
                                            )}
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
                                                    onClick={() => router.push(`/admin/scenarios/${lesson.id}`)}
                                                    title="Manage Scenario"
                                                >
                                                    <Shield size={13} /> Scenario
                                                </button>
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
