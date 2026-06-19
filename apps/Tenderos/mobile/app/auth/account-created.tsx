import { useEffect, useRef } from "react"
import { Animated, Pressable, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import Feather from "@expo/vector-icons/Feather"

export default function AccountCreatedScreen() {
  const router = useRouter()

  // ── Fade + slide animation ──
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(40)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start()
  }, [fadeAnim, slideAnim])

  const handleStart = () => {
    router.replace("/(tabs)")
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Animated.View
        className="flex-1 items-center justify-center px-6"
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        {/* ── Checkmark icon ── */}
        <Feather name="check-circle" size={96} color="#22c55e" />

        {/* ── Title ── */}
        <Text className="mt-6 text-3xl font-bold text-[#25262a]">
          ¡Cuenta creada!
        </Text>

        {/* ── Subtitle ── */}
        <Text className="mt-2 text-center text-lg text-gray-500">
          Bienvenido a Tenderos
        </Text>
      </Animated.View>

      {/* ── Bottom CTA ── */}
      <View className="px-6 pb-10">
        <Pressable
          onPress={handleStart}
          className="min-h-[50px] items-center justify-center rounded-full bg-orange-400"
        >
          <Text className="text-base font-semibold text-white">
            Comenzar
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}
