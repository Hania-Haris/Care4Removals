// Kept separate from session.ts (which imports firebase-admin + "server-only")
// so the Edge middleware can import just this without pulling Node-only code.
export const SESSION_COOKIE = "__session";
