import axios from 'axios';

const fetchClient = () => {
  const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000',
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  axiosInstance.interceptors.request.use(function (config) {
    const token = localStorage.getItem('x-access-token');
    config.headers.Authorization = token ? `Bearer ${token}` : '';
    return config;
  });

  return axiosInstance;
};

export default fetchClient();
