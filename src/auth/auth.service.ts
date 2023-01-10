import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

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

      delete user.password;

      //^ return the saved user
      return user;
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

    delete user.password;

    //^ send back the user
    return user;
  }
}
