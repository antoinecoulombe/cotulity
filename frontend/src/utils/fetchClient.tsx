import axios, { AxiosInstance } from 'axios';

const fetchClient = (): AxiosInstance => {
  const axiosInstance = axios.create({
    baseURL: 'http://127.0.0.1:4000',
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('x-access-token');
    config.headers.Authorization = token ? `Bearer ${token}` : '';
    return config;
  });

  return axiosInstance;
};

export default fetchClient();
