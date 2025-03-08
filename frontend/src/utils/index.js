export const getPermission = (user, module) => {
  return user?.role === 'admin' || user?.modules?.includes(module);
};

export const formatBalance = (balance) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PKR',
  }).format(balance);
};
