import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsEmail({}, { message: 'Por favor, insira um email válido.' })
    @IsNotEmpty({ message: 'O email não pode ser vazio.' })
    email: string;

    @IsNotEmpty({ message: 'A senha não pode ser vazia.' })
    @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
    password: string;
}
