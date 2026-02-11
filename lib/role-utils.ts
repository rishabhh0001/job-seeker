export const ROLES = {
    APPLICANT: "applicant",
    EMPLOYER: "employer",
    ADMIN: "admin",
    SUPERADMIN: "superadmin",
    OWNER: "owner",
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

const ROLE_HIERARCHY: Record<Role, number> = {
    [ROLES.APPLICANT]: 0,
    [ROLES.EMPLOYER]: 1,
    [ROLES.ADMIN]: 2,
    [ROLES.SUPERADMIN]: 3,
    [ROLES.OWNER]: 4,
}

export function getRoleLevel(role: string): number {
    return ROLE_HIERARCHY[role as Role] ?? 0
}

export function hasRolePermission(userRole: string, requiredRole: string): boolean {
    return getRoleLevel(userRole) >= getRoleLevel(requiredRole)
}

export function isEmployerOrAbove(role: string): boolean {
    return hasRolePermission(role, ROLES.EMPLOYER)
}

export function isAdminOrAbove(role: string): boolean {
    return hasRolePermission(role, ROLES.ADMIN)
}
