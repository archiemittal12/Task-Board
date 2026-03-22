const checkGlobalAdmin = async (req, res, next) => {
  if (req.user?.globalRole !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Global Admin access required',
    });
  }
  next();
};

module.exports = { checkGlobalAdmin };
