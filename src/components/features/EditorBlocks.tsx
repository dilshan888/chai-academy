"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BlockType, LessonBlock } from "./LessonEditor";
import { Trash, GripVertical, Image as ImageIcon, Type, HelpCircle } from "lucide-react";

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
                    <textarea
                        className={styles.textarea}
                        placeholder="Type your lesson content here..."
                        value={block.content || ""}
                        onChange={(e) => onUpdate(block.id, { content: e.target.value })}
                        rows={4}
                    />
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
                                    style={{ maxLength: '100%', maxHeight: '200px', objectFit: 'contain', margin: '0 auto' }}
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
