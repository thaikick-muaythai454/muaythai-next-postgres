"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { isValidReferralCodeFormat } from "@/lib/utils/affiliate";

const REFERRAL_STORAGE_KEY = "referralCode";

interface ReferralContextValue {
  referralCode: string | null;
  setReferralCode: (code: string | null) => void;
  clearReferralCode: () => void;
}

const ReferralContext = createContext<ReferralContextValue | undefined>(
  undefined
);

function normalizeReferralCode(code: string): string {
  return code.trim().toUpperCase();
}

export function ReferralProvider({ children }: { children: React.ReactNode }) {
  const [referralCode, setReferralCodeState] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedCode = window.sessionStorage.getItem(REFERRAL_STORAGE_KEY);

      if (storedCode && isValidReferralCodeFormat(storedCode)) {
        setReferralCodeState(normalizeReferralCode(storedCode));
      } else if (storedCode) {
        // Clean up invalid value that might have been stored previously
        window.sessionStorage.removeItem(REFERRAL_STORAGE_KEY);
      }
    } catch (error) {
      console.warn("[ReferralProvider] Unable to read referral code:", error);
    }
  }, []);

  const persistReferralCode = useCallback((code: string | null) => {
    if (typeof window === "undefined") return;

    try {
      if (code && isValidReferralCodeFormat(code)) {
        const normalized = normalizeReferralCode(code);
        window.sessionStorage.setItem(REFERRAL_STORAGE_KEY, normalized);
        setReferralCodeState(normalized);
      } else {
        window.sessionStorage.removeItem(REFERRAL_STORAGE_KEY);
        setReferralCodeState(null);
      }
    } catch (error) {
      console.warn("[ReferralProvider] Unable to persist referral code:", error);
      setReferralCodeState(code);
    }
  }, []);

  const api = useMemo<ReferralContextValue>(
    () => ({
      referralCode,
      setReferralCode: (code: string | null) => {
        persistReferralCode(code);
      },
      clearReferralCode: () => {
        persistReferralCode(null);
      },
    }),
    [persistReferralCode, referralCode]
  );

  return (
    <ReferralContext.Provider value={api}>
      {children}
    </ReferralContext.Provider>
  );
}

export function useReferralCode() {
  const context = useContext(ReferralContext);

  if (!context) {
    throw new Error(
      "useReferralCode must be used within a ReferralProvider"
    );
  }

  return context;
}

