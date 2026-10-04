'use client'

import { useRef, useState, type KeyboardEvent } from 'react'
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  FileSpreadsheet,
  FileText,
  Layers3,
  Megaphone,
  MessageSquare,
  ReceiptText,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import styles from './landing.module.css'

type StatusTone = 'green' | 'blue' | 'amber' | 'slate'
type TableCell = string | { label: string; tone: StatusTone }
type WorkspaceView = {
  id: string
  label: string
  icon: LucideIcon
  stats: { label: string; value: string; detail: string }[]
  columns: string[]
  rows: TableCell[][]
  note: string
}

const workspaceViews: WorkspaceView[] = [
  {
    id: 'institutions',
    label: 'Institutions',
    icon: Building2,
    stats: [
      { label: 'Institutions', value: '24', detail: 'in the tournament' },
      { label: 'Teams', value: '86', detail: 'registered so far' },
      { label: 'Rosters ready', value: '21', detail: '3 need a follow-up' },
    ],
    columns: ['Institution', 'Teams', 'Roster', 'Payment'],
    rows: [
      ['Northbridge University', '4', { label: 'Complete', tone: 'green' }, { label: 'Settled', tone: 'green' }],
      ['Riverside College', '3', { label: 'Complete', tone: 'green' }, { label: 'Receipt uploaded', tone: 'blue' }],
      ['Eastwood University', '5', { label: 'Needs review', tone: 'amber' }, { label: 'Settled', tone: 'green' }],
      ["St. Anne’s College", '2', { label: 'Complete', tone: 'green' }, { label: 'Awaiting payment', tone: 'slate' }],
    ],
    note: 'Showing 4 of 24 institutions',
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: ReceiptText,
    stats: [
      { label: 'Collected', value: '₱84,000', detail: 'payments confirmed' },
      { label: 'Outstanding', value: '₱12,000', detail: 'across 6 institutions' },
      { label: 'Receipts to review', value: '3', detail: 'awaiting your team' },
    ],
    columns: ['Institution', 'Invoice', 'Balance', 'Status'],
    rows: [
      ['Northbridge University', '₱8,000', '₱0', { label: 'Settled', tone: 'green' }],
      ['Riverside College', '₱6,000', '₱6,000', { label: 'Receipt uploaded', tone: 'blue' }],
      ['Eastwood University', '₱10,000', '₱0', { label: 'Settled', tone: 'green' }],
      ["St. Anne’s College", '₱4,000', '₱2,000', { label: 'Partially paid', tone: 'amber' }],
    ],
    note: 'Balances update when a payment is approved',
  },
  {
    id: 'requests',
    label: 'Requests',
    icon: MessageSquare,
    stats: [
      { label: 'Awaiting review', value: '4', detail: 'from institutions' },
      { label: 'Approved', value: '18', detail: 'with a decision on record' },
      { label: 'Institutions', value: '3', detail: 'waiting for a reply' },
    ],
    columns: ['Institution', 'Request', 'Status', 'Received'],
    rows: [
      ['Northbridge University', 'Speaker replacement', { label: 'Pending', tone: 'amber' }, '12 minutes ago'],
      ['Riverside College', 'Eligibility check', { label: 'Pending', tone: 'amber' }, '35 minutes ago'],
      ['Eastwood University', 'Team name change', { label: 'Approved', tone: 'green' }, '1 hour ago'],
      ["St. Anne’s College", 'Speaker replacement', { label: 'Approved', tone: 'green' }, '2 hours ago'],
    ],
    note: 'Every request keeps its decision history',
  },
]

function Status({ children, tone = 'green' }: { children: React.ReactNode; tone?: StatusTone }) {
  return <span className={`${styles.status} ${styles[`status_${tone}`]}`}>{children}</span>
}

