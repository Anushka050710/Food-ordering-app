import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../common/enums';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(userId: string, restaurantId: string, items: { menuItemId: string; quantity: number }[], user: any) {
    // Country-scoped: restaurant must be in user's country
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { id: restaurantId, country: user.country },
    });
    if (!restaurant) throw new ForbiddenException('Restaurant not available in your country');

    // Validate menu items belong to this restaurant
    const menuItemIds = items.map((i) => i.menuItemId);
    const menuItems = await this.prisma.menuItem.findMany({
      where: { id: { in: menuItemIds }, restaurantId },
    });
    if (menuItems.length !== items.length) throw new BadRequestException('Invalid menu items');

    const orderItems = items.map((item) => {
      const mi = menuItems.find((m) => m.id === item.menuItemId)!;
      return { menuItemId: item.menuItemId, quantity: item.quantity, price: mi.price * item.quantity };
    });
    const totalAmount = orderItems.reduce((sum, i) => sum + i.price, 0);

    return this.prisma.order.create({
      data: {
        userId,
        restaurantId,
        country: user.country,
        totalAmount,
        items: { create: orderItems },
      },
      include: { items: { include: { menuItem: true } }, restaurant: true, user: true },
    });
  }

  async checkout(orderId: string, paymentMethodId: string, user: any) {
    if (user.role === Role.MEMBER) throw new ForbiddenException('Members cannot checkout');
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, country: user.country },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== 'PENDING') throw new BadRequestException('Order is not pending');

    // Verify payment method belongs to user (Admin can use any in country)
    const pm = await this.prisma.paymentMethod.findFirst({
      where: { id: paymentMethodId, userId: user.role === Role.ADMIN ? undefined : user.id },
    });
    if (!pm) throw new ForbiddenException('Payment method not found');

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CONFIRMED', paymentMethodId },
      include: { items: { include: { menuItem: true } }, restaurant: true, user: true },
    });
  }

  async cancelOrder(orderId: string, user: any) {
    if (user.role === Role.MEMBER) throw new ForbiddenException('Members cannot cancel orders');
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, country: user.country },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status === 'CANCELLED') throw new BadRequestException('Already cancelled');

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
      include: { items: { include: { menuItem: true } }, restaurant: true, user: true },
    });
  }

  async getOrders(user: any) {
    const where: any = { country: user.country };
    // Members and managers only see their own orders; admins see all in country
    if (user.role !== Role.ADMIN) where.userId = user.id;
    return this.prisma.order.findMany({
      where,
      include: { items: { include: { menuItem: true } }, restaurant: true, user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOrder(orderId: string, user: any) {
    const where: any = { id: orderId, country: user.country };
    if (user.role !== Role.ADMIN) where.userId = user.id;
    const order = await this.prisma.order.findFirst({
      where,
      include: { items: { include: { menuItem: true } }, restaurant: true, user: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}
