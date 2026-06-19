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
  cedula?: string
  address?: string
  latitude?: number
  longitude?: number
  photos?: string[]
  paymentMethod?: "efectivo" | "pichincha"
  bankAccountName?: string
  bankAccountNumber?: string
  bankAccountType?: "ahorro" | "corriente"
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
  saveProfile: (data: {
    name: string
    storeName: string
  }) => Promise<{
    success: boolean
    error?: string
  }>
  saveIdentityCard: (cedula: string) => Promise<{
    success: boolean
    error?: string
  }>
  savePhotos: (uris: string[]) => Promise<{
    success: boolean
    error?: string
  }>
  savePaymentMethod: (data: {
    method: string
    bankAccountName?: string
    bankAccountNumber?: string
    bankAccountType?: string
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

  const saveProfile = async (data: { name: string; storeName: string }) => {
    await delay(1000)
    setUser((prev) => (prev ? { ...prev, ...data } : null))
    return { success: true }
  }

  const saveIdentityCard = async (cedula: string) => {
    await delay(800)
    setUser((prev) => (prev ? { ...prev, cedula } : null))
    return { success: true }
  }

  const savePhotos = async (uris: string[]) => {
    await delay(800)
    setUser((prev) => (prev ? { ...prev, photos: uris } : null))
    return { success: true }
  }

  const savePaymentMethod = async (data: {
    method: string
    bankAccountName?: string
    bankAccountNumber?: string
    bankAccountType?: string
  }) => {
    await delay(800)
    setUser((prev) =>
      prev
        ? {
            ...prev,
            paymentMethod: data.method as "efectivo" | "pichincha",
            bankAccountName: data.bankAccountName,
            bankAccountNumber: data.bankAccountNumber,
            bankAccountType: data.bankAccountType as "ahorro" | "corriente" | undefined,
          }
        : null,
    )
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
      saveProfile,
      saveIdentityCard,
      savePhotos,
      savePaymentMethod,
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
