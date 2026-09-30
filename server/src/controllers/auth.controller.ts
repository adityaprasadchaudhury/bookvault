import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.ts';
import { registerSchema, loginSchema } from '../validators/auth.validator.ts';
import { AuthService } from '../services/auth.service.ts';

export class AuthController {
  static async register(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = registerSchema.parse(req.body);
      const result = await AuthService.register(validated);

      res.status(201).json({
        success: true,
        message: 'Account successfully registered.',
        user: result.user,
        token: result.token,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await AuthService.login(validated);

      res.status(200).json({
        success: true,
        message: 'Successfully logged in.',
        user: result.user,
        token: result.token,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const user = await AuthService.getMe(req.user.id);

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      next(error);
    }
  }
}
