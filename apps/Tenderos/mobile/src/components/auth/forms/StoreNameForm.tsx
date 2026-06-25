import { useEffect, useState } from "react";
import { Keyboard, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/components/AuthProvider";
import BackButton from "@/src/components/auth/BackButton";
import ScreenTitle from "@/src/components/auth/ScreenTitle";
import FormField from "@/src/components/auth/FormField";
import FormButton from "@/src/components/auth/FormButton";
import { useAuthLoading } from "@/src/components/auth/AuthLoadingContext";
import { storeNameMessages } from "@/src/components/auth/messages";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

export default function StoreNameForm() {
  const { saveProfile, user } = useAuth();
  const router = useRouter();
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setLoading: setGlobalLoading } = useAuthLoading();
  useEffect(() => {
    return () => setGlobalLoading(false);
  }, [setGlobalLoading]);

  const valid = storeName.trim().length >= 5;

  const handleSubmit = async () => {
    if (loading) return;
    Keyboard.dismiss();

    const trimmed = storeName.trim();

    if (!trimmed) {
      setError(storeNameMessages.errors.empty);
      return;
    }
    if (trimmed.length < 5) {
      setError(storeNameMessages.errors.tooShort);
      return;
    }

    setLoading(true);
    setGlobalLoading(true);
    setError("");
    const result = await saveProfile({
      name: user?.fullName || "",
      storeName,
    });

    if (result.success) {
      router.push("/auth/identity-card" as any);
      setTimeout(() => {
        setLoading(false);
        setGlobalLoading(false);
      }, 350);
    } else {
      setLoading(false);
      setGlobalLoading(false);
      setError(result.error ?? storeNameMessages.errors.empty);
    }
  };

  return (
    <View className="flex-1">
      <View className="flex-1 px-6 pt-12">
        <ScreenTitle>¿Cuál es el nombre de tu negocio?</ScreenTitle>

        <FormField
          value={storeName}
          onChangeText={(v) => {
            setStoreName(v);
            if (error) setError("");
          }}
          placeholder={storeNameMessages.placeholder}
          autoCapitalize="words"
          autoFocus
          error={error || undefined}
          hint={storeNameMessages.hint}
        />
      </View>

      <FormButton
        label="Siguiente"
        valid={valid}
        loading={loading}
        onPress={handleSubmit}
      />

      <Text className="text-gray-500 pb-5 flex items-center justify-center text-center px-2 text-sm leading-5">
        <FontAwesome6 name="file-circle-exclamation" size={12} color="black" />{" "}
        Esta información ayuda a personalizar tu sesión
      </Text>
    </View>
  );
}
