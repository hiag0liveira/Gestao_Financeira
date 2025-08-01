import apiClient from './axios';

enum TransactionType {
    INCOME = 'income',
    EXPENSE = 'expense',
    FIXED_EXPENSE = 'fixed-expense',
}

interface CreateTransactionData {
    description: string;
    amount: number;
    date: string; // Formato YYYY-MM-DD
    type: TransactionType;
    categoryId: number;
    recurrenceDay?: number;
}

interface RangedTransactionParams {
    startDate: string;
    endDate: string;
    page?: number;
    limit?: number;
    categoryIds?: number[];
}


export const createTransaction = (data: CreateTransactionData) => {
    return apiClient.post('/transactions', data);
};


export const getRangedTransactions = (params: RangedTransactionParams) => {
    return apiClient.get('/transactions/by-range', { params });
};

export const updateTransaction = (id: number, data: Partial<CreateTransactionData>) => {
    return apiClient.patch(`/transactions/${id}`, data);
};


export const deleteTransaction = (id: number) => {
    return apiClient.delete(`/transactions/${id}`);
};
