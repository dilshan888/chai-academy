"use client"

import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import styles from './admin/module-management.module.css'

interface PhaseItem {
    id: string
    title: string
    slug: string
}

interface ModuleItem {
    id: string
    title: string
    slug: string
    description: string | null
    sortOrder: number
    phaseId: string
    phase?: { id: string; title: string }
    _count?: { lessons: number }
    lessonCount?: number
    createdAt: string
    updatedAt: string
}

interface ModuleFormData {
    title: string
    slug: string
    description: string
    sortOrder: number
    phaseId: string
}

const emptyForm: ModuleFormData = {
    title: '',
    slug: '',
    description: '',
    sortOrder: 0,
    phaseId: '',
}

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
}

export function ModuleManagementView({ showHeader = true }: { showHeader?: boolean }) {
    const [modules, setModules] = useState<ModuleItem[]>([])
    const [phases, setPhases] = useState<PhaseItem[]>([])
    const [loading, setLoading] = useState(true)
    const [filterPhaseId, setFilterPhaseId] = useState<string>('')

    // Delete dialog state
    const [deleteTarget, setDeleteTarget] = useState<ModuleItem | null>(null)
    const [deleting, setDeleting] = useState(false)

    // Form modal state
    const [formOpen, setFormOpen] = useState(false)
    const [editingModule, setEditingModule] = useState<ModuleItem | null>(null)
    const [formData, setFormData] = useState<ModuleFormData>(emptyForm)
    const [saving, setSaving] = useState(false)
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

    const loadPhases = useCallback(async () => {
        try {
            const res = await fetch('/api/phases')
            if (res.ok) {
                const data = await res.json()
                setPhases(data)
            }
        } catch (error) {
            console.error('Failed to load phases', error)
        }
    }, [])

    const loadModules = useCallback(async (phaseId?: string) => {
        try {
            const url = phaseId
                ? `/api/modules?phaseId=${phaseId}`
                : '/api/modules'
            const res = await fetch(url)
            if (res.ok) {
                const data = await res.json()
                setModules(data)
            }
        } catch (error) {
            console.error('Failed to load modules', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadPhases()
        loadModules()
    }, [loadPhases, loadModules])

    useEffect(() => {
        setLoading(true)
        loadModules(filterPhaseId || undefined)
    }, [filterPhaseId, loadModules])

    function getPhaseTitle(phaseId: string): string {
        if (editingModule?.phase?.id === phaseId) return editingModule.phase.title
        const found = phases.find(p => p.id === phaseId)
        return found?.title ?? 'Unknown'
    }

    function getLessonCount(mod: ModuleItem): number {
        if (typeof mod.lessonCount === 'number') return mod.lessonCount
        if (mod._count?.lessons !== undefined) return mod._count.lessons
        return 0
    }

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
    }

    // --- Delete ---
    async function handleDelete() {
        if (!deleteTarget) return
        setDeleting(true)
        try {
            const res = await fetch(`/api/modules/${deleteTarget.id}`, { method: 'DELETE' })
            if (res.ok) {
                setModules(modules.filter(m => m.id !== deleteTarget.id))
                setDeleteTarget(null)
            } else {
                const err = await res.json()
                alert('Delete failed: ' + (err.error || 'Unknown error'))
            }
        } catch {
            alert('Delete failed: Network error')
        } finally {
            setDeleting(false)
        }
    }

    // --- Create / Edit form ---
    function openCreateForm() {
        setEditingModule(null)
        setFormData(emptyForm)
        setSlugManuallyEdited(false)
        setFormOpen(true)
    }

    function openEditForm(mod: ModuleItem) {
        setEditingModule(mod)
        setFormData({
            title: mod.title,
            slug: mod.slug,
            description: mod.description ?? '',
            sortOrder: mod.sortOrder,
            phaseId: mod.phaseId,
        })
        setSlugManuallyEdited(true)
        setFormOpen(true)
    }

    function closeForm() {
        setFormOpen(false)
        setEditingModule(null)
        setFormData(emptyForm)
        setSaving(false)
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
        setFormData(prev => ({ ...prev, slug: value }))
    }

    async function handleFormSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!formData.title.trim() || !formData.phaseId) return
        setSaving(true)

        try {
            const payload = {
                title: formData.title.trim(),
                slug: formData.slug.trim() || generateSlug(formData.title),
                description: formData.description.trim() || null,
                sortOrder: Number(formData.sortOrder) || 0,
                phaseId: formData.phaseId,
            }

            if (editingModule) {
                // Update
                const res = await fetch(`/api/modules/${editingModule.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                })
                if (res.ok) {
                    const updated = await res.json()
                    setModules(modules.map(m => m.id === editingModule.id ? updated : m))
                    closeForm()
                } else {
                    const err = await res.json()
                    alert('Update failed: ' + (err.error || 'Unknown error'))
                }
            } else {
                // Create
                const res = await fetch('/api/modules', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                })
                if (res.ok) {
                    const created = await res.json()
                    setModules([...modules, created])
                    closeForm()
                } else {
                    const err = await res.json()
                    alert('Create failed: ' + (err.error || 'Unknown error'))
                }
            }
        } catch {
            alert('Save failed: Network error')
        } finally {
            setSaving(false)
        }
    }

    // --- Stats ---
    const totalModules = modules.length
    const filteredLabel = filterPhaseId
        ? `Modules in "${getPhaseTitle(filterPhaseId)}"`
        : 'Showing All Phases'

    if (loading && modules.length === 0) {
        return <div className={styles.loading}>Loading modules...</div>
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            {showHeader ? (
                <header className={styles.header}>
                    <div>
                        <h1 className={styles.headerTitle}>Module Management</h1>
                        <p className={styles.headerSub}>
                            Create, edit, and manage modules within phases
                        </p>
                    </div>
                    <div className={styles.headerActions}>
                        <Button variant="primary" onClick={openCreateForm}>
                            <Plus size={16} style={{ marginRight: '0.25rem' }} />
                            Create Module
                        </Button>
                    </div>
                </header>
            ) : (
                <div className={styles.noHeaderActions}>
                    <Button variant="primary" onClick={openCreateForm}>
                        <Plus size={16} style={{ marginRight: '0.25rem' }} />
                        Create Module
                    </Button>
                </div>
            )}

            {/* Filter */}
            <div className={styles.filterRow}>
                <select
                    className={styles.filterSelect}
                    value={filterPhaseId}
                    onChange={(e) => setFilterPhaseId(e.target.value)}
                >
                    <option value="">All Phases</option>
                    {phases.map((phase) => (
                        <option key={phase.id} value={phase.id}>
                            {phase.title}
                        </option>
                    ))}
                </select>
            </div>

            {/* Stats */}
            <div className={styles.statsRow}>
                <div className={styles.statCard}>
                    <span className={styles.statCardLabel}>Total Modules</span>
                    <span className={styles.statCardValue}>{totalModules}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statCardLabel}>{filteredLabel}</span>
                    <span className={styles.statCardValue}>{modules.length}</span>
                </div>
            </div>

            {/* Module Table */}
            {modules.length === 0 ? (
                <div className={styles.tableCard}>
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}><Layers size={48} /></div>
                        <div className={styles.emptyTitle}>No modules yet</div>
                        <p className={styles.emptyText}>
                            {filterPhaseId
                                ? 'No modules found for the selected phase. Create one to get started.'
                                : 'Create your first module to start organizing content within phases.'}
                        </p>
                        <Button variant="primary" onClick={openCreateForm}>
                            <Plus size={16} style={{ marginRight: '0.25rem' }} />
                            Create First Module
                        </Button>
                    </div>
                </div>
            ) : (
                <div className={styles.tableCard}>
                    <div className={styles.tableHeader}>
                        <span className={styles.tableTitle}>
                            {filterPhaseId ? `Modules in Phase` : 'All Modules'}
                        </span>
                        <span className={styles.tableCount}>{modules.length} module{modules.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className={styles.tableScroll}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Module</th>
                                    <th>Phase</th>
                                    <th>Lessons</th>
                                    <th>Sort Order</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {modules.map((mod) => (
                                    <tr key={mod.id}>
                                        <td>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{mod.title}</div>
                                            <div style={{ fontSize: '0.73rem', color: 'hsl(var(--muted-foreground))', fontFamily: 'monospace' }}>
                                                /{mod.slug}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={styles.phaseBadge}>
                                                {mod.phase?.title ?? getPhaseTitle(mod.phaseId)}
                                            </span>
                                        </td>
                                        <td>{getLessonCount(mod)}</td>
                                        <td>{mod.sortOrder}</td>
                                        <td>
                                            <span style={{ fontSize: '0.82rem', color: 'hsl(var(--muted-foreground))' }}>
                                                {formatDate(mod.createdAt)}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button
                                                    className={styles.actionBtn}
                                                    onClick={() => openEditForm(mod)}
                                                >
                                                    <Pencil size={13} /> Edit
                                                </button>
                                                <button
                                                    className={styles.deleteBtn}
                                                    onClick={() => setDeleteTarget(mod)}
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
                        <h3 className={styles.dialogTitle}>Delete Module</h3>
                        <p className={styles.dialogText}>
                            Are you sure you want to delete <strong>&quot;{deleteTarget.title}&quot;</strong>?
                            This will also remove all associated lessons and progress records. This action cannot be undone.
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
                                {deleting ? 'Deleting...' : 'Delete Module'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create / Edit Form Modal */}
            {formOpen && (
                <div className={styles.dialogOverlay} onClick={() => !saving && closeForm()}>
                    <div className={styles.formDialog} onClick={(e) => e.stopPropagation()}>
                        <h3 className={styles.dialogTitle}>
                            {editingModule ? 'Edit Module' : 'Create Module'}
                        </h3>
                        <form onSubmit={handleFormSubmit}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel} htmlFor="mod-title">Title</label>
                                <input
                                    id="mod-title"
                                    className={styles.formInput}
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => handleTitleChange(e.target.value)}
                                    placeholder="e.g. Introduction to JavaScript"
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel} htmlFor="mod-slug">Slug</label>
                                <input
                                    id="mod-slug"
                                    className={styles.formInput}
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => handleSlugChange(e.target.value)}
                                    placeholder="auto-generated-from-title"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel} htmlFor="mod-phase">Phase</label>
                                <select
                                    id="mod-phase"
                                    className={styles.formSelect}
                                    value={formData.phaseId}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phaseId: e.target.value }))}
                                    required
                                >
                                    <option value="">Select a phase...</option>
                                    {phases.map((phase) => (
                                        <option key={phase.id} value={phase.id}>
                                            {phase.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel} htmlFor="mod-desc">Description</label>
                                <textarea
                                    id="mod-desc"
                                    className={styles.formTextarea}
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Optional description for this module"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel} htmlFor="mod-sort">Sort Order</label>
                                <input
                                    id="mod-sort"
                                    className={styles.formInput}
                                    type="number"
                                    value={formData.sortOrder}
                                    onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: Number(e.target.value) }))}
                                    min={0}
                                />
                            </div>

                            <div className={styles.formActions}>
                                <button
                                    type="button"
                                    className={styles.dialogCancel}
                                    onClick={closeForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={styles.formSave}
                                    disabled={saving || !formData.title.trim() || !formData.phaseId}
                                >
                                    {saving
                                        ? 'Saving...'
                                        : editingModule
                                            ? 'Update Module'
                                            : 'Create Module'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
