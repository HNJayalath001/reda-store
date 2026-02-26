export const ROLES = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  CASHIER: "CASHIER",
} as const;

export type Role = keyof typeof ROLES;

export function canManageAdmins(role: string): boolean {
  return role === ROLES.OWNER;
}

export function canDeleteProducts(role: string): boolean {
  return role === ROLES.OWNER || role === ROLES.ADMIN;
}

export function canViewReports(role: string): boolean {
  return role === ROLES.OWNER || role === ROLES.ADMIN;
}
