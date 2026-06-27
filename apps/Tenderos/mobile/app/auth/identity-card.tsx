import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Keyboard,
  KeyboardEvent,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/components/AuthProvider";
import { validateCedula } from "@/src/utils/cedula";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

export default function IdentityCardScreen() {
  const { saveIdentityCard } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [cedula, setCedula] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const validation = cedula.length > 0 ? validateCedula(cedula) : null;
  const valid = validation?.valid ?? false;

  // ── Manual keyboard tracking ──
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e: KeyboardEvent) => setKeyboardHeight(e.endCoordinates.height),
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardHeight(0),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
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

  const handleBack = () => {
    Keyboard.dismiss();
    setTimeout(() => router.back(), 50);
  };

  const handleSubmit = async () => {
    if (!valid || loading) return;

    const result = validateCedula(cedula);
    if (!result.valid) {
      setError(result.error ?? "Cédula inválida. Verifica el número.");
      return;
    }

    Keyboard.dismiss();
    setLoading(true);
    setError("");
    const saveResult = await saveIdentityCard(cedula);
    if (saveResult.success) {
      router.push("/auth/payment-method" as any);
      setTimeout(() => setLoading(false), 400);
    } else {
      setLoading(false);
      setError(saveResult.error ?? "Error al guardar cédula");
    }
  };

  return (
    <View className="flex-1 bg-white">
      <Animated.View
        className="flex-1"
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          paddingBottom: keyboardHeight,
        }}
      >
        {/* ── Content area (flex-1 pushes CTA to the bottom) ── */}
        <View className="flex-1 px-6" style={{ paddingTop: insets.top + 24 }}>
          {/* ── Back Arrow ── */}
          <Pressable
            onPress={handleBack}
            className="mb-10 h-10 w-10 justify-center"
          >
            <FontAwesome6 name="chevron-left" size={24} color="black" />
          </Pressable>

          {/* ── Title ── */}
          <Text className="text-4xl pb-10 font-medium text-gray-900">
            ¿Cuál es tu número de cédula?
          </Text>

          {/* ── Input ── */}
          <TextInput
            value={cedula}
            onChangeText={(v) => {
              const digits = v.replace(/\D/g, "");
              setCedula(digits);
              if (error) setError("");
            }}
            placeholder="1234567890"
            placeholderTextColor="#9ca3af"
            keyboardType="number-pad"
            maxLength={10}
            autoFocus
            className="h-16 px-4 border rounded-2xl border-gray-900 text-lg text-gray-900"
          />

          {error ? (
            <Text className="text-base pt-4 leading-5 text-red-400">
              {error}
            </Text>
          ) : (
            <Text className="text-base pt-4 leading-5 text-gray-600">
              La cédula es necesaria para poder emitir facturas electrónicas y
              ayudarte a crear un historial en la app.
            </Text>
          )}
        </View>

        {/* ── Bottom-pinned CTA ── */}
        <View className="px-6" style={{ paddingBottom: insets.bottom + 16 }}>
          <Pressable
            onPress={handleSubmit}
            disabled={!valid || loading}
            className={`h-16 items-center justify-center rounded-full ${
              valid && !loading ? "bg-black" : "bg-gray-100"
            }`}
          >
            <Text
              className={`text-lg ${
                valid && !loading ? "text-white" : "text-gray-400"
              }`}
            >
              Siguiente
            </Text>
          </Pressable>
          <Text className="text-center text-sm pt-4">
            <MaterialCommunityIcons
              name="folder-alert"
              size={12}
              color="black"
            />{" "}
            Esta información ayuda a personalizar tu sesión
          </Text>
        </View>
      </Animated.View>

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
