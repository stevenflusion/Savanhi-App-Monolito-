import type { AppProps } from "next/app";
import "../styles/globals.css";
import { AuthProvider } from "../src/presentation/components/auth/auth-provider";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
