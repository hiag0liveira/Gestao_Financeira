import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({
        description: 'O email para o novo usuário.',
        example: 'novo.usuario@exemplo.com',
    })
    @IsEmail({}, { message: 'Por favor, insira um email válido.' })
    @IsNotEmpty({ message: 'O email não pode ser vazio.' })
    email: string;

    @ApiProperty({
        description: 'A senha para o novo usuário (mínimo de 6 caracteres).',
        example: 'senhaForte123',
    })
    @IsNotEmpty({ message: 'A senha não pode ser vazia.' })
    @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
    password: string;
}
