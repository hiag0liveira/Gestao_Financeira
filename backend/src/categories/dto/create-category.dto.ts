import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
    @ApiProperty({
        description: 'O nome da nova categoria.',
        example: 'Alimentação',
    })
    @IsString({ message: 'O nome deve ser um texto.' })
    @IsNotEmpty({ message: 'O nome não pode ser vazio.' })
    name: string;
}
