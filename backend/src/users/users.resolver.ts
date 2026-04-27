import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums';
import { UserType } from './user.type';
import { PrismaService } from '../prisma/prisma.service';

@Resolver(() => UserType)
export class UsersResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => UserType)
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: any): UserType {
    return user;
  }

  @Query(() => [UserType])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async users(@CurrentUser() currentUser: any) {
    return this.prisma.user.findMany({ where: { country: currentUser.country } });
  }
}
