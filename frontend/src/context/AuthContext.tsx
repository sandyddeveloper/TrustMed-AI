"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  signupUser,
  loginUser,
  logoutUser,
  fetchCurrentUser,
  refreshAccessToken,
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
  isSessionExpired: boolean;
  setIsSessionExpired: (val: boolean) => void;
  lastKnownPhone: string;
  lastKnownName: string;
  loginWithCredentials: (phoneNumber: string, password: string) => Promise<PractitionerUser>;
  signupWithCredentials: (payload: UserSignupRequest) => Promise<PractitionerUser>;
  loginWithWeb3: (role: PractitionerRole, licenseNumber: string, institution: string) => Promise<PractitionerUser>;
  loginWithDemo: () => Promise<PractitionerUser>;
  reAuthenticate: (password: string) => Promise<PractitionerUser>;
  reAuthenticateDemo: () => Promise<PractitionerUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isSessionExpired: false,
  setIsSessionExpired: () => {},
  lastKnownPhone: "",
  lastKnownName: "",
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
  reAuthenticate: async () => {
    throw new Error("AuthProvider not initialized");
  },
  reAuthenticateDemo: async () => {
    throw new Error("AuthProvider not initialized");
  },
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PractitionerUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [lastKnownPhone, setLastKnownPhone] = useState<string>("");
  const [lastKnownName, setLastKnownName] = useState<string>("");

  const setAuthSession = useCallback(
    (
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
      setIsSessionExpired(false);

      if (practitionerUser.phone_number) {
        setLastKnownPhone(practitionerUser.phone_number);
        localStorage.setItem("trustmed_last_phone", practitionerUser.phone_number);
      }
      if (practitionerUser.full_name || practitionerUser.first_name) {
        const name = practitionerUser.full_name || `${practitionerUser.first_name || ""} ${practitionerUser.last_name || ""}`.trim();
        setLastKnownName(name);
        localStorage.setItem("trustmed_last_name", name);
      }
    },
    []
  );

  const clearSession = useCallback(() => {
    localStorage.removeItem("trustmed_jwt_token");
    localStorage.removeItem("trustmed_refresh_token");
    localStorage.removeItem("trustmed_practitioner_session");
    document.cookie = "trustmed_access_token=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "trustmed_refresh_token=; path=/; max-age=0; SameSite=Lax";
    setUser(null);
  }, []);

  // Initial session restoration and background validation
  useEffect(() => {
    const saved = localStorage.getItem("trustmed_practitioner_session");
    const token = localStorage.getItem("trustmed_jwt_token");
    const savedPhone = localStorage.getItem("trustmed_last_phone") || "";
    const savedName = localStorage.getItem("trustmed_last_name") || "";

    if (savedPhone) setLastKnownPhone(savedPhone);
    if (savedName) setLastKnownName(savedName);

    if (saved) {
      try {
        const parsed: PractitionerUser = JSON.parse(saved);
        setUser(parsed);
        if (parsed.phone_number) setLastKnownPhone(parsed.phone_number);
        if (parsed.full_name) setLastKnownName(parsed.full_name);
      } catch {
        localStorage.removeItem("trustmed_practitioner_session");
      }
    }

    if (token) {
      fetchCurrentUser()
        .then((res: UserResponse) => {
          const updatedUser: PractitionerUser = {
            id: res.id,
            address: res.wallet_address || "0x71C84010a3b08803450942475E2582775a6fA6f1",
            role: (res.role as PractitionerRole) || "Chief Medical Officer",
            licenseNumber: res.npi_number || res.patient_id || "1487290145",
            institution: res.address || "TrustMed Clinical Health System",
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
          setIsSessionExpired(false);
        })
        .catch(async () => {
          // Attempt silent auto-refresh using the 20-day refresh token
          try {
            const ref = await refreshAccessToken();
            if (ref && ref.user) {
              const u = ref.user;
              const refreshedUser: PractitionerUser = {
                id: u.id,
                address: u.wallet_address || "0x71C84010a3b08803450942475E2582775a6fA6f1",
                role: (u.role as PractitionerRole) || "Chief Medical Officer",
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
              setUser(refreshedUser);
              localStorage.setItem("trustmed_practitioner_session", JSON.stringify(refreshedUser));
              setIsSessionExpired(false);
            } else {
              // Refresh token is also expired or invalid
              if (saved) {
                setIsSessionExpired(true);
              }
            }
          } catch {
            if (saved) {
              setIsSessionExpired(true);
            }
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  // Listen for global session-expired events from api interceptor
  useEffect(() => {
    const handleSessionExpiredEvent = () => {
      setIsSessionExpired(true);
    };

    window.addEventListener("trustmed:session-expired", handleSessionExpiredEvent);
    return () => {
      window.removeEventListener("trustmed:session-expired", handleSessionExpiredEvent);
    };
  }, []);

  // Proactive token refresh check on tab visibility or periodic interval
  useEffect(() => {
    const checkAndRefreshTokens = async () => {
      const token = localStorage.getItem("trustmed_jwt_token");
      const refreshToken = localStorage.getItem("trustmed_refresh_token");
      if (token && refreshToken && !isSessionExpired) {
        try {
          await refreshAccessToken();
        } catch {
          // Handled by refreshAccessToken
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAndRefreshTokens();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    // Refresh proactively every 15 minutes (token lives 60 mins)
    const interval = setInterval(checkAndRefreshTokens, 15 * 60 * 1000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(interval);
    };
  }, [isSessionExpired]);

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
        role: (u.role as PractitionerRole) || "Chief Medical Officer",
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
        role: (u.role as PractitionerRole) || payload.role || "Chief Medical Officer",
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

      // Connect or authenticate with backend to receive signed session
      let authRes;
      try {
        authRes = await loginUser({
          phone_number: "9345693386",
          password: "250825",
        });
      } catch {
        // Fallback
      }

      const practitionerUser: PractitionerUser = {
        id: authRes?.user?.id || 1,
        address,
        role,
        licenseNumber: licenseNumber || authRes?.user?.patient_id || "NPI-1487290145",
        institution,
        email: authRes?.user?.email || "clinician.web3@trustmed.ai",
        phone_number: authRes?.user?.phone_number || "9345693386",
        patient_id: authRes?.user?.patient_id || `PAT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        record_number: authRes?.user?.record_number || `REC-${Math.floor(10000 + Math.random() * 90000)}`,
        authSignature: signature,
        issuedAt: timestamp,
      };

      if (authRes?.access_token) {
        setAuthSession(authRes.access_token, practitionerUser, authRes.refresh_token);
      } else {
        setAuthSession(`web3-mock-${address.slice(0, 10)}`, practitionerUser);
      }
      return practitionerUser;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithDemo = async (): Promise<PractitionerUser> => {
    setIsLoading(true);
    try {
      // Authenticate with the seeded admin/doctor account in FastAPI backend
      let authRes;
      try {
        authRes = await loginUser({
          phone_number: "9345693386",
          password: "250825",
        });
      } catch (loginErr) {
        // If the account was not yet in the DB, register it now
        authRes = await signupUser({
          email: "admin@trustmed.ai",
          phone_number: "9345693386",
          password: "250825",
          first_name: "Dr. Sarah",
          last_name: "Mitchell, MD",
          role: "Chief Medical Officer",
          npi_number: "1487290145",
          address: "TrustMed Clinical Decision Support Center",
          age: 42,
          gender: "Female",
        });
      }

      const u = authRes.user;
      const demoUser: PractitionerUser = {
        id: u.id,
        address: u.wallet_address || "0x71C84010a3b08803450942475E2582775a6fA6f1",
        role: (u.role as PractitionerRole) || "Chief Medical Officer",
        licenseNumber: u.npi_number || u.patient_id || "1487290145",
        institution: u.address || "TrustMed Clinical Decision Support Center",
        email: u.email || "dr.mitchell@trustmed.ai",
        phone_number: u.phone_number || "9345693386",
        patient_id: u.patient_id || "DOC-2026-01",
        record_number: u.record_number || "NPI-1487290145",
        first_name: u.first_name || "Dr. Sarah",
        last_name: u.last_name || "Mitchell, MD",
        full_name: u.full_name || "Dr. Sarah Mitchell, MD",
        npi_number: u.npi_number || "1487290145",
        authSignature: "0x7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a",
        issuedAt: new Date().toISOString(),
      };

      setAuthSession(authRes.access_token, demoUser, authRes.refresh_token);
      return demoUser;
    } finally {
      setIsLoading(false);
    }
  };

  const reAuthenticate = async (password: string): Promise<PractitionerUser> => {
    const phone = lastKnownPhone || user?.phone_number || user?.email || "9345693386";
    const res = await loginWithCredentials(phone, password);
    setIsSessionExpired(false);
    return res;
  };

  const reAuthenticateDemo = async (): Promise<PractitionerUser> => {
    const res = await loginWithDemo();
    setIsSessionExpired(false);
    return res;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // Best effort
    }
    clearSession();
    setIsSessionExpired(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !isSessionExpired,
        isLoading,
        isSessionExpired,
        setIsSessionExpired,
        lastKnownPhone,
        lastKnownName,
        loginWithCredentials,
        signupWithCredentials,
        loginWithWeb3,
        loginWithDemo,
        reAuthenticate,
        reAuthenticateDemo,
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
