import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TrustMed-AI | Patient-First Explainable AI & Clinical Health Intelligence",
  description:
    "Empowering patients to understand their health reports in crystal-clear plain English with clinical-grade Explainable AI (SHAP & LIME), ADA/AHA biomarker matrices, and cryptographic security.",
  keywords: ["Healthcare AI", "Patient Portal", "Explainable AI", "SHAP", "LIME", "Google Gemini", "Web3", "Blockchain", "FastAPI", "Next.js"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable} light`} suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased selection:bg-emerald-500 selection:text-white dark:selection:text-slate-950">
        <ThemeProvider>
          <AuthProvider>
            <LanguageProvider>{children}</LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
