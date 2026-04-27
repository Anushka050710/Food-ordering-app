import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class PaymentMethodType {
  @Field(() => ID) id: string;
  @Field() userId: string;
  @Field() type: string;
  @Field() last4: string;
  @Field() expiryDate: string;
  @Field() isDefault: boolean;
  @Field() createdAt: Date;
}
