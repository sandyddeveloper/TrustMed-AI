"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signupUser,
  loginUser,
  logoutUser,
  fetchCurrentUser,
  UserSignupRequest,
  UserResponse,
} from "@/lib/api";
import { connectWallet, getWeb3Provider } from "@/lib/web3";

export type PractitionerRole =
  | "Chief Medical Officer"
  | "Endocrinologist"
  | "Cardiologist"
  | "Attending Physician"
  | "Clinical Radiologist"
  | "Clinical AI Auditor";

export interface PractitionerUser {
  id?: number;
  address: string;
  role: PractitionerRole | string;
  licenseNumber: string;
  institution: string;
  email?: string;
  phone_number?: string;
  patient_id?: string;
  record_number?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  age?: number;
  gender?: string;
  npi_number?: string;
  wallet_address?: string;
  authSignature?: string;
  issuedAt: string;
}

interface AuthContextType {
  user: PractitionerUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithCredentials: (phoneNumber: string, password: string) => Promise<PractitionerUser>;
  signupWithCredentials: (payload: UserSignupRequest) => Promise<PractitionerUser>;
  loginWithWeb3: (role: PractitionerRole, licenseNumber: string, institution: string) => Promise<PractitionerUser>;
  loginWithDemo: () => Promise<PractitionerUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  loginWithCredentials: async () => {
    throw new Error("AuthProvider not initialized");
  },
  signupWithCredentials: async () => {
    throw new Error("AuthProvider not initialized");
  },
  loginWithWeb3: async () => {
    throw new Error("AuthProvider not initialized");
  },
  loginWithDemo: async () => {
    throw new Error("AuthProvider not initialized");
  },
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PractitionerUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Check saved session
    const saved = localStorage.getItem("trustmed_practitioner_session");
    const token = localStorage.getItem("trustmed_jwt_token");

    if (saved) {
      try {
        const parsed: PractitionerUser = JSON.parse(saved);
        setUser(parsed);
      } catch {
        localStorage.removeItem("trustmed_practitioner_session");
      }
    }

