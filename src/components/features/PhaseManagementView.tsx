"use client"

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import styles from './admin/phase-management.module.css'

interface PhaseItem {
    id: string
    title: string
    slug: string
    description: string | null
    sortOrder: number
    createdAt: string
    updatedAt: string
    _count: {
        modules: number
    }
}

interface PhaseFormData {
    title: string
    slug: string
    description: string
    sortOrder: number
}

const emptyForm: PhaseFormData = {
    title: '',
    slug: '',
    description: '',
    sortOrder: 0,
}

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
}

export function PhaseManagementView({ showHeader = true }: { showHeader?: boolean }) {
    const [phases, setPhases] = useState<PhaseItem[]>([])
    const [loading, setLoading] = useState(true)
    const [deleteTarget, setDeleteTarget] = useState<PhaseItem | null>(null)
    const [deleting, setDeleting] = useState(false)

    // Form modal state
    const [formOpen, setFormOpen] = useState(false)
    const [editingPhase, setEditingPhase] = useState<PhaseItem | null>(null)
    const [formData, setFormData] = useState<PhaseFormData>(emptyForm)
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
    const [formSubmitting, setFormSubmitting] = useState(false)
    const [formError, setFormError] = useState('')

    useEffect(() => {
        loadPhases()
    }, [])

    async function loadPhases() {
        try {
            const res = await fetch('/api/phases')
            if (res.ok) {
                const data = await res.json()
                setPhases(data)
            }
        } catch (error) {
            console.error('Failed to load phases', error)
        } finally {
            setLoading(false)
        }
    }

    // --- Delete ---
    async function handleDelete() {
        if (!deleteTarget) return
        setDeleting(true)
        try {
            const res = await fetch(`/api/phases/${deleteTarget.id}`, { method: 'DELETE' })
            if (res.ok) {
                setPhases(phases.filter(p => p.id !== deleteTarget.id))
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

    // --- Form helpers ---
    function openCreateForm() {
        setEditingPhase(null)
        setFormData(emptyForm)
        setSlugManuallyEdited(false)
        setFormError('')
        setFormOpen(true)
    }

    function openEditForm(phase: PhaseItem) {
        setEditingPhase(phase)
        setFormData({
            title: phase.title,
            slug: phase.slug,
            description: phase.description || '',
            sortOrder: phase.sortOrder,
        })
        setSlugManuallyEdited(true)
        setFormError('')
        setFormOpen(true)
    }

    function closeForm() {
        if (formSubmitting) return
        setFormOpen(false)
        setEditingPhase(null)
        setFormData(emptyForm)
        setFormError('')
    }

    function handleTitleChange(value: string) {
        setFormData(prev => ({
            ...prev,
            title: value,
            slug: slugManuallyEdited ? prev.slug : generateSlug(value),
        }))
    }

    function handleSlugChange(value: string) {
        setSlugManuallyEdited(true)
        setFormData(prev => ({ ...prev, slug: generateSlug(value) }))
    }

    async function handleFormSubmit(e: React.FormEvent) {
        e.preventDefault()
        setFormError('')

        if (!formData.title.trim() || !formData.slug.trim()) {
            setFormError('Title and slug are required.')
            return
        }

        setFormSubmitting(true)
        try {
            const isEdit = !!editingPhase
            const url = isEdit ? `/api/phases/${editingPhase!.id}` : '/api/phases'
            const method = isEdit ? 'PATCH' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title.trim(),
                    slug: formData.slug.trim(),
                    description: formData.description.trim() || null,
                    sortOrder: formData.sortOrder,
                }),
            })

            if (res.ok) {
                closeForm()
                // Reload to get fresh data with _count
                setLoading(true)
                await loadPhases()
            } else {
                const err = await res.json()
                setFormError(err.error || 'Something went wrong.')
            }
        } catch (error) {
            setFormError('Network error. Please try again.')
        } finally {
            setFormSubmitting(false)
        }
    }

    // --- Derived stats ---
    const totalModules = phases.reduce((sum, p) => sum + p._count.modules, 0)

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
    }

    if (loading) {
        return <div className={styles.loading}>Loading phases...</div>
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            {showHeader ? (
                <header className={styles.header}>
                    <div>
                        <h1 className={styles.headerTitle}>Phase Management</h1>
                        <p className={styles.headerSub}>
                            Create, edit, and manage curriculum phases
                        </p>
                    </div>
                    <div className={styles.headerActions}>
                        <Button variant="primary" onClick={openCreateForm}>
                            <Plus size={16} style={{ marginRight: '0.25rem' }} />
                            Create Phase
                        </Button>
                    </div>
                </header>
            ) : (
                <div className={styles.noHeaderActions}>
                    <Button variant="primary" onClick={openCreateForm}>
                        <Plus size={16} style={{ marginRight: '0.25rem' }} />
                        Create Phase
                    </Button>
                </div>
            )}

            {/* Stats */}
            <div className={styles.statsRow}>
                <div className={styles.statCard}>
                    <span className={styles.statCardLabel}>Total Phases</span>
                    <span className={styles.statCardValue}>{phases.length}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statCardLabel}>Total Modules</span>
                    <span className={styles.statCardValue}>{totalModules}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statCardLabel}>Avg Modules / Phase</span>
                    <span className={styles.statCardValue}>
                        {phases.length > 0 ? (totalModules / phases.length).toFixed(1) : 0}
                    </span>
                </div>
            </div>

            {/* Phase Table */}
            {phases.length === 0 ? (
                <div className={styles.tableCard}>
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}><Layers size={48} /></div>
                        <div className={styles.emptyTitle}>No phases yet</div>
                        <p className={styles.emptyText}>
                            Create your first phase to start building the curriculum structure.
                        </p>
                        <Button variant="primary" onClick={openCreateForm}>
                            <Plus size={16} style={{ marginRight: '0.25rem' }} />
                            Create First Phase
                        </Button>
                    </div>
                </div>
            ) : (
                <div className={styles.tableCard}>
                    <div className={styles.tableHeader}>
                        <span className={styles.tableTitle}>All Phases</span>
                        <span className={styles.tableCount}>{phases.length} phases</span>
                    </div>
                    <div className={styles.tableScroll}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Phase</th>
                                    <th>Description</th>
                                    <th>Modules</th>
                                    <th>Order</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {phases.map((phase) => (
                                    <tr key={phase.id}>
                                        <td>
                                            <div className={styles.phaseTitle}>{phase.title}</div>
                                            <div className={styles.phaseSlug}>/{phase.slug}</div>
                                        </td>
                                        <td>
                                            <span className={styles.phaseDescription}>
                                                {phase.description || '\u2014'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={styles.moduleBadge}>
                                                <Layers size={12} />
                                                {phase._count.modules}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={styles.sortOrderBadge}>
                                                {phase.sortOrder}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={styles.dateCell}>
                                                {formatDate(phase.createdAt)}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button
                                                    className={styles.actionBtn}
                                                    onClick={() => openEditForm(phase)}
                                                >
                                                    <Pencil size={13} /> Edit
                                                </button>
                                                <button
                                                    className={styles.deleteBtn}
                                                    onClick={() => setDeleteTarget(phase)}
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
                        <h3 className={styles.dialogTitle}>Delete Phase</h3>
                        <p className={styles.dialogText}>
                            Are you sure you want to delete <strong>&quot;{deleteTarget.title}&quot;</strong>?
                            This will also remove all modules and lessons within this phase. This action cannot be undone.
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
                                {deleting ? 'Deleting...' : 'Delete Phase'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create / Edit Form Modal */}
            {formOpen && (
                <div className={styles.dialogOverlay} onClick={closeForm}>
                    <div className={styles.formDialog} onClick={(e) => e.stopPropagation()}>
                        <h3 className={styles.formTitle}>
                            {editingPhase ? 'Edit Phase' : 'Create Phase'}
                        </h3>

                        {formError && (
                            <div className={styles.formError}>{formError}</div>
                        )}

                        <form onSubmit={handleFormSubmit}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel} htmlFor="phase-title">
                                    Title
                                </label>
                                <input
                                    id="phase-title"
                                    className={styles.formInput}
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => handleTitleChange(e.target.value)}
                                    placeholder="e.g. Phase 1: Foundations"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel} htmlFor="phase-slug">
                                    Slug
                                </label>
                                <input
                                    id="phase-slug"
                                    className={styles.formInput}
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => handleSlugChange(e.target.value)}
                                    placeholder="phase-1-foundations"
                                    required
                                />
                                <span className={styles.formHint}>
                                    Auto-generated from title. Edit to customise.
                                </span>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel} htmlFor="phase-description">
                                    Description
                                </label>
                                <textarea
                                    id="phase-description"
                                    className={styles.formTextarea}
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData(prev => ({ ...prev, description: e.target.value }))
                                    }
                                    placeholder="Brief description of this phase..."
                                    rows={3}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel} htmlFor="phase-sortOrder">
                                    Sort Order
                                </label>
                                <input
                                    id="phase-sortOrder"
                                    className={styles.formInput}
                                    type="number"
                                    value={formData.sortOrder}
                                    onChange={(e) =>
                                        setFormData(prev => ({
                                            ...prev,
                                            sortOrder: parseInt(e.target.value, 10) || 0,
                                        }))
                                    }
                                    min={0}
                                />
                                <span className={styles.formHint}>
                                    Lower numbers appear first in the curriculum.
                                </span>
                            </div>

                            <div className={styles.formActions}>
                                <button
                                    type="button"
                                    className={styles.dialogCancel}
                                    onClick={closeForm}
                                    disabled={formSubmitting}
                                >
                                    Cancel
                                </button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={formSubmitting}
                                >
                                    {formSubmitting
                                        ? 'Saving...'
                                        : editingPhase
                                            ? 'Update Phase'
                                            : 'Create Phase'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
