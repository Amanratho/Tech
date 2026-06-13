/**
 * verifyCronSecret — Express middleware
 *
 * Validates that incoming requests to the cron endpoint carry the
 * correct secret token. The token is read from the CRON_SECRET
 * environment variable and can be supplied by the caller in either:
 *
 *   1. The `Authorization` header  → "Bearer <token>"
 *   2. The query string            → ?secret=<token>
 *
 * If the token is missing or invalid the request is rejected with 401.
 */
const verifyCronSecret = (req, res, next) => {
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret) {
    console.error(
      "❌ [Security] CRON_SECRET is not set in environment variables. " +
        "Cron endpoint is disabled until it is configured."
    );
    return res.status(500).json({
      success: false,
      message: "Server misconfiguration — CRON_SECRET is not set.",
    });
  }

  // Extract token from Authorization header or query param
  let token = null;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  }

  if (!token) {
    token = req.query.secret;
  }

  if (!token || token !== expectedSecret) {
    console.warn(
      `⚠️  [Security] Unauthorized cron request from IP: ${req.ip}`
    );
    return res.status(401).json({
      success: false,
      message: "Unauthorized — invalid or missing cron secret.",
    });
  }

  next();
};

module.exports = { verifyCronSecret };
