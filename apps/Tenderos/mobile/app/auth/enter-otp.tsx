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
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

export default function EnterOtpScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const { verifyOTP, requestOTP } = useAuth();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const verifyingRef = useRef(false);

  // ── 30-second countdown ──
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
        router.push("/auth/access-notify" as any);
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
                className="mb-10 h-10 w-10 justify-center"
              >
                <FontAwesome6 name="chevron-left" size={24} color="black" />
              </Pressable>
              <Text className="text-4xl pb-5 font-medium text-gray-900">
                Ingresa tu codigo de verificación
              </Text>
              <Text className="text-base pt-4 leading-5 text-gray-600">
                Te enviamos tu código a {email}. Revísalo e introdúcelo a
                continuación.
                <Text
                  className="underline text-gray-900"
                  onPress={() => router.push("/auth/enter-email")}
                >
                  {" "}
                  Cambiar dirección de email
                </Text>
              </Text>

              {/* ── OTP Input ── */}
              <View className="mt-8 pb-8">
                <OtpInput
                  value={code}
                  onChange={(v) => {
                    setCode(v);
                    if (error) setError("");
                  }}
                  error={error}
                />
              </View>

              {/* ── Timer / Resend ── */}
              {countdown > 0 ? (
                <Text className="text-sm text-center leading-5 text-gray-600">
                  Recibirás el código dentro de {countdown} seg. Quizá necesites
                  revisar tu carpeta de correo no deseado
                </Text>
              ) : (
                <Pressable onPress={handleResend} disabled={resending}>
                  <Text className="underline text-center text-lg font-medium text-gray-900">
                    ¿Aún no has recibido el mensaje?
                  </Text>
                </Pressable>
              )}
            </View>
            <Text className="text-center flex items-center justify-center text-sm pb-4">
              <Ionicons name="alert-circle-sharp" size={14} color="black" />{" "}
              Nunca compartiremos tu email con nadie
            </Text>
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
