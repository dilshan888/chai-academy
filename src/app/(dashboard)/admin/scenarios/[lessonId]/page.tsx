"use client"

import { use } from 'react'
import { ScenarioEditor } from '@/components/features/admin/ScenarioEditor'

export default function AdminScenarioPage({ params }: { params: Promise<{ lessonId: string }> }) {
    const { lessonId } = use(params)
    return <ScenarioEditor lessonId={lessonId} />
}
