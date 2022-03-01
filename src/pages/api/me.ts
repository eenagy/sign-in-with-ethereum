import { withIronSession } from "next-iron-session";

async function getPersonalInformatin(req, res) {
  const siwe = req.session.get('siwe')
  if (!siwe) {
    res.status(401).json({ message: "You have to first sign_in" });
    return;
  }
  console.log("User is authenticated!");
  res.setHeader("Content-Type", "text/plain");
  res.send(
    `You are authenticated and your address is: ${req.session.siwe.address}`
  );
}

export default withIronSession(getPersonalInformatin, {
  cookieName: "siwe",
  password: process.env.TOKEN_SECRET,
  // if your localhost is served on http:// then disable the secure flag
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
});
