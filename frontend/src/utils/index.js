export const getPermission = (user, module) => {
  return user?.role === 'admin' || user?.modules?.includes(module);
};
