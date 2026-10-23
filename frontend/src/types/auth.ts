export type User = { id: number; email: string; username: string | null; has_avatar?: boolean }
export type Credentials = { email: string; password: string }
export type RegisterData = Credentials & { username: string }
