"use client"

import { useEffect, useState, useRef } from 'react'
import {
    ClipboardList, Users, FileCheck, Search, Filter,
    User, Download, ChevronDown, Check, X
} from 'lucide-react'
import styles from './assessment-results.module.css'

interface AnswerDetail {
    questionId: string
    questionText: string
    category: string
    answer: string
    answerLabel: string
}

interface AssessmentResponseData {
    id: string
    type: 'PRE_TEST' | 'POST_TEST'
    submittedAt: string
    user: {
        id: string
        name: string | null
        email: string | null
        department: string | null
    }
    answers: AnswerDetail[]
}

interface Stats {
    totalResponses: number
    preTestCount: number
    postTestCount: number
    uniqueUsers: number
}

interface UserGroup {
    userId: string
    name: string
    email: string
    department: string
    preTest: AssessmentResponseData | null
    postTest: AssessmentResponseData | null
}

export function AssessmentResultsView() {
    const [responses, setResponses] = useState<AssessmentResponseData[]>([])
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // Filters
    const [search, setSearch] = useState('')
    const [deptFilter, setDeptFilter] = useState('')

    // Export dropdown state (per-user)
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Global export  
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
    const [globalDropdownOpen, setGlobalDropdownOpen] = useState(false)
    const globalDropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch('/api/admin/assessments')
                if (!res.ok) throw new Error('Failed to fetch')
                const data = await res.json()
                setResponses(data.responses)
                setStats(data.stats)
            } catch {
                setError('Failed to load assessment data.')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // Close dropdowns on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpenDropdownId(null)
            }
            if (globalDropdownRef.current && !globalDropdownRef.current.contains(e.target as Node)) {
                setGlobalDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    // Group responses by user
    const userGroups: UserGroup[] = (() => {
        const map = new Map<string, UserGroup>()
        for (const r of responses) {
            const uid = r.user.id
            if (!map.has(uid)) {
                map.set(uid, {
                    userId: uid,
                    name: r.user.name || 'Unknown',
                    email: r.user.email || '',
                    department: r.user.department || 'Unassigned',
                    preTest: null,
                    postTest: null,
                })
            }
            const group = map.get(uid)!
            if (r.type === 'PRE_TEST') group.preTest = r
            if (r.type === 'POST_TEST') group.postTest = r
        }
        return Array.from(map.values())
    })()

    const departments = Array.from(new Set(userGroups.map(u => u.department))).sort()

    const filteredUsers = userGroups.filter(u => {
        const matchesSearch = search === '' ||
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
        const matchesDept = deptFilter === '' || u.department === deptFilter
        return matchesSearch && matchesDept
    })

    const formatDateShort = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: '2-digit', month: '2-digit', year: 'numeric',
        })
    }

    // ---- Export helpers ----
    function buildCSVForResponses(userName: string, responsesToExport: AssessmentResponseData[]) {
        const headers = ['User Name', 'Email', 'Department', 'Assessment Type', 'Submitted Date', 'Question ID', 'Question', 'Category', 'Answer']
        const rows = responsesToExport.flatMap(r =>
            r.answers.map(a => [
                r.user.name || 'Unknown',
                r.user.email || '',
                r.user.department || '',
                r.type === 'PRE_TEST' ? 'Pre-Test' : 'Post-Test',
                formatDateShort(r.submittedAt),
                a.questionId,
                `"${a.questionText.replace(/"/g, '""')}"`,
                a.category === 'LITERACY' ? 'Knowledge' : 'Attitude',
                `"${a.answerLabel.replace(/"/g, '""')}"`,
            ])
        )
        return [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    }

    function downloadCSV(csvContent: string, filename: string) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        link.click()
        URL.revokeObjectURL(url)
    }

    async function buildPDFForResponses(title: string, responsesToExport: AssessmentResponseData[]) {
        const jsPDFModule = await import('jspdf')
        const jsPDF = jsPDFModule.default
        const autoTableModule = await import('jspdf-autotable')
        const autoTable = autoTableModule.default

        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

        doc.setFontSize(18)
        doc.setTextColor(157, 36, 71)
        doc.text('ChAI Academy — Assessment Results', 14, 18)

        doc.setFontSize(10)
        doc.setTextColor(100)
        doc.text(title, 14, 25)
        doc.text(`Exported: ${new Date().toLocaleDateString('en-GB')}`, 14, 31)

        const tableHeaders = [['#', 'User', 'Email', 'Type', 'Date', 'Question', 'Category', 'Answer']]
        let rowNum = 0
        const tableRows = responsesToExport.flatMap(r =>
            r.answers.map(a => {
                rowNum++
                return [
                    rowNum.toString(),
                    r.user.name || 'Unknown',
                    r.user.email || '',
                    r.type === 'PRE_TEST' ? 'Pre' : 'Post',
                    formatDateShort(r.submittedAt),
                    a.questionText,
                    a.category === 'LITERACY' ? 'Knowledge' : 'Attitude',
                    a.answerLabel,
                ]
            })
        )

        autoTable(doc, {
            startY: 35,
            head: tableHeaders,
            body: tableRows,
            theme: 'grid',
            styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak', lineColor: [220, 220, 220], lineWidth: 0.2 },
            headStyles: { fillColor: [157, 36, 71], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            columnStyles: {
                0: { cellWidth: 8 }, 1: { cellWidth: 28 }, 2: { cellWidth: 38 },
                3: { cellWidth: 12 }, 4: { cellWidth: 20 }, 5: { cellWidth: 100 },
                6: { cellWidth: 18 }, 7: { cellWidth: 50 },
            },
            didDrawPage: (data: { pageNumber: number }) => {
                doc.setFontSize(7)
                doc.setTextColor(150)
                doc.text(
                    `ChAI Academy — Page ${data.pageNumber}`,
                    doc.internal.pageSize.getWidth() / 2,
                    doc.internal.pageSize.getHeight() - 8,
                    { align: 'center' }
                )
            },
        })

        return doc
    }

    // Per-user export
    async function handlePerUserExport(user: UserGroup, type: 'pre' | 'post', format: 'csv' | 'pdf') {
        const response = type === 'pre' ? user.preTest : user.postTest
        if (!response) return
        setOpenDropdownId(null)

        const label = type === 'pre' ? 'Pre-Test' : 'Post-Test'
        const safeName = user.name.replace(/[^a-zA-Z0-9]/g, '_')

        if (format === 'csv') {
            const csv = buildCSVForResponses(user.name, [response])
            downloadCSV(csv, `${safeName}_${label}_${formatDateShort(response.submittedAt)}.csv`)
        } else {
            const doc = await buildPDFForResponses(`${user.name} — ${label}`, [response])
            doc.save(`${safeName}_${label}_${formatDateShort(response.submittedAt)}.pdf`)
        }
    }

    // Global export
    async function handleGlobalExport(format: 'csv' | 'pdf') {
        const selectedResponses = responses.filter(r => selectedUsers.has(r.user.id))
        if (selectedResponses.length === 0) return
        setGlobalDropdownOpen(false)

        const date = new Date().toISOString().split('T')[0]

        if (format === 'csv') {
            const csv = buildCSVForResponses('Multiple Users', selectedResponses)
            downloadCSV(csv, `assessment-results-${date}.csv`)
        } else {
            const userNames = Array.from(new Set(selectedResponses.map(r => r.user.name || 'Unknown')))
            const doc = await buildPDFForResponses(`Selected Users: ${userNames.join(', ')}`, selectedResponses)
            doc.save(`assessment-results-${date}.pdf`)
        }
    }

    // Select all / deselect all
    function toggleSelectAll() {
        if (selectedUsers.size === filteredUsers.length) {
            setSelectedUsers(new Set())
        } else {
            setSelectedUsers(new Set(filteredUsers.map(u => u.userId)))
        }
    }

    function toggleUserSelection(userId: string) {
        setSelectedUsers(prev => {
            const next = new Set(prev)
            if (next.has(userId)) next.delete(userId)
            else next.add(userId)
            return next
        })
    }

    if (loading) return <div className={styles.loading}>Loading assessment results...</div>
    if (error) return <div className={styles.loading}>{error}</div>

    const allSelected = filteredUsers.length > 0 && selectedUsers.size === filteredUsers.length

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.headerTitle}>Assessment Results</h1>
                    <p className={styles.headerSub}>Export learner pre-test and post-test responses</p>
                </div>

                {/* Global Export Dropdown */}
                <div className={styles.globalExportWrapper} ref={globalDropdownRef}>
                    <button
                        className={`${styles.exportBtn} ${styles.exportBtnPrimary}`}
                        onClick={() => setGlobalDropdownOpen(!globalDropdownOpen)}
                        disabled={selectedUsers.size === 0}
                    >
                        <Download size={16} />
                        Export Selected ({selectedUsers.size})
                        <ChevronDown size={14} />
                    </button>
                    {globalDropdownOpen && (
                        <div className={styles.dropdown}>
                            <button className={styles.dropdownItem} onClick={() => handleGlobalExport('csv')}>
                                Export as CSV
                            </button>
                            <button className={styles.dropdownItem} onClick={() => handleGlobalExport('pdf')}>
                                Export as PDF
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className={styles.statsRow}>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.statIconTotal}`}><ClipboardList size={18} /></div>
                        <div className={styles.statValue}>{stats.totalResponses}</div>
                        <div className={styles.statLabel}>Total Responses</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.statIconPre}`}><FileCheck size={18} /></div>
                        <div className={styles.statValue}>{stats.preTestCount}</div>
                        <div className={styles.statLabel}>Pre-Tests</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.statIconPost}`}><FileCheck size={18} /></div>
                        <div className={styles.statValue}>{stats.postTestCount}</div>
                        <div className={styles.statLabel}>Post-Tests</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.statIconUsers}`}><Users size={18} /></div>
                        <div className={styles.statValue}>{stats.uniqueUsers}</div>
                        <div className={styles.statLabel}>Unique Users</div>
                    </div>
                </div>
            )}

            {/* Toolbar */}
            <div className={styles.toolbar}>
                <div className={styles.searchBox}>
                    <Search size={16} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
                <div className={styles.filterBox}>
                    <Filter size={14} />
                    <select
                        value={deptFilter}
                        onChange={(e) => setDeptFilter(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="">All Departments</option>
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div className={styles.resultCount}>
                    {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
                </div>
            </div>

            {/* User Table */}
            {filteredUsers.length === 0 ? (
                <div className={styles.emptyState}>
                    <ClipboardList size={48} />
                    <h2>No Assessment Responses Yet</h2>
                    <p>Assessment responses will appear here once learners complete their pre or post tests.</p>
                </div>
            ) : (
                <div className={styles.tableCard}>
                    <div className={styles.tableScroll}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.checkboxCol}>
                                        <button
                                            className={`${styles.checkbox} ${allSelected ? styles.checkboxChecked : ''}`}
                                            onClick={toggleSelectAll}
                                            aria-label="Select all"
                                        >
                                            {allSelected && <Check size={12} />}
                                        </button>
                                    </th>
                                    <th>User</th>
                                    <th>Department</th>
                                    <th>Pre-Test</th>
                                    <th>Post-Test</th>
                                    <th>Export</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(user => {
                                    const isSelected = selectedUsers.has(user.userId)
                                    const isDropdownOpen = openDropdownId === user.userId
                                    return (
                                        <tr key={user.userId} className={isSelected ? styles.rowSelected : ''}>
                                            <td className={styles.checkboxCol}>
                                                <button
                                                    className={`${styles.checkbox} ${isSelected ? styles.checkboxChecked : ''}`}
                                                    onClick={() => toggleUserSelection(user.userId)}
                                                    aria-label={`Select ${user.name}`}
                                                >
                                                    {isSelected && <Check size={12} />}
                                                </button>
                                            </td>
                                            <td>
                                                <div className={styles.userCell}>
                                                    <div className={styles.userAvatar}>
                                                        <User size={14} />
                                                    </div>
                                                    <div>
                                                        <div className={styles.userName}>{user.name}</div>
                                                        <div className={styles.userEmail}>{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={styles.deptBadge}>{user.department}</span>
                                            </td>
                                            <td>
                                                {user.preTest ? (
                                                    <span className={`${styles.statusBadge} ${styles.statusComplete}`}>
                                                        Completed
                                                    </span>
                                                ) : (
                                                    <span className={`${styles.statusBadge} ${styles.statusPending}`}>
                                                        Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                {user.postTest ? (
                                                    <span className={`${styles.statusBadge} ${styles.statusComplete}`}>
                                                        Completed
                                                    </span>
                                                ) : (
                                                    <span className={`${styles.statusBadge} ${styles.statusPending}`}>
                                                        Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <div className={styles.exportCellWrapper} ref={isDropdownOpen ? dropdownRef : undefined}>
                                                    <button
                                                        className={styles.exportBtn}
                                                        onClick={() => setOpenDropdownId(isDropdownOpen ? null : user.userId)}
                                                        disabled={!user.preTest && !user.postTest}
                                                    >
                                                        <Download size={14} />
                                                        Export
                                                        <ChevronDown size={12} />
                                                    </button>
                                                    {isDropdownOpen && (
                                                        <div className={styles.dropdown}>
                                                            {user.preTest && (
                                                                <>
                                                                    <div className={styles.dropdownHeader}>Pre-Test</div>
                                                                    <button className={styles.dropdownItem} onClick={() => handlePerUserExport(user, 'pre', 'csv')}>
                                                                        Download CSV
                                                                    </button>
                                                                    <button className={styles.dropdownItem} onClick={() => handlePerUserExport(user, 'pre', 'pdf')}>
                                                                        Download PDF
                                                                    </button>
                                                                </>
                                                            )}
                                                            {user.postTest && (
                                                                <>
                                                                    <div className={styles.dropdownHeader}>Post-Test</div>
                                                                    <button className={styles.dropdownItem} onClick={() => handlePerUserExport(user, 'post', 'csv')}>
                                                                        Download CSV
                                                                    </button>
                                                                    <button className={styles.dropdownItem} onClick={() => handlePerUserExport(user, 'post', 'pdf')}>
                                                                        Download PDF
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
