import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { IsInt, IsOptional, IsArray, IsDateString, IsNotEmpty, Min, Max } from 'class-validator';

export class GetRangedTransactionsDto {
    @ApiProperty({
        description: 'Data de início para filtrar por um intervalo (formato YYYY-MM-DD).',
        example: '2025-03-01',
    })
    @IsDateString()
    @IsNotEmpty()
    startDate: string;

    @ApiProperty({
        description: 'Data de fim para filtrar por um intervalo (formato YYYY-MM-DD).',
        example: '2025-07-31',
    })
    @IsDateString()
    @IsNotEmpty()
    endDate: string;

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
