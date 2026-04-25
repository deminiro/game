import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { AuthUserEntity } from '@/modules/auth/entities/auth-user.entity';

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthUserEntity | undefined => {
    return ctx.switchToHttp().getRequest().user as AuthUserEntity | undefined;
  },
);

export const CurrentUserId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string | undefined => {
    const user = ctx.switchToHttp().getRequest().user as
      | AuthUserEntity
      | undefined;
    return user?.id;
  },
);
