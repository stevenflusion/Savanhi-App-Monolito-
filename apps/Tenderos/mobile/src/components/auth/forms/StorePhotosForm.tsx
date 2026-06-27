import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/components/AuthProvider";
import * as ImagePicker from "expo-image-picker";
import { storePhotosMessages } from "@/src/components/auth/messages";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import BackButton from "@/src/components/auth/BackButton";
import ScreenTitle from "@/src/components/auth/ScreenTitle";
import FormButton from "@/src/components/auth/FormButton";
import { useAuthLoading } from "@/src/components/auth/AuthLoadingContext";

const MIN_PHOTOS = 3;
const MAX_PHOTOS = 3;

export default function StorePhotosForm() {
  const { savePhotos } = useAuth();
  const router = useRouter();
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setLoading: setGlobalLoading } = useAuthLoading();
  useEffect(() => {
    return () => setGlobalLoading(false);
  }, [setGlobalLoading]);

  const valid = photos.length >= MIN_PHOTOS;

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
              setPhotos((prev) => [...prev, asset.uri].slice(0, MAX_PHOTOS));
            }
          } catch {
            setError(storePhotosMessages.errors.camera);
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
              setPhotos((prev) => [...prev, asset.uri].slice(0, MAX_PHOTOS));
            }
          } catch {
            setError(storePhotosMessages.errors.gallery);
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
    setGlobalLoading(true);
    setError("");
    const result = await savePhotos(photos);

    if (result.success) {
      router.push("/auth/payment-method" as any);
      setTimeout(() => {
        setLoading(false);
        setGlobalLoading(false);
      }, 350);
    } else {
      setLoading(false);
      setGlobalLoading(false);
      setError(result.error ?? storePhotosMessages.errors.save);
    }
  };

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-10">
          <BackButton />

          <ScreenTitle>Fotos de tu local</ScreenTitle>

          <Text className="mt-2 text-base leading-5 text-gray-500">
            {storePhotosMessages.hint}
          </Text>

          {/* ── Photo Upload Zone ── */}
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
              {storePhotosMessages.hint}
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
                    <MaterialIcons name="close" size={14} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          {/* ── Hints ── */}
          {photos.length === 0 && (
            <Text className="mt-4 text-center text-sm text-gray-400">
              Necesitás al menos {MIN_PHOTOS} fotos para continuar
            </Text>
          )}

          {photos.length > 0 && photos.length < MIN_PHOTOS && (
            <Text className="mt-4 text-center text-sm text-orange-500">
              {storePhotosMessages.photosCount(photos.length, MIN_PHOTOS)}
            </Text>
          )}

          {photos.length >= MIN_PHOTOS && (
            <Text className="mt-4 text-center text-sm text-green-600">
              {storePhotosMessages.photosCount(photos.length, MAX_PHOTOS)} — ¡Listo!
            </Text>
          )}

          {error ? (
            <Text className="mt-3 text-sm text-red-500">{error}</Text>
          ) : null}
        </View>
      </ScrollView>

      <FormButton
        label="Continuar"
        loadingLabel="Guardando..."
        valid={valid}
        loading={loading}
        onPress={handleSubmit}
      />
    </View>
  );
}
