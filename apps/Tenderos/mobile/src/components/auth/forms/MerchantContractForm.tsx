import { useEffect, useState } from "react";
import { Keyboard, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/components/AuthProvider";
import { merchantContractMessages } from "@/src/components/auth/messages";
import BackButton from "@/src/components/auth/BackButton";
import ScreenTitle from "@/src/components/auth/ScreenTitle";
import FormButton from "@/src/components/auth/FormButton";
import { useAuthLoading } from "@/src/components/auth/AuthLoadingContext";
import LoadingOverlay from "@/src/components/auth/LoadingOverlay";
import type { MerchantContractData } from "@repo/api-contracts";

export default function MerchantContractForm() {
  const { user, saveContract } = useAuth();
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setLoading: setGlobalLoading } = useAuthLoading();

  useEffect(() => {
    return () => setGlobalLoading(false);
  }, [setGlobalLoading]);

  const handleSubmit = async () => {
    if (!accepted || loading) return;

    if (!accepted) {
      setError(merchantContractMessages.errors.noCheck);
      return;
    }

    Keyboard.dismiss();
    setLoading(true);
    setGlobalLoading(true);
    setError("");

    const payload: MerchantContractData = {
      userId: user?.id ?? "",
      fullName: user?.fullName ?? "",
      cedula: user?.cedula ?? "",
      storeName: user?.storeName ?? "",
      email: user?.email ?? "",
      address: user?.address ?? "",
      paymentMethod: user?.paymentMethod ?? "",
      termsVersion: "1.0.0",
      acceptedAt: new Date().toISOString(),
      ipAddress: "unknown",
      userAgent: "unknown",
      signature: "digital",
    };

    console.log(
      "[MerchantContract] Submitting:",
      JSON.stringify(payload, null, 2),
    );

    const result = await saveContract(payload);

    if (result.success) {
      router.push("/auth/account-created" as any);
      setTimeout(() => {
        setLoading(false);
        setGlobalLoading(false);
      }, 350);
    } else {
      setLoading(false);
      setGlobalLoading(false);
      setError(result.error ?? merchantContractMessages.errors.save);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <LoadingOverlay visible={loading} />

      <View className="flex-1 px-6 pt-10">
        <BackButton />

        <ScreenTitle>{merchantContractMessages.title}</ScreenTitle>

        {/* ── User Data Summary ── */}
        <View className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <Text className="mb-3 text-base font-medium text-[#25262a]">
            {merchantContractMessages.summaryTitle}
          </Text>
          <View className="gap-2">
            <DataRow label="Nombre" value={user?.fullName} />
            <DataRow label="Cédula" value={user?.cedula} />
            <DataRow label="Tienda" value={user?.storeName} />
            <DataRow label="Email" value={user?.email} />
            <DataRow label="Dirección" value={user?.address} />
            <DataRow label="Método de pago" value={user?.paymentMethod} />
          </View>
        </View>

        {/* ── Terms ── */}
        <Text className="mb-2 mt-6 text-base font-medium text-[#25262a]">
          {merchantContractMessages.termsTitle}
        </Text>
        <Text className="mb-2 text-xs text-gray-400">
          Versión: 1.0.0
        </Text>
        <ScrollView
          className="max-h-64 rounded-xl border border-gray-200 bg-gray-50 p-4"
          showsVerticalScrollIndicator={true}
        >
          <Text className="text-sm leading-5 text-gray-700">
            {merchantContractMessages.termsPlaceholder}
          </Text>
        </ScrollView>

        {/* ── Checkbox ── */}
        <Pressable
          disabled={loading}
          onPress={() => {
            if (loading) return;
            setAccepted((prev) => !prev);
            if (error) setError("");
          }}
          className="mt-5 flex-row items-center"
        >
          <View
            className={`h-6 w-6 items-center justify-center rounded-md border-2 ${
              accepted
                ? "border-orange-400 bg-orange-400"
                : "border-gray-300 bg-white"
            }`}
          >
            {accepted && (
              <Text className="text-sm font-bold text-white">✓</Text>
            )}
          </View>
          <Text className="ml-3 flex-1 text-base text-gray-900">
            {merchantContractMessages.checkbox}
          </Text>
        </Pressable>

        {/* ── Error ── */}
        {error ? (
          <Text className="mt-3 text-sm text-red-500">{error}</Text>
        ) : null}
      </View>

      {/* ── Bottom Button ── */}
      <View className="px-6 pb-5">
        <FormButton
          label={merchantContractMessages.accept}
          loadingLabel={merchantContractMessages.accepting}
          valid={accepted}
          loading={loading}
          onPress={handleSubmit}
        />
      </View>
    </SafeAreaView>
  );
}

// ── Helper component ──
function DataRow({ label, value }: { label: string; value?: string }) {
  return (
    <View className="flex-row justify-between">
      <Text className="text-sm text-gray-500">{label}</Text>
      <Text className="text-sm font-medium text-gray-900">
        {value || "-"}
      </Text>
    </View>
  );
}
