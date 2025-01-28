import { postCallback, getCallback } from '../utils/apiHelpers';

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
  const response = await getCallback('/auth/me');
  return response;
};
