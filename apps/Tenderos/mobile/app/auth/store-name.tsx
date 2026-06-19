import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/components/AuthProvider";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function StoreNameScreen() {
  const { saveProfile, user } = useAuth();
  const router = useRouter();
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const valid = storeName.trim().length > 0;

  // ── Fade + slide animation ──
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleBack = () => {
    Keyboard.dismiss();
    setTimeout(() => router.back(), 50);
  };

  const handleSubmit = async () => {
    if (!valid || loading) return;
    Keyboard.dismiss();
    setLoading(true);
    setError("");
    const result = await saveProfile({ name: user?.name || "", storeName });
    if (result.success) {
      router.push("/auth/identity-card" as any);
      setTimeout(() => setLoading(false), 400);
    } else {
      setLoading(false);
      setError(result.error ?? "Error al guardar datos");
    }
  };

  return (
    <View className="flex-1">
      <SafeAreaView className="flex-1 bg-white">
        <KeyboardAvoidingView behavior="padding" className="flex-1">
          <Animated.View
            className="flex-1"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <View className="flex-1 px-6 pt-10">
              {/* ── Back Arrow ── */}
              <Pressable
                onPress={handleBack}
                className="mb-6 h-14 w-14 flex justify-center"
              >
                <MaterialIcons name="arrow-back" size={26} color="#798091" />
              </Pressable>

              {/* ── Title ── */}
              <Text className="pr-20 text-4xl font-medium text-[#25262a]">
                ¿Cuál es el nombre de tu negocio?
              </Text>

              {/* ── Input ── */}
              <TextInput
                value={storeName}
                onChangeText={(v) => {
                  setStoreName(v);
                  if (error) setError("");
                }}
                placeholder="Nombre de tu tienda"
                placeholderTextColor="#9ca3af"
                autoCapitalize="words"
                autoFocus
                className="mt-8 border-b-2 border-gray-400 pb-2 text-lg text-gray-900"
              />

              {error ? (
                <Text className="mt-3 text-sm text-red-500">{error}</Text>
              ) : (
                <Text className="mt-4 text-base leading-5 text-gray-500">
                  Así identificarán tus clientes tu negocio. Puedes cambiarlo
                  después.
                </Text>
              )}
            </View>

            {/* ── Bottom-pinned CTA ── */}
            <View className="px-6 pb-5">
              <Pressable
                onPress={handleSubmit}
                disabled={!valid || loading}
                className={`min-h-[50px] items-center justify-center rounded-full ${
                  valid && !loading ? "bg-orange-400" : "bg-gray-100"
                }`}
              >
                <Text
                  className={`text-base font-semibold ${
                    valid && !loading ? "text-white" : "text-gray-400"
                  }`}
                >
                  Continuar
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* ── Loading overlay ── */}
      {loading && (
        <View className="absolute inset-0 z-50">
          <View className="flex-1 items-center justify-center bg-white">
            <Image
              source={require("../../assets/images/logo.png")}
              className="h-40 w-40"
              resizeMode="contain"
            />
          </View>
        </View>
      )}
    </View>
  );
}
