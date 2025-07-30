import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
    @ApiProperty({
        description: 'O email de login do usuário.',
        example: 'novo.usuario@exemplo.com',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        description: 'A senha do usuário (mínimo de 6 caracteres).',
        example: 'senhaForte123',
    })
    @IsNotEmpty()
    password: string;
}
