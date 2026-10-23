// keep in sync with the username validator in backend/user/schemas/auth.py
export const USERNAME_HINT = '3 to 20 characters: letters, numbers and _'
export const validUsername = (u: string) => /^[A-Za-z0-9_]{3,20}$/.test(u)
