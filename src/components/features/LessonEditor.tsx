"use client";

import { useState } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { EditorBlock } from "./EditorBlocks";

// Types for our Lesson Blocks
export type BlockType = "text" | "quiz" | "image";

export interface LessonBlock {
    id: string; // Unique ID for Drag and Drop
    type: BlockType;
    content?: string; // For text
    question?: string; // For quiz
    options?: string[]; // For quiz
    answer?: string; // For quiz
    imageUrl?: string; // For image (mapped to 'url')
    altText?: string; // For image (mapped to 'alt')
}

import styles from './LessonEditor.module.css';

export default function LessonEditor() {
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [difficulty, setDifficulty] = useState("beginner");
    const [blocks, setBlocks] = useState<LessonBlock[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setBlocks((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const addBlock = (type: BlockType) => {
        const newBlock: LessonBlock = {
            id: crypto.randomUUID(),
            type,
            content: "",
            options: type === "quiz" ? ["", ""] : undefined,
            answer: "",
        };
        setBlocks([...blocks, newBlock]);
    };

    const updateBlock = (id: string, updates: Partial<LessonBlock>) => {
        setBlocks(blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    };

    const removeBlock = (id: string) => {
        setBlocks(blocks.filter((b) => b.id !== id));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Validate
            if (!title || !slug || blocks.length === 0) {
                alert("Please fill in title, slug and add at least one block.");
                setIsSaving(false);
                return;
            }

            // Map blocks to API expected structure
            const steps = blocks.map((b) => {
                if (b.type === "text") return { type: "text", content: b.content };
                if (b.type === "quiz") return {
                    type: "quiz",
                    question: b.question || "Untitled Question",
                    options: b.options || [],
                    answer: b.answer
                };
                if (b.type === "image") return { type: "image", url: b.imageUrl, alt: b.altText };
                return b;
            });

            const response = await fetch("/api/lessons", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    slug,
                    difficulty,
                    steps,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to save");
            }

            alert("Lesson saved successfully!");
            // Optional: redirect
            // window.location.href = '/admin';
        } catch (e: any) {
            alert("Error: " + e.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.editorContainer}>
            <div className={styles.header}>
                <h1 className={styles.title}>Create New Lesson</h1>
                <div style={{ fontSize: '0.9rem', color: 'gray' }}>Admin Mode</div>
            </div>

            <div className={styles.metaGrid}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Lesson Title</label>
                    <input
                        className={styles.input}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Introduction to AI"
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Slug (URL)</label>
                    <input
                        className={styles.input}
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="e.g. intro-to-ai"
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Difficulty Level</label>
                    <select
                        className={styles.select}
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                    >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                </div>
            </div>

            <div className={styles.contentArea}>
                <h2 className={styles.contentTitle}>Lesson Content</h2>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={blocks.map((b) => b.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className={styles.blocksList}>
                            {blocks.map((block) => (
                                <EditorBlock
                                    key={block.id}
                                    block={block}
                                    onUpdate={updateBlock}
                                    onRemove={removeBlock}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>

                {blocks.length === 0 && (
                    <div className={styles.emptyState}>
                        No content yet. Add a block to get started.
                    </div>
                )}
            </div>

            <div className={styles.toolbar}>
                <button onClick={() => addBlock("text")} className={styles.toolBtn}>
                    <span style={{ color: '#3b82f6' }}>T</span> Add Text
                </button>
                <button onClick={() => addBlock("quiz")} className={styles.toolBtn}>
                    <span style={{ color: '#a855f7' }}>?</span> Add Quiz
                </button>
                <button onClick={() => addBlock("image")} className={styles.toolBtn}>
                    <span style={{ color: '#22c55e' }}>IMG</span> Add Image
                </button>
            </div>

            <div className={styles.saveBar}>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={styles.saveBtn}
                    style={{ opacity: isSaving ? 0.7 : 1 }}
                >
                    {isSaving ? "Publishing..." : "Publish Lesson"}
                </button>
            </div>
        </div>
    );
}
