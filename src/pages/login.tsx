//import { useUser } from "../hooks/hooks";
import Layout from "../components/layout";
import SignInFlow from "../components/sign-in-flow";
import { useUser } from "../hooks/useUser";

const Login = () => {
  useUser({ redirectTo: "/", redirectIfFound: true });

  return (
    <Layout>
      <div className="login">
        <SignInFlow />
      </div>
      <style jsx>{`
        .login {
          max-width: 21rem;
          margin: 0 auto;
          padding: 1rem;
          display: flex;
          justify-content: center;
        }
      `}</style>
    </Layout>
  );
};

export default Login;
