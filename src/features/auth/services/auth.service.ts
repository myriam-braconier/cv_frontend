import { api } from '@/services/axios';

interface LoginResponse {
    token: string;
    userId: string;
    username: string;
    email: string;
}

export const authService = {
    async login(email: string, password: string): Promise<LoginResponse> {
        const { data } = await api.post<LoginResponse>('/auth/login', {
            email,
            password,
        });
        return data;
    }
};