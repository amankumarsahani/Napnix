// Service-to-service API key auth
// Sets req.user as a synthetic sales_operator so role checks pass
const apiKeyAuth = (req, res, next) => {
  const key = req.headers['x-api-key'];
  if (!key || !process.env.NAPLEAD_API_KEY) return next('route');
  if (key !== process.env.NAPLEAD_API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  req.user = { id: 0, name: 'NapLead Service', role: 'sales_operator', service: true };
  next();
};

module.exports = { apiKeyAuth };
