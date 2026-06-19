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

type PaymentMethod = "efectivo" | "pichincha" | null;

export default function PaymentMethodScreen() {
  const { savePaymentMethod } = useAuth();
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethod>(null);
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [accountType, setAccountType] = useState<"ahorro" | "corriente" | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Validation ──
  const isEfectivoValid = method === "efectivo";
  const isPichinchaValid =
    method === "pichincha" &&
    bankAccountName.trim().length > 0 &&
    bankAccountNumber.trim().length > 0 &&
    accountType !== null;
  const valid = isEfectivoValid || isPichinchaValid;

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

    const data: {
      method: string;
      bankAccountName?: string;
      bankAccountNumber?: string;
      bankAccountType?: string;
    } = { method: method! };

    if (method === "pichincha") {
      data.bankAccountName = bankAccountName.trim();
      data.bankAccountNumber = bankAccountNumber.trim();
      data.bankAccountType = accountType!;
    }

    const result = await savePaymentMethod(data);
    if (result.success) {
      router.push("/auth/account-created" as any);
      setTimeout(() => setLoading(false), 400);
    } else {
      setLoading(false);
      setError(result.error ?? "Error al guardar método de pago");
    }
  };

  // ── Radio option component ──
  const RadioOption = ({
    label,
    value,
  }: {
    label: string;
    value: PaymentMethod;
  }) => {
    const selected = method === value;
    return (
      <Pressable
        onPress={() => {
          setMethod(value);
          if (error) setError("");
        }}
        className="flex-row items-center py-4"
      >
        <View
          className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
            selected
              ? "border-orange-400 bg-orange-400"
              : "border-gray-300 bg-white"
          }`}
        >
          {selected && (
            <View className="h-2.5 w-2.5 rounded-full bg-white" />
          )}
        </View>
        <Text className="ml-3 text-lg text-gray-900">{label}</Text>
      </Pressable>
    );
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
                Método de cobro principal
              </Text>

              {/* ── Subtitle ── */}
              <Text className="mt-2 text-base leading-5 text-gray-500">
                ¿Cómo prefieres recibir tus pagos?
              </Text>

              {/* ── Radio options ── */}
              <View className="mt-6">
                <RadioOption label="Efectivo" value="efectivo" />
                <View className="h-px bg-gray-100" />
                <RadioOption label="Banco Pichincha" value="pichincha" />
              </View>

              {/* ── Conditional bank account form ── */}
              {method === "pichincha" && (
                <View className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <Text className="mb-4 text-base font-medium text-[#25262a]">
                    Datos bancarios
                  </Text>

                  {/* ── Titular ── */}
                  <Text className="mb-1 text-sm text-gray-500">
                    Nombre del titular
                  </Text>
                  <TextInput
                    value={bankAccountName}
                    onChangeText={(v) => {
                      setBankAccountName(v);
                      if (error) setError("");
                    }}
                    placeholder="Nombre completo"
                    placeholderTextColor="#9ca3af"
                    autoCapitalize="words"
                    className="border-b-2 border-gray-300 pb-2 text-lg text-gray-900"
                  />

                  {/* ── Número de cuenta ── */}
                  <Text className="mb-1 mt-5 text-sm text-gray-500">
                    Número de cuenta
                  </Text>
                  <TextInput
                    value={bankAccountNumber}
                    onChangeText={(v) => {
                      setBankAccountNumber(v);
                      if (error) setError("");
                    }}
                    placeholder="0000000000"
                    placeholderTextColor="#9ca3af"
                    keyboardType="number-pad"
                    className="border-b-2 border-gray-300 pb-2 text-lg text-gray-900"
                  />

                  {/* ── Tipo de cuenta ── */}
                  <Text className="mb-3 mt-5 text-sm text-gray-500">
                    Tipo de cuenta
                  </Text>
                  <View className="flex-row gap-4">
                    <Pressable
                      onPress={() => setAccountType("ahorro")}
                      className="flex-row items-center"
                    >
                      <View
                        className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
                          accountType === "ahorro"
                            ? "border-orange-400 bg-orange-400"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {accountType === "ahorro" && (
                          <View className="h-2 w-2 rounded-full bg-white" />
                        )}
                      </View>
                      <Text className="ml-2 text-base text-gray-900">
                        Ahorro
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setAccountType("corriente")}
                      className="flex-row items-center"
                    >
                      <View
                        className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
                          accountType === "corriente"
                            ? "border-orange-400 bg-orange-400"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {accountType === "corriente" && (
                          <View className="h-2 w-2 rounded-full bg-white" />
                        )}
                      </View>
                      <Text className="ml-2 text-base text-gray-900">
                        Corriente
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}

              {error ? (
                <Text className="mt-3 text-sm text-red-500">{error}</Text>
              ) : null}
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
                  {loading ? "Guardando..." : "Finalizar"}
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
