import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CustomersModule } from './customers/customers.module';
import { PanditsModule } from './pandits/pandits.module';
import { CategoriesModule } from './categories/categories.module';
import { PujasModule } from './pujas/pujas.module';
import { AvailabilityModule } from './availability/availability.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { ReviewsModule } from './reviews/reviews.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SupportModule } from './support/support.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    CustomersModule,
    PanditsModule,
    CategoriesModule,
    PujasModule,
    AvailabilityModule,
    BookingsModule,
    PaymentsModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    ReviewsModule,
    NotificationsModule,
    SupportModule,
    AdminModule,
  ],
})
export class AppModule {}
