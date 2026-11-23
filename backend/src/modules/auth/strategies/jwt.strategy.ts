import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PerfilUsuario } from '@prisma/client';
import { AuthUser } from '../../../common/types/auth-user';

export interface JwtPayload {
    sub: string;
    email: string;
    perfil: PerfilUsuario;
    voluntarioId: string | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET'),
        });
    }

    async validate(payload: JwtPayload): Promise<AuthUser> {
        return {
            id: payload.sub,
            email: payload.email,
            perfil: payload.perfil,
            voluntarioId: payload.voluntarioId ?? null,
        };
    }
}