export function OrganizerPreview() {
  const [activeTab, setActiveTab] = useState(0)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  function changeTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextTab = index
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextTab = (index + 1) % workspaceViews.length
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextTab = (index - 1 + workspaceViews.length) % workspaceViews.length
    else if (event.key === 'Home') nextTab = 0
    else if (event.key === 'End') nextTab = workspaceViews.length - 1
    else return
    event.preventDefault()
    setActiveTab(nextTab)
    tabRefs.current[nextTab]?.focus()
  }

  return (
    <div className={styles.workspace}>
      <div className={styles.workspaceTopbar}>
        <div className={styles.tournamentIdentity}>
          <span className={styles.tournamentMark} aria-hidden="true">C</span>
          <div><p>Campus Invitational</p><span>Tournament workspace</span></div>
        </div>
        <span className={styles.registrationStatus}><span aria-hidden="true" />Registration open</span>
      </div>
      <div className={styles.workspaceBody}>
        <div className={styles.workspaceSidebar}>
          <div className={styles.workspaceTabs} role="tablist" aria-label="Example tournament sections">
            {workspaceViews.map((view, index) => (
              <button
                key={view.id}
                ref={(element) => { tabRefs.current[index] = element }}
                type="button"
                role="tab"
                id={`workspace-tab-${view.id}`}
                aria-controls={`workspace-panel-${view.id}`}
                aria-selected={activeTab === index}
                tabIndex={activeTab === index ? 0 : -1}
                className={styles.workspaceTab}
                onClick={() => setActiveTab(index)}
                onKeyDown={(event) => changeTab(event, index)}
              >
                <view.icon size={17} strokeWidth={1.7} aria-hidden="true" />
                {view.label}
                {view.id === 'requests' && <span className={styles.requestCount}>4</span>}
              </button>
            ))}
          </div>
          <div className={styles.sidebarNote}>
            <ShieldCheck size={18} strokeWidth={1.65} aria-hidden="true" />
            <p>A shared view for<br />your organizing team.</p>
          </div>
        </div>

        {workspaceViews.map((view, index) => (
          <div
            key={view.id}
            className={styles.workspacePanel}
            role="tabpanel"
            id={`workspace-panel-${view.id}`}
            aria-labelledby={`workspace-tab-${view.id}`}
            hidden={activeTab !== index}
          >
            <dl className={styles.workspaceStats}>
              {view.stats.map((stat) => (
                <div key={stat.label}>
                  <dt>{stat.label}</dt>
                  <dd>{stat.value}</dd>
                  <p>{stat.detail}</p>
                </div>
              ))}
            </dl>
            <div className={styles.tableTitle}><h3>{view.label}</h3><span>Campus Invitational</span></div>
            <div className={styles.tableScroll} tabIndex={0} role="region" aria-label={`${view.label} example table`}>
              <table className={styles.workspaceTable}>
                <thead><tr>{view.columns.map((column) => <th key={column} scope="col">{column}</th>)}</tr></thead>
                <tbody>
                  {view.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => {
                        const content = typeof cell === 'string' ? cell : <Status tone={cell.tone}>{cell.label}</Status>
                        return cellIndex === 0
                          ? <th key={cellIndex} scope="row">{content}</th>
                          : <td key={cellIndex}>{content}</td>
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={styles.tableNote}>{view.note}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const importColumns = [
  { header: 'school_name', sample: 'Northbridge University', initial: 'institution' },
  { header: 'team', sample: 'Northbridge A', initial: 'team' },
  { header: 'debater', sample: 'Alex Santos', initial: '' },
]
const tournamentFields = [
  { value: 'institution', label: 'Institution' },
  { value: 'team', label: 'Team name' },
  { value: 'speaker', label: 'Speaker name' },
]

export function ImportPreview() {
  const [mapping, setMapping] = useState(importColumns.map((column) => column.initial))
  const matchedCount = mapping.filter(Boolean).length
  const isComplete = matchedCount === importColumns.length

  return (
    <div className={styles.importDemo}>
      <div className={styles.importFile}>
        <div className={styles.fileIcon}><FileSpreadsheet size={25} strokeWidth={1.6} aria-hidden="true" /></div>
        <div><p>registration.csv</p><span>Match columns to your tournament</span></div>
        <span className={styles.fileExtension}>CSV</span>
      </div>
      <div className={styles.mappingSheet}>
        <div className={styles.mappingHeader}><span>In your file</span><span>In Debately</span></div>
        {importColumns.map((column, index) => (
          <div className={styles.mappingRow} key={column.header}>
            <div><p>{column.header}</p><span>{column.sample}</span></div>
            <ArrowRight size={16} strokeWidth={1.6} aria-hidden="true" />
            <div className={styles.mappingSelect}>
              <select
                aria-label={`Tournament field for ${column.header}`}
                value={mapping[index]}
                onChange={(event) => setMapping((current) => current.map((value, fieldIndex) => fieldIndex === index ? event.target.value : value))}
              >
                <option value="">Choose a field</option>
                {tournamentFields.map((field) => (
                  <option key={field.value} value={field.value} disabled={mapping.some((value, fieldIndex) => fieldIndex !== index && value === field.value)}>{field.label}</option>
                ))}
              </select>
              <ChevronDown size={14} aria-hidden="true" />
            </div>
          </div>
        ))}
        <div className={`${styles.mappingResult} ${isComplete ? styles.mappingComplete : ''}`} role="status" aria-live="polite">
          {isComplete ? <CheckCircle2 size={17} aria-hidden="true" /> : <CircleDot size={17} aria-hidden="true" />}
          <span>{matchedCount} of 3 columns matched</span>
          {isComplete && <span className={styles.readyLabel}>Ready to review</span>}
        </div>
      </div>
      <div className={styles.mappingReuse}>
        <Layers3 size={19} strokeWidth={1.6} aria-hidden="true" />
        <div><p>One mapping. Every registration phase.</p><span>Save templates in Debately for the next file.</span></div>
      </div>
    </div>
  )
}

export function InstitutionPreview() {
  return (
    <div className={styles.institutionDemo}>
      <div className={styles.portalTopbar}><ShieldCheck size={15} aria-hidden="true" /><span>Institution portal</span><span>Campus Invitational</span></div>
      <div className={styles.portalMain}>
        <div className={styles.schoolIdentity}>
          <div className={styles.schoolMark} aria-hidden="true">N</div>
          <div><h3>Northbridge University</h3><p>Your delegation, all together.</p></div>
          <CheckCircle2 className={styles.schoolVerified} size={21} aria-label="Portal claimed" />
        </div>
        <dl className={styles.delegationStats}>
          <div><dt>Teams</dt><dd>4</dd></div>
          <div><dt>Speakers</dt><dd>12</dd></div>
          <div><dt>Adjudicators</dt><dd>2</dd></div>
        </dl>
        <div className={styles.portalRoster}>
          <div className={styles.portalRosterHeading}><h4>Team roster</h4><Status>Up to date</Status></div>
          <ul>
            <li><span className={styles.teamMark}>A</span><div><p>Northbridge A</p><span>Alex Santos, Jamie Cruz, Sam Lee</span></div><Check size={16} aria-label="Complete" /></li>
            <li><span className={styles.teamMark}>B</span><div><p>Northbridge B</p><span>Casey Tan, Morgan Lim, Jordan Reyes</span></div><Check size={16} aria-label="Complete" /></li>
          </ul>
        </div>
        <div className={styles.portalReceipt}>
          <FileText size={21} strokeWidth={1.6} aria-hidden="true" />
          <div><p>Registration payment</p><span>Receipt uploaded for review</span></div>
          <span>₱8,000</span>
        </div>
      </div>
      <div className={styles.portalAnnouncement}><Megaphone size={17} strokeWidth={1.6} aria-hidden="true" /><p>Team check-in opens at 8:00 am on Saturday.</p></div>
    </div>
  )
}
