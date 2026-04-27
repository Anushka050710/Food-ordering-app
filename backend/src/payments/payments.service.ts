import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../common/enums';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async addPaymentMethod(userId: string, type: string, last4: string, expiryDate: string, isDefault: boolean, user: any) {
    if (user.role !== Role.ADMIN) throw new ForbiddenException('Only Admins can manage payment methods');
    if (isDefault) {
      await this.prisma.paymentMethod.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    return this.prisma.paymentMethod.create({ data: { userId, type, last4, expiryDate, isDefault } });
  }

  async updatePaymentMethod(id: string, type: string, last4: string, expiryDate: string, isDefault: boolean, user: any) {
    if (user.role !== Role.ADMIN) throw new ForbiddenException('Only Admins can manage payment methods');
    const pm = await this.prisma.paymentMethod.findUnique({ where: { id } });
    if (!pm) throw new NotFoundException('Payment method not found');
    if (isDefault) {
      await this.prisma.paymentMethod.updateMany({ where: { userId: pm.userId }, data: { isDefault: false } });
    }
    return this.prisma.paymentMethod.update({ where: { id }, data: { type, last4, expiryDate, isDefault } });
  }

  async deletePaymentMethod(id: string, user: any) {
    if (user.role !== Role.ADMIN) throw new ForbiddenException('Only Admins can manage payment methods');
    const pm = await this.prisma.paymentMethod.findUnique({ where: { id } });
    if (!pm) throw new NotFoundException('Payment method not found');
    return this.prisma.paymentMethod.delete({ where: { id } });
  }

  async getPaymentMethods(user: any) {
    // Admins see all in their scope; others see their own
    const where = user.role === Role.ADMIN ? {} : { userId: user.id };
    return this.prisma.paymentMethod.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async getMyPaymentMethods(userId: string) {
    return this.prisma.paymentMethod.findMany({ where: { userId }, orderBy: { isDefault: 'desc' } });
  }
}
