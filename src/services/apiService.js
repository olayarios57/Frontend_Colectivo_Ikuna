// src/services/apiService.js
import clientAxios from '../config/axios';

export const apiService = {
    // --- AUTH REAL ---
    login: async (credentials) => {
        // Envía username y password a tu endpoint de Spring Boot
        const response = await clientAxios.post('/admin/login', credentials);
        return response.data;
    },
    register: async (userData) => {
        const response = await clientAxios.post('/admin/users/register', userData);
        return response.data;
    },

    // --- PROYECTOS ---
    getPortfolio: async () => {
        const response = await clientAxios.get('/ikuna/portfolio');
        return response.data;
    },
    createProject: async (projectData) => {
        // Asegúrate de que projectData use los nombres: title, category, status, executionDate...
        const response = await clientAxios.post('/ikuna/projects', projectData);
        return response.data;
    },
    updateProject: async (id, projectData) => {
        const response = await clientAxios.put(`/ikuna/projects/${id}`, projectData);
        return response.data;
    },

    // --- GESTIÓN DE USUARIOS ---
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
    createBudget: async (budgetData) => {
        const response = await clientAxios.post('/budgets/budgets', budgetData);
        return response.data;
    },

    // --- ACCIONES DE ADMINISTRADOR ---
    disableUser: async (id) => {
        const response = await clientAxios.patch(`/admin/users/${id}/disable`);
        return response.data;
    },
    enableUser: async (id) => {
        const response = await clientAxios.patch(`/admin/users/${id}/enable`);
        return response.data;
    },
    deleteUser: async (id) => {
        const response = await clientAxios.delete(`/admin/users/${id}`);
        return response.data;
    },

    // --- PERFIL ---
    updateProfile: async (id, profileData) => {
        const response = await clientAxios.put(`/admin/users/${id}/profile`, profileData);
        return response.data;
    },
    changePassword: async (id, passwordData) => {
        const response = await clientAxios.put(`/admin/users/${id}/password`, passwordData);
        return response.data;
    }
};