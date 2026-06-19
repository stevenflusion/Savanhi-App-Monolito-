import { Redirect } from "expo-router"
import { useAuth } from "@/src/components/AuthProvider"
import LoadingScreen from "@/src/components/LoadingScreen"

export default function IndexScreen() {
  const { isLoggedIn, isLoading } = useAuth()

  if (isLoading) return <LoadingScreen />
  return (
    <Redirect
      href={(isLoggedIn ? "/(tabs)" : "/auth/welcome") as never}
    />
  )
}
