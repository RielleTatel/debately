import type { Announcement, AnnouncementTarget, AnnouncementRead } from '@prisma/client'
export type { Announcement, AnnouncementTarget, AnnouncementRead }
export type AnnouncementListItem = Pick<Announcement, 'id' | 'title' | 'status' | 'publishedAt' | 'scheduledFor' | 'isPublic' | 'isAllInstitutions' | 'bodyHtml'> & { author: { displayName: string }; targetCount: number; readCount: number }
export type AnnouncementDetail = Announcement & { author: { displayName: string; avatarUrl: string | null }; targets: Array<AnnouncementTarget & { institution: { id: string; name: string } }> }
