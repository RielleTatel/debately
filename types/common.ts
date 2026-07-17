export type ID = string

export type Nullable<T> = T | null

export type Optional<T> = T | undefined

export type WithTimestamps = {
  createdAt: Date
  updatedAt: Date
}

export type WithId = {
  id: ID
}

export type BaseEntity = WithId & WithTimestamps

export type Status = 'active' | 'inactive' | 'pending' | 'archived'
