import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { OrderStatus, Country } from '../common/enums';
import { UserType } from '../users/user.type';
import { RestaurantType, MenuItemType } from '../restaurants/restaurant.type';

@ObjectType()
export class OrderItemType {
  @Field(() => ID) id: string;
  @Field() orderId: string;
  @Field() menuItemId: string;
  @Field(() => MenuItemType) menuItem: MenuItemType;
  @Field() quantity: number;
  @Field(() => Float) price: number;
}

@ObjectType()
export class OrderType {
  @Field(() => ID) id: string;
  @Field() userId: string;
  @Field(() => UserType) user: UserType;
  @Field() restaurantId: string;
  @Field(() => RestaurantType) restaurant: RestaurantType;
  @Field(() => [OrderItemType]) items: OrderItemType[];
  @Field(() => OrderStatus) status: OrderStatus;
  @Field(() => Float) totalAmount: number;
  @Field({ nullable: true }) paymentMethodId?: string;
  @Field(() => Country) country: Country;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
}
