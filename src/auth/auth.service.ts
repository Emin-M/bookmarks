import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt/dist';
import { ConfigService } from '@nestjs/config/dist';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  //! signup function
  async signup(dto: AuthDto) {
    //^ generate the password hash
    const hashedPassword = await argon.hash(dto.password);

    //^ save the new user in db
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          firstName: dto.firstName,
          lastname: dto.lastName,
        },
        // select: {
        //   email: true,
        //   firstName: true,
        //   lastname: true,
        // },
      });

      //^ return access_token
      return this.signToken(user.id, user.email);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }

  //! signin function
  async signin(dto: AuthDto) {
    //^ find the user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    //^ compare password
    const pwMatches = await argon.verify(
      user.password,
      dto.password,
    );

    //^ if user does not exist or password incorrect throw exception
    if (!user || !pwMatches)
      throw new ForbiddenException(
        'Credentials incorrect!',
      );

    //^ return access_token
    return this.signToken(user.id, user.email);
  }

  //! creating jwt access_token
  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };

    const token = await this.jwt.signAsync(payload, {
      expiresIn: this.config.get('JWT_EXPIRESIN'),
      secret: this.config.get('JWT_SECRET'),
    });

    return {
      access_token: token,
    };
  }
}
