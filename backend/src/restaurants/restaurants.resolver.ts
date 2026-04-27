import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { RestaurantType, MenuItemType } from './restaurant.type';

@Resolver(() => RestaurantType)
export class RestaurantsResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => [RestaurantType])
  @UseGuards(JwtAuthGuard)
  async restaurants(@CurrentUser() user: any) {
    return this.prisma.restaurant.findMany({
      where: { country: user.country },
      include: { menuItems: true },
    });
  }

  @Query(() => RestaurantType, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async restaurant(@Args('id', { type: () => ID }) id: string, @CurrentUser() user: any) {
    return this.prisma.restaurant.findFirst({
      where: { id, country: user.country },
      include: { menuItems: true },
    });
  }

  @Query(() => [MenuItemType])
  @UseGuards(JwtAuthGuard)
  async menuItems(@Args('restaurantId', { type: () => ID }) restaurantId: string, @CurrentUser() user: any) {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { id: restaurantId, country: user.country },
    });
    if (!restaurant) return [];
    return this.prisma.menuItem.findMany({ where: { restaurantId } });
  }
}
