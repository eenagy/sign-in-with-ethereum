import { ethers } from "ethers";
import { SiweMessage } from "siwe";
import create from "zustand";

type ConnectionState =
  | "disconnected"
  | "connecting to wallet"
  | "connected to wallet"
  | "connecting to api"
  | "connected to api";

type State = {
  wallet: string;
  connectionState: ConnectionState;
  errorMessage:
    | "rejected wallet connect"
    | "rejected message sign"
    | "Already processing eth_requestAccounts. Please wait."
    | "";
};

type Updaters = {
  // connects to wallet
  connectWallet: () => Promise<void>;
  // signs ethereum message
  signInWithEthereum: () => Promise<void>;
  // if localstorage has a wallet, set it
  restoreWallet: () => Promise<void>;
};

async function createSiweMessage(address, statement) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/nonce`, {
    credentials: "include",
  });
  const message = new SiweMessage({
    domain: window.location.host,
    address,
    statement,
    uri: origin,
    version: "1",
    chainId: 1,
    nonce: await res.text(),
  });
  return message.prepareMessage();
}
const connectWallet = (set) => async () => {
  // @ts-ignore
  const provider = new ethers.providers.Web3Provider(window?.ethereum);
  set({ wallet: "", connectionState: "connecting to wallet" });
  await provider
    .send("eth_requestAccounts", [])
    .then((accounts) => {
      set({ wallet: accounts[0], connectionState: "connected to wallet" });
    })
    .catch(({ code }) => {
      if (code.toString() === "-32002") {
        set({
          wallet: "",
          connectionState: "connecting to wallet",
          errorMessage: "Already processing eth_requestAccounts. Please wait.",
        });
      } else {
        set({
          wallet: "",
          connectionState: "disconnected",
          errorMessage: "rejected wallet connect",
        });
      }
    });
};
export const useWallet = create<State & Updaters>((set, get) => ({
  connectionState: "disconnected",
  wallet: "",
  errorMessage: "",
  connectWallet: connectWallet(set),
  signInWithEthereum: async () => {
    const wallet = get().wallet;
    // if wallet is not connected do nothing
    if (!wallet) return;
    // @ts-ignore
    const provider = new ethers.providers.Web3Provider(window?.ethereum);
    const signer = provider.getSigner();
    const message = await createSiweMessage(
      await signer.getAddress(),
      "Sign in with Ethereum to the app."
    );
    const signature = await signer.signMessage(message);

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, signature }),
      credentials: "include",
    })
      .then(async (res) => {
        const text = await res.text();
        set({
          wallet: wallet,
          errorMessage: "",
          connectionState: "connected to api",
        });
      })
      .catch(() => {
        set({
          wallet: "",
          errorMessage: "rejected message sign",
          connectionState: "connected to wallet",
        });
      });
  },
  restoreWallet: async () => {
    if (window) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })
      const loggedIn = res.status !== 401;
      if (loggedIn) {
        await connectWallet(set)();
        const wallet = get().wallet;
        if (wallet) {
          // if connected and token valid reset state
          set({
            wallet: wallet,
            errorMessage: "",
            connectionState: "connected to api",
          });
        } else {
          // if disconnected from wallet, 
          // reset all state as that means the user disconnected manually
          set({
            wallet: "",
            errorMessage: "",
            connectionState: "disconnected",
          });
        }
      }
    }
  },
}));
