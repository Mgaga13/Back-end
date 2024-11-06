export enum UserRole {
  ADMIN = 'Admin',
  USER = 'User',
}
export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'CLIENT',
  MODERATOR = 'MODERATOR',
}
export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum Status {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export enum FeaturedType {
  FOLLOW = 'follow',
  LIKE = 'like',
}

export const HEADER = {
  X_CLIENT_ID: 'x-client-id',
  C_CLIENT_ID: 'c-client-id',
};

export const listCommentBot = [];

export const expireTokenTimeLocal = 1000 * 60 * 5; // 5 minutes
export const expireTokenTimeProduct = 1000 * 60 * 60 * 12; // 12 hours
