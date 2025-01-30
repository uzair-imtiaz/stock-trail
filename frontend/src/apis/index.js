import {
  postCallback,
  getCallback,
  putCallback,
  deleteCallback,
} from '../utils/apiHelpers';

export const signIn = async (data) => {
  const response = await postCallback('/auth/login', data);
  return response;
};

export const signUp = async (data) => {
  const response = await postCallback('/auth/register', data);
  return response;
};

export const healthCheck = async () => {
  const response = await getCallback('/health-check');
  return response;
};

export const logout = async () => {
  const response = await getCallback('/auth/logout');
  return response;
};

export const getUser = async () => {
  const response = await getCallback(`/auth/me`);
  return response;
};

export const getRoutes = async () => {
  const response = await getCallback('/routes');
  return response;
};

export const createRoute = async (data) => {
  const response = await postCallback('/routes/new', data);
  return response;
};

export const updateRoute = async (id, data) => {
  const response = await putCallback(`/routes/${id}/edit`, data);
  return response;
};

export const deleteRoute = async (id) => {
  const response = await deleteCallback(`/routes/${id}/delete`);
  return response;
};

export const getUsers = async () => {
  const response = await getCallback('/users');
  return response;
};

export const updateUserAccess = async (userId, data) => {
  const response = await putCallback(`/users/${userId}/update-access`, data);
  return response;
};

export const getInventory = async () => {
  const response = await getCallback('/inventory');
  return response;
};

export const createInventory = async (data) => {
  const response = await postCallback('/inventory/new', data);
  return response;
};

export const updateInventory = async (id, data) => {
  const response = await putCallback(`/inventory/${id}/edit`, data);
  return response;
};

export const deleteInventory = async (id) => {
  const response = await deleteCallback(`/inventory/${id}/delete`);
  return response;
};
