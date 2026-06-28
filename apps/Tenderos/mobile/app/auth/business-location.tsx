import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Keyboard,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import Mapbox from "@rnmapbox/maps";
import { useAuth } from "@/src/components/AuthProvider";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Feather from "@expo/vector-icons/Feather";
import { MAPBOX_ACCESS_TOKEN } from "@/src/lib/mapbox";

if (MAPBOX_ACCESS_TOKEN) {
  Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);
} else {
  console.warn(
    "MAPBOX_ACCESS_TOKEN is empty — map tiles will not load. Check .env and app.config.js",
  );
}

// Default center: Quito, Ecuador
// NOTE: Mapbox uses [longitude, latitude] order everywhere
const DEFAULT_LNG = -78.52495;
const DEFAULT_LAT = -0.22985;

const SHEET_ANIM_DURATION = 300;
const DISMISS_THRESHOLD = 120;

export default function BusinessLocationScreen() {
  const { saveLocation } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<Mapbox.Camera>(null);

  const [selectedAddress, setSelectedAddress] = useState("");
  const [latitude, setLatitude] = useState(DEFAULT_LAT);
  const [longitude, setLongitude] = useState(DEFAULT_LNG);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState("");

  // Bottom-sheet state (GPS result) — animated with PanResponder
  const [showGpsResult, setShowGpsResult] = useState(false);
  const [gpsAddress, setGpsAddress] = useState("");
  const [gpsLat, setGpsLat] = useState(0);
  const [gpsLng, setGpsLng] = useState(0);

  const sheetAnimY = useRef(new Animated.Value(0)).current;
  const sheetVisibleRef = useRef(false);

  // Sync the animated value with show/hide transitions
  useEffect(() => {
    if (showGpsResult) {
      sheetVisibleRef.current = true;
      sheetAnimY.setValue(0);
    }
  }, [showGpsResult, sheetAnimY]);

  const dismissSheet = useCallback(() => {
    return new Promise<void>((resolve) => {
      Animated.timing(sheetAnimY, {
        toValue: 400,
        duration: SHEET_ANIM_DURATION,
        useNativeDriver: true,
      }).start(() => {
        sheetVisibleRef.current = false;
        setShowGpsResult(false);
        resolve();
      });
    });
  }, [sheetAnimY]);

  const sheetPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dy) > 5,
      onPanResponderMove: (_, gs) => {
        // Only allow downward drag when sheet is at origin
        if (gs.dy > 0) {
          sheetAnimY.setValue(gs.dy);
        }
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > DISMISS_THRESHOLD || gs.vy > 0.5) {
          // Flinged / dragged past threshold → dismiss
          dismissSheet();
        } else {
          // Snap back
          Animated.spring(sheetAnimY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 20,
            stiffness: 200,
          }).start();
        }
      },
    }),
  ).current;

  const hasLocation = selectedAddress.length > 0 || showGpsResult;

  // ── GPS: get current location → show bottom sheet ──
  const handleUseGPS = async () => {
    setGpsError("");
    setGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setGpsError("No dimos acceso a tu ubicación.");
        setGpsLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude: lat, longitude: lng } = loc.coords;
      setLatitude(lat);
      setLongitude(lng);
      setGpsLat(lat);
      setGpsLng(lng);

      // Animate camera to GPS coords using Mapbox flyTo [lng, lat]
      cameraRef.current?.flyTo([lng, lat], 500);

      // Reverse geocode → address text
      const revGeo = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });
      if (revGeo.length > 0 && revGeo[0]) {
        const addr = revGeo[0];
        const parts = [
          addr.street,
          addr.streetNumber,
          addr.city,
          addr.region,
        ].filter((s): s is string => !!s);
        setGpsAddress(parts.join(", "));
      } else {
        setGpsAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }

      // Show bottom sheet with the result
      setShowGpsResult(true);
    } catch {
      setGpsError("No pudimos obtener tu ubicación.");
    }
    setGpsLoading(false);
  };

  // ── Draggable pin ──
  // onDragEnd receives a GeoJSON Feature; coordinates = [lng, lat]
  const onDragEnd = (feature: any) => {
    const [lng, lat] = feature.geometry.coordinates;
    setLatitude(lat);
    setLongitude(lng);
    setSelectedAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
  };

  // ── Confirm from bottom sheet (saves location + navigates) ──
  const handleConfirm = async () => {
    if (loading || !hasLocation) return;

    // Resolve final location: use GPS values (modal is visible)
    const finalAddress = showGpsResult ? gpsAddress : selectedAddress;
    const finalLat = showGpsResult ? gpsLat : latitude;
    const finalLng = showGpsResult ? gpsLng : longitude;

    if (!finalAddress) return;

    // 1. Animate the bottom sheet out, then wait for it to finish
    await dismissSheet();

    // 2. THEN show loading overlay and save
    setLoading(true);
    const result = await saveLocation({
      address: finalAddress,
      latitude: finalLat,
      longitude: finalLng,
    });
    setLoading(false);

    if (result.success) {
      // Sync state and animate map
      setSelectedAddress(finalAddress);
      setLatitude(finalLat);
      setLongitude(finalLng);
      cameraRef.current?.flyTo([finalLng, finalLat], 500);
      router.push("/auth/store-photos" as any);
    }
  };

  const handleBack = () => {
    Keyboard.dismiss();
    setTimeout(() => router.back(), 50);
  };

  return (
    <View className="flex-1 bg-gray-200">
      {/* ══════ FULL-SCREEN MAP AS BACKGROUND (Mapbox) ══════ */}
      <Mapbox.MapView
        style={StyleSheet.absoluteFill}
        styleURL="mapbox://styles/mapbox/streets-v12"
        scaleBarEnabled={false}
        logoEnabled={false}
        attributionEnabled={false}
      >
        <Mapbox.Camera
          ref={cameraRef}
          centerCoordinate={[longitude, latitude]} // [lng, lat]
          zoomLevel={15}
          animationMode="flyTo"
          animationDuration={500}
        />
        <Mapbox.PointAnnotation
          key={`pin-${latitude}-${longitude}`}
          id="business-pin"
          coordinate={[longitude, latitude]} // [lng, lat]
          draggable
          onDragEnd={onDragEnd}
          title="Tu negocio"
          subtitle={selectedAddress || "Arrastra para ajustar"}
        />
      </Mapbox.MapView>

      {/* ══════ UI OVERLAY (on top of map) ══════ */}
      <View className="flex-1">
        {/* ── Back button ── */}
        <View style={{ paddingTop: insets.top + 16 }} className="px-6">
          <Pressable onPress={handleBack} className="h-10 w-10 justify-center">
            <FontAwesome6 name="chevron-left" size={24} color="black" />
          </Pressable>
        </View>

        {/* ── Spacer pushes bottom content down ── */}
        <View className="flex-1" />

        {/* ── GPS error ── */}
        {gpsError ? (
          <View className="mx-6 mb-2 rounded-lg bg-white/80 px-3 py-2">
            <Text className="text-center text-sm text-gray-500">
              {gpsError}
            </Text>
          </View>
        ) : null}

        {/* ── Address preview card ── */}
        {selectedAddress.length > 0 ? (
          <View
            className="mx-6 mb-3 flex-row items-center gap-2 rounded-xl bg-white px-4 py-3"
            style={{
              elevation: 4,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.15,
              shadowRadius: 3,
            }}
          >
            <MaterialIcons name="check-circle" size={18} color="#22c55e" />
            <Text className="flex-1 text-sm text-gray-700" numberOfLines={2}>
              {selectedAddress}
            </Text>
          </View>
        ) : null}

        {/* ── Main CTA: Obtener ubicación (replaces floating GPS icon) ── */}
        <View className="px-6" style={{ paddingBottom: insets.bottom + 16 }}>
          <Pressable
            onPress={handleUseGPS}
            disabled={gpsLoading}
            className="h-16 flex-row items-center justify-center gap-2 rounded-full bg-black"
          >
            {gpsLoading ? null : (
              <MaterialIcons name="my-location" size={18} color="white" />
            )}
            <Text className="text-lg text-white">
              {gpsLoading ? (
                <View className="animate-spin">
                  <Feather name="loader" size={18} color="white" />
                </View>
              ) : (
                "Obtener ubicación"
              )}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* ══════ GPS RESULT BOTTOM SHEET (animated + draggable) ══════ */}
      {showGpsResult && (
        <View className="absolute inset-0 z-40">
          {/* Tap backdrop to dismiss */}
          <Pressable
            className="flex-1 bg-black/40"
            onPress={dismissSheet}
          />

          {/* Sheet */}
          <Animated.View
            style={{
              transform: [{ translateY: sheetAnimY }],
            }}
            className="rounded-t-3xl bg-white px-6 pb-10 pt-2"
            {...sheetPanResponder.panHandlers}
          >
            {/* Draggable handle bar */}
            <View className="mb-6 self-center h-1 w-12 rounded-full bg-gray-400" />

            {/* Icon */}
            <View className="items-center mb-4">
              <MaterialIcons name="location-on" size={44} color="black" />
            </View>

            <Text className="text-3xl mb-2 text-center font-medium text-gray-900">
              Ubicación actual
            </Text>
            <Text className="text-base mb-4 text-center leading-5 text-gray-600">
              {gpsAddress}
            </Text>

            <Pressable
              onPress={handleConfirm}
              disabled={loading}
              className="h-16 items-center justify-center rounded-full bg-black"
            >
              <Text className="text-lg font-medium text-white">
                {"Confirmar ubicación"}
              </Text>
            </Pressable>

            <Text className="text-center flex items-center justify-center text-sm pt-4">
              <MaterialIcons name="lock" size={12} color="black" /> Esta
              información ayuda a personalizar tu sesión
            </Text>
          </Animated.View>
        </View>
      )}

      {/* ══════ LOADING OVERLAY ══════ */}
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
