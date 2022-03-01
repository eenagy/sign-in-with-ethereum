import { withIronSession } from "next-iron-session";

const logout = (req, res) => {
  req.session.destroy();
  res.writeHead(302, { Location: "/" });
  res.end();
};

export default withIronSession(logout, {
  cookieName: "siwe",
  password: process.env.TOKEN_SECRET,
  // if your localhost is served on http:// then disable the secure flag
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
});
