import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { AuthService } from '@/modules/auth/auth.service';
import { AuthUserEntity } from '@/modules/auth/entities/auth-user.entity';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly authService: AuthService) {
    super();
  }

  serializeUser(
    user: AuthUserEntity,
    done: (err: Error | null, id?: string) => void,
  ): void {
    done(null, user.id);
  }

  async deserializeUser(
    id: string,
    done: (err: Error | null, user?: AuthUserEntity | null) => void,
  ): Promise<void> {
    try {
      const user = await this.authService.findById(id);
      done(null, user);
    } catch (err) {
      done(err as Error);
    }
  }
}
