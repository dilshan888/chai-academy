export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">ChAI Academy</h1>
      <p className="text-xl mb-8">MVP Ready for Review</p>

      <a
        href="/login"
        className="px-6 py-3 bg-[hsl(222,47%,11%)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        style={{ backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
      >
        Go to Login
      </a>
    </main>
  )
}
