"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
    explanation?: string; // For quiz
    sourceUrl?: string; // For text - "Read More" link
    imageUrl?: string; // For image (mapped to 'url')
    altText?: string; // For image (mapped to 'alt')
}

import styles from './LessonEditor.module.css';

interface LessonEditorProps {
    lessonId?: string; // If provided, edit mode
}

export default function LessonEditor({ lessonId }: LessonEditorProps) {
    const router = useRouter();
    const isEditMode = Boolean(lessonId);

    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [difficulty, setDifficulty] = useState("beginner");
    const [blocks, setBlocks] = useState<LessonBlock[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(isEditMode);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Load existing lesson data in edit mode
    useEffect(() => {
        if (!lessonId) return;

        async function loadLesson() {
            try {
                const res = await fetch(`/api/lessons/${lessonId}`);
                if (!res.ok) throw new Error("Failed to load lesson");
                const data = await res.json();

                setTitle(data.title || "");
                setSlug(data.slug || "");
                setDescription(data.description || "");
                setDifficulty(data.difficulty || "beginner");

                // Convert API steps back to editor blocks
                if (data.content?.steps && Array.isArray(data.content.steps)) {
                    const loadedBlocks: LessonBlock[] = data.content.steps.map(
                        (step: any) => {
                            const block: LessonBlock = {
                                id: crypto.randomUUID(),
                                type: step.type || "text",
                            };
                            if (step.type === "text") {
                                block.content = step.content || "";
                            } else if (step.type === "quiz") {
                                block.question = step.question || "";
                                block.options = step.options || ["", ""];
                                block.answer = step.answer || "";
                            } else if (step.type === "image") {
                                block.imageUrl = step.url || "";
                                block.altText = step.alt || "";
                            }
                            return block;
                        }
                    );
                    setBlocks(loadedBlocks);
                }
            } catch (error) {
                console.error("Failed to load lesson:", error);
                alert("Failed to load lesson data.");
            } finally {
                setIsLoading(false);
            }
        }

        loadLesson();
    }, [lessonId]);

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

            const url = isEditMode ? `/api/lessons/${lessonId}` : "/api/lessons";
            const method = isEditMode ? "PATCH" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    slug,
                    description: description || undefined,
                    difficulty,
                    steps,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to save");
            }

            // Redirect to lesson management page
            router.push("/admin/lessons");
        } catch (e: any) {
            alert("Error: " + e.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className={styles.editorContainer}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', color: 'gray' }}>
                    Loading lesson data...
                </div>
            </div>
        );
    }

    return (
        <div className={styles.editorContainer}>
            <div className={styles.header}>
                <h1 className={styles.title}>
                    {isEditMode ? "Edit Lesson" : "Create New Lesson"}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ fontSize: '0.9rem', color: 'gray' }}>Admin Mode</div>
                    <button
                        onClick={() => router.push('/admin/lessons')}
                        style={{
                            padding: '0.4rem 0.8rem',
                            fontSize: '0.82rem',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px',
                            background: 'hsl(var(--card))',
                            cursor: 'pointer',
                            color: 'hsl(var(--foreground))',
                        }}
                    >
                        ← Back to Lessons
                    </button>
                </div>
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

            {/* Description field */}
            <div style={{ marginBottom: '1rem' }}>
                <label className={styles.label} style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Description (optional)
                </label>
                <textarea
                    className={styles.input}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A brief description of this lesson..."
                    rows={2}
                    style={{ resize: 'vertical', minHeight: '60px', width: '100%', fontFamily: 'inherit' }}
                />
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
                    {isSaving
                        ? (isEditMode ? "Saving..." : "Publishing...")
                        : (isEditMode ? "Save Changes" : "Publish Lesson")
                    }
                </button>
            </div>
        </div>
    );
}
