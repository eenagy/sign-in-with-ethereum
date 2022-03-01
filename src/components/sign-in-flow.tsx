import { useCallback } from "react";
import { useWallet } from "../hooks/useWallet";

const SignInFlow = () => {
  const connectWallet = useWallet((state) => state.connectWallet);
  const signInWithEthereum = useWallet((state) => state.signInWithEthereum);
  const errorMessage = useWallet((state) => state.errorMessage);
  const connectionState = useWallet((state) => state.connectionState);

  const onSubmit = useCallback(() => {
    connectWallet().then(signInWithEthereum);
  }, [connectWallet, signInWithEthereum]);

  return (
    <div>
      <div className="submit">
        <button type="submit" onClick={onSubmit}>
          {connectionState === "disconnected" && "Sign in with Ethereum"}
          {connectionState === "connecting to wallet" && "Signing in with Ethereum..."}
          {connectionState === "connected to wallet" && "Signing in with Ethereum..."}
          {connectionState === "connecting to api" && "Signing in with Ethereum..."}
          {connectionState === "connected to api" && "Signed in"}
        </button>
      </div>

      {errorMessage && <p className="error">{errorMessage}</p>}

      <style jsx>{`
        form,
        .submit {
          display: flex;
          justify-content: center;
          align-items: center;
          justify-content: space-between;
        }
        .submit > a {
          text-decoration: none;
        }
        .submit > button {
          padding: 0.5rem 1rem;
          cursor: pointer;
          background: #fff;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .submit > button:hover {
          border-color: #888;
        }
        .error {
          color: brown;
          margin: 1rem 0 0;
        }
      `}</style>
    </div>
  );
};

export default SignInFlow;
