import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { UserType } from '../users/user.type';

@ObjectType()
export class AuthPayload {
  @Field()
  token: string;

  @Field(() => UserType)
  user: UserType;
}

@InputType()
export class RegisterInput {
  @Field() email: string;
  @Field() password: string;
  @Field() name: string;
  @Field() role: string;
  @Field() country: string;
}

@InputType()
export class LoginInput {
  @Field() email: string;
  @Field() password: string;
}
