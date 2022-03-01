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

  const redirect = useCallback(() => {
    if (!redirectTo) return;
    if (
      // If redirectTo is set, redirect if the user was not found.
      (redirectTo && !redirectIfFound && !wallet) ||
      // If redirectIfFound is also set, redirect if the user was found
      (redirectIfFound && wallet)
    ) {
      Router.push(redirectTo);
    }
  }, [redirectTo, redirectIfFound, wallet]);

  useEffect(() => {
    if (!wallet) {
      restoreWallet().then(redirect);
    }
  }, [redirect]);

  return wallet;
}
