import Router from "next/router";
import { useCallback, useEffect } from "react";
import { useWallet } from "./useWallet";

export function useUser({
  redirectTo,
  redirectIfFound,
}: {
  redirectTo?: string;
  redirectIfFound?: boolean;
} = {}) {
  const restoreWallet = useWallet((state) => state.restoreWallet);
  const wallet = useWallet((state) => state.wallet);
  const connectionState = useWallet((state) => state.connectionState);

  const redirect = useCallback(() => {
    if (!redirectTo) return;
    if (
      // If redirectTo is set, redirect if the user was not found.
      (redirectTo &&
        !redirectIfFound &&
        connectionState !== "connected to api") ||
      // If redirectIfFound is also set, redirect if the user was found
      (redirectIfFound && connectionState == "connected to api")
    ) {
      Router.push(redirectTo);
    }
  }, [redirectTo, redirectIfFound, wallet]);

  useEffect(() => {
    if (!wallet) {
      restoreWallet().then(redirect);
    }
  }, [redirect]);

  return connectionState === "connected to api" ? wallet : "";
}
