import { useEffect, useRef, useState } from "react";
import { Animated, Modal, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Location from "expo-location";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function AccessUbicationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showModal, setShowModal] = useState(false);

  // ── Simple fade-in animation (500ms, no slide) ──
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleRequestPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      router.push("/auth/business-location" as any);
    } else {
      setShowModal(true);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* ── Main content (disabled when modal is up) ── */}
      <View className="flex-1" pointerEvents={showModal ? "none" : "auto"}>
        <Animated.View className="flex-1" style={{ opacity: fadeAnim }}>
          {/* ── Centered content ── */}
          <View className="flex-1 mt-28 items-center gap-5 px-6">
            {/* ── Icon ── */}
            <Ionicons name="location-sharp" size={60} color="black" />

            {/* ── Title ── */}
            <Text className="text-center text-4xl font-medium leading-9 text-[#25262a]">
              Permitir el acceso a la ubicación
            </Text>

            {/* ── Subtitle ── */}
            <Text className="text-base text-center leading-5 text-gray-600">
              Utilizamos tu ubicación para mostrar tu negocio en el mapa y
              ayudar a tus clientes a encontrarte fácilmente.
            </Text>
          </View>

          {/* ── Bottom-pinned CTA ── */}
          <View className="px-6" style={{ paddingBottom: insets.bottom + 16 }}>
            <Text className="text-center text-sm pb-6 leading-5 text-gray-500">
              Al permitir el acceso, usted consiente compartir su ubicación con
              Savanhi SA, tal como se establece en la{" "}
              <Text className="underline text-gray-900">
                Política de Privacidad.
              </Text>
            </Text>
            <Pressable
              onPress={handleRequestPermission}
              disabled={showModal}
              className={`h-16 items-center justify-center rounded-full ${
                showModal ? "bg-gray-200" : "bg-black"
              }`}
            >
              <Text
                className={`text-lg ${
                  showModal ? "text-gray-400" : "text-white"
                }`}
              >
                Permitir acceso
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>

      {/* ── Modal: permiso denegado ── */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View className="flex-1 bg-gray-900/50 justify-center items-center px-8">
          <View className="bg-white rounded-3xl p-8 w-full max-w-sm">
            <MaterialIcons
              className="self-center mb-4"
              name="location-off"
              size={40}
              color="black"
            />
            <Text className="text-3xl font-medium text-center text-[#25262a]">
              Haz que te encuentren
            </Text>
            <Text className="text-base text-center pt-4 leading-5 text-gray-600">
              Activa la ubicación para que los clientes cercanos puedan
              encontrar tu negocio y realizar pedidos.
            </Text>
            <Pressable
              onPress={() => {
                setShowModal(false);
                setTimeout(
                  () => router.push("/auth/business-location" as any),
                  300,
                );
              }}
              className="h-14 items-center justify-center rounded-full bg-black mt-6"
            >
              <Text className="text-lg text-white">Continuar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
