"use client"

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
    ArrowLeft, Shield, Plus, X, CheckCircle, Trash2, Save,
    FileText, Lightbulb, Zap, Target,
} from 'lucide-react'
import styles from './scenario-editor.module.css'

interface ScenarioOption {
    id: string
    label: string
    description: string
    impacts: { compliance: number; ethics: number; trust: number }
    feedback: string
    isOptimal: boolean
}

interface ScenarioData {
    id: string
    lessonId: string
    title: string
    riskLevel: string
    situation: string
    prompt: string
    options: ScenarioOption[]
    proTip: string
    xpReward: number
}

const RISK_LEVELS = [
    { value: 'MINIMAL', label: 'Minimal' },
    { value: 'LIMITED', label: 'Limited' },
    { value: 'HIGH', label: 'High' },
    { value: 'UNACCEPTABLE', label: 'Unacceptable' },
]

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

function makeEmptyOption(index: number): ScenarioOption {
    return {
        id: OPTION_LETTERS[index] || `opt_${index}`,
        label: '',
        description: '',
        impacts: { compliance: 50, ethics: 50, trust: 50 },
        feedback: '',
        isOptimal: false,
    }
}

export function ScenarioEditor({ lessonId }: { lessonId: string }) {
    const router = useRouter()

    const [lessonTitle, setLessonTitle] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [isExisting, setIsExisting] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    // Form state
    const [title, setTitle] = useState('')
    const [riskLevel, setRiskLevel] = useState('LIMITED')
    const [situation, setSituation] = useState('')
    const [prompt, setPrompt] = useState('')
    const [proTip, setProTip] = useState('')
    const [xpReward, setXpReward] = useState(30)
    const [options, setOptions] = useState<ScenarioOption[]>([
        makeEmptyOption(0),
        makeEmptyOption(1),
        makeEmptyOption(2),
    ])

    // Load lesson title and existing scenario
    const loadData = useCallback(async () => {
        setLoading(true)
        try {
            // Fetch lesson info
            const lessonRes = await fetch(`/api/lessons/${lessonId}`)
            if (lessonRes.ok) {
                const lessonData = await lessonRes.json()
                setLessonTitle(lessonData.title || 'Unknown Lesson')
            }

            // Fetch existing scenario
            const scenarioRes = await fetch(`/api/admin/scenarios?lessonId=${lessonId}`)
            if (scenarioRes.ok) {
                const { scenario } = await scenarioRes.json()
                if (scenario) {
                    setIsExisting(true)
                    setTitle(scenario.title)
                    setRiskLevel(scenario.riskLevel)
                    setSituation(scenario.situation)
                    setPrompt(scenario.prompt)
                    setProTip(scenario.proTip)
                    setXpReward(scenario.xpReward)
                    const opts = scenario.options as ScenarioOption[]
                    setOptions(opts.length > 0 ? opts : [makeEmptyOption(0), makeEmptyOption(1), makeEmptyOption(2)])
                }
            }
        } catch (error) {
            console.error('Failed to load data', error)
        } finally {
            setLoading(false)
        }
    }, [lessonId])

    useEffect(() => {
        loadData()
    }, [loadData])

    function showToast(type: 'success' | 'error', message: string) {
        setToast({ type, message })
        setTimeout(() => setToast(null), 3000)
    }

    function addOption() {
        if (options.length >= 6) return
        setOptions([...options, makeEmptyOption(options.length)])
    }

    function removeOption(index: number) {
        if (options.length <= 2) return
        const updated = options.filter((_, i) => i !== index)
        // Re-assign letters
        const relabeled = updated.map((opt, i) => ({
            ...opt,
            id: OPTION_LETTERS[i] || `opt_${i}`,
        }))
        setOptions(relabeled)
    }

    function updateOption(index: number, field: keyof ScenarioOption, value: any) {
        const updated = [...options]
        if (field === 'isOptimal') {
            // Only one optimal at a time
            updated.forEach((opt, i) => {
                opt.isOptimal = i === index
            })
        } else {
            (updated[index] as any)[field] = value
        }
        setOptions(updated)
    }

    function updateImpact(index: number, key: 'compliance' | 'ethics' | 'trust', value: number) {
        const updated = [...options]
        updated[index].impacts = { ...updated[index].impacts, [key]: Math.max(0, Math.min(100, value)) }
        setOptions(updated)
    }

    async function handleSave() {
        // Validation
        if (!title.trim()) return showToast('error', 'Title is required')
        if (!situation.trim()) return showToast('error', 'Situation text is required')
        if (!prompt.trim()) return showToast('error', 'Prompt/Question is required')
        if (!proTip.trim()) return showToast('error', 'Pro Tip is required')
        if (options.some(o => !o.label.trim())) return showToast('error', 'All options need a label')
        if (options.some(o => !o.feedback.trim())) return showToast('error', 'All options need feedback text')
        if (!options.some(o => o.isOptimal)) return showToast('error', 'Mark one option as the optimal choice')

        setSaving(true)
        try {
            const payload = {
                lessonId,
                title: title.trim(),
                riskLevel,
                situation: situation.trim(),
                prompt: prompt.trim(),
                options,
                proTip: proTip.trim(),
                xpReward,
            }

            const method = isExisting ? 'PUT' : 'POST'
            const res = await fetch('/api/admin/scenarios', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (res.ok) {
                setIsExisting(true)
                showToast('success', isExisting ? 'Scenario updated successfully' : 'Scenario created successfully')
            } else {
                const err = await res.json()
                showToast('error', err.error || 'Failed to save scenario')
            }
        } catch (error) {
            showToast('error', 'Network error while saving')
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete() {
        setDeleting(true)
        try {
            const res = await fetch(`/api/admin/scenarios?lessonId=${lessonId}`, { method: 'DELETE' })
            if (res.ok) {
                showToast('success', 'Scenario deleted')
                setShowDeleteDialog(false)
                setTimeout(() => router.push('/admin/lessons'), 500)
            } else {
                const err = await res.json()
                showToast('error', err.error || 'Failed to delete')
            }
        } catch (error) {
            showToast('error', 'Network error while deleting')
        } finally {
            setDeleting(false)
        }
    }

    if (loading) {
        return <div className={styles.loading}>Loading scenario editor...</div>
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <a href="/admin/lessons" className={styles.backLink}>
                        <ArrowLeft size={14} /> Back to Content Manager
                    </a>
                    <h1 className={styles.headerTitle}>
                        {isExisting ? 'Edit Scenario' : 'Create Scenario'}
                    </h1>
                    <p className={styles.headerSub}>
                        Lesson: <strong>{lessonTitle}</strong>
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <span className={`${styles.statusBadge} ${isExisting ? styles.statusExisting : styles.statusNew}`}>
                        {isExisting ? (
                            <><CheckCircle size={12} /> Existing</>
                        ) : (
                            <><Plus size={12} /> New</>
                        )}
                    </span>
                </div>
            </div>

            {/* Core Details Card */}
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <div className={styles.cardHeaderIcon} style={{ background: 'hsl(210 80% 50% / 0.1)', color: 'hsl(210 80% 50%)' }}>
                        <Shield size={14} />
                    </div>
                    <span className={styles.cardHeaderTitle}>Scenario Details</span>
                </div>
                <div className={styles.cardBody}>
                    <div className={styles.fieldRow}>
                        <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Title</label>
                            <input
                                className={styles.input}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., AI-Generated Content Submission"
                            />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Risk Level</label>
                            <select
                                className={styles.select}
                                value={riskLevel}
                                onChange={(e) => setRiskLevel(e.target.value)}
                            >
                                {RISK_LEVELS.map((rl) => (
                                    <option key={rl.value} value={rl.value}>{rl.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Situation</label>
                        <span className={styles.fieldHint}>Describe the real-world scenario the learner will face</span>
                        <textarea
                            className={styles.textarea}
                            value={situation}
                            onChange={(e) => setSituation(e.target.value)}
                            placeholder="A student in your university's Computer Science program submits a final project report..."
                            rows={4}
                        />
                    </div>
                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Prompt / Question</label>
                        <span className={styles.fieldHint}>The question presented to the learner after reading the situation</span>
                        <input
                            className={styles.input}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="What would you do as the course instructor?"
                        />
                    </div>
                </div>
            </div>

            {/* Options Card */}
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <div className={styles.cardHeaderIcon} style={{ background: 'hsl(270 60% 50% / 0.1)', color: 'hsl(270 60% 50%)' }}>
                        <Target size={14} />
                    </div>
                    <span className={styles.cardHeaderTitle}>Decision Options</span>
                    <div style={{ flex: 1 }} />
                    {options.length < 6 && (
                        <button className={styles.addOptionBtn} onClick={addOption} type="button">
                            <Plus size={12} /> Add Option
                        </button>
                    )}
                </div>
                <div className={styles.cardBody}>
                    <div className={styles.optionsList}>
                        {options.map((opt, index) => (
                            <div
                                key={index}
                                className={`${styles.optionCard} ${opt.isOptimal ? styles.optionCardOptimal : ''}`}
                            >
                                <div className={styles.optionHeader}>
                                    <span className={`${styles.optionLetter} ${opt.isOptimal ? styles.optionLetterOptimal : ''}`}>
                                        {OPTION_LETTERS[index]}
                                    </span>
                                    <span className={styles.optionHeaderTitle}>
                                        Option {OPTION_LETTERS[index]}
                                        {opt.isOptimal && ' — Optimal'}
                                    </span>
                                    <div className={styles.optionHeaderActions}>
                                        <button
                                            type="button"
                                            className={`${styles.optimalToggle} ${opt.isOptimal ? styles.optimalToggleActive : ''}`}
                                            onClick={() => updateOption(index, 'isOptimal', true)}
                                        >
                                            <CheckCircle size={10} />
                                            {opt.isOptimal ? 'Optimal' : 'Set Optimal'}
                                        </button>
                                        {options.length > 2 && (
                                            <button
                                                type="button"
                                                className={styles.removeOptionBtn}
                                                onClick={() => removeOption(index)}
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className={styles.optionBody}>
                                    <div className={styles.fieldGroup}>
                                        <label className={styles.fieldLabel}>Label</label>
                                        <input
                                            className={styles.input}
                                            value={opt.label}
                                            onChange={(e) => updateOption(index, 'label', e.target.value)}
                                            placeholder="e.g., Report to Academic Integrity Office"
                                        />
                                    </div>
                                    <div className={styles.fieldGroup}>
                                        <label className={styles.fieldLabel}>Description</label>
                                        <textarea
                                            className={styles.textarea}
                                            value={opt.description}
                                            onChange={(e) => updateOption(index, 'description', e.target.value)}
                                            placeholder="What this choice entails..."
                                            rows={2}
                                        />
                                    </div>
                                    <div className={styles.fieldGroup}>
                                        <label className={styles.fieldLabel}>Feedback</label>
                                        <span className={styles.fieldHint}>Shown to the learner after they choose this option</span>
                                        <textarea
                                            className={styles.textarea}
                                            value={opt.feedback}
                                            onChange={(e) => updateOption(index, 'feedback', e.target.value)}
                                            placeholder="Explain why this choice is good/bad and what the learner should consider..."
                                            rows={2}
                                        />
                                    </div>
                                    <div className={styles.impactRow}>
                                        <div className={styles.impactField}>
                                            <label className={styles.impactLabel}>Compliance %</label>
                                            <input
                                                type="number"
                                                className={styles.impactInput}
                                                value={opt.impacts.compliance}
                                                onChange={(e) => updateImpact(index, 'compliance', parseInt(e.target.value) || 0)}
                                                min={0}
                                                max={100}
                                            />
                                        </div>
                                        <div className={styles.impactField}>
                                            <label className={styles.impactLabel}>Ethics %</label>
                                            <input
                                                type="number"
                                                className={styles.impactInput}
                                                value={opt.impacts.ethics}
                                                onChange={(e) => updateImpact(index, 'ethics', parseInt(e.target.value) || 0)}
                                                min={0}
                                                max={100}
                                            />
                                        </div>
                                        <div className={styles.impactField}>
                                            <label className={styles.impactLabel}>Trust %</label>
                                            <input
                                                type="number"
                                                className={styles.impactInput}
                                                value={opt.impacts.trust}
                                                onChange={(e) => updateImpact(index, 'trust', parseInt(e.target.value) || 0)}
                                                min={0}
                                                max={100}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Rewards & Pro Tip Card */}
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <div className={styles.cardHeaderIcon} style={{ background: 'hsl(45 93% 47% / 0.1)', color: 'hsl(45 93% 47%)' }}>
                        <Lightbulb size={14} />
                    </div>
                    <span className={styles.cardHeaderTitle}>Rewards & Pro Tip</span>
                </div>
                <div className={styles.cardBody}>
                    <div className={styles.fieldRow}>
                        <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>XP Reward</label>
                            <span className={styles.fieldHint}>Base XP for completing (optimal gets +20 bonus)</span>
                            <input
                                type="number"
                                className={styles.input}
                                value={xpReward}
                                onChange={(e) => setXpReward(parseInt(e.target.value) || 0)}
                                min={0}
                                max={500}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', paddingBottom: '0.15rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: 'hsl(var(--muted-foreground))' }}>
                                <Zap size={14} style={{ color: 'hsl(45 93% 47%)' }} />
                                Optimal: {xpReward + 20} XP total
                            </div>
                        </div>
                    </div>
                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>Pro Tip</label>
                        <span className={styles.fieldHint}>Expert advice shown in the sidebar during the scenario</span>
                        <textarea
                            className={styles.textarea}
                            value={proTip}
                            onChange={(e) => setProTip(e.target.value)}
                            placeholder="When encountering potential AI-generated content, consider the context and intent before making decisions..."
                            rows={4}
                        />
                    </div>
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className={styles.bottomBar}>
                <div className={styles.bottomBarLeft}>
                    {isExisting && (
                        <button
                            type="button"
                            className={styles.deleteScenarioBtn}
                            onClick={() => setShowDeleteDialog(true)}
                        >
                            <Trash2 size={14} /> Delete Scenario
                        </button>
                    )}
                </div>
                <button
                    type="button"
                    className={styles.saveBtn}
                    onClick={handleSave}
                    disabled={saving}
                >
                    <Save size={14} />
                    {saving ? 'Saving...' : (isExisting ? 'Update Scenario' : 'Create Scenario')}
                </button>
            </div>

            {/* Delete Confirmation */}
            {showDeleteDialog && (
                <div className={styles.dialogOverlay} onClick={() => !deleting && setShowDeleteDialog(false)}>
                    <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
                        <h3 className={styles.dialogTitle}>Delete Scenario</h3>
                        <p className={styles.dialogText}>
                            Are you sure you want to delete this scenario? All learner responses will also be permanently removed. This cannot be undone.
                        </p>
                        <div className={styles.dialogActions}>
                            <button
                                className={styles.dialogCancel}
                                onClick={() => setShowDeleteDialog(false)}
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.dialogDelete}
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting ? 'Deleting...' : 'Delete Scenario'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
                    {toast.message}
                </div>
            )}
        </div>
    )
}
