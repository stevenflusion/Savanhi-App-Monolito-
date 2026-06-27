import { useEffect, useState } from "react";
import { Keyboard, Pressable, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/components/AuthProvider";
import BackButton from "@/src/components/auth/BackButton";
import ScreenTitle from "@/src/components/auth/ScreenTitle";
import RadioOption from "@/src/components/auth/RadioOption";
import { paymentMethodMessages } from "@/src/components/auth/messages";
import FormButton from "@/src/components/auth/FormButton";
import { useAuthLoading } from "@/src/components/auth/AuthLoadingContext";

type PaymentMethod = "efectivo" | "pichincha" | null;

export default function PaymentMethodForm() {
  const { savePaymentMethod } = useAuth();
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethod>(null);
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [accountType, setAccountType] = useState<"ahorro" | "corriente" | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setLoading: setGlobalLoading } = useAuthLoading();
  useEffect(() => {
    return () => setGlobalLoading(false);
  }, [setGlobalLoading]);

  const MIN_NAME_LENGTH = 3;
  const MIN_ACCOUNT_LENGTH = 10;

  const isEfectivoValid = method === "efectivo";
  const isPichinchaValid =
    method === "pichincha" &&
    bankAccountName.trim().length >= MIN_NAME_LENGTH &&
    bankAccountNumber.trim().length >= MIN_ACCOUNT_LENGTH &&
    accountType !== null;
  const valid = isEfectivoValid || isPichinchaValid;

  const handleSubmit = async () => {
    if (!valid || loading) return;
    Keyboard.dismiss();

    // Extra validation on submit for specific field errors
    if (method === "pichincha") {
      if (!bankAccountName.trim()) {
        setError(paymentMethodMessages.pichincha.accountName.errors.empty);
        return;
      }
      if (bankAccountName.trim().length < MIN_NAME_LENGTH) {
        setError("El nombre del titular debe tener al menos 3 caracteres.");
        return;
      }
      if (!bankAccountNumber.trim()) {
        setError(paymentMethodMessages.pichincha.accountNumber.errors.empty);
        return;
      }
      if (bankAccountNumber.trim().length < MIN_ACCOUNT_LENGTH) {
        setError(paymentMethodMessages.pichincha.accountNumber.errors.tooShort);
        return;
      }
      if (!accountType) {
        setError(paymentMethodMessages.pichincha.accountType.errors.empty);
        return;
      }
    }

    setLoading(true);
    setGlobalLoading(true);
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
      router.push("/auth/merchant-contract" as any);
      setTimeout(() => {
        setLoading(false);
        setGlobalLoading(false);
      }, 350);
    } else {
      setLoading(false);
      setGlobalLoading(false);
      setError(result.error ?? paymentMethodMessages.errors.save);
    }
  };

  return (
    <View className="flex-1">
      <View className="flex-1 px-6 pt-10">
        <BackButton />

        <ScreenTitle>Método de cobro principal</ScreenTitle>

        <Text className="mt-2 text-base leading-5 text-gray-500">
          {paymentMethodMessages.hint}
        </Text>

        {/* ── Radio options ── */}
        <View className="mt-6">
          <RadioOption
            label="Efectivo"
            selected={method === "efectivo"}
            onSelect={() => {
              setMethod("efectivo");
              if (error) setError("");
            }}
          />
          <View className="h-px bg-gray-100" />
          <RadioOption
            label="Banco Pichincha"
            selected={method === "pichincha"}
            onSelect={() => {
              setMethod("pichincha");
              if (error) setError("");
            }}
          />
        </View>

        {/* ── Conditional bank account form ── */}
        {method === "pichincha" && (
          <View className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <Text className="mb-4 text-base font-medium text-[#25262a]">
              {paymentMethodMessages.pichincha.title}
            </Text>

            <Text className="mb-1 text-sm text-gray-500">
              Nombre del titular
            </Text>
            <TextInput
              value={bankAccountName}
              onChangeText={(v) => {
                setBankAccountName(v);
                if (error) setError("");
              }}
              placeholder={paymentMethodMessages.pichincha.accountName.placeholder}
              placeholderTextColor="#9ca3af"
              autoCapitalize="words"
              className="border-b-2 border-gray-300 pb-2 text-lg text-gray-900"
            />

            <Text className="mb-1 mt-5 text-sm text-gray-500">
              Número de cuenta
            </Text>
            <Text className="mb-2 text-xs text-gray-400">
              {paymentMethodMessages.pichincha.accountNumber.hint}
            </Text>
            <TextInput
              value={bankAccountNumber}
              onChangeText={(v) => {
                const digits = v.replace(/\D/g, "");
                setBankAccountNumber(digits);
                if (error) setError("");
              }}
              placeholder={paymentMethodMessages.pichincha.accountNumber.placeholder}
              placeholderTextColor="#9ca3af"
              keyboardType="number-pad"
              className="border-b-2 border-gray-300 pb-2 text-lg text-gray-900"
            />

            <Text className="mb-1 mt-5 text-sm text-gray-500">
              Tipo de cuenta
            </Text>
            <Text className="mb-2 text-xs text-gray-400">
              {paymentMethodMessages.pichincha.accountType.hint}
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
                <Text className="ml-2 text-base text-gray-900">Ahorro</Text>
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
                <Text className="ml-2 text-base text-gray-900">Corriente</Text>
              </Pressable>
            </View>
          </View>
        )}

        {error ? (
          <Text className="mt-3 text-sm text-red-500">{error}</Text>
        ) : null}
      </View>

      <FormButton
        label="Finalizar"
        loadingLabel="Guardando..."
        valid={valid}
        loading={loading}
        onPress={handleSubmit}
      />
    </View>
  );
}
