import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';
import { PaymentsService } from './payments.service';
import { PaymentMethodType } from './payment.type';

@Resolver(() => PaymentMethodType)
export class PaymentsResolver {
  constructor(private paymentsService: PaymentsService) {}

  @Query(() => [PaymentMethodType])
  @UseGuards(JwtAuthGuard)
  async paymentMethods(@CurrentUser() user: any) {
    return this.paymentsService.getMyPaymentMethods(user.id);
  }

  @Mutation(() => PaymentMethodType)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async addPaymentMethod(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('type') type: string,
    @Args('last4') last4: string,
    @Args('expiryDate') expiryDate: string,
    @Args('isDefault', { defaultValue: false }) isDefault: boolean,
    @CurrentUser() user: any,
  ) {
    return this.paymentsService.addPaymentMethod(userId, type, last4, expiryDate, isDefault, user);
  }

  @Mutation(() => PaymentMethodType)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updatePaymentMethod(
    @Args('id', { type: () => ID }) id: string,
    @Args('type') type: string,
    @Args('last4') last4: string,
    @Args('expiryDate') expiryDate: string,
    @Args('isDefault', { defaultValue: false }) isDefault: boolean,
    @CurrentUser() user: any,
  ) {
    return this.paymentsService.updatePaymentMethod(id, type, last4, expiryDate, isDefault, user);
  }

  @Mutation(() => PaymentMethodType)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async deletePaymentMethod(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ) {
    return this.paymentsService.deletePaymentMethod(id, user);
  }
}
