import { Role } from "@prisma/client";

export type SessionUser = {
  id: string;
  name: string;
  username: string;
  role: Role;
};

export function canManageUsers(role: Role) {
  return role === Role.SUPER_ADMIN;
}

export function canManageCategories(role: Role) {
  return role === Role.SUPER_ADMIN || role === Role.EDITOR;
}

export function canEditAllPosts(role: Role) {
  return role === Role.SUPER_ADMIN || role === Role.EDITOR;
}

/** Editors and Super Admins may publish / approve for the public site. */
export function canPublish(role: Role) {
  return role === Role.SUPER_ADMIN || role === Role.EDITOR;
}

export function canEditPost(
  role: Role,
  authorId: string,
  userId: string,
) {
  if (canEditAllPosts(role)) return true;
  return role === Role.AUTHOR && authorId === userId;
}

/** Authors may only hold draft or pending-review statuses. */
export function authorAllowedStatuses() {
  return ["DRAFT", "PENDING_REVIEW"] as const;
}

/** Only Super Admin manages public clients / trust stats. */
export function canManageClients(role: Role) {
  return role === Role.SUPER_ADMIN;
}
