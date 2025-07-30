import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class GetBalanceByDateRangeDto {
    @ApiProperty({
        description: 'Data de início do período (formato YYYY-MM-DD)',
        example: '2025-03-01',
    })
    @IsDateString()
    @IsNotEmpty()
    startDate: string;

    @ApiProperty({
        description: 'Data de fim do período (formato YYYY-MM-DD)',
        example: '2025-07-31',
    })
    @IsDateString()
    @IsNotEmpty()
    endDate: string;

    @ApiPropertyOptional({
        description: 'Array de IDs de categoria para filtrar o saldo. Ex: ?categoryIds=1&categoryIds=2',
        type: [Number],
        example: [1, 5],
    })
    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    @Transform(({ value }) => (Array.isArray(value) ? value.map(Number) : [Number(value)]))
    categoryIds?: number[];
}
