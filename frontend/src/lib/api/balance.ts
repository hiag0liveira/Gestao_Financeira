import apiClient from './axios';

interface BalanceByDateRangeParams {
    startDate: string;
    endDate: string;
    categoryIds?: number[];
}

interface MonthlyBalanceParams {
    year: number;
    month: number;
    categoryIds?: number[];
}


export const getBalanceByDateRange = (params: BalanceByDateRangeParams) => {
    return apiClient.get('/balance/by-range', { params });
};


export const getMonthlyBalance = (params: MonthlyBalanceParams) => {
    return apiClient.get('/balance', { params });
};
