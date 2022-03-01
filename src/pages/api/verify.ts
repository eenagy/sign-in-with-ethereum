import { withIronSession } from "next-iron-session";
import { ErrorTypes, SiweMessage } from "siwe";

const verify = async (req, res) => {
  const nonce = req.session.get("nonce");
  try {
    if (!req.body.message) {
      res
        .status(422)
        .json({ message: "Expected prepareMessage object as body." });
      return;
    }

    let message = new SiweMessage(req.body.message);
    const fields = await message.validate(req.body.signature);
    if (fields.nonce !== nonce) {
      console.log(req.session);
      res.status(422).json({
        message: `Invalid nonce.`,
      });
      return;
    }
    req.session.set("siwe", fields)
    await req.session.save();
    res.status(200).end();
  } catch (e) {
    req.session.set("siwe", null)
    req.session.set("nonce", null)
    console.error(e);
    switch (e) {
      case ErrorTypes.EXPIRED_MESSAGE: {
        req.session.save(() => res.status(440).json({ message: e.message }));
        break;
      }
      case ErrorTypes.INVALID_SIGNATURE: {
        req.session.save(() => res.status(422).json({ message: e.message }));
        break;
      }
      default: {
        req.session.save(() => res.status(500).json({ message: e.message }));
        break;
      }
    }
  }
};

export default withIronSession(verify, {
  cookieName: "siwe",
  password: process.env.TOKEN_SECRET,
  // if your localhost is served on http:// then disable the secure flag
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
});
