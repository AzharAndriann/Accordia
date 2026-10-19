import type { RequestHandler } from 'express';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../shared/errors';
import { verifyAccessToken } from './auth.tokens';

export type SessionStore = {
  session: {
    findFirst(args: {
      where: {
        id: string;
        userId: string;
        revokedAt: null;
        expiresAt: { gt: Date };
      };
      select: { id: true };
    }): Promise<{ id: string } | null>;
  };
};

export function createAuthenticateMiddleware(
  database: SessionStore = prisma,
): RequestHandler {
  return async (request, _response, next) => {
    let identity: { userId: string; sessionId: string };

    try {
      const authorization = request.header('authorization');

      if (!authorization?.startsWith('Bearer ')) {
        throw new AppError(401, 'UNAUTHENTICATED', 'Sesi tidak valid');
      }

      const token = authorization.slice('Bearer '.length).trim();
      if (!token) {
        throw new AppError(401, 'UNAUTHENTICATED', 'Sesi tidak valid');
      }

      identity = verifyAccessToken(token);
    } catch {
      next(new AppError(401, 'UNAUTHENTICATED', 'Sesi tidak valid'));
      return;
    }

    try {
      const session = await database.session.findFirst({
        where: {
          id: identity.sessionId,
          userId: identity.userId,
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
        select: { id: true },
      });

      if (!session) {
        throw new AppError(401, 'UNAUTHENTICATED', 'Sesi tidak valid');
      }

      request.auth = identity;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export const authenticate = createAuthenticateMiddleware();
