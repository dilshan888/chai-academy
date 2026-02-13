"use client"

import { use } from 'react'
import LessonEditor from '@/components/features/LessonEditor'

export default function EditLessonPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    return <LessonEditor lessonId={id} />
}
