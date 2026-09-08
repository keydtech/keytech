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
