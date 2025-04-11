export const getPermission = (user, module) => {
  if (user?.role === 'admin') return true;

  const routeWithoutSlash = module.replace(/^\/+/, '');
  return user?.modules?.some((mod) => {
    const normalizedMod = mod.replace(/_+$/, ""); 
    return mod.endsWith("_") 
      ? routeWithoutSlash.startsWith(normalizedMod)
      : routeWithoutSlash === normalizedMod;       
  });
};


export const formatBalance = (balance) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PKR',
  }).format(balance);
};
