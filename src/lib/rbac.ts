import { UserRole } from "@prisma/client";

/**
 * Role hierarchy: FREE < STUDENT < PRO < ENTERPRISE < ADMIN.
 *
 * STUDENT and ADMIN were added to the schema enum but never here, so this map
 * was missing two of the five roles. It only compiled because the generated
 * Prisma client was stale; a real ADMIN user would have produced
 * `roleHierarchy[role] === undefined` and failed every comparison, silently
 * denying admins access to everything.
 */
const roleHierarchy: Record<UserRole, number> = {
  FREE: 0,
  STUDENT: 1,
  PRO: 2,
  ENTERPRISE: 3,
  ADMIN: 4,
};

export function hasAccess(userRole: UserRole, requiredRole: UserRole): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export function canAccessTrack(userRole: UserRole, trackId: number): boolean {
  // Tracks 1-4 are free, 5-10 are PRO, 11-12 are ENTERPRISE
  if (trackId <= 4) return true;
  if (trackId <= 10) return hasAccess(userRole, UserRole.PRO);
  return hasAccess(userRole, UserRole.ENTERPRISE);
}

export function canAccessLab(userRole: UserRole, isPremium: boolean): boolean {
  if (!isPremium) return true;
  return hasAccess(userRole, UserRole.PRO);
}

export function getFeatureAccess(userRole: UserRole) {
  const features = {
    basicTracks: true,
    codeLabs: hasAccess(userRole, UserRole.FREE),
    examPrep: hasAccess(userRole, UserRole.PRO),
    advancedTracks: hasAccess(userRole, UserRole.PRO),
    privateSupport: hasAccess(userRole, UserRole.ENTERPRISE),
    customContent: hasAccess(userRole, UserRole.ENTERPRISE),
    analytics: hasAccess(userRole, UserRole.ENTERPRISE),
  };

  const limits = {
    labAttemptsPerDay: userRole === UserRole.FREE ? 10 : userRole === UserRole.PRO ? 50 : -1,
    examAttemptsPerMonth: userRole === UserRole.FREE ? 2 : userRole === UserRole.PRO ? 10 : -1,
    maxTracksAccess: userRole === UserRole.FREE ? 4 : userRole === UserRole.PRO ? 10 : 12,
  };

  return { features, limits };
}
