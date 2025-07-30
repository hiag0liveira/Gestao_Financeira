// backend/src/auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus, ValidationPipe, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private usersService: UsersService,
    ) { }

    @Post('signup')
    @ApiOperation({ summary: 'Registra um novo usuário no sistema.' })
    @ApiBody({ type: CreateUserDto })
    @ApiResponse({ status: 201, description: 'Usuário registrado com sucesso. Retorna os dados do usuário sem a senha.' })
    @ApiResponse({ status: 400, description: 'Dados inválidos.' })
    async signUp(@Body(ValidationPipe) createUserDto: CreateUserDto) {
        const user = await this.usersService.create(createUserDto);
        return user;
    }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    @ApiOperation({ summary: 'Autentica um usuário e retorna um token JWT.' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({ status: 200, description: 'Login bem-sucedido. Retorna o token de acesso.' })
    @ApiResponse({ status: 401, description: 'Credenciais inválidas.' })
    async login(@Body(ValidationPipe) loginDto: LoginDto) {
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Credenciais inválidas.');
        }
        return this.authService.login(user);
    }
}
