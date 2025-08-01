import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindManyOptions, In, Repository } from 'typeorm';
import { Transaction, TransactionType } from './entities/transaction.entity';
import { Category } from '../categories/entities/category.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { GetMonthlyTransactionsDto } from './dto/get-monthly-transactions.dto';
import { GetRangedTransactionsDto } from './dto/get-ranged-transactions.dto';

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

    private async findAndPaginate(userId: number, options: FindManyOptions<Transaction>, page: number, limit: number) {
        options.where = { ...options.where, user: { id: userId } };
        options.relations = ['category'];
        options.order = { date: 'DESC' };
        options.take = limit;
        options.skip = (page - 1) * limit;

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

    async findAllByMonth(userId: number, query: GetMonthlyTransactionsDto) {
        const { year, month, page = 1, limit = 10, categoryIds } = query;

        const firstDay = new Date(year, month - 1, 1);
        const lastDay = new Date(year, month, 0);

        const where: FindManyOptions<Transaction>['where'] = {
            user: { id: userId },
            date: Between(firstDay, lastDay),
        };

        if (categoryIds && categoryIds.length > 0) {
            where.category = { id: In(categoryIds) };
        }

        const normalTransactions = await this.transactionsRepository.find({
            where,
            relations: ['category'],
        });

        const fixedExpenses = await this.transactionsRepository.find({
            where: { user: { id: userId }, type: TransactionType.FIXED_EXPENSE },
            relations: ['category'],
        });

        const generatedFixed: Transaction[] = [];

        for (const fixed of fixedExpenses) {
            if ((fixed as any).recurrenceEndDate && new Date((fixed as any).recurrenceEndDate) < firstDay) {
                continue;
            }

            const cursor = new Date(firstDay);
            while (cursor <= lastDay) {
                if (cursor.getDate() === fixed.recurrenceDay) {
                    generatedFixed.push(
                        this.transactionsRepository.create({
                            amount: fixed.amount,
                            description: fixed.description,
                            date: new Date(cursor),
                            type: fixed.type,
                            recurrenceDay: fixed.recurrenceDay,
                            category: fixed.category,
                            user: fixed.user,
                        }),
                    );
                }
                cursor.setDate(cursor.getDate() + 1);
            }
        }

        const allTransactions = [...normalTransactions, ...generatedFixed].sort(
            (a, b) => b.date.getTime() - a.date.getTime()
        );

        const total = allTransactions.length;
        const paginated = allTransactions.slice((page - 1) * limit, page * limit);

        return {
            data: paginated,
            meta: {
                totalItems: total,
                itemsPerPage: limit,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
            },
        };
    }


    async findAllByRange(userId: number, query: GetRangedTransactionsDto) {
        const { startDate, endDate, page = 1, limit = 10, categoryIds } = query;

        const start = new Date(startDate);
        const end = new Date(endDate);

        const where: FindManyOptions<Transaction>['where'] = {
            user: { id: userId },
            date: Between(start, end),
        };

        if (categoryIds && categoryIds.length > 0) {
            where.category = { id: In(categoryIds) };
        }

        const normalTransactions = await this.transactionsRepository.find({
            where,
            relations: ['category'],
        });

        const fixedExpenses = await this.transactionsRepository.find({
            where: { user: { id: userId }, type: TransactionType.FIXED_EXPENSE },
            relations: ['category'],
        });

        const generatedFixed: Transaction[] = [];

        for (const fixed of fixedExpenses) {
            if ((fixed as any).recurrenceEndDate && new Date((fixed as any).recurrenceEndDate) < start) {
                continue;
            }

            const cursor = new Date(start);
            while (cursor <= end) {
                if (cursor.getDate() === fixed.recurrenceDay) {
                    generatedFixed.push(
                        this.transactionsRepository.create({
                            amount: fixed.amount,
                            description: fixed.description,
                            date: new Date(cursor),
                            type: fixed.type,
                            recurrenceDay: fixed.recurrenceDay,
                            category: fixed.category,
                            user: fixed.user,
                        }),
                    );
                }
                cursor.setDate(cursor.getDate() + 1);
            }
        }

        const allTransactions = [...normalTransactions, ...generatedFixed].sort(
            (a, b) => b.date.getTime() - a.date.getTime()
        );

        const total = allTransactions.length;
        const paginated = allTransactions.slice((page - 1) * limit, page * limit);

        return {
            data: paginated,
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
            where: { id, user: { id: userId } },
        });

        if (!transaction) {
            throw new NotFoundException(`Transação com ID ${id} não encontrada ou não pertence a você.`);
        }

        const updatedTransaction = this.transactionsRepository.merge(transaction, updateTransactionDto);

        if (updateTransactionDto.categoryId) {
            updatedTransaction.category = { id: updateTransactionDto.categoryId } as Category;
        }

        return this.transactionsRepository.save(updatedTransaction);
    }

    async remove(id: number, userId: number): Promise<void> {
        const result = await this.transactionsRepository.delete({ id, user: { id: userId } });

        if (result.affected === 0) {
            throw new NotFoundException(`Transação com ID ${id} não encontrada ou não pertence a você.`);
        }
    }
}
