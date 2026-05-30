import { Redirect } from "expo-router";
import { useAuth } from "./components/AuthProvider";

export default function IndexScreen() {
  const { isLoggedIn } = useAuth();
  return <Redirect href={(isLoggedIn ? "/(tabs)" : "/auth/login") as never} />;
}
