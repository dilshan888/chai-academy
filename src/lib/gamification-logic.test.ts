import { test } from 'node:test'
import * as assert from 'node:assert'
import { calculateLevel, getLevelTitle, getNextLevelXP, LEVEL_THRESHOLDS } from './gamification-logic.ts'

test('calculateLevel', async (t) => {
    await t.test('returns level 1 for 0 XP', () => {
        assert.strictEqual(calculateLevel(0), 1)
    })

    await t.test('returns level 1 for 99 XP', () => {
        assert.strictEqual(calculateLevel(99), 1)
    })

    await t.test('returns level 2 for 100 XP (exact threshold)', () => {
        assert.strictEqual(calculateLevel(100), 2)
    })

    await t.test('returns level 2 for 299 XP (between thresholds)', () => {
        assert.strictEqual(calculateLevel(299), 2)
    })

    await t.test('returns level 3 for 300 XP', () => {
        assert.strictEqual(calculateLevel(300), 3)
    })

    await t.test('returns max level (7) for exact max threshold (2500 XP)', () => {
        assert.strictEqual(calculateLevel(2500), 7)
    })

    await t.test('returns max level (7) for XP far exceeding max threshold', () => {
        assert.strictEqual(calculateLevel(10000), 7)
    })
})

test('getLevelTitle', async (t) => {
    await t.test('returns correct title for valid levels', () => {
        assert.strictEqual(getLevelTitle(1), 'Novice')
        assert.strictEqual(getLevelTitle(2), 'Apprentice')
        assert.strictEqual(getLevelTitle(3), 'Practitioner')
        assert.strictEqual(getLevelTitle(4), 'Specialist')
        assert.strictEqual(getLevelTitle(5), 'Expert')
        assert.strictEqual(getLevelTitle(6), 'Master')
        assert.strictEqual(getLevelTitle(7), 'Champion')
    })

    await t.test('returns "Novice" for unknown/out-of-bounds levels', () => {
        assert.strictEqual(getLevelTitle(0), 'Novice')
        assert.strictEqual(getLevelTitle(8), 'Novice')
        assert.strictEqual(getLevelTitle(-1), 'Novice')
    })
})

test('getNextLevelXP', async (t) => {
    await t.test('returns XP for the next level when it exists', () => {
        assert.strictEqual(getNextLevelXP(1), 100)
        assert.strictEqual(getNextLevelXP(2), 300)
        assert.strictEqual(getNextLevelXP(3), 600)
        assert.strictEqual(getNextLevelXP(4), 1000)
        assert.strictEqual(getNextLevelXP(5), 1500)
        assert.strictEqual(getNextLevelXP(6), 2500)
    })

    await t.test('returns null for the max level', () => {
        assert.strictEqual(getNextLevelXP(7), null)
    })

    await t.test('returns null for unknown/out-of-bounds levels', () => {
        assert.strictEqual(getNextLevelXP(8), null)
        assert.strictEqual(getNextLevelXP(0), 0) // Level 0 + 1 is 1, so it returns 0.
    })
})
