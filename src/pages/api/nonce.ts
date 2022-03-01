import { withIronSession } from "next-iron-session";
import { generateNonce } from "siwe";

async function nonce(req, res) {
  const nonce = generateNonce();
  req.session.set("nonce", nonce);
  await req.session.save();
  res.setHeader("Content-Type", "text/plain");
  res.status(200).send(nonce);
}

export default withIronSession(nonce, {
  cookieName: "siwe",
  password: process.env.TOKEN_SECRET,
  // if your localhost is served on http:// then disable the secure flag
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
});
