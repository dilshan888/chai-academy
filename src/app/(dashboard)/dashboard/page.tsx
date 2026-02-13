"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { DashboardView } from '@/components/features/DashboardView'

export default function DashboardPage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
            router.replace('/admin')
        }
    }, [status, session, router])

    if (status === 'loading' || session?.user?.role === 'ADMIN') {
        return null
    }

    return <DashboardView />
}
