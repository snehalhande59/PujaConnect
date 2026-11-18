import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Res,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";

import { Response } from "express";

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";

import { AuthService } from "./auth.service";
import { RegisterCustomerDto } from "./dto/register-customer.dto";
import { RegisterPanditDto } from "./dto/register-pandit.dto";
import { LoginDto } from "./dto/login.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";

import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { CurrentUser } from "./decorators/current-user.decorator";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Set secure HTTP-only authentication cookie
   */
  private setAuthCookie(res: Response, token: string) {
    res.cookie("devsutra_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });
  }

  // ==========================================
  // CUSTOMER REGISTRATION
  // ==========================================

  @Post("customer/register")
  @ApiOperation({ summary: "Register a new Devotee / Customer" })
  @ApiResponse({
    status: 201,
    description: "Customer registered successfully",
  })
  @ApiResponse({
    status: 409,
    description: "Email or phone already registered",
  })
  async registerCustomer(
    @Body() dto: RegisterCustomerDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.registerCustomer(dto);

    this.setAuthCookie(res, result.token);

    return result;
  }

  // ==========================================
  // CUSTOMER LOGIN
  // ==========================================

  @Post("customer/login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Customer / Devotee Login" })
  @ApiResponse({
    status: 200,
    description: "Customer authenticated successfully",
  })
  @ApiResponse({
    status: 401,
    description: "Invalid credentials or wrong role",
  })
  async loginCustomer(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.loginCustomer(dto);

    this.setAuthCookie(res, result.token);

    return result;
  }

  // ==========================================
  // GENERAL LOGIN
  // ==========================================

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "General Login" })
  @ApiResponse({
    status: 200,
    description: "User authenticated successfully",
  })
  @ApiResponse({
    status: 401,
    description: "Invalid credentials",
  })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.authenticateUser(dto);

    this.setAuthCookie(res, result.token);

    return result;
  }

  // ==========================================
  // PANDIT REGISTRATION
  // ==========================================

  @Post("pandit/register")
  @ApiOperation({ summary: "Register a new Pandit" })
  @ApiResponse({
    status: 201,
    description:
      "Pandit registration submitted successfully. Awaiting admin verification.",
  })
  @ApiResponse({
    status: 409,
    description: "Email or phone already registered",
  })
  async registerPandit(
    @Body() dto: RegisterPanditDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.registerPandit(dto);

    this.setAuthCookie(res, result.token);

    return result;
  }

  // ==========================================
  // PANDIT LOGIN
  // ==========================================

  @Post("pandit/login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Pandit Login" })
  @ApiResponse({
    status: 200,
    description: "Pandit authenticated successfully",
  })
  @ApiResponse({
    status: 401,
    description: "Invalid credentials or wrong account role",
  })
  async loginPandit(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.loginPandit(dto);

    this.setAuthCookie(res, result.token);

    return result;
  }

  // ==========================================
  // ADMIN LOGIN
  // ==========================================

  @Post("admin/login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Enterprise Admin Console Login" })
  @ApiResponse({
    status: 200,
    description: "Admin authenticated successfully",
  })
  @ApiResponse({
    status: 401,
    description: "Invalid credentials or unauthorized role",
  })
  async loginAdmin(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.loginAdmin(dto);

    this.setAuthCookie(res, result.token);

    return result;
  }

  // ==========================================
  // FORGOT PASSWORD
  // ==========================================

  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Request password reset instructions" })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  // ==========================================
  // RESET PASSWORD
  // ==========================================

  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Reset password with security token" })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  // ==========================================
  // GET AUTHENTICATED PROFILE
  // ==========================================

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get authenticated user profile" })
  async getProfile(@CurrentUser() user: any) {
    return this.authService.getMe(user.id);
  }

  // ==========================================
  // LOGOUT
  // ==========================================

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Log out and clear session cookie" })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("devsutra_token", { path: "/" });
    res.clearCookie("token", { path: "/" });

    return {
      success: true,
      message: "Logged out successfully.",
    };
  }
}
