import { Injectable } from '@nestjs/common';

@Injectable({})
export class AuthService {
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
