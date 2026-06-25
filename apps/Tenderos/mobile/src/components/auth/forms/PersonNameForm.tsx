import { useEffect, useState } from "react";
import { Keyboard, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/components/AuthProvider";
import BackButton from "@/src/components/auth/BackButton";
import ScreenTitle from "@/src/components/auth/ScreenTitle";
import FormField from "@/src/components/auth/FormField";
import FormButton from "@/src/components/auth/FormButton";
import { useAuthLoading } from "@/src/components/auth/AuthLoadingContext";
import { personNameMessages } from "@/src/components/auth/messages";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

export default function PersonNameForm() {
  const { saveProfile, user } = useAuth();
  const router = useRouter();
  // Only allow letters (including accents/ñ), spaces, and dots (abbreviations)
  const NAME_RE = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s.]+$/;

  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const { setLoading: setGlobalLoading } = useAuthLoading();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    return () => setGlobalLoading(false);
  }, [setGlobalLoading]);

  const valid = name.trim().length >= 3 && NAME_RE.test(name.trim());

  const handleSubmit = async () => {
    if (loading) return;
    Keyboard.dismiss();

    const trimmed = name.trim();

    if (!trimmed) {
      setError(personNameMessages.errors.empty);
      return;
    }
    if (trimmed.length < 3) {
      setError(personNameMessages.errors.tooShort);
      return;
    }
    if (!NAME_RE.test(trimmed)) {
      setError(personNameMessages.errors.invalidChars);
      return;
    }

    setLoading(true);
    setGlobalLoading(true);
    setError("");
    const result = await saveProfile({
      name,
      storeName: user?.storeName || "",
    });

    if (result.success) {
      router.push("/auth/store-name" as any);
      setTimeout(() => {
        setLoading(false);
        setGlobalLoading(false);
      }, 350);
    } else {
      setLoading(false);
      setGlobalLoading(false);
      setError(result.error ?? personNameMessages.errors.empty);
    }
  };

  return (
    <View className="flex-1">
      <View className="flex-1 px-6 pt-12">
        <ScreenTitle>¿Cuéntanos cómo te llamas?</ScreenTitle>

        <FormField
          value={name}
          onChangeText={(v) => {
            const filtered = v.replace(/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s.]/g, "");
            setName(filtered);
            if (error) setError("");
          }}
          placeholder={personNameMessages.placeholder}
          autoCapitalize="words"
          autoFocus
          error={error || undefined}
          hint={personNameMessages.hint}
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
