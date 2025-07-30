import { IsNumber, IsString, IsNotEmpty, IsEnum, IsOptional, IsInt, Min, Max, IsDateString } from 'class-validator';
import { TransactionType } from '../entities/transaction.entity';

export class CreateTransactionDto {
    @IsNumber({}, { message: 'O valor deve ser um número.' })
    @IsNotEmpty({ message: 'O valor não pode ser vazio.' })
    amount: number;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsDateString({}, { message: 'A data deve estar no formato YYYY-MM-DD.' })
    date: Date;

    @IsEnum(TransactionType, { message: 'Tipo inválido. Use "income", "expense" ou "fixed-expense".' })
    type: TransactionType;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(31)
    recurrenceDay?: number;

    @IsOptional()
    @IsInt()
    categoryId?: number;
}
