import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Role, Country } from '../common/enums';

@ObjectType()
export class UserType {
  @Field(() => ID) id: string;
  @Field() email: string;
  @Field() name: string;
  @Field(() => Role) role: Role;
  @Field(() => Country) country: Country;
  @Field() createdAt: Date;
}
