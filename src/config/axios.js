import axios from 'axios';

const clientAxios = axios.create({
    baseURL: 'http://localhost:8080/api', // Tu backend Spring Boot
    headers: {
        'Content-Type': 'application/json'
    }
});

export default clientAxios;