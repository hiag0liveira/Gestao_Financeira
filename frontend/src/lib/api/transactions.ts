import apiClient from './axios';

enum TransactionType {
    INCOME = 'income',
    EXPENSE = 'expense',
    FIXED_EXPENSE = 'fixed-expense',
}

interface CreateTransactionData {
    description: string;
    amount: number;
    date: string;
    type: TransactionType;
    categoryId: number;
    recurrenceDay?: number;
}

interface MonthlyTransactionParams {
    year: number;
    month: number;
    page?: number;
    limit?: number;
    categoryIds?: number[];
}


export const createTransaction = (data: CreateTransactionData) => {
    return apiClient.post('/transactions', data);
};


export const getMonthlyTransactions = (params: MonthlyTransactionParams) => {
    return apiClient.get('/transactions', { params });
};


export const deleteTransaction = (id: number) => {
    return apiClient.delete(`/transactions/${id}`);
};
