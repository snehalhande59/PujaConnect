import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: Request) => {
          return req?.cookies?.['devsutra_token'] || req?.cookies?.['token'] || null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'pujaconnect_super_secret_jwt_key_development_2026'),
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid token credentials.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { customerProfile: true, panditProfile: true },
    });

    if (!user || !user.isActive || user.isDeleted) {
      throw new UnauthorizedException('User account is inactive or not found.');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      customerProfile: user.customerProfile,
      panditProfile: user.panditProfile,
    };
  }
}
