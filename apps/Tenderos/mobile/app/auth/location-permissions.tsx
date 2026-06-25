import { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Entypo from "@expo/vector-icons/Entypo";

export default function LocationPermissionsScreen() {
  const router = useRouter();
  const [showDenyModal, setShowDenyModal] = useState(false);

  // ── Simple fade-in animation ──
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleContinue = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status === "granted") {
      setTimeout(() => {
        router.push("/auth/business-location" as any);
      }, 300);
    } else {
      setShowDenyModal(true);
    }
  };

  const handleContinueAnyway = () => {
    setShowDenyModal(false);
    router.push("/auth/business-location" as any);
  };

  return (
    <View className="flex-1">
      <SafeAreaView className="flex-1 bg-white">
        <KeyboardAvoidingView behavior="padding" className="flex-1">
          <Animated.View className="flex-1" style={{ opacity: fadeAnim }}>
            {/* ── Centered content ── */}
            <View className="flex-1 gap-6 items-center pt-28 px-6">
              {/* ── Icon ── */}
              <View className="bg-[#ff73003f] w-24 h-24 rounded-full flex items-center justify-center">
                <Entypo name="location" size={45} color="black" />
              </View>

              {/* ── Title ── */}
              <Text className="text-4xl text-center font-medium text-[#25262a]">
                Permitir el acceso a la ubicación
              </Text>

              {/* ── Subtitle ── */}
              <Text className="text-center text-gray-500 text-base leading-5">
                Utilizamos esto para mostrar tiendas cercanas. Puedes modificar
                el acceso en la configuración de tu perfil.
              </Text>
            </View>

            {/* ── Bottom-pinned CTA ── */}
            <View className="px-6 pb-5 flex gap-6">
              <Text className="text-center text-gray-500 text-sm leading-5">
                Al permitir el acceso, consientes compartir tu información
                personal con Google Maps, tal como se indica en la{" "}
                <Text className="underline text-gray-800">
                  Política de privacidad.
                </Text>
              </Text>
              <Pressable
                onPress={handleContinue}
                className={`h-16 items-center justify-center rounded-full ${showDenyModal ? " bg-gray-100" : "bg-black"}`}
              >
                <Text
                  className={`text-lg font-semibold ${showDenyModal ? "text-gray-400" : "text-white"}`}
                >
                  Permitir Acceso
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* ── Deny Modal ── */}
      <Modal
        visible={showDenyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDenyModal(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/50 px-6">
          <View className="w-full grid items-center rounded-2xl bg-white px-6 pb-6 pt-8">
            <MaterialCommunityIcons
              name="map-marker-off"
              size={40}
              color="black"
            />
            <Text className="text-2xl text-center py-5 font-medium text-[#25262a]">
              Tus clientes no podrán encontrarte
            </Text>
            <Text className="text-base text-center leading-6 text-gray-600">
              Sin la ubicación, tu negocio no aparecerá en el mapa y perderás
              clientes que buscan tiendas cercanas.
            </Text>

            <Pressable
              onPress={handleContinueAnyway}
              className="mt-8 h-16 w-full items-center justify-center rounded-full bg-black"
            >
              <Text className="text-lg font-medium text-white">Aceptar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
