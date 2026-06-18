import Feather from "@expo/vector-icons/Feather";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

type Props = {
  password: string;
  confirmPassword: string;
  onChange: (v: string) => void;
  onConfirm: () => void;
  onBackToPassword: () => void;
};

export default function ConfirmPasswordStep({
  password,
  confirmPassword,
  onChange,
  onConfirm,
  onBackToPassword,
}: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const match = confirmPassword.length > 0 && confirmPassword === password;

  return (
    <View className="flex-1">
      <View className="flex-1 px-6 pt-28">
        <Text className="pr-24 text-3xl tracking-wide font-medium text-[#25262a]">
          Confirma tu contraseña
        </Text>

        {/* Confirm password input with eye toggle */}
        <View className="mt-8 flex-row items-center border-b-2 border-gray-400">
          <TextInput
            value={confirmPassword}
            onChangeText={onChange}
            placeholder="Repite tu contraseña"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showConfirm}
            autoFocus
            className="flex-1 pb-2 text-lg text-gray-900"
          />

          <Pressable
            onPress={() => setShowConfirm((p) => !p)}
            className="pb-2 pl-2 pr-2"
            hitSlop={8}
          >
            {showConfirm ? (
              <Feather name="eye" color="#787f8f" size={22} />
            ) : (
              <Feather name="eye-off" color="#787f8f" size={22} />
            )}
          </Pressable>
        </View>

        {confirmPassword.length > 0 && !match ? (
          <Text className="mt-3 font-medium text-red-400">
            Las contraseñas no coinciden.
          </Text>
        ) : (
          <Text className="mt-4 text-base leading-5 text-gray-500">
            Recuerda que las contraseñas deben coincidir.{" "}
            <Text
              className="text-orange-400"
              onPress={onBackToPassword}
            >
               ¿Deseas volver a introducir la contraseña?
            </Text>
          </Text>
        )}
      </View>

      <View className="px-6 pb-5">
        <Pressable
          onPress={onConfirm}
          disabled={!match}
          className={`min-h-[50px] items-center justify-center rounded-full ${
            match ? "bg-orange-400" : "bg-gray-100"
          }`}
        >
          <Text
            className={`text-base font-semibold ${
              match ? "text-white" : "text-gray-400"
            }`}
          >
            Iniciar Sesion
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
