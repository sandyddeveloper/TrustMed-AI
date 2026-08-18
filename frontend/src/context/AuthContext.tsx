"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { connectWallet, getWeb3Provider } from "@/lib/web3";

export type PractitionerRole = "Chief Medical Officer" | "Clinical Radiologist" | "Cardiologist" | "AI Safety Auditor";

export interface PractitionerUser {
  address: string;
  role: PractitionerRole;
  licenseNumber: string;
  institution: string;
  authSignature: string;
  issuedAt: string;
}

interface AuthContextType {
  user: PractitionerUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithWeb3: (role: PractitionerRole, licenseNumber: string, institution: string) => Promise<PractitionerUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  loginWithWeb3: async () => {
    throw new Error("AuthProvider not initialized");
  },
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PractitionerUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check saved session in localStorage
    const saved = localStorage.getItem("trustmed_practitioner_session");
    if (saved) {
      try {
        const parsed: PractitionerUser = JSON.parse(saved);
        setUser(parsed);
      } catch {
        localStorage.removeItem("trustmed_practitioner_session");
      }
    }
    setIsLoading(false);
  }, []);

  const loginWithWeb3 = async (
    role: PractitionerRole,
    licenseNumber: string,
    institution: string
  ): Promise<PractitionerUser> => {
    setIsLoading(true);
    try {
      // 1. Connect Ethereum wallet
      const { address } = await connectWallet();

      // 2. Request EIP-712 / Personal SIWE challenge signature from the connected wallet
      const provider = await getWeb3Provider();
      if (!provider) {
        throw new Error("No Web3 provider found.");
      }

      const signer = await provider.getSigner();
      const nonce = Math.random().toString(36).substring(2, 15);
      const timestamp = new Date().toISOString();

      const challengeMessage = 
`TrustMed-AI Decoupled Clinical Authentication Challenge
======================================================
Sign this cryptographic message to authenticate your clinical practitioner credentials into the SecRE-XAI CDSS.

Practitioner Address: ${address}
Clinical Role: ${role}
License Identifier: ${licenseNumber}
Institution: ${institution}
Nonce: 0x${nonce}
Issued At: ${timestamp}
Standard: IEEE Access SecRE-XAI Verified`;

      let signature = "";
      try {
        signature = await signer.signMessage(challengeMessage);
      } catch (err: unknown) {
        throw new Error(`Signature request rejected: ${(err as Error).message || "User cancelled signature."}`);
      }

      const authenticatedPractitioner: PractitionerUser = {
        address,
        role,
        licenseNumber,
        institution,
        authSignature: signature,
        issuedAt: timestamp,
      };

      setUser(authenticatedPractitioner);
      localStorage.setItem("trustmed_practitioner_session", JSON.stringify(authenticatedPractitioner));
      return authenticatedPractitioner;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("trustmed_practitioner_session");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginWithWeb3,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
