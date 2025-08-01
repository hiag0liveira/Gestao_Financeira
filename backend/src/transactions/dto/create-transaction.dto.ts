import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, IsNotEmpty, IsEnum, IsOptional, IsInt, Min, Max, IsDateString } from 'class-validator';
import { TransactionType } from '../entities/transaction.entity';

export class CreateTransactionDto {
    @ApiProperty({
        description: 'O valor da transação.',
        example: 150.75,
    })
    @IsNumber({}, { message: 'O valor deve ser um número.' })
    @IsNotEmpty({ message: 'O valor não pode ser vazio.' })
    amount: number;

    @ApiProperty({
        description: 'Uma breve descrição da transação.',
        example: 'Almoço de negócios',
    })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({
        description: 'A data em que a transação ocorreu.',
        example: '2025-07-30',
    })
    @IsDateString({}, { message: 'A data deve estar no formato YYYY-MM-DD.' })
    date: Date;

    @ApiProperty({
        description: 'O tipo da transação.',
        enum: TransactionType,
        example: TransactionType.EXPENSE,
    })
    @IsEnum(TransactionType, { message: 'Tipo inválido. Use "income", "expense" ou "fixed-expense".' })
    type: TransactionType;

    @ApiPropertyOptional({
        description: 'O dia do mês para despesas recorrentes (1-31).',
        example: 15,
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(31)
    recurrenceDay?: number;

    @ApiPropertyOptional({
        description: 'Data final da recorrência da despesa fixa. Se não informado, será infinita.',
        example: '2025-12-31',
    })
    @IsOptional()
    @IsDateString({}, { message: 'A data final deve estar no formato YYYY-MM-DD.' })
    recurrenceEndDate?: Date;


    @ApiPropertyOptional({
        description: 'O ID da categoria à qual a transação pertence.',
        example: 1,
    })
    @IsOptional()
    @IsInt()
    categoryId?: number;
}
