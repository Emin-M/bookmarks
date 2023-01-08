import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService) {}

  signup() {
    return {
      status: 200,
      message: 'SignUp',
    };
  }

  signin() {
    return {
      status: 200,
      message: 'SignIn',
    };
  }
}
