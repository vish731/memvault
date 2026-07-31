"use client";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";

export default function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <AptosWalletAdapterProvider
      dappConfig={{ network: Network.SHELBYNET }}
      optInWallets={["Petra", "OKX Wallet"]}
      autoConnect
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}
