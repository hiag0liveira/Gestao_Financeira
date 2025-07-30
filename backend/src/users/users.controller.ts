import { Controller, Get, Body, Patch, UseGuards, Request, ValidationPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('users')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    @ApiOperation({ summary: 'Obtém os dados do perfil do usuário logado.' })
    @ApiResponse({ status: 200, description: 'Dados do perfil retornados com sucesso.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    getProfile(@Request() req) {
        return this.usersService.findOneById(req.user.userId);
    }

    @Patch('me')
    @ApiOperation({ summary: 'Atualiza os dados do perfil do usuário logado.' })
    @ApiResponse({ status: 200, description: 'Perfil atualizado com sucesso.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
    updateProfile(@Request() req, @Body(ValidationPipe) updateUserDto: UpdateUserDto) {
        const userId = req.user.userId;
        return this.usersService.update(userId, updateUserDto);
    }
}