    // 2. Validate token against backend if available
    if (token) {
      fetchCurrentUser()
        .then((res: UserResponse) => {
          const updatedUser: PractitionerUser = {
            id: res.id,
            address: res.wallet_address || "0x71C84010a3b08803450942475E2582775a6fA6f1",
            role: res.role as PractitionerRole,
            licenseNumber: res.npi_number || res.patient_id || "1487290145",
            institution: res.address || "TrustMed Health System",
            email: res.email,
            phone_number: res.phone_number,
            patient_id: res.patient_id,
            record_number: res.record_number,
            first_name: res.first_name,
            last_name: res.last_name,
            full_name: res.full_name || `${res.first_name || ""} ${res.last_name || ""}`.trim(),
            age: res.age,
            gender: res.gender,
            npi_number: res.npi_number,
            wallet_address: res.wallet_address,
            issuedAt: new Date().toISOString(),
          };
          setUser(updatedUser);
          localStorage.setItem("trustmed_practitioner_session", JSON.stringify(updatedUser));
        })
        .catch(async () => {
          // If access token is expired, attempt auto-refresh using the 20-day refresh token
          try {
            const { refreshAccessToken } = await import("@/lib/api");
            const ref = await refreshAccessToken();
            if (ref && ref.user) {
              const u = ref.user;
              const refreshedUser: PractitionerUser = {
                id: u.id,
                address: u.wallet_address || "0x71C84010a3b08803450942475E2582775a6fA6f1",
                role: u.role as PractitionerRole,
                licenseNumber: u.npi_number || u.patient_id || "1487290145",
                institution: u.address || "TrustMed Health System",
                email: u.email,
                phone_number: u.phone_number,
                patient_id: u.patient_id,
                record_number: u.record_number,
                first_name: u.first_name,
                last_name: u.last_name,
                full_name: u.full_name || `${u.first_name || ""} ${u.last_name || ""}`.trim(),
                age: u.age,
                gender: u.gender,
                npi_number: u.npi_number,
                wallet_address: u.wallet_address,
                issuedAt: new Date().toISOString(),
              };
              setUser(refreshedUser);
              localStorage.setItem("trustmed_practitioner_session", JSON.stringify(refreshedUser));
            }
          } catch {
            // Refresh token expired, session cleared
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const setAuthSession = (
    token: string,
    practitionerUser: PractitionerUser,
    refreshToken?: string
  ) => {
    localStorage.setItem("trustmed_jwt_token", token);
    if (refreshToken) {
      localStorage.setItem("trustmed_refresh_token", refreshToken);
      document.cookie = `trustmed_refresh_token=${refreshToken}; path=/; max-age=1728000; SameSite=Lax`;
    }
    localStorage.setItem("trustmed_practitioner_session", JSON.stringify(practitionerUser));
    document.cookie = `trustmed_access_token=${token}; path=/; max-age=3600; SameSite=Lax`;
    setUser(practitionerUser);
  };

  const loginWithCredentials = async (
    phoneNumber: string,
    password: string
  ): Promise<PractitionerUser> => {
    setIsLoading(true);
    try {
      const res = await loginUser({ phone_number: phoneNumber, password });
      const u = res.user;
      const practitionerUser: PractitionerUser = {
        id: u.id,
        address: u.wallet_address || "0x71C84010a3b08803450942475E2582775a6fA6f1",
        role: (u.role as PractitionerRole) || "Patient",
        licenseNumber: u.npi_number || u.patient_id || "1487290145",
        institution: u.address || "TrustMed Clinical Health System",
        email: u.email,
        phone_number: u.phone_number,
        patient_id: u.patient_id,
        record_number: u.record_number,
        first_name: u.first_name,
        last_name: u.last_name,
        full_name: u.full_name || `${u.first_name || ""} ${u.last_name || ""}`.trim(),
        age: u.age,
        gender: u.gender,
        npi_number: u.npi_number,
        wallet_address: u.wallet_address,
        issuedAt: new Date().toISOString(),
      };
      setAuthSession(res.access_token, practitionerUser, res.refresh_token);
      return practitionerUser;
    } finally {
      setIsLoading(false);
    }
  };

  const signupWithCredentials = async (
    payload: UserSignupRequest
  ): Promise<PractitionerUser> => {
    setIsLoading(true);
    try {
      const res = await signupUser(payload);
      const u = res.user;
      const practitionerUser: PractitionerUser = {
        id: u.id,
        address: u.wallet_address || "0x71C84010a3b08803450942475E2582775a6fA6f1",
        role: (u.role as PractitionerRole) || payload.role || "Patient",
        licenseNumber: u.npi_number || u.patient_id || "1487290145",
        institution: payload.address || "TrustMed Clinical Health System",
        email: u.email,
        phone_number: u.phone_number,
        patient_id: u.patient_id,
        record_number: u.record_number,
        first_name: u.first_name,
        last_name: u.last_name,
        full_name: u.full_name || `${u.first_name || ""} ${u.last_name || ""}`.trim(),
        age: u.age,
        gender: u.gender,
        npi_number: u.npi_number,
        wallet_address: u.wallet_address,
        issuedAt: new Date().toISOString(),
      };
      setAuthSession(res.access_token, practitionerUser, res.refresh_token);
      return practitionerUser;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithWeb3 = async (
    role: PractitionerRole,
    licenseNumber: string,
    institution: string
  ): Promise<PractitionerUser> => {
    setIsLoading(true);
    try {
      const { address } = await connectWallet();
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
Medical Institution: ${institution}
Challenge Nonce: ${nonce}
Timestamp: ${timestamp}
Standard: IEEE Access SecRE-XAI & HIPAA Tier-1 Compliant
======================================================`;

      const signature = await signer.signMessage(challengeMessage);

      const practitionerUser: PractitionerUser = {
        address,
        role,
        licenseNumber,
        institution,
        patient_id: `PAT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        record_number: `REC-${Math.floor(10000 + Math.random() * 90000)}`,
        authSignature: signature,
        issuedAt: timestamp,
      };

      setAuthSession(`web3-mock-${address.slice(0, 10)}`, practitionerUser);
      return practitionerUser;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithDemo = async (): Promise<PractitionerUser> => {
    setIsLoading(true);
    try {
      const demoUser: PractitionerUser = {
        id: 1,
        address: "0x71C84010a3b08803450942475E2582775a6fA6f1",
        role: "Chief Medical Officer",
        licenseNumber: "NPI-1487290145",
        institution: "TrustMed Clinical Decision Support Center",
        email: "dr.mitchell@trustmed.ai",
        phone_number: "9345693386",
        patient_id: "DOC-2026-01",
        record_number: "NPI-1487290145",
        first_name: "Dr. Sarah",
        last_name: "Mitchell, MD",
        full_name: "Dr. Sarah Mitchell, MD",
        npi_number: "1487290145",
        authSignature: "0x7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a",
        issuedAt: new Date().toISOString(),
      };
      setAuthSession("demo-jwt-token-valid-doctor", demoUser);
      return demoUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // Best effort
    }
    localStorage.removeItem("trustmed_jwt_token");
    localStorage.removeItem("trustmed_practitioner_session");
    document.cookie = "trustmed_access_token=; path=/; max-age=0";
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginWithCredentials,
        signupWithCredentials,
        loginWithWeb3,
        loginWithDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
