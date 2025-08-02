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
            } else if (t.type === TransactionType.EXPENSE) {
                totalExpense += Number(t.amount);
            }
        });

        fixedExpenses.forEach(t => {
            const endDateObj = t.recurrenceEndDate
                ? new Date(t.recurrenceEndDate)
                : null;

            if (endDateObj && endDateObj.getTime() < startDate.getTime()) {
                return;
            }

            const cursor = new Date(startDate);
            while (cursor.getTime() <= endDate.getTime()) {
                if (cursor.getDate() === t.recurrenceDay) {
                    totalExpense += Number(t.amount);
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
        });

        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach(t => {
            if (t.type === TransactionType.INCOME) {
                totalIncome += Number(t.amount);
            } else if (t.type === TransactionType.EXPENSE) {
                totalExpense += Number(t.amount);
            }
        });

        fixedExpenses.forEach(t => {
            const endDateObj = t.recurrenceEndDate
                ? new Date(t.recurrenceEndDate)
                : null;

            if (endDateObj && endDateObj.getTime() < start.getTime()) {
                return;
            }

            const cursor = new Date(start);
            while (cursor.getTime() <= end.getTime()) {
                if (cursor.getDate() === t.recurrenceDay) {
                    totalExpense += Number(t.amount);
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
