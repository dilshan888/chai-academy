"use client"

import { use } from 'react'
import { ScenarioView } from '@/components/features/scenario/ScenarioView'

export default function ScenarioPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    return <ScenarioView scenarioId={id} />
}
