import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, FindManyOptions, Repository } from 'typeorm';
import { Transaction, TransactionType } from '../transactions/entities/transaction.entity';

@Injectable()
export class BalanceService {
    constructor(
        @InjectRepository(Transaction)
        private transactionsRepository: Repository<Transaction>,
    ) { }

    async calculateBalance(
        userId: number,
        year: number,
        month: number,
        categoryIds?: number[]
    ) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const whereClause: FindManyOptions<Transaction>['where'] = {
            user: { id: userId },
            date: Between(startDate, endDate),
        };

        if (categoryIds && categoryIds.length > 0) {
            whereClause.category = { id: In(categoryIds) };
        }

        const transactions = await this.transactionsRepository.find({
            where: whereClause,
            relations: ['category'],
        });

        const fixedExpenses = await this.transactionsRepository.find({
            where: { user: { id: userId }, type: TransactionType.FIXED_EXPENSE },
        });

        let totalIncome = 0;
        let totalExpense = 0;
        transactions.forEach(t => {
            if (t.type === TransactionType.INCOME) {
                totalIncome += Number(t.amount);
            } else if (t.type === TransactionType.EXPENSE || t.type === TransactionType.FIXED_EXPENSE) {
                totalExpense += Number(t.amount);
            }
        });

        fixedExpenses.forEach(t => {
            const endDateObj = t.recurrenceEndDate ? new Date(t.recurrenceEndDate) : null;

            if (endDateObj && endDateObj < startDate) return;

            const cursor = new Date(startDate);
            while (cursor <= endDate) {
                if (cursor.getDate() === t.recurrenceDay) {
                    const exists = transactions.some(tr =>
                        tr.type === TransactionType.FIXED_EXPENSE &&
                        tr.recurrenceDay === t.recurrenceDay &&
                        new Date(tr.date).getTime() === cursor.getTime()
                    );
                    if (!exists) {
                        totalExpense += Number(t.amount);
                    }
                }
                cursor.setDate(cursor.getDate() + 1);
            }
        });





        const balance = totalIncome - totalExpense;

        return {
            filter: { year, month, categoryIds: categoryIds || 'all' },
            totalIncome,
            totalExpense,
            balance,
        };
    }

    async calculateBalanceByDateRange(
        userId: number,
        startDate: string,
        endDate: string,
        categoryIds?: number[]
    ) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const whereClause: FindManyOptions<Transaction>['where'] = {
            user: { id: userId },
            date: Between(start, end),
        };

        if (categoryIds && categoryIds.length > 0) {
            whereClause.category = { id: In(categoryIds) };
        }

        const transactions = await this.transactionsRepository.find({
            where: whereClause,
            relations: ['category'],
        });

        const fixedExpenses = await this.transactionsRepository.find({
            where: { user: { id: userId }, type: TransactionType.FIXED_EXPENSE },
            relations: ['category'],
        });

        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach(t => {
            if (t.type === TransactionType.INCOME) {
                totalIncome += Number(t.amount);
            } else if (t.type === TransactionType.EXPENSE || t.type === TransactionType.FIXED_EXPENSE) {
                totalExpense += Number(t.amount);
            }
        });

        fixedExpenses.forEach(t => {
            const endDateObj = t.recurrenceEndDate ? new Date(t.recurrenceEndDate) : null;

            if (endDateObj && endDateObj < start) return;

            const cursor = new Date(start);
            while (cursor <= end) {
                if (cursor.getDate() === t.recurrenceDay) {
                    const exists = transactions.some(tr =>
                        tr.type === TransactionType.FIXED_EXPENSE &&
                        tr.recurrenceDay === t.recurrenceDay &&
                        new Date(tr.date).getTime() === cursor.getTime()
                    );
                    if (!exists) {
                        if (!endDateObj || cursor <= endDateObj) {
                            totalExpense += Number(t.amount);
                        }
                    }
                }
                cursor.setDate(cursor.getDate() + 1);
            }
        });

        const balance = totalIncome - totalExpense;

        return {
            startDate,
            endDate,
            categoryIds: categoryIds || 'all',
            totalIncome,
            totalExpense,
            balance,
        };
    }



}
