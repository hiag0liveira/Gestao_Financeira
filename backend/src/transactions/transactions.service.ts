// backend/src/transactions/transactions.service.ts
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindManyOptions, Repository } from 'typeorm';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from './entities/transaction.entity';
import { Category } from '../categories/entities/category.entity';
import { GetTransactionsQueryDto } from './dto/get-transactions-query.dto';

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(Transaction)
        private transactionsRepository: Repository<Transaction>,
        @InjectRepository(Category)
        private categoriesRepository: Repository<Category>,
    ) { }

    async create(createTransactionDto: CreateTransactionDto, userId: number): Promise<Transaction> {
        const { categoryId, ...transactionData } = createTransactionDto;
        let finalCategoryId = categoryId;

        if (!finalCategoryId) {
            const defaultCategoryName = 'Demais Gastos';
            let defaultCategory = await this.categoriesRepository.findOne({
                where: { name: defaultCategoryName, user: { id: userId } },
            });

            if (!defaultCategory) {
                defaultCategory = this.categoriesRepository.create({
                    name: defaultCategoryName,
                    user: { id: userId },
                });
                await this.categoriesRepository.save(defaultCategory);
            }
            finalCategoryId = defaultCategory.id;
        }

        const transaction = this.transactionsRepository.create({
            ...transactionData,
            user: { id: userId },
            category: { id: finalCategoryId },
        });

        return this.transactionsRepository.save(transaction);
    }

    async findAllByUserId(userId: number, query: GetTransactionsQueryDto) {
        const { year, month, page = 1, limit = 10 } = query;

        const options: FindManyOptions<Transaction> = {
            where: { user: { id: userId } },
            relations: ['category'],
            order: { date: 'DESC' },
            take: limit,
            skip: (page - 1) * limit,
        };

        if (year && month) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);
            options.where = {
                ...options.where,
                date: Between(startDate, endDate),
            };
        }

        const [data, total] = await this.transactionsRepository.findAndCount(options);

        return {
            data,
            meta: {
                totalItems: total,
                itemsPerPage: limit,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async update(id: number, updateTransactionDto: UpdateTransactionDto, userId: number): Promise<Transaction> {
        const transaction = await this.transactionsRepository.findOne({
            where: { id },
            relations: ['user'],
        });

        if (!transaction) {
            throw new NotFoundException(`Transação com ID ${id} não encontrada.`);
        }

        if (transaction.user.id !== userId) {
            throw new UnauthorizedException('Você não tem permissão para editar esta transação.');
        }

        const updatedTransaction = this.transactionsRepository.merge(transaction, updateTransactionDto);

        if (updateTransactionDto.categoryId) {
            updatedTransaction.category = { id: updateTransactionDto.categoryId } as Category;
        }

        return this.transactionsRepository.save(updatedTransaction);
    }


    async remove(id: number, userId: number): Promise<void> {
        const transaction = await this.transactionsRepository.findOne({
            where: { id },
            relations: ['user'],
        });

        if (!transaction) {
            throw new NotFoundException(`Transação com ID ${id} não encontrada.`);
        }

        if (transaction.user.id !== userId) {
            throw new UnauthorizedException('Você não tem permissão para remover esta transação.');
        }

        await this.transactionsRepository.remove(transaction);
    }
}
