import { Controller, Get, Post, Body, UseGuards, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto, CreateUserDto, UserLoginResponseDto, CheckStatusResponseDto } from './dto/index';
import { AuthGuard } from '@nestjs/passport';
import { User } from './entities/user.entity';
import { Auth, GetRawHeaders, GetUser, RoleProtected } from './decorators/index';
import { IncomingHttpHeaders } from 'http';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { ValidRoles } from './interfaces';
import { ApiBearerAuth, ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';



@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiResponse({status: 201, description: 'User was created', type: User})
  create(@Body() createAuthDto: CreateUserDto) {
    return this.authService.create(createAuthDto);
  }

  @Post('login')
  @ApiResponse({status: 201, description: 'User was logged', type: UserLoginResponseDto})
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto);
  }

  @Get('check-status')
  @Auth()
  @ApiBearerAuth()
  @ApiResponse({
    status: 200, 
    description: 'Check status token for user', 
    type: CheckStatusResponseDto
  })
  checkAuthStatus(
    @GetUser() user: User,
  ) {
    return this.authService.checkAuthStatus(user);
  }


  @Get('private')
  @UseGuards( AuthGuard() )
  testingPrivateRoute(
    @GetUser() user: User,
    @GetUser('email') userEmail: string,

    @GetRawHeaders() rawHeaders: string[],
    @Headers() headers: IncomingHttpHeaders
  ) {
    console.log(rawHeaders);
    
    return {
      ok:true,
      message: "hola mundo private",
      user,
      userEmail,
      rawHeaders,
      headers
    };
  }

  // @SetMetadata('roles', ['admin', 'superuser'])
  @Get('private2')
  @RoleProtected(ValidRoles.superUser)
  @UseGuards( AuthGuard(), UserRoleGuard )
  privateRoute2(
    @GetUser() user: User
  ){
    return {
      ok: true,
      user
    }
  }

    // @SetMetadata('roles', ['admin', 'superuser'])
    @Get('private3')
    @Auth(ValidRoles.superUser, ValidRoles.admin)
    privateRoute3(
      @GetUser() user: User
    ){
      return {
        ok: true,
        user
      }
    }

 
}
