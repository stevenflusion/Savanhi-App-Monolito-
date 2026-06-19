import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/src/components/AuthProvider";
import OtpInput from "@/src/components/auth/OtpInput";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function EnterOtpScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const { verifyOTP, requestOTP } = useAuth();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const verifyingRef = useRef(false);

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

  // ── Auto-submit when all 6 digits are entered ──
  useEffect(() => {
    if (code.length === 6 && !loading && !verifyingRef.current) {
      handleVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const handleVerify = async () => {
    if (loading || verifyingRef.current) return;
    Keyboard.dismiss();
    verifyingRef.current = true;
    setLoading(true);
    setError("");
    const result = await verifyOTP(email ?? "", code);
    verifyingRef.current = false;

    if (result.success) {
      if (result.isNewUser) {
        router.push("/auth/assistant-message" as any);
        setTimeout(() => setLoading(false), 400);
      } else {
        router.replace("/(tabs)");
      }
    } else {
      setLoading(false);
      setError(result.error ?? "Código inválido");
      setCode("");
    }
  };

  const handleBack = () => {
    Keyboard.dismiss();
    setTimeout(() => router.back(), 50);
  };

  const handleResend = async () => {
    if (resending) return;
    setResending(true);
    await requestOTP(email ?? "");
    setResending(false);
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
            {/* ── Title + Subtitle ── */}
            <View className="flex-1 px-6 pt-10">
              {/* ── Back Arrow ── */}
              <Pressable
                onPress={handleBack}
                className="mb-6 h-14 w-14 flex justify-center"
              >
                <MaterialIcons name="arrow-back" size={26} color="#798091" />
              </Pressable>
              <Text className="pr-24 text-4xl font-medium text-[#25262a]">
                Ingresa tu codigo
              </Text>
              <Text className="mt-4 text-base leading-5 text-gray-500">
                Enviado a
                <Text className="text-black font-medium"> Correo. </Text>
                Este codigo caduca en 10 minutos.
              </Text>

              {/* ── OTP Input ── */}
              <View className="mt-8">
                <OtpInput
                  value={code}
                  onChange={(v) => {
                    setCode(v);
                    if (error) setError("");
                  }}
                  error={error}
                />
              </View>

              {/* ── Resend link ── */}
              <View className="mt-5 flex items-center">
                <Text className="text-base leading-5 text-gray-500">
                  ¿No recibiste el código?
                  <Pressable onPress={handleResend} disabled={resending}>
                    <Text className="text-base font-semibold text-orange-400">
                      {resending ? " Reenviando..." : " Reenviar codigo."}
                    </Text>
                  </Pressable>
                </Text>
              </View>
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
