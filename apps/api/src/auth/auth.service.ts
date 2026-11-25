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
import * as crypto from "crypto";
import { RegisterCustomerDto } from "./dto/register-customer.dto";
import { LoginDto } from "./dto/login.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { RegisterPanditDto } from "./dto/register-pandit.dto";
import { SendOtpDto } from "./dto/send-otp.dto";
import { VerifyOtpDto } from "./dto/verify-otp.dto";
import { SmsService } from "./sms.service";
import { MailService } from "../mail/mail.service";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly smsService: SmsService,
    private readonly mailService: MailService,
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
    if (!user.passwordHash) {
      throw new UnauthorizedException(
        "This account was registered using OTP verification. Please sign in with Email OTP or reset your password.",
      );
    }

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

    // Audit login event in PostgreSQL (zero-migration audit recording)
    try {
      await this.prisma.otpVerification.create({
        data: {
          phoneNumber: user.email,
          otpHash: 'PASSWORD_LOGIN',
          purpose: 'LOGIN_PASSWORD',
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          isVerified: true,
        },
      });
    } catch (auditErr: any) {
      this.logger.warn(`Could not persist password login audit: ${auditErr?.message}`);
    }

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

  /**
   * Send Customer OTP for login / registration (Email OTP active via Gmail SMTP)
   */
  async sendCustomerOtp(dto: SendOtpDto) {
    const rawIdentifier = (dto.identifier || dto.email || dto.phoneNumber || dto.phone || '').trim();
    if (!rawIdentifier) {
      throw new BadRequestException('Please provide an email address or mobile number.');
    }

    const isEmail = rawIdentifier.includes('@');
    const channel = dto.channel || (isEmail ? 'email' : 'sms');

    if (channel === 'email' || isEmail) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(rawIdentifier)) {
        throw new BadRequestException('Please provide a valid email address.');
      }
      const normalizedEmail = rawIdentifier.toLowerCase();

      // Check role boundary: Never authenticate Admin or Pandit via Customer OTP!
      const existingUser = await this.prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true, role: true, isActive: true },
      });

      if (existingUser && existingUser.role !== Role.CUSTOMER) {
        throw new UnauthorizedException(
          `This email address is registered as an authorized ${existingUser.role} account. Customer OTP cannot be used to sign in to this account.`,
        );
      }

      // 60-second resend cooldown
      const recentOtp = await this.prisma.otpVerification.findFirst({
        where: {
          phoneNumber: normalizedEmail,
          createdAt: { gte: new Date(Date.now() - 60 * 1000) },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (recentOtp) {
        const waitSeconds = Math.ceil(
          (recentOtp.createdAt.getTime() + 60 * 1000 - Date.now()) / 1000,
        );
        throw new BadRequestException(
          `Please wait ${waitSeconds > 0 ? waitSeconds : 1} seconds before requesting a new code.`,
        );
      }

      // Rate limit: Maximum 5 OTP requests per hour per email
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const hourlyCount = await this.prisma.otpVerification.count({
        where: {
          phoneNumber: normalizedEmail,
          createdAt: { gte: oneHourAgo },
        },
      });

      if (hourlyCount >= 5) {
        throw new BadRequestException(
          'Too many verification requests for this email address. Please try again after 1 hour.',
        );
      }

      // Generate cryptographically secure 6-digit OTP
      const rawOtp = crypto.randomInt(100000, 1000000).toString();
      const otpHash = this.smsService.hashOtp(rawOtp);
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Store in PostgreSQL OtpVerification
      await this.prisma.otpVerification.create({
        data: {
          phoneNumber: normalizedEmail,
          otpHash,
          purpose: dto.purpose || 'LOGIN',
          expiresAt,
        },
      });

      // Send real branded email via MailService (Gmail SMTP)
      const mailResult = await this.mailService.sendOtpEmail(normalizedEmail, rawOtp, true);

      if (!mailResult.success) {
        throw new BadRequestException(
          mailResult.error || 'Failed to deliver verification email. Please try again.',
        );
      }

      const masked = this.mailService.maskEmail(normalizedEmail);
      return {
        success: true,
        channel: 'email',
        message: `Verification code sent to ${masked}. Valid for 5 minutes.`,
        identifier: normalizedEmail,
        cooldownSeconds: 60,
      };
    } else {
      // Mobile SMS OTP - strictly disabled until SMS provider credentials are provided and verified
      throw new BadRequestException(
        'Mobile SMS OTP is temporarily unavailable. Please sign in using your Email Address.',
      );
    }
  }

  /**
   * Verify Customer OTP and authenticate or register Customer
   */
  async verifyCustomerOtp(dto: VerifyOtpDto) {
    const rawIdentifier = (dto.identifier || dto.email || dto.phoneNumber || dto.phone || '').trim();
    if (!rawIdentifier || !dto.otp) {
      throw new BadRequestException('Identifier and verification code are required.');
    }

    const cleanOtp = dto.otp.trim();
    if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      throw new BadRequestException('Verification code must be exactly 6 digits.');
    }

    const isEmail = rawIdentifier.includes('@');
    const normalizedIdentifier = isEmail
      ? rawIdentifier.toLowerCase()
      : this.smsService.normalizePhoneNumber(rawIdentifier);

    // Find latest active unverified OTP for this identifier
    const record = await this.prisma.otpVerification.findFirst({
      where: {
        phoneNumber: normalizedIdentifier,
        isVerified: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      throw new BadRequestException(
        "No active verification code request found. Please click 'Send Code' first.",
      );
    }

    // Check expiration (5 minutes)
    if (new Date() > record.expiresAt) {
      throw new BadRequestException(
        'Verification code has expired. Please request a new code.',
      );
    }

    // Check maximum attempts limit (max 5)
    if (record.attempts >= 5) {
      throw new BadRequestException(
        'Maximum verification attempts exceeded. Please request a new code.',
      );
    }

    // Verify OTP hash
    const isValid = this.smsService.verifyOtpHash(cleanOtp, record.otpHash);
    if (!isValid) {
      await this.prisma.otpVerification.update({
        where: { id: record.id },
        data: { attempts: record.attempts + 1 },
      });

      const remaining = 5 - (record.attempts + 1);
      throw new UnauthorizedException(
        `Invalid verification code. ${remaining > 0 ? `${remaining} attempts remaining.` : 'Please request a new code.'}`,
      );
    }

    // Mark OTP as verified
    await this.prisma.otpVerification.update({
      where: { id: record.id },
      data: { isVerified: true },
    });

    // Resolve or create Customer User
    let user = await this.prisma.user.findFirst({
      where: isEmail
        ? { email: normalizedIdentifier }
        : { phoneNumber: normalizedIdentifier },
      include: {
        customerProfile: true,
      },
    });

    // Strict Role boundary check: Never authenticate Admin or Pandit via Customer OTP!
    if (user && user.role !== Role.CUSTOMER) {
      this.logger.warn(
        `Role mismatch rejected: ${user.email} with role ${user.role} attempted Customer OTP login.`,
      );
      throw new UnauthorizedException(
        `Access denied. This account has ${user.role} privileges. Please sign in via the designated portal.`,
      );
    }

    let isNewCustomer = false;

    if (!user) {
      isNewCustomer = true;
      const names = (dto.fullName || 'Sacred Devotee').trim().split(/\s+/);
      const firstName = names[0] || 'Devotee';
      const lastName = names.slice(1).join(' ') || '';

      // Create high-entropy cryptographic password hash (unusable for password login)
      const unguessablePassword = crypto.randomBytes(32).toString('hex');
      const passwordHash = await bcrypt.hash(unguessablePassword, 12);

      user = await this.prisma.user.create({
        data: {
          email: isEmail ? normalizedIdentifier : `devotee.${Date.now()}@devsutra.in`,
          phoneNumber: isEmail ? null : normalizedIdentifier,
          passwordHash,
          role: Role.CUSTOMER,
          customerProfile: {
            create: {
              firstName,
              lastName,
            },
          },
        },
        include: {
          customerProfile: true,
        },
      });

      this.logger.log(`Created new Devotee via Email OTP: ${user.email} (ID: ${user.id})`);
    } else {
      // Ensure customer profile exists if missing on existing devotee
      if (!user.customerProfile) {
        const names = (dto.fullName || 'Sacred Devotee').trim().split(/\s+/);
        const firstName = names[0] || 'Devotee';
        const lastName = names.slice(1).join(' ') || '';
        user.customerProfile = await this.prisma.customerProfile.create({
          data: {
            userId: user.id,
            firstName,
            lastName,
          },
        });
      }
      // Record latest active login timestamp in database
      await this.prisma.user.update({
        where: { id: user.id },
        data: { updatedAt: new Date() },
      });
    }

    // Generate JWT Auth Token
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      success: true,
      message: isNewCustomer
        ? 'Welcome to DevSutra! Account created successfully.'
        : 'Logged in successfully!',
      token,
      isNewCustomer,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.customerProfile?.firstName || 'Devotee',
        lastName: user.customerProfile?.lastName || '',
        phoneNumber: user.phoneNumber,
      },
    };
  }
}
