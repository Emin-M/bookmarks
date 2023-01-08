import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  //! signup function
  async signup(dto: AuthDto) {
    // generate the password hash
    const hashedPassword = await argon.hash(dto.password);

    // save the new user in db
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastname: dto.lastName,
      },
    });

    // return the saved user
    return user;
  }

  signin() {
    return {
      status: 200,
      message: 'SignIn',
    };
  }
}
