import { useEffect, useState } from "react";
import { Keyboard, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/components/AuthProvider";
import { validateCedula } from "@/src/utils/cedula";
import BackButton from "@/src/components/auth/BackButton";
import ScreenTitle from "@/src/components/auth/ScreenTitle";
import FormField from "@/src/components/auth/FormField";
import FormButton from "@/src/components/auth/FormButton";
import { useAuthLoading } from "@/src/components/auth/AuthLoadingContext";
import { identityCardMessages } from "@/src/components/auth/messages";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

export default function IdentityCardForm() {
  const { saveIdentityCard } = useAuth();
  const router = useRouter();
  const [cedula, setCedula] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setLoading: setGlobalLoading } = useAuthLoading();
  useEffect(() => {
    return () => setGlobalLoading(false);
  }, [setGlobalLoading]);

  const validation = cedula.length > 0 ? validateCedula(cedula) : null;
  const valid = validation?.valid ?? false;

  const handleSubmit = async () => {
    if (!valid || loading) return;

    const result = validateCedula(cedula);
    if (!result.valid) {
      const msg = result.error ?? "";
      if (msg.includes("10 dígitos")) {
        setError(
          identityCardMessages.errors.invalidLength.replace(
            "{count}",
            cedula.length.toString(),
          ),
        );
      } else if (msg.includes("provincia")) {
        setError(identityCardMessages.errors.invalidProvince);
      } else if (msg.includes("tercer dígito")) {
        setError(identityCardMessages.errors.invalidThirdDigit);
      } else if (msg.includes("dígito verificador")) {
        setError(identityCardMessages.errors.invalidChecksum);
      } else {
        setError(msg);
      }
      return;
    }

    Keyboard.dismiss();
    setLoading(true);
    setGlobalLoading(true);
    setError("");
    const saveResult = await saveIdentityCard(cedula);

    if (saveResult.success) {
      router.push("/auth/location-permissions" as any);
      setTimeout(() => {
        setLoading(false);
        setGlobalLoading(false);
      }, 350);
    } else {
      setLoading(false);
      setGlobalLoading(false);
      setError(saveResult.error ?? identityCardMessages.errors.empty);
    }
  };

  return (
    <View className="flex-1">
      <View className="flex-1 px-6 pt-12">
        <ScreenTitle>¿Cuál es tu número de cédula?</ScreenTitle>

        <FormField
          value={cedula}
          onChangeText={(v) => {
            const digits = v.replace(/\D/g, "");
            setCedula(digits);
            if (error) setError("");
          }}
          placeholder={identityCardMessages.placeholder}
          keyboardType="number-pad"
          maxLength={10}
          autoFocus
          error={error || undefined}
          hint={identityCardMessages.hint}
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
