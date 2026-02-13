"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MessageCircle, X, Send } from 'lucide-react'

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Array<{ role: string, content: string, id: string }>>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const sendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return

        const userMsg = { role: 'user', content: text, id: Date.now().toString() }
        setMessages(prev => [...prev, userMsg])
        setIsLoading(true)

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [...messages, userMsg] })
            })

            if (!response.ok) throw new Error(response.statusText)

            const reader = response.body?.getReader()
            if (!reader) throw new Error('No reader available')

            const assistantMsg = { role: 'assistant', content: '', id: (Date.now() + 1).toString() }
            setMessages(prev => [...prev, assistantMsg])

            const decoder = new TextDecoder()

            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                const chunk = decoder.decode(value, { stream: true })

                setMessages(prev => {
                    const newMsgs = [...prev]
                    const lastMsg = newMsgs[newMsgs.length - 1]
                    if (lastMsg.role === 'assistant') {
                        lastMsg.content += chunk
                    }
                    return newMsgs
                })
            }
        } catch (error) {
            console.error(error)
            alert('Chat failed to connect. Please check your API Key.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        sendMessage(input)
        setInput('')
    }

    return (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 50 }}>
            {isOpen && (
                <Card style={{
                    position: 'absolute',
                    bottom: '4rem',
                    right: '0',
                    width: '350px',
                    height: '500px',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    overflow: 'hidden'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '1rem',
                        background: 'hsl(var(--primary))',
                        color: 'hsl(var(--primary-foreground))',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>🇪🇺</span> EU AI Act Assistant
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {messages.length === 0 && (
                            <div style={{ textAlign: 'center', color: 'hsl(var(--foreground)/0.5)', marginTop: '2rem', fontSize: '0.9rem' }}>
                                <p>Hello! I am your AI compliance assistant.</p>
                                <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>Ask me about risk categories, transparency, or university obligations.</p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {[
                                        "What are high-risk AI systems?",
                                        "Who is responsible for compliance?",
                                        "Does this apply to academic research?"
                                    ].map(q => (
                                        <button
                                            key={q}
                                            onClick={() => sendMessage(q)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                background: 'hsl(var(--secondary))',
                                                color: 'hsl(var(--secondary-foreground))',
                                                border: '1px solid hsl(var(--border))',
                                                borderRadius: '20px',
                                                fontSize: '0.85rem',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.background = 'hsl(var(--secondary)/0.8)'}
                                            onMouseOut={(e) => e.currentTarget.style.background = 'hsl(var(--secondary))'}
                                        >
                                            → {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((m) => (
                            <div key={m.id} style={{
                                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                                background: m.role === 'user' ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                                color: m.role === 'user' ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
                                padding: '0.75rem',
                                borderRadius: '12px',
                                maxWidth: '85%',
                                fontSize: '0.9rem',
                                lineHeight: '1.4',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {m.content}
                            </div>
                        ))}
                        {isLoading && messages[messages.length - 1]?.role === 'user' && (
                            <div style={{ alignSelf: 'flex-start', fontSize: '0.8rem', color: 'hsl(var(--foreground)/0.5)' }}>
                                Thinking...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Form */}
                    <form onSubmit={handleSubmit} style={{ padding: '1rem', borderTop: '1px solid hsl(var(--border))', display: 'flex', gap: '0.5rem' }}>
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about AI regulation..."
                            style={{
                                flex: 1,
                                padding: '0.5rem',
                                borderRadius: '6px',
                                border: '1px solid hsl(var(--border))',
                                background: 'hsl(var(--background))',
                                color: 'hsl(var(--foreground))',
                                fontSize: '0.9rem'
                            }}
                        />
                        <Button type="submit" disabled={isLoading || !input.trim()}>
                            <Send size={16} />
                        </Button>
                    </form>
                </Card>
            )}

            {/* Toggle Button */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    borderRadius: '50%',
                    width: '3.5rem',
                    height: '3.5rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
            >
                <div style={{ position: 'relative' }}>
                    <MessageCircle size={24} />
                    {!isOpen && <span style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        width: '12px',
                        height: '12px',
                        background: '#22c55e',
                        borderRadius: '50%',
                        border: '2px solid white'
                    }} />}
                </div>
            </Button>
        </div>
    )
}
