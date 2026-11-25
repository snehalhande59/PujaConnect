import { Injectable, NotFoundException, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureDefaultProducts();
  }

  async ensureDefaultProducts() {
    try {
      const defaultProducts = [
        {
          name: 'सत्यनारायण महापूजा संपूर्ण किट (ताट) - Satyanarayan Complete Kit',
          slug: 'satyanarayan-mahapuja-complete-kit',
          description: 'नारळ (श्रीफळ), ताजी फुले व दुर्वा, तांब्या-पितळी दिवा, शुद्ध पूजा तेल, वाती, हळद-कुंकू, अक्षता, सुपारी, विड्याची पाने, जानवे, अत्तर, भीमसेनी कापूर, अगरबत्ती, धूप, गंगाजल, पंचामृत घटक, रांगोळी सहित १००% शुद्ध पूजा थाळी.',
          category: 'Kits & Combos',
          price: 1299,
          discountPrice: 1599,
          stockQuantity: 100,
          images: ['https://images.unsplash.com/photo-1609358905581-e5382c45162a?auto=format&fit=crop&w=600&q=80'],
          isActive: true,
        },
        {
          name: 'गृहप्रवेश व वास्तुशांती महापूजा किट - Griha Pravesh & Vastu Kit',
          slug: 'griha-pravesh-vastu-shanti-kit',
          description: 'श्रीफळ नारळ (३), फुले-हार, पितळी समई व दिवा, शुद्ध गायीचे तूप, तीळ तेल, वाती, हळद-कुंकू, रांगोळी, नवग्रह धान्य, नवग्रह समिधा, गुग्गुळ, लोभान, कापूर, धूप, पंचरत्न, लाल कापड, कलश, गंगाजल सहित १००% शुद्ध किट.',
          category: 'Kits & Combos',
          price: 2499,
          discountPrice: 2999,
          stockQuantity: 50,
          images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80'],
          isActive: true,
        },
        {
          name: 'महा रुद्राभिषेक विधी ताट व किट - Rudrabhishek Sacred Thali',
          slug: 'rudrabhishek-sacred-thali-kit',
          description: 'शुद्ध बेलपत्र (१०८), भस्म, चंदन, अत्तर, शुद्ध मध, गंगाजल, गायीचे दूध व तूप घटक, कापूर, दिवा, तीळ तेल, वाती, अक्षता, काळे तीळ, दुर्वा, धूप बत्ती, पंचामृत.',
          category: 'Kits & Combos',
          price: 1499,
          discountPrice: 1799,
          stockQuantity: 75,
          images: ['https://images.unsplash.com/photo-1620802051782-725fa33be063?auto=format&fit=crop&w=600&q=80'],
          isActive: true,
        },
        {
          name: 'श्री गणेश व अथर्वशीर्ष संपूर्ण पूजा थाळी - Shri Ganesh Puja Thali',
          slug: 'shri-ganesh-puja-thali-kit',
          description: 'नारळ, दुर्वा (२१ जुड्या), लाल फुले, अष्टगंध, शेंदूर, हळद-कुंकू, मोदक साहित्य, कापसाची वस्त्रमाळ, अगरबत्ती, कापूर, तांब्याचा दिवा, शुद्ध तेल, विड्याची पाने, सुपारी.',
          category: 'Kits & Combos',
          price: 899,
          discountPrice: 1099,
          stockQuantity: 120,
          images: ['https://images.unsplash.com/photo-1567591414240-e221371e7d23?auto=format&fit=crop&w=600&q=80'],
          isActive: true,
        },
        {
          name: 'दैनिक नित्य पूजा साहित्य कॉम्बो (ताट) - Daily Puja Combo',
          slug: 'daily-nitya-puja-combo-thali',
          description: 'शुद्ध पूजा तेल (५०० मिली), फुलवाती व लांब वाती (१०० नग), भीमसेनी कापूर, सुवासिक अगरबत्ती, हळद-कुंकू-अक्षता डबी, रांगोळी, तांब्याची छोटी वाटी व आचमनी.',
          category: 'Kits & Combos',
          price: 499,
          discountPrice: 649,
          stockQuantity: 200,
          images: ['https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=600&q=80'],
          isActive: true,
        },
        {
          name: 'हवन व यज्ञ संपूर्ण समिधा किट - Sacred Havan & Yagya Kit',
          slug: 'sacred-havan-yagya-samidha-kit',
          description: 'पळस, आंबा, खैर समिधा, दशांग धूप, कापूर, १००% शुद्ध गायीचे तूप, नवग्रह लाकडे, लोभान व हविष्यान्न.',
          category: 'Havan & Yagya',
          price: 999,
          discountPrice: 1299,
          stockQuantity: 60,
          images: ['https://images.unsplash.com/photo-1609358905581-e5382c45162a?auto=format&fit=crop&w=600&q=80'],
          isActive: true,
        },
      ];

      for (const prod of defaultProducts) {
        const existing = await this.prisma.product.findUnique({ where: { slug: prod.slug } });
        if (!existing) {
          await this.prisma.product.create({
            data: prod,
          });
        }
      }
    } catch (e: any) {
      this.logger.warn(`Could not seed default products: ${e?.message}`);
    }
  }

  async findAll(params?: { category?: string; search?: string }) {
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      isDeleted: false,
    };

    if (params?.category && params.category !== 'All' && params.category !== 'All Categories') {
      where.category = { contains: params.category.trim(), mode: 'insensitive' };
    }

    if (params?.search) {
      where.OR = [
        { name: { contains: params.search.trim(), mode: 'insensitive' } },
        { description: { contains: params.search.trim(), mode: 'insensitive' } },
      ];
    }

    let products = await this.prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    if (products.length === 0 && !params?.search) {
      await this.ensureDefaultProducts();
      products = await this.prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
    }

    return products;
  }

  async findByIdOrSlug(idOrSlug: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

    const product = await this.prisma.product.findFirst({
      where: isUuid
        ? { id: idOrSlug, isActive: true, isDeleted: false }
        : { slug: idOrSlug, isActive: true, isDeleted: false },
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    return product;
  }
}
