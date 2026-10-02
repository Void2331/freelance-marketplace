const crypto = require("crypto");

const verifyPaystackSignature = (req) => {
  const signature =
    req.headers["x-paystack-signature"];

  if (!signature || !req.rawBody) {
    return false;
  }

  const secret =
    process.env.PAYSTACK_SECRET_KEY;

  if (!secret) {
    console.error(
      "PAYSTACK_SECRET_KEY is not configured"
    );

    return false;
  }

  const hash = crypto
    .createHmac("sha512", secret)
    .update(req.rawBody)
    .digest("hex");

  const hashBuffer =
    Buffer.from(hash, "utf8");

  const signatureBuffer =
    Buffer.from(signature, "utf8");

  /*
   * timingSafeEqual requires both
   * buffers to have the same length.
   */
  if (
    hashBuffer.length !==
    signatureBuffer.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    hashBuffer,
    signatureBuffer
  );
};

module.exports = {
  verifyPaystackSignature,
};