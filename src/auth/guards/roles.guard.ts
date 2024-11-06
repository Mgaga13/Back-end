import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ROLES } from '../decorators/roler.decorator';
import RequestWithUser from '../interfaces/requestWithAccount.interface';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly refector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles: string[] = this.refector.getAllAndOverride(ROLES, [
      context.getHandler(),
      context.getClass(),
    ]);
    const request: RequestWithUser = context.switchToHttp().getRequest();
    // console.log(request.user.role);\]-
    return roles.includes(request.user.role as unknown as string);
  }
}
