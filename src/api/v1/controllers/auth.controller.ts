import { Request, Response } from 'express';
import { SeedUsers } from '../user/user.seed';
import { HttpStatus } from '../common/error/http_code';
import HttpError from '../common/error/http_error';
import Logger from '../logger/logger';
import { ErrorCode } from '../common/error/error_code';
import { myGenerateJwt } from '../common/tools/jwt.helper';

/**
 * Sign in user
 * @param {Request} req
 * @param {Response} res
 */
export function signIn(req: Request, res: Response): void {
  try {
    // Get credentials
    const { username, password } = req.body;

    Logger.logDebug(`Login credentiels: username = ${username}, pwd = ${password?.padEnd(1, '*')}`);

    // Find user by username and password
    const findedUser = SeedUsers.find(x => x.password === password && x.username === username);
    if (!findedUser) {
      throw new HttpError(HttpStatus.UNAUTHORIZED, ErrorCode.BAD_CREDENTIALS, 'Bad login or password', {
        username,
      });
    }

    // Create a new token with the username in the payload and which expires 300 seconds after issue
    const token = myGenerateJwt(findedUser);
    Logger.logDebug(`Generated JWT token: ${token}`);

    res.json({
      status: 'success',
      token,
    });
  } catch (err) {
    Logger.logError(err);
    if (err.status) {
      res.status(err.status).json(err);
    } else {
      res.status(HttpStatus.INTERNAL_ERROR).json({
        status: HttpStatus.INTERNAL_ERROR,
        error: err.toString(),
      });
    }
  }
}
