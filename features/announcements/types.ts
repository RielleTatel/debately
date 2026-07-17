export type AnnouncementId = string

export type CreateAnnouncementInput = {
  tournamentId: string
  title: string
  body: string
  publishedAt?: Date
}
