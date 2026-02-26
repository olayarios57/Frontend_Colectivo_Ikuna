// src/services/apiService.js
import clientAxios from '../config/axios';

export const apiService = {
    // --- AUTH ---
    login: async (credentials) => {
        const response = await clientAxios.post('/admin/login', credentials);
        return response.data;
    },
    register: async (userData) => {
        const response = await clientAxios.post('/admin/users/register', userData);
        return response.data;
    },

    // --- PROYECTOS (PÚBLICO Y ADMIN) ---
    getPortfolio: async () => {
        const response = await clientAxios.get('/ikuna/portfolio');
        return response.data;
    },
    createProject: async (projectData) => {
        const response = await clientAxios.post('/ikuna/projects', projectData);
        return response.data;
    },
    updateProject: async (id, projectData) => {
        const response = await clientAxios.put(`/ikuna/projects/${id}`, projectData);
        return response.data;
    },

    // --- USUARIOS (ADMIN) ---
    getPendingUsers: async () => {
        const response = await clientAxios.get('/admin/users/pending');
        return response.data;
    },
    getActiveUsers: async () => {
        const response = await clientAxios.get('/admin/users/active');
        return response.data;
    },
    approveUser: async (id) => {
        const response = await clientAxios.patch(`/admin/users/${id}/approve`);
        return response.data;
    },
    rejectUser: async (id) => {
        await clientAxios.delete(`/admin/users/${id}/reject`);
        return id;
    },

    // --- PRESUPUESTOS ---
    getBudgetsByProject: async (projectId) => {
        const response = await clientAxios.get(`/budgets/project/${projectId}`);
        return response.data;
    },
    // 👇 AGREGA ESTA NUEVA FUNCIÓN 👇
    createBudget: async (budgetData) => {
        const response = await clientAxios.post('/budgets/budgets', budgetData);
        return response.data;
    }
};