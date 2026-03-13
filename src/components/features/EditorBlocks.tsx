"use client";

import { useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BlockType, LessonBlock } from "./LessonEditor";
import { Trash, GripVertical, Image as ImageIcon, Type, HelpCircle, Bold, Italic, List, Link as LinkIcon } from "lucide-react";

import styles from './LessonEditor.module.css';

interface EditorBlockProps {
    block: LessonBlock;
    onUpdate: (id: string, updates: Partial<LessonBlock>) => void;
    onRemove: (id: string) => void;
}

export function EditorBlock({ block, onUpdate, onRemove }: EditorBlockProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: block.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={styles.block}
        >
            <div
                {...attributes}
                {...listeners}
                className={styles.dragHandle}
                title="Drag to reorder"
            >
                <GripVertical size={20} />
            </div>

            <div className={styles.blockContent}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div className={styles.blockTypeLabel}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <BlockIcon type={block.type} />
                            {block.type} Block
                        </div>
                    </div>
                    <button
                        onClick={() => onRemove(block.id)}
                        className={styles.deleteBtn}
                        title="Delete Block"
                    >
                        <Trash size={16} />
                    </button>
                </div>

                {block.type === "text" && (
                    <div>
                        <TextBlockEditor block={block} onUpdate={onUpdate} />
                        <div style={{ marginTop: '0.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem', color: '#64748b' }}>
                                Source Link (optional "Read More")
                            </label>
                            <input
                                className={styles.input || styles.optionInput}
                                placeholder="https://example.com/source"
                                value={block.sourceUrl || ""}
                                onChange={(e) => onUpdate(block.id, { sourceUrl: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                            />
                        </div>
                    </div>
                )}

                {block.type === "quiz" && (
                    <div className={styles.quizContainer}>
                        <input
                            className={styles.quizQuestionInput}
                            placeholder="What is the question?"
                            value={block.question || ""}
                            onChange={(e) => onUpdate(block.id, { question: e.target.value })}
                        />
                        <div className={styles.optionList}>
                            {block.options?.map((opt, idx) => (
                                <div key={idx} className={styles.optionRow}>
                                    <input
                                        type="radio"
                                        name={`correct-${block.id}`}
                                        className={styles.correctRadio}
                                        checked={block.answer === opt && opt !== ""}
                                        onChange={() => onUpdate(block.id, { answer: opt })}
                                        title="Mark as correct answer"
                                    />
                                    <input
                                        className={styles.optionInput}
                                        placeholder={`Option ${idx + 1}`}
                                        value={opt}
                                        onChange={(e) => {
                                            const newOptions = [...(block.options || [])];
                                            newOptions[idx] = e.target.value;
                                            // auto-update answer if we're editing the correct one
                                            if (block.answer === block.options?.[idx]) {
                                                onUpdate(block.id, { options: newOptions, answer: e.target.value });
                                            } else {
                                                onUpdate(block.id, { options: newOptions });
                                            }
                                        }}
                                    />
                                    {idx > 1 && (
                                        <button
                                            onClick={() => {
                                                const newOptions = block.options?.filter((_, i) => i !== idx);
                                                onUpdate(block.id, { options: newOptions });
                                            }}
                                            style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                onClick={() => onUpdate(block.id, { options: [...(block.options || []), ""] })}
                                className={styles.addOptionBtn}
                            >
                                + Add Another Option
                            </button>
                        </div>
                        <div style={{ marginTop: '0.75rem' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem', color: '#64748b' }}>
                                Explanation (shown after answer)
                            </label>
                            <textarea
                                className={styles.textarea}
                                placeholder="Explain why the correct answer is right and why others are wrong..."
                                value={block.explanation || ""}
                                onChange={(e) => onUpdate(block.id, { explanation: e.target.value })}
                                rows={3}
                                style={{ fontSize: '0.85rem' }}
                            />
                        </div>
                    </div>
                )}

                {block.type === "image" && (
                    <div className={styles.inputGroup} style={{ gap: '1rem' }}>
                        <div>
                            <label className={styles.label} style={{ marginBottom: '0.5rem', display: 'block' }}>Image URL</label>
                            <input
                                className={styles.input}
                                placeholder="https://..."
                                value={block.imageUrl || ""}
                                onChange={(e) => onUpdate(block.id, { imageUrl: e.target.value })}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div>
                            <label className={styles.label} style={{ marginBottom: '0.5rem', display: 'block' }}>Alt Text (Accessibility)</label>
                            <input
                                className={styles.input}
                                placeholder="Describe the image..."
                                value={block.altText || ""}
                                onChange={(e) => onUpdate(block.id, { altText: e.target.value })}
                                style={{ width: '100%' }}
                            />
                        </div>
                        {block.imageUrl && (
                            <div style={{ marginTop: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                                <img
                                    src={block.imageUrl}
                                    alt="preview"
                                    style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', margin: '0 auto' }}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function BlockIcon({ type }: { type: BlockType }) {
    switch (type) {
        case "text": return <Type size={14} />;
        case "quiz": return <HelpCircle size={14} />;
        case "image": return <ImageIcon size={14} />;
    }
}

function TextBlockEditor({ block, onUpdate }: { block: LessonBlock, onUpdate: (id: string, updates: Partial<LessonBlock>) => void }) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const insertFormatting = (prefix: string, suffix: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentContent = block.content || "";

        const selectedText = currentContent.substring(start, end);
        const newText = currentContent.substring(0, start) + prefix + selectedText + suffix + currentContent.substring(end);

        onUpdate(block.id, { content: newText });

        // Restore focus and cursor position
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + prefix.length, end + prefix.length);
        }, 0);
    };

    const btnStyle = {
        padding: '0.35rem 0.5rem',
        borderRadius: '6px',
        cursor: 'pointer',
        border: 'none',
        background: 'transparent',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'hsl(var(--muted-foreground))',
        transition: 'all 0.1s'
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {/* Toolbar */}
            <div style={{ display: 'flex', gap: '0.25rem', background: 'hsl(var(--muted) / 0.4)', padding: '0.3rem', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}>
                <button
                    title="Bold"
                    type="button"
                    onClick={() => insertFormatting('**', '**')}
                    style={btnStyle}
                    onMouseOver={e => { e.currentTarget.style.background = 'hsl(var(--muted))'; e.currentTarget.style.color = 'hsl(var(--foreground))'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'hsl(var(--muted-foreground))'; }}
                ><Bold size={16} /></button>
                
                <button
                    title="Italic"
                    type="button"
                    onClick={() => insertFormatting('*', '*')}
                    style={btnStyle}
                    onMouseOver={e => { e.currentTarget.style.background = 'hsl(var(--muted))'; e.currentTarget.style.color = 'hsl(var(--foreground))'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'hsl(var(--muted-foreground))'; }}
                ><Italic size={16} /></button>
                
                <div style={{ width: '1px', background: 'hsl(var(--border))', margin: '0.2rem 0.4rem' }} />
                
                <button
                    title="Bullet List"
                    type="button"
                    onClick={() => insertFormatting('- ')}
                    style={btnStyle}
                    onMouseOver={e => { e.currentTarget.style.background = 'hsl(var(--muted))'; e.currentTarget.style.color = 'hsl(var(--foreground))'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'hsl(var(--muted-foreground))'; }}
                ><List size={16} /></button>
                
                <button
                    title="Insert Link"
                    type="button"
                    onClick={() => insertFormatting('[', '](url)')}
                    style={btnStyle}
                    onMouseOver={e => { e.currentTarget.style.background = 'hsl(var(--muted))'; e.currentTarget.style.color = 'hsl(var(--foreground))'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'hsl(var(--muted-foreground))'; }}
                ><LinkIcon size={16} /></button>
            </div>
            
            {/* Editor Area */}
            <textarea
                ref={textareaRef}
                className={styles.textarea}
                placeholder="Type your lesson content here... Use the toolbar above for formatting!"
                value={block.content || ""}
                onChange={(e) => onUpdate(block.id, { content: e.target.value })}
                rows={5}
                style={{ fontFamily: 'monospace', lineHeight: 1.5 }}
            />
        </div>
    );
}
