import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    let profile = await this.prisma.customerProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { email: true, phoneNumber: true, createdAt: true } },
        addresses: true,
      },
    });

    if (!profile) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      profile = await this.prisma.customerProfile.create({
        data: {
          userId,
          firstName: user?.email.split('@')[0] || 'Devotee',
          lastName: '',
        },
        include: {
          user: { select: { email: true, phoneNumber: true, createdAt: true } },
          addresses: true,
        },
      });
    }

    return profile;
  }

  async updateProfile(userId: string, data: { firstName?: string; lastName?: string; city?: string; state?: string }) {
    const profile = await this.getProfile(userId);
    return this.prisma.customerProfile.update({
      where: { id: profile.id },
      data: {
        firstName: data.firstName?.trim() || profile.firstName,
        lastName: data.lastName?.trim() || profile.lastName,
        city: data.city?.trim() || profile.city,
        state: data.state?.trim() || profile.state,
      },
    });
  }

  async getAddresses(userId: string) {
    const profile = await this.getProfile(userId);
    return this.prisma.address.findMany({
      where: { customerProfileId: profile.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addAddress(userId: string, data: {
    fullName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2?: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    isDefault?: boolean;
  }) {
    const profile = await this.getProfile(userId);

    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { customerProfileId: profile.id },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.create({
      data: {
        customerProfileId: profile.id,
        fullName: data.fullName.trim(),
        phoneNumber: data.phoneNumber.trim(),
        addressLine1: data.addressLine1.trim(),
        addressLine2: data.addressLine2?.trim() || null,
        landmark: data.landmark?.trim() || null,
        city: data.city.trim(),
        state: data.state.trim(),
        pincode: data.pincode.trim(),
        isDefault: Boolean(data.isDefault),
      },
    });
  }

  async deleteAddress(userId: string, addressId: string) {
    const profile = await this.getProfile(userId);
    const address = await this.prisma.address.findUnique({ where: { id: addressId } });
    if (!address || address.customerProfileId !== profile.id) {
      throw new NotFoundException('Address not found.');
    }

    await this.prisma.address.delete({ where: { id: addressId } });
    return { success: true, message: 'Address deleted.' };
  }
}
