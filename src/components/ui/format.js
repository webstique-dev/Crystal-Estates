export const formatPrice = (n) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2).replace(/\.?0+$/, '')} Cr`
  return `₹${(n / 100000).toFixed(n % 100000 ? 1 : 0).replace(/\.0$/, '')} Lakh`
}
