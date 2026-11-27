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
import { VerifyWidgetTokenDto } from "./dto/verify-widget-token.dto";
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
        panditProfile: true,
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
      // Mobile SMS OTP via MSG91 Widget
      const normalizedPhone = this.smsService.normalizePhoneNumber(rawIdentifier);
      if (!this.smsService.isValidIndianMobile(normalizedPhone)) {
        throw new BadRequestException(
          'Please enter a valid 10-digit Indian mobile number (e.g. 9822012345 or +919822012345).',
        );
      }

      // 60-second resend cooldown
      const recentOtp = await this.prisma.otpVerification.findFirst({
        where: {
          phoneNumber: normalizedPhone,
          createdAt: { gte: new Date(Date.now() - 60 * 1000) },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (recentOtp) {
        const waitSeconds = Math.ceil(
          (recentOtp.createdAt.getTime() + 60 * 1000 - Date.now()) / 1000,
        );
        throw new BadRequestException(
          `Please wait ${waitSeconds > 0 ? waitSeconds : 1} seconds before requesting a new SMS code.`,
        );
      }

      // Rate limit: Maximum 25 OTP requests per hour per mobile number
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const hourlyCount = await this.prisma.otpVerification.count({
        where: {
          phoneNumber: normalizedPhone,
          createdAt: { gte: oneHourAgo },
        },
      });

      if (hourlyCount >= 25) {
        throw new BadRequestException(
          'Too many verification requests for this mobile number. Please try again after 1 hour.',
        );
      }

      // Dispatch real SMS OTP via MSG91 Widget API
      const smsResult = await this.smsService.sendOtpSms(normalizedPhone);

      if (!smsResult.success) {
        throw new BadRequestException(
          smsResult.error || 'Failed to deliver SMS OTP to your mobile number. Please try again or use Email OTP.',
        );
      }

      // Store verification session in PostgreSQL with MSG91 reqId
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await this.prisma.otpVerification.create({
        data: {
          phoneNumber: normalizedPhone,
          otpHash: smsResult.reqId ? `msg91:${smsResult.reqId}` : 'MSG91_WIDGET',
          purpose: dto.purpose || 'LOGIN',
          expiresAt,
        },
      });

      const maskedPhone = `${normalizedPhone.slice(0, 6)}****${normalizedPhone.slice(-2)}`;
      return {
        success: true,
        channel: 'sms',
        message: `Verification code sent via SMS to ${maskedPhone}. Valid for 10 minutes.`,
        identifier: normalizedPhone,
        cooldownSeconds: 60,
        reqId: smsResult.reqId,
      };
    }
  }

  /**
   * Verify Customer OTP and authenticate or register Customer
   */
  async verifyCustomerOtp(dto: VerifyOtpDto) {
    const rawIdentifier = (dto.identifier || dto.email || dto.phoneNumber || dto.phone || '').trim();

    // If MSG91 access token is provided from React Native SDK verifyOTP
    if (dto.accessToken) {
      return this.verifyCustomerWidgetToken({
        phoneNumber: rawIdentifier,
        accessToken: dto.accessToken,
        fullName: dto.fullName,
      });
    }

    if (!rawIdentifier || !dto.otp) {
      throw new BadRequestException('Identifier and verification code are required.');
    }

    const cleanOtp = dto.otp.trim();
    if (!/^\d{4,6}$/.test(cleanOtp)) {
      throw new BadRequestException('Verification code must be numeric (4 to 6 digits).');
    }

    const isEmail = rawIdentifier.includes('@');
    let normalizedPhone: string | null = null;
    let normalizedEmail: string | null = null;

    if (isEmail) {
      normalizedEmail = rawIdentifier.toLowerCase();
    } else {
      normalizedPhone = this.smsService.normalizePhoneNumber(rawIdentifier);
    }

    // Find latest active unverified OTP for this identifier
    const record = await this.prisma.otpVerification.findFirst({
      where: {
        phoneNumber: isEmail ? normalizedEmail! : normalizedPhone!,
        isVerified: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!isEmail) {
      // Mobile OTP verification via MSG91 widget or stored session
      const reqIdToUse =
        (dto.reqId && dto.reqId !== 'BACKEND_SENT' ? dto.reqId.trim() : undefined) ||
        (record?.otpHash?.startsWith('msg91:') ? record.otpHash.replace('msg91:', '').trim() : undefined);

      let msg91Verified = false;
      let accessTokenFromMsg91: string | undefined = undefined;

      if (reqIdToUse && reqIdToUse !== 'MSG91_WIDGET') {
        const verifyResult = await this.smsService.verifyOtpWidget(cleanOtp, reqIdToUse, normalizedPhone!);
        if (verifyResult.success) {
          msg91Verified = true;
          accessTokenFromMsg91 = verifyResult.accessToken || this.smsService.getLastWidgetAccessToken();
        } else {
          if (record) {
            await this.prisma.otpVerification.update({
              where: { id: record.id },
              data: { attempts: record.attempts + 1 },
            });
          }
          throw new UnauthorizedException(verifyResult.error || 'Invalid or expired verification code.');
        }
      } else if (record && record.otpHash && !record.otpHash.startsWith('msg91:')) {
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
        msg91Verified = true;
      } else {
        throw new BadRequestException("Active verification session expired or not found. Please click 'Send OTP' first.");
      }

      if (record) {
        await this.prisma.otpVerification.update({
          where: { id: record.id },
          data: { isVerified: true },
        });
      }

      // If MSG91 returned a cryptographic access token, delegate to verifyCustomerWidgetToken
      if (accessTokenFromMsg91) {
        return this.verifyCustomerWidgetToken({
          phoneNumber: normalizedPhone!,
          accessToken: accessTokenFromMsg91,
          fullName: dto.fullName,
        });
      }

      // Resolve existing user by phone number
      let user = await this.prisma.user.findFirst({
        where: { phoneNumber: normalizedPhone! },
        include: {
          customerProfile: true,
          panditProfile: true,
        },
      });

      // Ensure any existing account is scoped as CUSTOMER on Devotee portal
      if (user && user.role === Role.PANDIT) {
        this.logger.log(`User ${user.phoneNumber} logging into Devotee portal; ensuring Customer role.`);
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { role: Role.CUSTOMER },
          include: { customerProfile: true, panditProfile: true },
        });
      }

      if (user) {
        if (!user.customerProfile) {
          const names = (dto.fullName || 'Sacred Devotee').trim().split(/\s+/);
          const firstName = names[0] || 'Devotee';
          const lastName = names.slice(1).join(' ') || '';
          user.customerProfile = await this.prisma.customerProfile.create({
            data: { userId: user.id, firstName, lastName },
          });
        }

        await this.prisma.user.update({
          where: { id: user.id },
          data: { updatedAt: new Date() },
        });

        await this.recordLoginSessionAndNotifyAdmins(user, normalizedPhone!, 'MOBILE_OTP', false);

        const token = this.jwtService.sign({
          sub: user.id,
          email: user.email,
          role: Role.CUSTOMER,
        });

        const hasCompletedProfile = Boolean(
          user.customerProfile?.firstName &&
          user.customerProfile?.firstName.toLowerCase() !== 'devotee' &&
          user.customerProfile?.city,
        );

        return {
          success: true,
          message: 'Logged in successfully!',
          token,
          isNewCustomer: false,
          hasCompletedProfile,
          role: Role.CUSTOMER,
          user: {
            id: user.id,
            email: user.email,
            role: Role.CUSTOMER,
            firstName: user.customerProfile?.firstName || 'Devotee',
            lastName: user.customerProfile?.lastName || '',
            phoneNumber: user.phoneNumber,
            city: user.customerProfile?.city || null,
            hasCompletedProfile,
          },
        };
      }

      // New Devotee Customer Registration via Mobile
      const phoneDigits = normalizedPhone!.replace(/[^0-9]/g, '');
      const defaultEmail = `devotee.${phoneDigits}@devsutra.in`;
      const unguessablePassword = crypto.randomBytes(32).toString('hex');
      const passwordHash = await bcrypt.hash(unguessablePassword, 12);

      const names = (dto.fullName || 'Sacred Devotee').trim().split(/\s+/);
      const firstName = names[0] || 'Devotee';
      const lastName = names.slice(1).join(' ') || '';

      user = await this.prisma.user.create({
        data: {
          email: defaultEmail,
          phoneNumber: normalizedPhone!,
          passwordHash,
          role: Role.CUSTOMER,
          customerProfile: {
            create: {
              firstName,
              lastName,
            },
          },
        },
        include: { customerProfile: true, panditProfile: true },
      });

      this.logger.log(`Created new Devotee via Mobile OTP: ${user.phoneNumber} (ID: ${user.id})`);
      await this.recordLoginSessionAndNotifyAdmins(user, normalizedPhone!, 'MOBILE_OTP', true);

      const token = this.jwtService.sign({
        sub: user.id,
        email: user.email,
        role: Role.CUSTOMER,
      });

      return {
        success: true,
        message: 'Welcome to DevSutra! Account created successfully.',
        token,
        isNewCustomer: true,
        hasCompletedProfile: false,
        role: Role.CUSTOMER,
        user: {
          id: user.id,
          email: user.email,
          role: Role.CUSTOMER,
          firstName,
          lastName,
          phoneNumber: user.phoneNumber,
          city: null,
          hasCompletedProfile: false,
        },
      };
    }

    // Email OTP Flow
    if (!record) {
      throw new BadRequestException(
        "No active verification code request found. Please click 'Send OTP' first.",
      );
    }

    if (new Date() > record.expiresAt) {
      throw new BadRequestException('Verification code has expired. Please request a new code.');
    }

    if (record.attempts >= 5) {
      throw new BadRequestException('Maximum verification attempts exceeded. Please request a new code.');
    }

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

    await this.prisma.otpVerification.update({
      where: { id: record.id },
      data: { isVerified: true },
    });

    let user = await this.prisma.user.findFirst({
      where: { email: normalizedEmail! },
      include: {
        customerProfile: true,
        panditProfile: true,
      },
    });

    if (user && user.role === Role.PANDIT) {
      this.logger.log(`User ${user.email} logging into Devotee portal via Email OTP; ensuring Customer role.`);
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { role: Role.CUSTOMER },
        include: { customerProfile: true, panditProfile: true },
      });
    }

    // Case 2: Existing Admin Account
    if (user && user.role === Role.ADMIN) {
      this.logger.log(`Admin verified via Mobile OTP: ${user.email}`);
      const token = this.jwtService.sign({
        sub: user.id,
        email: user.email,
        role: Role.ADMIN,
      });

      return {
        success: true,
        message: 'Welcome to the DevSutra Admin Console.',
        token,
        isNewCustomer: false,
        role: Role.ADMIN,
        user: {
          id: user.id,
          email: user.email,
          role: Role.ADMIN,
          firstName: 'Admin',
          lastName: '',
          phoneNumber: user.phoneNumber,
        },
      };
    }

    // Case 3: Existing Customer Account
    if (user && user.role === Role.CUSTOMER) {
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

      await this.prisma.user.update({
        where: { id: user.id },
        data: { updatedAt: new Date() },
      });

      // Track verified login session & notify Admin portal in real-time
      await this.recordLoginSessionAndNotifyAdmins(user, normalizedEmail!, 'EMAIL_OTP', false);

      const token = this.jwtService.sign({
        sub: user.id,
        email: user.email,
        role: Role.CUSTOMER,
      });

      const hasCompletedProfile = Boolean(
        user.customerProfile?.firstName &&
        user.customerProfile?.firstName.toLowerCase() !== 'devotee' &&
        user.customerProfile?.city,
      );

      return {
        success: true,
        message: 'Logged in successfully!',
        token,
        isNewCustomer: false,
        hasCompletedProfile,
        role: Role.CUSTOMER,
        user: {
          id: user.id,
          email: user.email,
          role: Role.CUSTOMER,
          firstName: user.customerProfile?.firstName || 'Devotee',
          lastName: user.customerProfile?.lastName || '',
          phoneNumber: user.phoneNumber,
          city: user.customerProfile?.city || null,
          hasCompletedProfile,
        },
      };
    }

    // Case 4: New User (First time login via Email OTP -> create Customer account)
    const defaultEmail = normalizedEmail!;

    const unguessablePassword = crypto.randomBytes(32).toString('hex');
    const passwordHash = await bcrypt.hash(unguessablePassword, 12);

    user = await this.prisma.user.create({
      data: {
        email: defaultEmail,
        phoneNumber: null,
        passwordHash,
        role: Role.CUSTOMER,
        customerProfile: {
          create: {
            firstName: 'Devotee',
            lastName: '',
          },
        },
      },
      include: {
        customerProfile: true,
        panditProfile: true,
      },
    });

    this.logger.log(
      `Created new Devotee via Email OTP: ${user.email} (ID: ${user.id})`,
    );

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: Role.CUSTOMER,
    });

    return {
      success: true,
      message: 'Welcome to DevSutra! Account created successfully.',
      token,
      isNewCustomer: true,
      hasCompletedProfile: false,
      role: Role.CUSTOMER,
      user: {
        id: user.id,
        email: user.email,
        role: Role.CUSTOMER,
        firstName: 'Devotee',
        lastName: '',
        phoneNumber: user.phoneNumber,
        city: null,
        hasCompletedProfile: false,
      },
    };
  }

  /**
   * Cryptographically verify MSG91 access token and authenticate or register customer
   */
  async verifyCustomerWidgetToken(dto: VerifyWidgetTokenDto) {
    const rawPhone = (dto.phoneNumber || '').trim();
    const cleanToken = (dto.accessToken || '').trim();

    if (!rawPhone || !cleanToken) {
      throw new BadRequestException('Phone number and MSG91 access token are required.');
    }

    const expectedPhone = this.smsService.normalizePhoneNumber(rawPhone);
    if (!this.smsService.isValidIndianMobile(expectedPhone)) {
      throw new BadRequestException(
        'Please enter a valid 10-digit Indian mobile number.',
      );
    }

    // Call MSG91 server-to-server endpoint using MSG91_AUTH_KEY
    const verifyResult = await this.smsService.verifyAccessToken(cleanToken);

    if (!verifyResult.success || !verifyResult.identifier) {
      this.logger.warn(`[MSG91 Widget Token] Verification failed for ${expectedPhone}: ${verifyResult.error}`);
      let userMsg = verifyResult.error || 'Invalid or expired MSG91 verification token.';
      if (userMsg.toLowerCase().includes('verification failed') || userMsg.toLowerCase().includes('failed')) {
        userMsg = 'OTP verification failed or token has expired. Please request a fresh OTP.';
      }
      throw new UnauthorizedException(userMsg);
    }

    // Strict equality check between normalized phone number and MSG91 verified identifier
    const normalizedExpected = this.smsService.normalizePhoneNumber(expectedPhone);
    const normalizedVerified = this.smsService.normalizePhoneNumber(verifyResult.identifier);
    const last10Expected = normalizedExpected.replace(/[^0-9]/g, '').slice(-10);
    const last10Verified = normalizedVerified.replace(/[^0-9]/g, '').slice(-10);

    if (normalizedExpected !== normalizedVerified && last10Expected !== last10Verified) {
      this.logger.error(
        `[MSG91 Widget Token] Identifier mismatch: expected ${expectedPhone}, verified ${verifyResult.identifier}`,
      );
      throw new UnauthorizedException(
        'Verified mobile number does not match requested phone number.',
      );
    }

    // Find existing user by phone
    let user = await this.prisma.user.findFirst({
      where: { phoneNumber: expectedPhone },
      include: {
        customerProfile: true,
        panditProfile: true,
      },
    });

    // -------------------------------------------------------------
    // POST-VERIFICATION ROLE & ACCOUNT IDENTIFICATION (Zero Escalation)
    // -------------------------------------------------------------

    // If existing account was registered as PANDIT, ensure CUSTOMER role when logging into Devotee portal
    if (user && user.role === Role.PANDIT) {
      this.logger.log(`User ${user.phoneNumber || user.email} logging into Devotee portal; ensuring Customer role.`);
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { role: Role.CUSTOMER },
        include: {
          customerProfile: true,
          panditProfile: true,
        },
      });
    }

    // Case 2: Existing Admin Account
    if (user && user.role === Role.ADMIN) {
      this.logger.log(`Admin verified via MSG91 SDK: ${user.email}`);
      const token = this.jwtService.sign({
        sub: user.id,
        email: user.email,
        role: Role.ADMIN,
      });

      return {
        success: true,
        message: 'Welcome to the DevSutra Admin Console.',
        token,
        isNewCustomer: false,
        role: Role.ADMIN,
        user: {
          id: user.id,
          email: user.email,
          role: Role.ADMIN,
          firstName: 'Admin',
          lastName: '',
          phoneNumber: user.phoneNumber,
        },
      };
    }

    // Case 3: Existing Customer Account
    if (user && user.role === Role.CUSTOMER) {
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

      await this.prisma.user.update({
        where: { id: user.id },
        data: { updatedAt: new Date() },
      });

      // Track verified login session & notify Admin portal in real-time
      await this.recordLoginSessionAndNotifyAdmins(user, expectedPhone, 'MOBILE_OTP', false);

      const token = this.jwtService.sign({
        sub: user.id,
        email: user.email,
        role: Role.CUSTOMER,
      });

      const hasCompletedProfile = Boolean(
        user.customerProfile?.firstName &&
        user.customerProfile?.firstName.toLowerCase() !== 'devotee' &&
        user.customerProfile?.city,
      );

      return {
        success: true,
        message: 'Logged in successfully!',
        token,
        isNewCustomer: false,
        hasCompletedProfile,
        role: Role.CUSTOMER,
        user: {
          id: user.id,
          email: user.email,
          role: Role.CUSTOMER,
          firstName: user.customerProfile?.firstName || 'Devotee',
          lastName: user.customerProfile?.lastName || '',
          phoneNumber: user.phoneNumber,
          city: user.customerProfile?.city || null,
          hasCompletedProfile,
        },
      };
    }

    // Case 4: New User -> Register Customer Account
    const phoneDigits = expectedPhone.replace(/[^0-9]/g, '');
    const defaultEmail = `devotee.${phoneDigits}@devsutra.in`;

    const unguessablePassword = crypto.randomBytes(32).toString('hex');
    const passwordHash = await bcrypt.hash(unguessablePassword, 12);

    try {
      user = await this.prisma.user.create({
        data: {
          email: defaultEmail,
          phoneNumber: expectedPhone,
          passwordHash,
          role: Role.CUSTOMER,
          customerProfile: {
            create: {
              firstName: 'Devotee',
              lastName: '',
            },
          },
        },
        include: {
          customerProfile: true,
          panditProfile: true,
        },
      });
    } catch (createErr: any) {
      // Handle Prisma P2002 unique constraint race condition safely
      if (createErr?.code === 'P2002') {
        this.logger.warn(
          `[MSG91 Widget Token] Concurrent registration detected (P2002) for ${expectedPhone}. Re-fetching record.`,
        );
        user = await this.prisma.user.findFirst({
          where: { phoneNumber: expectedPhone },
          include: {
            customerProfile: true,
            panditProfile: true,
          },
        });

        if (user) {
          // Re-apply role checks strictly
          if (user.role === Role.PANDIT) {
            user = await this.prisma.user.update({
              where: { id: user.id },
              data: { role: Role.CUSTOMER },
              include: { customerProfile: true, panditProfile: true },
            });
          }

          if (user.role === Role.ADMIN) {
            const token = this.jwtService.sign({
              sub: user.id,
              email: user.email,
              role: Role.ADMIN,
            });
            return {
              success: true,
              message: 'Welcome to the DevSutra Admin Console.',
              token,
              isNewCustomer: false,
              role: Role.ADMIN,
              user: {
                id: user.id,
                email: user.email,
                role: Role.ADMIN,
                firstName: 'Admin',
                lastName: '',
                phoneNumber: user.phoneNumber,
              },
            };
          }

          if (user.role === Role.CUSTOMER) {
            const token = this.jwtService.sign({
              sub: user.id,
              email: user.email,
              role: Role.CUSTOMER,
            });
            const hasCompletedProfile = Boolean(
              user.customerProfile?.firstName &&
              user.customerProfile?.firstName.toLowerCase() !== 'devotee' &&
              user.customerProfile?.city,
            );
            return {
              success: true,
              message: 'Logged in successfully!',
              token,
              isNewCustomer: false,
              hasCompletedProfile,
              role: Role.CUSTOMER,
              user: {
                id: user.id,
                email: user.email,
                role: Role.CUSTOMER,
                firstName: user.customerProfile?.firstName || 'Devotee',
                lastName: user.customerProfile?.lastName || '',
                phoneNumber: user.phoneNumber,
                city: user.customerProfile?.city || null,
                hasCompletedProfile,
              },
            };
          }
        }
      }
      throw createErr;
    }

    this.logger.log(
      `Created new Devotee via MSG91 SDK: ${user.phoneNumber} (ID: ${user.id})`,
    );

    // Track verified login session & notify Admin portal in real-time
    await this.recordLoginSessionAndNotifyAdmins(user, expectedPhone, 'MOBILE_OTP', true);

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: Role.CUSTOMER,
    });

    return {
      success: true,
      message: 'Welcome to DevSutra! Account created successfully.',
      token,
      isNewCustomer: true,
      hasCompletedProfile: false,
      role: Role.CUSTOMER,
      user: {
        id: user.id,
        email: user.email,
        role: Role.CUSTOMER,
        firstName: 'Devotee',
        lastName: '',
        phoneNumber: user.phoneNumber,
        city: null,
        hasCompletedProfile: false,
      },
    };
  }

  /**
   * Record verified customer login/registration session in OtpVerification table
   * and push active notification to all Admin consoles.
   */
  private async recordLoginSessionAndNotifyAdmins(
    user: any,
    identifier: string,
    method: 'MOBILE_OTP' | 'EMAIL_OTP' | 'PASSWORD',
    isNewCustomer: boolean,
  ): Promise<void> {
    try {
      // 1. Record in OtpVerification table for accurate customer directory presence
      const purpose = method === 'MOBILE_OTP' ? 'LOGIN_MOBILE_OTP' : method === 'PASSWORD' ? 'LOGIN_PASSWORD' : 'EMAIL_OTP';
      await this.prisma.otpVerification.create({
        data: {
          phoneNumber: identifier,
          otpHash: 'MSG91_VERIFIED',
          purpose,
          isVerified: true,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
        },
      });
    } catch (e: any) {
      this.logger.warn(`Could not persist OtpVerification record: ${e?.message}`);
    }

    try {
      // 2. Dispatch real-time Admin notification
      const admins = await this.prisma.user.findMany({
        where: { role: Role.ADMIN, isDeleted: false },
        select: { id: true },
      });

      const customerName = `${user.customerProfile?.firstName || 'Devotee'} ${user.customerProfile?.lastName || ''}`.trim();
      const methodLabel = method === 'MOBILE_OTP' ? 'Mobile OTP' : method === 'PASSWORD' ? 'Password' : 'Email OTP';
      const actionLabel = isNewCustomer ? 'New Devotee Registered' : 'Devotee Sign-in';
      const title = `📱 ${actionLabel}: ${identifier}`;
      const message = `${customerName} (${identifier}) signed in successfully via ${methodLabel}.`;

      for (const admin of admins) {
        await this.prisma.notification.create({
          data: {
            userId: admin.id,
            title,
            message,
            type: 'SYSTEM',
            link: '/admin/customers',
          },
        });
      }
    } catch (e: any) {
      this.logger.warn(`Could not dispatch admin login notification: ${e?.message}`);
    }
  }
}
