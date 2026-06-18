import { Redirect } from "expo-router";
import { useAuth } from "@/src/components/AuthProvider";

export default function IndexScreen() {
  const { isLoggedIn } = useAuth();
  return <Redirect href={(isLoggedIn ? "/(tabs)" : "/auth/welcome") as never} />;
}
