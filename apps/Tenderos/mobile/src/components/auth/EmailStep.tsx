import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

type Props = {
  email: string;
  onChange: (v: string) => void;
  onNext: () => void;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailStep({ email, onChange, onNext }: Props) {
  const [touched, setTouched] = useState(false);
  const valid = EMAIL_RE.test(email);

  return (
    <View className="flex-1">
      {/* back button is handled by login.tsx */}

      <View className="flex-1 px-6 pt-28">
        <Text
          className="pr-24 text-3xl font-medium text-[#25262a]"
        >
          ¿Cuál es tu dirección de correo electrónico?
        </Text>

        <TextInput
          value={email}
          onChangeText={(v) => {
            onChange(v);
            if (!touched) setTouched(true);
          }}
          placeholder="Introduce tu correo electrónico"
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          keyboardType="email-address"
          autoFocus
          className="mt-8 border-b-2 border-gray-400 pb-2 text-lg text-gray-900"
        />

        <Text className="mt-4 text-base leading-5 text-gray-500">
          Te enviaremos un código para verificar tu email. Es posible que debas
          revisar tu carpeta de correo no deseado.
        </Text>
      </View>

      {/* Button pinned to bottom */}
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
