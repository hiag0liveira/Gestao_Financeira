import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, Min, Max, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class GetBalanceDto {
    @ApiProperty({ description: 'Ano para o cálculo do saldo', example: 2025 })
    @Type(() => Number)
    @IsInt()
    @IsNotEmpty()
    year: number;

    @ApiProperty({ description: 'Mês para o cálculo do saldo (1-12)', example: 7 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(12)
    @IsNotEmpty()
    month: number;

    @ApiPropertyOptional({
        description: 'Array de IDs de categoria para filtrar o saldo. Ex: ?categoryIds=1&categoryIds=2',
        type: [Number],
        example: [1, 2],
    })
    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    @Transform(({ value }) => (Array.isArray(value) ? value.map(Number) : [Number(value)]))
    categoryIds?: number[];
}
