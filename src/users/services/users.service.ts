import { Injectable } from '@nestjs/common';

import { v4 as uuidv4 } from 'uuid';

import { User } from '../models';

@Injectable()
export class UsersService {
  private readonly users: Record<string, User>;

  constructor() {
    this.users = {}
  }

  findOne(userId: string): User {
    return this.users[ userId ];
  }

  createOne({ name, password }: User): User {
    const id = uuidv4();
    const newUser = { id: name || id, name, password };

    this.users[ id ] = newUser;

    return newUser;
  }

}
