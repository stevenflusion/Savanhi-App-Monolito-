import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/components/AuthProvider";
import * as ImagePicker from "expo-image-picker";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const MAX_PHOTOS = 5;

export default function StorePhotosScreen() {
  const { savePhotos } = useAuth();
  const router = useRouter();
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const valid = photos.length > 0;

  // ── Fade + slide animation ──
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleBack = () => {
    Keyboard.dismiss();
    setTimeout(() => router.back(), 50);
  };

  const pickImage = async () => {
    Alert.alert("Agregar foto", "Elige una opción", [
      {
        text: "Cámara",
        onPress: async () => {
          try {
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ["images"],
              allowsEditing: true,
              quality: 0.8,
            });
            if (!result.canceled && result.assets[0]) {
              const asset = result.assets[0];
              setPhotos((prev) =>
                [...prev, asset.uri].slice(0, MAX_PHOTOS),
              );
            }
          } catch {
            setError("No pudimos acceder a la cámara");
          }
        },
      },
      {
        text: "Galería",
        onPress: async () => {
          try {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ["images"],
              allowsEditing: true,
              quality: 0.8,
            });
            if (!result.canceled && result.assets[0]) {
              const asset = result.assets[0];
              setPhotos((prev) =>
                [...prev, asset.uri].slice(0, MAX_PHOTOS),
              );
            }
          } catch {
            setError("No pudimos acceder a la galería");
          }
        },
      },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!valid || loading) return;
    Keyboard.dismiss();
    setLoading(true);
    setError("");
    const result = await savePhotos(photos);
    if (result.success) {
      router.push("/auth/payment-method" as any);
      setTimeout(() => setLoading(false), 400);
    } else {
      setLoading(false);
      setError(result.error ?? "Error al guardar fotos");
    }
  };

  return (
    <View className="flex-1">
      <SafeAreaView className="flex-1 bg-white">
        <KeyboardAvoidingView behavior="padding" className="flex-1">
          <Animated.View
            className="flex-1"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
            >
              <View className="flex-1 px-6 pt-10">
                {/* ── Back Arrow ── */}
                <Pressable
                  onPress={handleBack}
                  className="mb-6 h-14 w-14 flex justify-center"
                >
                  <MaterialIcons name="arrow-back" size={26} color="#798091" />
                </Pressable>

                {/* ── Title ── */}
                <Text className="pr-20 text-4xl font-medium text-[#25262a]">
                  Fotos de tu local
                </Text>

                {/* ── Subtitle ── */}
                <Text className="mt-2 text-base leading-5 text-gray-500">
                  Ayuda a tus clientes a identificar tu negocio.
                </Text>

                {/* ── Photo Upload Zone (dashed border) ── */}
                <View
                  className="mt-8 items-center justify-center"
                  style={{
                    borderWidth: 2,
                    borderColor: "#d1d5db",
                    borderRadius: 12,
                    borderStyle: "dashed",
                    overflow: "hidden",
                    paddingVertical: 48,
                  }}
                >
                  <MaterialIcons name="camera-alt" size={48} color="#9ca3af" />
                  <Text className="mt-3 text-base text-gray-400">
                    Agrega fotos de tu local
                  </Text>
                </View>

                {/* ── "Tomar foto" button ── */}
                <Pressable
                  onPress={pickImage}
                  disabled={photos.length >= MAX_PHOTOS}
                  className={`mt-4 flex-row items-center justify-center gap-2 rounded-xl border py-3 ${
                    photos.length >= MAX_PHOTOS
                      ? "border-gray-200 bg-gray-50"
                      : "border-orange-300 bg-orange-50"
                  }`}
                >
                  <MaterialIcons
                    name="camera-alt"
                    size={18}
                    color={photos.length >= MAX_PHOTOS ? "#9ca3af" : "#f97316"}
                  />
                  <Text
                    className={`text-base font-medium ${
                      photos.length >= MAX_PHOTOS
                        ? "text-gray-400"
                        : "text-orange-600"
                    }`}
                  >
                    Tomar foto
                  </Text>
                </Pressable>

                {/* ── Photo previews ── */}
                {photos.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mt-6"
                    contentContainerStyle={{ gap: 10 }}
                  >
                    {photos.map((uri, index) => (
                      <View key={`${uri}-${index}`} className="relative">
                        <Image
                          source={{ uri }}
                          className="h-20 w-20 rounded-lg"
                          resizeMode="cover"
                        />
                        <TouchableOpacity
                          onPress={() => removePhoto(index)}
                          className="absolute -right-2 -top-2 z-10 h-6 w-6 items-center justify-center rounded-full bg-gray-800/70"
                        >
                          <MaterialIcons
                            name="close"
                            size={14}
                            color="#ffffff"
                          />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                )}

                {/* ── Max photos hint ── */}
                {photos.length === 0 && (
                  <Text className="mt-4 text-center text-sm text-gray-400">
                    Máximo {MAX_PHOTOS} fotos
                  </Text>
                )}

                {photos.length >= MAX_PHOTOS && (
                  <Text className="mt-4 text-center text-sm text-orange-500">
                    Límite de {MAX_PHOTOS} fotos alcanzado
                  </Text>
                )}

                {error ? (
                  <Text className="mt-3 text-sm text-red-500">{error}</Text>
                ) : null}
              </View>

              {/* ── Bottom-pinned CTA ── */}
              <View className="px-6 pb-5">
                <Pressable
                  onPress={handleSubmit}
                  disabled={!valid || loading}
                  className={`min-h-[50px] items-center justify-center rounded-full ${
                    valid && !loading ? "bg-orange-400" : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={`text-base font-semibold ${
                      valid && !loading ? "text-white" : "text-gray-400"
                    }`}
                  >
                    {loading ? "Guardando..." : "Continuar"}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* ── Loading overlay ── */}
      {loading && (
        <View className="absolute inset-0 z-50">
          <View className="flex-1 items-center justify-center bg-white">
            <Image
              source={require("../../assets/images/logo.png")}
              className="h-40 w-40"
              resizeMode="contain"
            />
          </View>
        </View>
      )}
    </View>
  );
}
