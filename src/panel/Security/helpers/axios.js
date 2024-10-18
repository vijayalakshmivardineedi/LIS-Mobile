import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
const ImagebaseURL = 'https://livinsync.onrender.com';
const baseURL = 'https://livinsync.onrender.com/api';

const axiosInstance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

const Api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

const getAuthToken = () => {
    const token = AsyncStorage.getItem('token');
    return token ? `Bearer ${token}` : '';
};

axiosInstance.interceptors.request.use(
    config => {
        config.headers.Authorization = getAuthToken();
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
export { Api };
export { baseURL, ImagebaseURL };