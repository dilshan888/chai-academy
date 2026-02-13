import { test, describe } from 'node:test';
import assert from 'node:assert';
import { LESSONS } from './lessons.ts';

describe('LESSONS Data Integrity', () => {
    test('all lesson IDs are unique, positive, and match their keys', () => {
        const ids = new Set();
        for (const [key, lesson] of Object.entries(LESSONS)) {
            assert.strictEqual(key, lesson.id.toString(), `Key ${key} does not match lesson ID ${lesson.id}`);
            assert.ok(lesson.id > 0, `Lesson ID ${lesson.id} must be positive`);
            assert.ok(!ids.has(lesson.id), `Duplicate lesson ID found: ${lesson.id}`);
            ids.add(lesson.id);
        }
    });

    test('all lessons have non-empty titles and at least one section', () => {
        for (const lesson of Object.values(LESSONS)) {
            assert.ok(lesson.title && lesson.title.trim().length > 0, `Lesson ${lesson.id} has an empty title`);
            assert.ok(lesson.sections.length > 0, `Lesson ${lesson.id} has no sections`);
        }
    });

    test('all sections have a title and valid content/fields based on type', () => {
        for (const lesson of Object.values(LESSONS)) {
            lesson.sections.forEach((section, index) => {
                const prefix = `Lesson ${lesson.id} section ${index}`;
                assert.ok(section.title && section.title.trim().length > 0, `${prefix} has an empty title`);

                if (section.type === 'skill') {
                    assert.ok(section.question && section.question.trim().length > 0, `${prefix} (skill) is missing a question`);
                    assert.ok(Array.isArray(section.options) && section.options.length >= 2, `${prefix} (skill) must have at least 2 options`);
                    assert.ok(typeof section.correctIndex === 'number', `${prefix} (skill) must have a correctIndex`);
                    assert.ok(section.correctIndex >= 0 && section.correctIndex < section.options.length, `${prefix} (skill) correctIndex ${section.correctIndex} is out of bounds`);
                } else {
                    assert.ok(section.content && section.content.trim().length > 0, `${prefix} (${section.type}) is missing content`);
                }
            });
        }
    });
});
