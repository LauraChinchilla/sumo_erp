function formatNumber(value, decimals = 2) {
  if (value == null || isNaN(value)) return '0.00';
  return parseFloat(value).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}


export default formatNumber