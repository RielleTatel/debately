import type { ActivityAction } from '@prisma/client'

export const ACTION_LABELS: Record<ActivityAction, string> = {
  ORG_CREATED: 'Created organization', ORG_UPDATED: 'Updated organization', ORG_DELETED: 'Deleted organization',
  ORG_MEMBER_INVITED: 'Invited member', ORG_MEMBER_INVITE_ACCEPTED: 'Accepted invite', ORG_MEMBER_INVITE_DECLINED: 'Declined invite',
  ORG_MEMBER_REMOVED: 'Removed member', ORG_OWNERSHIP_TRANSFERRED: 'Transferred ownership',
  TOURNAMENT_CREATED: 'Created tournament', TOURNAMENT_UPDATED: 'Updated tournament', TOURNAMENT_ARCHIVED: 'Archived tournament', TOURNAMENT_UNARCHIVED: 'Unarchived tournament',
  TOURNAMENT_DIRECTOR_ADDED: 'Added director', TOURNAMENT_DIRECTOR_REMOVED: 'Removed director',
  CSV_IMPORT_STARTED: 'Started CSV import', CSV_IMPORT_MAPPED: 'Set import mapping', CSV_IMPORT_PROCESSED: 'Processed import',
  CSV_IMPORT_NORMALIZATION_CONFIRMED: 'Confirmed normalization', CSV_IMPORT_DIFF_APPLIED: 'Applied import diff', CSV_IMPORT_FINALIZED: 'Finalized import', CSV_IMPORT_ROLLED_BACK: 'Rolled back import',
  PORTAL_CLAIMED: 'Claimed portal', PORTAL_TOKEN_REGENERATED: 'Regenerated portal token', PORTAL_DISABLED: 'Disabled portal',
  INSTITUTION_UPDATED: 'Updated institution', TEAM_CREATED: 'Created team', TEAM_UPDATED: 'Updated team', TEAM_WITHDRAWN: 'Withdrew team',
  PARTICIPANT_UPDATED: 'Updated participant', ADJUDICATOR_UPDATED: 'Updated adjudicator',
  INVOICE_GENERATED: 'Generated invoice', INVOICE_DISCOUNT_APPLIED: 'Applied discount', INVOICE_OVERRIDE_APPLIED: 'Overrode invoice total',
  INVOICE_OVERRIDE_CLEARED: 'Cleared invoice override', RECEIPT_SUBMITTED: 'Submitted receipt', RECEIPT_APPROVED: 'Approved receipt',
  RECEIPT_REJECTED: 'Rejected receipt', REMINDER_SENT: 'Sent payment reminder',
  ANNOUNCEMENT_CREATED: 'Created announcement', ANNOUNCEMENT_UPDATED: 'Updated announcement', ANNOUNCEMENT_PUBLISHED: 'Published announcement',
  ANNOUNCEMENT_SCHEDULED: 'Scheduled announcement', ANNOUNCEMENT_RETRACTED: 'Retracted announcement',
  REQUEST_SUBMITTED: 'Submitted request', REQUEST_MORE_INFO_REQUESTED: 'Requested more info', REQUEST_MORE_INFO_PROVIDED: 'Provided more info',
  REQUEST_APPROVED: 'Approved request', REQUEST_REJECTED: 'Rejected request',
}
