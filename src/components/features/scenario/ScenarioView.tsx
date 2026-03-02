"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Shield, AlertTriangle, CheckCircle, Zap, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProgress } from '@/lib/ProgressContext'
import styles from './scenario.module.css'

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

export function ScenarioView({ scenarioId }: { scenarioId: string }) {
    const router = useRouter()
    const { refreshStats } = useProgress()
    const [scenario, setScenario] = useState<ScenarioData | null>(null)
    const [existingChoice, setExistingChoice] = useState<string | null>(null)
    const [selected, setSelected] = useState<string | null>(null)
    const [confirmed, setConfirmed] = useState(false)
    const [feedback, setFeedback] = useState<{ xpGained: number; isOptimal: boolean; bonusXP: number } | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(`/api/scenarios/${scenarioId}`)
                if (res.ok) {
                    const data = await res.json()
                    setScenario(data.scenario)
                    if (data.userResponse) {
                        setExistingChoice(data.userResponse)
                        setSelected(data.userResponse)
                        setConfirmed(true)
                    }
                }
            } catch (e) {
                console.error('Failed to load scenario', e)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [scenarioId])

    const handleConfirm = async () => {
        if (!selected || !scenario) return
        setSubmitting(true)

        try {
            const res = await fetch(`/api/scenarios/${scenarioId}/respond`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chosenOption: selected }),
            })

            if (res.ok) {
                const data = await res.json()
                setConfirmed(true)
                setFeedback(data)
                refreshStats()
            }
        } catch (e) {
            console.error('Failed to submit response', e)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return <div className={styles.loading}>Loading scenario...</div>
    }

    if (!scenario) {
        return <div className={styles.loading}>Scenario not found</div>
    }

    const options = scenario.options as ScenarioOption[]
    const selectedOption = options.find((o) => o.id === selected)
    const impacts = confirmed && selectedOption ? selectedOption.impacts : { compliance: 0, ethics: 0, trust: 0 }

    const riskClass = scenario.riskLevel === 'HIGH' ? styles.riskHigh
        : scenario.riskLevel === 'LIMITED' ? styles.riskLimited
            : scenario.riskLevel === 'MINIMAL' ? styles.riskMinimal
                : styles.riskUnacceptable

    return (
        <div className={styles.container}>
            {/* Main Column */}
            <div className={styles.mainColumn}>
                {/* Header */}
                <div className={styles.header}>
                    <a href={`/lesson/${scenario.lessonId}`} className={styles.backLink}>
                        <ArrowLeft size={14} /> Back to Lesson
                    </a>
                </div>

                <div className={styles.header}>
                    <h1 className={styles.headerTitle}>{scenario.title}</h1>
                    <span className={`${styles.riskBadge} ${riskClass}`}>
                        <AlertTriangle size={12} />
                        {scenario.riskLevel} Risk
                    </span>
                </div>

                {/* Situation */}
                <div className={styles.situationCard}>
                    <div className={styles.situationLabel}>Situation</div>
                    <div className={styles.situationText}>{scenario.situation}</div>
                    <div className={styles.promptQuote}>{scenario.prompt}</div>
                </div>

                {/* Choices */}
                <div className={styles.choicesCard}>
                    <div className={styles.choicesTitle}>Choose Your Response</div>
                    <div className={styles.choicesList}>
                        {options.map((option) => {
                            const isSelected = selected === option.id
                            const isDisabled = confirmed && !existingChoice

                            return (
                                <button
                                    key={option.id}
                                    className={`${styles.choiceOption} ${isSelected ? styles.choiceSelected : ''} ${confirmed ? styles.choiceDisabled : ''}`}
                                    onClick={() => !confirmed && setSelected(option.id)}
                                    disabled={confirmed}
                                    type="button"
                                >
                                    <div className={styles.choiceHeader}>
                                        <span className={`${styles.choiceLetter} ${isSelected ? styles.choiceLetterSelected : ''}`}>
                                            {option.id}
                                        </span>
                                        <span className={styles.choiceLabel}>{option.label}</span>
                                    </div>
                                    <div className={styles.choiceDesc}>{option.description}</div>
                                </button>
                            )
                        })}
                    </div>

                    {!confirmed && selected && (
                        <div className={styles.confirmButton}>
                            <Button onClick={handleConfirm} disabled={submitting}>
                                {submitting ? 'Submitting...' : 'Confirm Choice'}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Feedback */}
                {confirmed && selectedOption && (
                    <div className={`${styles.feedbackCard} ${selectedOption.isOptimal ? styles.feedbackOptimal : styles.feedbackSuboptimal}`}>
                        <div className={`${styles.feedbackHeader} ${selectedOption.isOptimal ? styles.feedbackOptimalText : styles.feedbackSuboptimalText}`}>
                            {selectedOption.isOptimal ? (
                                <><CheckCircle size={16} /> Optimal Response</>
                            ) : (
                                <><AlertTriangle size={16} /> Consider This</>
                            )}
                        </div>
                        <div className={styles.feedbackBody}>{selectedOption.feedback}</div>
                        {feedback && feedback.xpGained > 0 && (
                            <div className={styles.xpReveal}>
                                <Zap size={14} />
                                +{feedback.xpGained} XP earned
                                {feedback.bonusXP > 0 && ` (includes +${feedback.bonusXP} bonus)`}
                            </div>
                        )}
                    </div>
                )}

                {/* Navigation */}
                {confirmed && (
                    <div className={styles.navActions}>
                        <Button variant="secondary" onClick={() => router.push('/dashboard')}>
                            Back to Dashboard
                        </Button>
                        <Button onClick={() => router.push(`/lesson/${scenario.lessonId}`)}>
                            Review Lesson
                        </Button>
                    </div>
                )}
            </div>

            {/* Side Column */}
            <div className={styles.sideColumn}>
                {/* Impact Meters */}
                <div className={styles.impactCard}>
                    <div className={styles.impactTitle}>Impact Assessment</div>

                    <div className={styles.impactMeter}>
                        <div className={styles.impactLabel}>
                            <span className={styles.impactName}>Compliance</span>
                            <span className={styles.impactValue}>{impacts.compliance}%</span>
                        </div>
                        <div className={styles.impactBarTrack}>
                            <div className={`${styles.impactBarFill} ${styles.impactCompliance}`} style={{ width: `${impacts.compliance}%` }} />
                        </div>
                    </div>

                    <div className={styles.impactMeter}>
                        <div className={styles.impactLabel}>
                            <span className={styles.impactName}>Student Ethics</span>
                            <span className={styles.impactValue}>{impacts.ethics}%</span>
                        </div>
                        <div className={styles.impactBarTrack}>
                            <div className={`${styles.impactBarFill} ${styles.impactEthics}`} style={{ width: `${impacts.ethics}%` }} />
                        </div>
                    </div>

                    <div className={styles.impactMeter}>
                        <div className={styles.impactLabel}>
                            <span className={styles.impactName}>Institutional Trust</span>
                            <span className={styles.impactValue}>{impacts.trust}%</span>
                        </div>
                        <div className={styles.impactBarTrack}>
                            <div className={`${styles.impactBarFill} ${styles.impactTrust}`} style={{ width: `${impacts.trust}%` }} />
                        </div>
                    </div>
                </div>

                {/* Pro Tip */}
                <div className={styles.proTipCard}>
                    <div className={styles.proTipHeader}>
                        <Lightbulb size={14} />
                        ChAI Pro Tip
                    </div>
                    <div className={styles.proTipText}>{scenario.proTip}</div>
                </div>
            </div>
        </div>
    )
}
