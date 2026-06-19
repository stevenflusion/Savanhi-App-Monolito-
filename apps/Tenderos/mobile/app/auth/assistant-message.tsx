import { useEffect, useRef } from "react";
import { Animated, Image, KeyboardAvoidingView, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function AssistantMessageScreen() {
  const router = useRouter();

  // ── Simple fade-in animation (500ms, no slide) ──
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleStart = () => {
    router.push("/auth/person-name" as any);
  };

  return (
    <View className="flex-1">
      <SafeAreaView className="flex-1 bg-white">
        <KeyboardAvoidingView behavior="padding" className="flex-1">
          <Animated.View
            className="flex-1"
            style={{ opacity: fadeAnim }}
          >
            {/* ── Centered content ── */}
            <View className="flex-1 items-center justify-center px-6">
              {/* ── Logo ── */}
              <Image
                source={require("../../assets/images/logo.png")}
                className="h-40 w-40"
                resizeMode="contain"
              />

              {/* ── Title ── */}
              <Text className="mt-6 text-center text-3xl font-medium leading-9 text-[#25262a]">
                ¡Hola! Soy tu asistente.{"\n"}Vamos a registrar tu tienda
              </Text>

              {/* ── Subtitle ── */}
              <Text className="mt-4 text-center text-base leading-5 text-gray-500">
                Completa tus datos para que tus clientes te conozcan.
              </Text>
            </View>

            {/* ── Bottom-pinned CTA ── */}
            <View className="px-6 pb-5">
              <Pressable
                onPress={handleStart}
                className="min-h-[50px] items-center justify-center rounded-full bg-orange-400"
              >
                <Text className="text-base font-semibold text-white">
                  Comenzar
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
