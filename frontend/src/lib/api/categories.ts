import apiClient from './axios';

interface CategoryData {
    name: string;
}


export const createCategory = async (data: CategoryData) => {
    const response = await apiClient.post('/categories', data);
    return response.data;
};



export const getCategories = () => {
    return apiClient.get('/categories');
};


export const updateCategory = (id: number, data: CategoryData) => {
    return apiClient.patch(`/categories/${id}`, data);
};



export const deleteCategory = (id: number) => {
    return apiClient.delete(`/categories/${id}`);
};
