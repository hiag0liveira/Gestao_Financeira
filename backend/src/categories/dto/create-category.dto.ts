import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
    @IsString({ message: 'O nome deve ser um texto.' })
    @IsNotEmpty({ message: 'O nome não pode ser vazio.' })
    name: string;
}
