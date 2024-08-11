import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider, SignedIn, SignedOut, SignIn, UserButton } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "My Chatbot",
  description: "Ayesha Ejaz",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <header className="flex justify-between items-center p-4">
            <UserButton showName />
          </header>
          <main className="flex flex-col items-center justify-center min-h-screen">
            
            <SignedOut>
              <div className="flex justify-center w-full">
                <SignIn routing="hash" />
              </div>
            </SignedOut>
            <SignedIn>
              {children}
            </SignedIn>
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
