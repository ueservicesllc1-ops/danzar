import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "DanZar - Academia de Danza",
  description: "Tu academia de danza donde la pasión se convierte en arte. Clases para todos los niveles y estilos.",
  keywords: ["danza", "academia", "clases", "bailar", "arte", "música"],
  authors: [{ name: "DanZar" }],
  openGraph: {
    title: "DanZar - Academia de Danza",
    description: "Tu academia de danza donde la pasión se convierte en arte",
    type: "website",
    locale: "es_ES",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} ${poppins.variable} antialiased bg-white text-gray-900 min-h-screen`}
      >
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 pt-12">
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
