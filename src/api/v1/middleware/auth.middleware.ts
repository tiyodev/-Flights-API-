import { User } from '../user/user.entity';
import HttpError from '../common/error/http_error';
import { HttpStatus } from '../common/error/http_code';
import { ErrorCode } from '../common/error/error_code';
import { NextFunction } from 'express';
import Logger from '../logger/logger';
import { myVerifyJwt } from '../common/tools/jwt.helper';

async function authJwt(req: any, res: any, next: NextFunction): Promise<void> {
  try {
    const token: string = req.headers['authorization'] || req.body.authToken || req.query.authToken;

    if (!token) {
      throw new HttpError(HttpStatus.UNAUTHORIZED, ErrorCode.BAD_CREDENTIALS, 'JWT Token is mandatory', {});
    }

    try {
      const user: User = myVerifyJwt(token);
      req.user = user;
      next();
    } catch (err) {
      throw new HttpError(HttpStatus.UNAUTHORIZED, ErrorCode.BAD_CREDENTIALS, 'Invalid JWT', {});
    }
  } catch (err) {
    Logger.logError(err);
    if (err.status) {
      res.status(err.status).json(err);
    } else {
      res.status(HttpStatus.INTERNAL_ERROR).json({
        status: HttpStatus.INTERNAL_ERROR,
        error: err,
      });
    }
  }
}

export default authJwt;
