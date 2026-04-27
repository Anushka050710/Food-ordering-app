import { Resolver, Query, Mutation, Args, ID, InputType, Field, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';
import { OrdersService } from './orders.service';
import { OrderType } from './order.type';

@InputType()
class OrderItemInput {
  @Field(() => ID) menuItemId: string;
  @Field(() => Int) quantity: number;
}

@Resolver(() => OrderType)
export class OrdersResolver {
  constructor(private ordersService: OrdersService) {}

  @Query(() => [OrderType])
  @UseGuards(JwtAuthGuard)
  async orders(@CurrentUser() user: any) {
    return this.ordersService.getOrders(user);
  }

  @Query(() => OrderType)
  @UseGuards(JwtAuthGuard)
  async order(@Args('id', { type: () => ID }) id: string, @CurrentUser() user: any) {
    return this.ordersService.getOrder(id, user);
  }

  @Mutation(() => OrderType)
  @UseGuards(JwtAuthGuard)
  async createOrder(
    @Args('restaurantId', { type: () => ID }) restaurantId: string,
    @Args('items', { type: () => [OrderItemInput] }) items: OrderItemInput[],
    @CurrentUser() user: any,
  ) {
    return this.ordersService.createOrder(user.id, restaurantId, items, user);
  }

  @Mutation(() => OrderType)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async checkout(
    @Args('orderId', { type: () => ID }) orderId: string,
    @Args('paymentMethodId', { type: () => ID }) paymentMethodId: string,
    @CurrentUser() user: any,
  ) {
    return this.ordersService.checkout(orderId, paymentMethodId, user);
  }

  @Mutation(() => OrderType)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  async cancelOrder(
    @Args('orderId', { type: () => ID }) orderId: string,
    @CurrentUser() user: any,
  ) {
    return this.ordersService.cancelOrder(orderId, user);
  }
}
