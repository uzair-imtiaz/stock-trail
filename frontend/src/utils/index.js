export const getPermission = (user, module) => {
  if (user?.role === 'admin') return true;

  return user?.modules?.some((mod) => {
    const normalizedMod = mod.replace(/_+$/, ""); 
    return mod.endsWith("_") 
      ? module.startsWith(normalizedMod)
      : module === normalizedMod;       
  });
};


export const formatBalance = (balance) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PKR',
  }).format(balance);
};
