const isCouponExpired = (expireDate) => {
  const now = new Date(); // Get the current date and time
  const expiry = new Date(expireDate); // Convert expire_date string to Date object
  return now > expiry; // Returns true if expired, false otherwise
};
module.exports = isCouponExpired;
