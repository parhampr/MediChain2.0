export const logAllIncomingRoutes = (req, _, next) => {
  console.log(`\x1b[33m${req.originalUrl} [${req.protocol}:${req.method}] \x1b[0m`);
  next();
};
