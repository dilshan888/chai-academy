import { OnboardingForm } from '@/components/features/OnboardingForm'
import { Card } from '@/components/ui/card'

export default function OnboardingPage() {
    return (
        <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
            <Card>
                <OnboardingForm />
            </Card>
        </div>
    )
}
