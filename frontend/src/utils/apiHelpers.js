import axios from 'axios';
import Cookies from 'js-cookie';

const axiosInstance = axios.create({
  // In production, keep existing API URL; in dev, use Vite env or fallback to 5000
  baseURL: import.meta.env.PROD
    ? 'https://api.ds.algobricks.org/api'
    : import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 35000,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    if (response) {
      if (response.status === 401) {
        Cookies.remove('token');
        window.location.href = '/signin';
      }
      return Promise.resolve(response);
    }
    return Promise.reject(error);
  }
);

const _config = {
  headers: {
    'Content-Type': 'application/json',
  },
};

const getCallback = async (url, config = _config) => {
  const response = await axiosInstance.get(url, config);
  return response.data;
};

const postCallback = async (url, data, config = _config) => {
  const response = await axiosInstance.post(url, data, config);
  return response.data;
};

const putCallback = async (url, data, config = _config) => {
  const response = await axiosInstance.put(url, data, config);
  return response.data;
};

const deleteCallback = async (url, config = _config) => {
  const response = await axiosInstance.delete(url, config);
  return response.data;
};

export {
  axiosInstance,
  getCallback,
  postCallback,
  putCallback,
  deleteCallback,
};
