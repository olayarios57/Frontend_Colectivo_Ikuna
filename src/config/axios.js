import axios from 'axios';

const URL_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const clientAxios = axios.create({
    baseURL: URL_BASE,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default clientAxios;