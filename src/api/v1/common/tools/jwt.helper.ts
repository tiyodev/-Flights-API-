import jwt from 'jsonwebtoken';
import { User } from '../../user/user.entity';
import { SeedUsers } from '../../user/user.seed';
import HttpError from '../error/http_error';
import { HttpStatus } from '../error/http_code';
import { ErrorCode } from '../error/error_code';
import Logger from '../../logger/logger';

export function myGenerateJwt(user: User): string {
  return jwt.sign({ username: user.username, role: user.role, password: user.password }, process.env.JWT_SECRET, {
    expiresIn: Number(process.env.JWT_EXPIRY_SECONDS) || 300,
  });
}

export function myVerifyJwt(token: string): User {
  Logger.logDebug(`Verify token: ${token}`);

  let tokenData: any;
  try {
    tokenData = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    Logger.logError(err);
    throw err;
  }

  Logger.logDebug(`Token data: ${JSON.stringify(tokenData)}`);

  // Find user
  const user: User = SeedUsers.find(x => x.password === tokenData.password && x.username === tokenData.username);
  if (!user) {
    throw new HttpError(HttpStatus.UNAUTHORIZED, ErrorCode.BAD_CREDENTIALS, 'Invalid JWT or token has expired', {});
  }

  return user;
}
