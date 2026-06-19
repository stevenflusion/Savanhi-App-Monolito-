import Feather from '@expo/vector-icons/Feather';
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

type Props = {
  password: string;
  onChange: (v: string) => void;
  onNext: () => void;
};

export default function PasswordStep({ password, onChange, onNext }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const valid = password.length > 0;

  return (
    <View className="flex-1">
      <View className="flex-1 px-6 pt-28">
        <Text className="pr-24 text-3xl tracking-wide font-medium text-[#25262a]">
          Introduce tu contraseña
        </Text>

        {/* Password input with eye toggle */}
        <View className="mt-8 flex-row items-center border-b-2 border-gray-400">
          <TextInput
            value={password}
            onChangeText={onChange}
            placeholder="Introduce tu contraseña"
            placeholderTextColor="#9ca3af"
            secureTextEntry={!showPassword}
            autoFocus
            className="flex-1 pb-2 text-lg text-gray-900"
          />

          <Pressable
            onPress={() => setShowPassword((p) => !p)}
            className="pb-2 pl-2 pr-2"
            hitSlop={8}
          >
            {showPassword ? 
              <Feather name="eye" color="#787f8f" size={22} />
            : 
              <Feather name="eye-off" color="#787f8f" size={22} />
            }
          </Pressable>
        </View>

        <Text className="mt-4 text-base leading-5 text-gray-500">
          Introduce la contraseña con la cual te registraste.
          <Text className="text-orange-400"> ¿Olvidaste tu contraseña?</Text>
        </Text>
      </View>

      <View className="px-6 pb-5">
        <Pressable
          onPress={onNext}
          disabled={!valid}
          className={`min-h-[50px] items-center justify-center rounded-full ${
            valid ? "bg-orange-400" : "bg-gray-100"
          }`}
        >
          <Text
            className={`text-base font-semibold ${
              valid ? "text-white" : "text-gray-400"
            }`}
          >
            Siguiente
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

