import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { IsInt, IsOptional, Max, Min, IsArray, IsNotEmpty } from 'class-validator';

export class GetMonthlyTransactionsDto {
    @ApiProperty({
        description: 'Ano para filtrar as transações.',
        example: 2025,
    })
    @Type(() => Number)
    @IsInt()
    @IsNotEmpty()
    year: number;

    @ApiProperty({
        description: 'Mês para filtrar as transações (1-12).',
        example: 7,
    })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(12)
    @IsNotEmpty()
    month: number;

    @ApiPropertyOptional({
        description: 'Array de IDs de categoria para filtrar. Ex: ?categoryIds=1&categoryIds=2',
        type: [Number],
    })
    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    @Transform(({ value }) => (Array.isArray(value) ? value.map(Number) : [Number(value)]))
    categoryIds?: number[];

    @ApiPropertyOptional({
        description: 'Número da página para a paginação.',
        default: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'Número de itens por página.',
        default: 10,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;
}
