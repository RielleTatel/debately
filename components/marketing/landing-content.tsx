import Link from 'next/link'
import {
  ArrowUpRight,
  Check,
  FileSpreadsheet,
  Github,
  History,
  MessagesSquare,
  ReceiptText,
  UsersRound,
} from 'lucide-react'
import { Logo } from './logo'
import { ImportPreview, OrganizerPreview, InstitutionPreview } from './landing-previews'
import { GITHUB_REPOSITORY_URL } from './urls'
import styles from './landing.module.css'

const capabilities = [
  {
    icon: FileSpreadsheet,
    title: 'Registration, in order',
    description: 'Import your files and review the details before they go live.',
  },
  {
    icon: UsersRound,
    title: 'Schools, in the loop',
    description: 'A private portal for every institution to manage its roster.',
  },
  {
    icon: ReceiptText,
    title: 'Payments, accounted for',
    description: 'Review receipts and see which balances need a follow-up.',
  },
  {
    icon: History,
    title: 'Decisions, on record',
    description: 'Keep requests, approvals and their history in one place.',
  },
]

const importSteps = [
  {
    title: 'Match your columns',
    description: 'Tell Debately which column holds the school, team or speaker.',
  },
  {
    title: 'Review the details',
    description: 'Check the incoming rows before adding them to your tournament.',
  },
  {
    title: 'Keep the mapping',
    description: 'Use it again when the next registration file comes in.',
  },
]

const portalTasks = [
  'Check team and speaker details',
  'Upload payment receipts',
  'Request roster or eligibility changes',
  'Read the latest announcements',
]

export function LandingContent() {
  return (
    <div className={styles.content}>
      <FeatureOverview />
      <ImportSection />
      <InstitutionSection />
      <TabbycatSection />
      <RepositorySection />
      <FinalCTA />
    </div>
  )
}

function FeatureOverview() {
  return (
    <section id="features" className={`${styles.section} ${styles.overview}`}>
      <div className={styles.shell}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.heading}>A little less chasing.<br />A lot more clarity.</h2>
          <p className={styles.description}>
            See who&apos;s registered, what&apos;s been paid and what needs a
            decision. Give the whole organizing team the same picture.
          </p>
        </div>

        <figure className={styles.workspaceFigure}>
          <div className={styles.workspaceBackdrop}>
            <OrganizerPreview />
          </div>
          <figcaption className={styles.caption}>
            One shared workspace, from the first registration to the final receipt.
            <span>Example tournament</span>
          </figcaption>
        </figure>

        <div className={styles.capabilities}>
          {capabilities.map(({ icon: Icon, title, description }) => (
            <div key={title} className={styles.capability}>
              <Icon size={20} strokeWidth={1.65} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ImportSection() {
  return (
    <section className={`${styles.section} ${styles.importSection}`}>
      <div className={`${styles.shell} ${styles.split} ${styles.importSplit}`}>
        <figure className={styles.importFigure}>
          <ImportPreview />
          <figcaption className={styles.demoCaption}>
            Try matching the columns in this example file.
          </figcaption>
        </figure>

        <div className={styles.sectionCopy}>
          <h2 className={styles.heading}>Your spreadsheet.<br />A proper starting point.</h2>
          <p className={styles.description}>
            Registration rarely arrives perfectly formatted. Work with the CSV
            you already have, and turn it into a roster you can rely on.
          </p>
          <ol className={styles.steps}>
            {importSteps.map((step, index) => (
              <li key={step.title}>
                <span className={styles.stepNumber} aria-hidden="true">{index + 1}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

function InstitutionSection() {
  return (
    <section className={`${styles.section} ${styles.institutionSection}`}>
      <div className={`${styles.shell} ${styles.split} ${styles.portalSplit}`}>
        <div className={styles.sectionCopy}>
          <h2 className={styles.heading}>Let each school<br />handle its details.</h2>
          <p className={styles.description}>
            Give every institution its own private portal. Representatives can
            keep their delegation up to date, and your team can keep the
            tournament moving.
          </p>
          <ul className={styles.taskList}>
            {portalTasks.map((task) => (
              <li key={task}>
                <Check size={17} strokeWidth={2} aria-hidden="true" />
                {task}
              </li>
            ))}
          </ul>
          <div className={styles.portalNote}>
            <MessagesSquare size={19} strokeWidth={1.65} aria-hidden="true" />
            <p>Less back-and-forth. A clear record of every request.</p>
          </div>
        </div>

        <figure className={styles.portalFigure}>
          <InstitutionPreview />
          <figcaption className={styles.demoCaption}>
            Their delegation. Their details. Your team in control.
          </figcaption>
        </figure>
      </div>
    </section>
  )
}

function TabbycatSection() {
  return (
    <section id="tabbycat" className={`${styles.section} ${styles.tabSection}`}>
      <div className={styles.shell}>
        <div className={styles.tabHeading}>
          <h2 className={styles.heading}>A place beside your tab system.</h2>
          <p className={styles.description}>
            Debately takes care of the organizing work around the rounds.
            Tabbycat, or your preferred tab software, takes care of the debate.
          </p>
        </div>

        <div className={styles.scopeBoard}>
          <div className={styles.scopeColumn}>
            <div className={styles.scopeTitle}>
              <Logo size={36} alt="" />
              <div><h3>Debately</h3><p>The organizing desk</p></div>
            </div>
            <ul className={styles.scopeList}>
              <li><UsersRound aria-hidden="true" /><span>Registration and institution details</span></li>
              <li><ReceiptText aria-hidden="true" /><span>Receipts, balances and requests</span></li>
              <li><History aria-hidden="true" /><span>Announcements and activity records</span></li>
            </ul>
          </div>
          <div className={styles.scopeConnection} aria-hidden="true"><span>+</span></div>
          <div className={styles.scopeColumn}>
            <div className={styles.scopeTitle}>
              <div className={styles.roundsMark} aria-hidden="true">
                <span /><span /><span /><span />
              </div>
              <div><h3>Your tab software</h3><p>The debate floor</p></div>
            </div>
            <ul className={styles.scopeList}>
              <li><Check aria-hidden="true" /><span>Pairings and bracket generation</span></li>
              <li><Check aria-hidden="true" /><span>Ballot entry and speaker scoring</span></li>
              <li><Check aria-hidden="true" /><span>Judge allocation and motion release</span></li>
            </ul>
          </div>
        </div>
        <p className={styles.scopeFootnote}>Two parts of the same tournament. A clear job for each.</p>
      </div>
    </section>
  )
}

function RepositorySection() {
  return (
    <section id="open-source" className={styles.repositorySection}>
      <div className={`${styles.shell} ${styles.repositoryRow}`}>
        <div className={styles.repositoryCopy}>
          <Github size={30} strokeWidth={1.5} aria-hidden="true" />
          <div>
            <h2>Built in the open.</h2>
            <p>Explore the code, follow the project, or help shape what comes next.</p>
          </div>
        </div>
        <Link
          href={GITHUB_REPOSITORY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.repositoryLink}
        >
          Explore the repository <ArrowUpRight size={17} aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}

function FinalCTA() {
  return (
    <section className={styles.ctaSection}>
      <div className={`${styles.shell} ${styles.ctaPanel}`}>
        <div className={styles.ctaCopy}>
          <h2>The next tournament.<br />A clearer way to run it.</h2>
          <p>Get the organizing work in order before round one.</p>
        </div>
        <div className={styles.ctaActions}>
          <Link href="/register" className={styles.ctaButton}>Get started</Link>
          <Link href="/contact" className={styles.ctaContact}>Talk to us</Link>
        </div>
      </div>
    </section>
  )
}
