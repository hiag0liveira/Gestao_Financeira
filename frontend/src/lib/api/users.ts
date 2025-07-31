import apiClient from './axios';

interface LoginData {
    email: string;
    password?: string;
}

interface RegisterData extends LoginData {
    confirmPassword?: string;
}

interface UpdateProfileData {
    email?: string;
    password?: string;
}


export const loginUser = (data: LoginData) => {
    return apiClient.post('/auth/login', data);
};


export const registerUser = (data: RegisterData) => {
    return apiClient.post('/auth/signup', { email: data.email, password: data.password });
};


export const getProfile = () => {
    return apiClient.get('/users/me');
};

export const updateProfile = (data: UpdateProfileData) => {
    return apiClient.patch('/users/me', data);
};
