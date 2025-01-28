import axios from 'axios';
import { message } from 'antd';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3003/api',
  timeout: 12000,
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
    const { status, data } = error.response || {};
    if (status === 401) {
      window.location.href = '/login';
    } else {
      message.error(data?.message || 'Something went wrong');
    }
    return Promise.reject(error);
  }
);

const getCallback = async (url, config = {}) => {
  const response = await axiosInstance.get(url, config);
  return response.data;
};

const postCallback = async (url, data, config = {}) => {
  const response = await axiosInstance.post(url, data, config);
  return response.data;
};

const putCallback = async (url, data, config = {}) => {
  const response = await axiosInstance.put(url, data, config);
  return response.data;
};

const deleteCallback = async (url, config = {}) => {
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
