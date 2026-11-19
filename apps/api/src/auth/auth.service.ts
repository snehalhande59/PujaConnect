import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { Role } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { RegisterCustomerDto } from "./dto/register-customer.dto";
import { LoginDto } from "./dto/login.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { RegisterPanditDto } from "./dto/register-pandit.dto";
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register a new Customer / Devotee account in PostgreSQL
   */
  async registerCustomer(dto: RegisterCustomerDto) {
    const email = dto.email.toLowerCase().trim();

    // 1. Prevent duplicate email registration
    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      throw new ConflictException(
        "An account with this email address already exists. Please sign in instead.",
      );
    }

    // 2. Prevent duplicate phone registration if phone is supplied
    const phoneValue = (dto.phoneNumber || dto.phone)?.trim() || null;
    if (phoneValue) {
      const existingPhone = await this.prisma.user.findFirst({
        where: { phoneNumber: phoneValue },
      });
      if (existingPhone) {
        throw new ConflictException(
          "An account with this mobile number already exists.",
        );
      }
    }

    // 3. Securely hash password with bcrypt (10 rounds)
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // 4. Save User & CustomerProfile to PostgreSQL
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        phoneNumber: phoneValue,
        role: Role.CUSTOMER,
        customerProfile: {
          create: {
            firstName: dto.firstName.trim(),
            lastName: dto.lastName.trim(),
          },
        },
      },
      include: {
        customerProfile: true,
      },
    });

    this.logger.log(
      `Created new Devotee/Customer account: ${user.email} (ID: ${user.id})`,
    );

    // 5. Generate secure JWT token
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      message: "Account registered successfully.",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.customerProfile?.firstName || dto.firstName,
        lastName: user.customerProfile?.lastName || dto.lastName,
        phoneNumber: user.phoneNumber,
      },
    };
  }

  /**
   * Customer / Devotee Login with role enforcement
   */
  async loginCustomer(dto: LoginDto) {
    return this.authenticateUser(dto, Role.CUSTOMER);
  }

  /**
   * General login with optional role enforcement
   */ /**
   * Register a new Pandit account
   */
  async registerPandit(dto: RegisterPanditDto) {
    const email = dto.email.toLowerCase().trim();
    const phoneNumber = dto.phoneNumber.trim();

    // Check duplicate email
    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      throw new ConflictException(
        "An account with this email address already exists.",
      );
    }

    // Check duplicate mobile
    const existingPhone = await this.prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (existingPhone) {
      throw new ConflictException(
        "An account with this mobile number already exists.",
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create User and PanditProfile atomically
    const user = await this.prisma.user.create({
      data: {
        email,
        phoneNumber,
        passwordHash,
        role: Role.PANDIT,
        panditProfile: {
          create: {
            fullName: dto.fullName.trim(),
            experienceYears: dto.experienceYears ?? 1,
            languages: dto.languages,
            specializations: dto.specializations,
            city: dto.city.trim(),
            state: dto.state.trim(),
            serviceAreas: dto.serviceAreas,
            bio: dto.bio?.trim() || null,
            basePrice: dto.basePrice ?? null,
            verificationStatus: "PENDING",
          },
        },
      },
      include: {
        panditProfile: true,
      },
    });

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    this.logger.log(`New Pandit registered: ${user.email}`);

    return {
      message:
        "Pandit registration submitted successfully. Awaiting admin verification.",
      token,
      user: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        panditProfile: user.panditProfile,
      },
    };
  }

  /**
   * Pandit Login with role enforcement
   */
  async loginPandit(dto: LoginDto) {
    return this.authenticateUser(dto, Role.PANDIT);
  }

  /**
   * Admin Login with role enforcement
   */
  async loginAdmin(dto: LoginDto) {
    return this.authenticateUser(dto, Role.ADMIN);
  }

  async authenticateUser(dto: LoginDto, requiredRole?: Role) {
    const identifier = dto.email.toLowerCase().trim();

    // 1. Check user exists by email OR mobile phone number
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phoneNumber: identifier },
        ],
      },
      include: {
        customerProfile: true,
        panditProfile: true,
      },
    });

    if (!user || !user.isActive || user.isDeleted) {
      throw new UnauthorizedException("Invalid email/mobile or password.");
    }

    // 2. Role-Based boundary check
    if (requiredRole && user.role !== requiredRole) {
      this.logger.warn(
        `Role mismatch attempt on login: User ${user.email} (${user.role}) attempted ${requiredRole} login.`,
      );
      if (requiredRole === Role.CUSTOMER) {
        throw new UnauthorizedException(
          `This login portal is only for Devotees. ${user.role === Role.PANDIT ? "Please sign in via the Pandit Portal." : "Please sign in via the Admin Console."}`,
        );
      } else if (requiredRole === Role.PANDIT) {
        throw new UnauthorizedException(
          `This login portal is only for Vedic Pandits. ${user.role === Role.CUSTOMER ? "Please sign in via Devotee Login." : "Please sign in via the Admin Console."}`,
        );
      } else if (requiredRole === Role.ADMIN) {
        throw new UnauthorizedException(
          `Access denied. Administrative privileges are required.`,
        );
      } else {
        throw new UnauthorizedException(`Unauthorized access for role ${user.role}.`);
      }
    }

    // 3. Verify password hash using bcrypt
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid email address or password.");
    }

    // 4. Generate JWT
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    this.logger.log(`Successful login: ${user.email} as ${user.role}`);

    const firstName =
      user.customerProfile?.firstName ||
      (user.panditProfile ? user.panditProfile.fullName.split(" ")[0] : "User");
    const lastName = user.customerProfile?.lastName || "";

    return {
      message: "Authentication successful.",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName,
        lastName,
        phoneNumber: user.phoneNumber,
      },
    };
  }

  /**
   * Forgot password: validates user existence and generates a secure, timed reset token
   */
  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.toLowerCase().trim();

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException("No account found with this email address.");
    }

    // 15-minute cryptographically signed token
    const resetToken = this.jwtService.sign(
      { sub: user.id, email: user.email, type: "pwd_reset" },
      { expiresIn: "15m" },
    );

    this.logger.log(`Password reset token generated for ${user.email}`);

    return {
      message: "Password reset instructions have been generated.",
      resetToken,
      resetUrl: `/customer/reset-password?token=${resetToken}`,
    };
  }

  /**
   * Reset password using validated token
   */
  async resetPassword(dto: ResetPasswordDto) {
    let payload: { sub: string; email: string; type: string };

    try {
      payload = this.jwtService.verify(dto.token);
    } catch {
      throw new BadRequestException(
        "Password reset link is invalid or has expired. Please request a new link.",
      );
    }

    if (payload.type !== "pwd_reset" || !payload.sub) {
      throw new BadRequestException("Invalid password reset token format.");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new NotFoundException("User account no longer exists.");
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    this.logger.log(`Password successfully reset for user: ${user.email}`);

    return {
      message:
        "Password updated successfully. You can now log in with your new password.",
    };
  }

  /**
   * Fetch current authenticated user's profile
   */
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        customerProfile: true,
        panditProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException("User profile not found.");
    }

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
