import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

type User = {
  name: string
  email: string
  storeName?: string
  address?: string
  latitude?: number
  longitude?: number
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  isLoggedIn: boolean
  requestOTP: (email: string) => Promise<{
    success: boolean
    error?: string
  }>
  verifyOTP: (
    email: string,
    code: string,
  ) => Promise<{
    success: boolean
    isNewUser?: boolean
    error?: string
  }>
  completeProfile: (data: {
    name: string
    storeName: string
  }) => Promise<{
    success: boolean
    error?: string
  }>
  saveLocation: (data: {
    address: string
    latitude: number
    longitude: number
  }) => Promise<{
    success: boolean
    error?: string
  }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Simulate session check on mount
  useEffect(() => {
    const init = async () => {
      setIsLoading(true)
      await delay(1500)
      // Mock: no persisted session
      setUser(null)
      setIsLoading(false)
    }
    init()
  }, [])

  const requestOTP = async (_email: string) => {
    await delay(1500)
    return { success: true }
  }

  const verifyOTP = async (email: string, code: string) => {
    await delay(1500)
    if (code === "123456") {
      setUser({
        name: email === "demo@test.com" ? "Demo" : "",
        email,
      })
      return { success: true, isNewUser: email !== "demo@test.com" }
    }
    return { success: false, error: "Código incorrecto" }
  }

  const completeProfile = async (data: {
    name: string
    storeName: string
  }) => {
    await delay(1000)
    setUser((prev) => (prev ? { ...prev, ...data } : null))
    return { success: true }
  }

  const saveLocation = async (data: {
    address: string
    latitude: number
    longitude: number
  }) => {
    await delay(800)
    setUser((prev) => (prev ? { ...prev, ...data } : null))
    return { success: true }
  }

  const logout = () => {
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isLoggedIn: user !== null,
      requestOTP,
      verifyOTP,
      completeProfile,
      saveLocation,
      logout,
    }),
    [user, isLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return ctx
}
