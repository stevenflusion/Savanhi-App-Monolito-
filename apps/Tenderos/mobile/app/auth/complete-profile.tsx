import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/components/AuthProvider";
import ProgressBar from "@/src/components/auth/ProgressBar";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const STEPS = [
  {
    title: "¿Cuentanos como te llamas?",
    subtitle:
      "Usaremos tu nombre para dirigirnos a ti. Así te conocerán tus clientes. Puedes editarlo después.",
    placeholder: "Introduce tu nombre",
    key: "name",
  },
  {
    title: "¿Cual es el nombre de tu negocio?",
    subtitle:
      "Recuerda ser unica ya que asi identificarán los clientes tu negocio. Puedes cambiarlo después.",
    placeholder: "Introduce el nombre de tu negocio",
    key: "storeName",
  },
] as const;

const TOTAL = STEPS.length;

export default function CompleteProfileScreen() {
  const { completeProfile } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const directionRef = useRef(1);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // ── Animate on step change ──
  useEffect(() => {
    const dir = directionRef.current;
    fadeAnim.setValue(0);
    slideAnim.setValue(dir * 40);
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
  }, [step, fadeAnim, slideAnim]);

  // ── Form helpers ──
  const getCurrentValue = useCallback(() => {
    switch (step) {
      case 0:
        return name;
      case 1:
        return storeName;
      default:
        return "";
    }
  }, [step, name, storeName]);

  const setCurrentValue = useCallback(
    (v: string) => {
      if (error) setError("");
      switch (step) {
        case 0:
          setName(v);
          break;
        case 1:
          setStoreName(v);
          break;
      }
    },
    [step, error],
  );

  const valid = getCurrentValue().trim().length > 0;

  // ── Navigation ──
  const goToNext = () => {
    if (step < TOTAL - 1) {
      directionRef.current = 1;
      setStep((s) => s + 1);
    }
  };

  const goToPrev = () => {
    if (step > 0) {
      directionRef.current = -1;
      setStep((s) => s - 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      goToPrev();
    } else {
      router.back();
    }
  };

  // ── Submit ──
  const handleSubmit = async () => {
    if (!valid || loading) return;
    setLoading(true);
    setError("");
    const result = await completeProfile({ name, storeName });

    if (result.success) {
      router.push("/auth/business-location" as any);
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
          {/* ── ProgressBar ── */}
          <View className="mt-4">
            <ProgressBar current={step + 1} total={TOTAL} />
          </View>
          {/* ── Back button ── */}
          <View className="px-6 pt-2">
            <Pressable
              onPress={handleBack}
              className="mb-6 h-14 w-14 flex justify-center"
            >
              <MaterialIcons name="arrow-back" size={26} color="#798091" />
            </Pressable>
          </View>

          {/* ── Animated content ── */}
          <Animated.View
            className="flex-1 px-6"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <Text className="pr-24 text-4xl font-medium text-[#25262a]">
              {STEPS[step]!.title}
            </Text>

            <TextInput
              value={getCurrentValue()}
              onChangeText={setCurrentValue}
              placeholder={STEPS[step]!.placeholder}
              placeholderTextColor="#9ca3af"
              autoCapitalize={step === 2 ? "sentences" : "words"}
              autoCorrect={false}
              autoFocus
              keyboardType="default"
              className="mt-8 border-b-2 border-gray-400 pb-2 text-lg text-gray-900"
            />

            {error ? (
              <Text className="mt-3 text-sm text-red-500">{error}</Text>
            ) : (
              <Text className="mt-4 text-base leading-5 text-gray-500">
                {STEPS[step]!.subtitle}
              </Text>
            )}
          </Animated.View>

          {/* ── Bottom-pinned CTA ── */}
          <View className="px-6 pb-5">
            <Pressable
              onPress={step < TOTAL - 1 ? goToNext : handleSubmit}
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
                {step < TOTAL - 1 ? "Continuar" : "Finalizar"}
              </Text>
            </Pressable>
          </View>
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
