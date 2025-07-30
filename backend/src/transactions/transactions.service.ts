import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindManyOptions, In, Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
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
            date: Between(firstDay, lastDay)
        };

        if (categoryIds && categoryIds.length > 0) {
            where.category = { id: In(categoryIds) };
        }

        return this.findAndPaginate(userId, { where }, page, limit);
    }

    async findAllByRange(userId: number, query: GetRangedTransactionsDto) {
        const { startDate, endDate, page = 1, limit = 10, categoryIds } = query;

        const where: FindManyOptions<Transaction>['where'] = {
            date: Between(new Date(startDate), new Date(endDate))
        };

        if (categoryIds && categoryIds.length > 0) {
            where.category = { id: In(categoryIds) };
        }

        return this.findAndPaginate(userId, { where }, page, limit);
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
