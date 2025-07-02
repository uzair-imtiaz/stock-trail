export const getPermission = (user, module) => {
  if (user?.role === 'admin') return true;

  const routeWithoutSlash = module.replace(/^\/+/, '');
  return user?.modules?.some((mod) => {
    const normalizedMod = mod.replace(/_+$/, '');
    return mod.endsWith('_')
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

export function objectToQueryString(params) {
  const query = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join('&');

  return query ? `?${query}` : '';
}
