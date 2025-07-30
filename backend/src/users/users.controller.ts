import { Controller, Get, Body, Patch, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    getProfile(@Request() req) {
        return this.usersService.findOneById(req.user.userId);
    }

    @Patch('me')
    updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
        const userId = req.user.userId;
        return this.usersService.update(userId, updateUserDto);
    }
}
