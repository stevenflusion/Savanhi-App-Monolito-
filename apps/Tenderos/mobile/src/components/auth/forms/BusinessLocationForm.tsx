import { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import Mapbox from "@rnmapbox/maps";
import { useAuth } from "@/src/components/AuthProvider";
import { useAuthLoading } from "@/src/components/auth/AuthLoadingContext";
import BackButton from "@/src/components/auth/BackButton";
import ScreenTitle from "@/src/components/auth/ScreenTitle";
import FormButton from "@/src/components/auth/FormButton";
import { businessLocationMessages } from "@/src/components/auth/messages";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Feather from "@expo/vector-icons/Feather";
import { MAPBOX_ACCESS_TOKEN, buildGeocodeUrl } from "@/src/lib/mapbox";

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

type Suggestion = {
  id: string;
  name: string;
  subtitle: string;
  coordinates: [number, number]; // [lng, lat]
};

export default function BusinessLocationForm() {
  const { saveLocation } = useAuth();
  const router = useRouter();
  const cameraRef = useRef<Mapbox.Camera>(null);

  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [latitude, setLatitude] = useState(DEFAULT_LAT);
  const [longitude, setLongitude] = useState(DEFAULT_LNG);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState("");
  const [geocodingError, setGeocodingError] = useState("");
  const { setLoading: setGlobalLoading } = useAuthLoading();

  useEffect(() => {
    return () => setGlobalLoading(false);
  }, [setGlobalLoading]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<TextInput>(null);

  const hasLocation = selectedAddress.length > 0;

  // ── Mapbox Geocoding v6 (single call, debounced 400ms, AbortController) ──
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Cancel any in-flight request so only the latest resolves
    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    try {
      const url = buildGeocodeUrl(query);
      const res = await fetch(url, { signal: abortRef.current.signal });
      const data = await res.json();

      if (data.features?.length > 0) {
        setSuggestions(
          data.features.map(
            (f: {
              id?: string;
              geometry: { coordinates: [number, number] };
              properties: { name: string; place_formatted: string };
            }) => ({
              id:
                f.id ??
                `${f.geometry.coordinates[0]}-${f.geometry.coordinates[1]}`,
              name: f.properties?.name ?? "",
              subtitle: f.properties?.place_formatted ?? "",
              coordinates: f.geometry.coordinates, // [lng, lat]
            }),
          ),
        );
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setGeocodingError("Error al buscar dirección");
      // Auto-dismiss toast after 3s
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setGeocodingError(""), 3000);
    }
  }, []);

  const onSearchChange = (text: string) => {
    setSearch(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(text), 400);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // ── Select suggestion → flyTo [lng, lat] + set state (single call) ──
  const selectSuggestion = (suggestion: Suggestion) => {
    Keyboard.dismiss();
    setShowSuggestions(false);
    const [lng, lat] = suggestion.coordinates; // [lng, lat] from Mapbox
    const fullAddress = `${suggestion.name}, ${suggestion.subtitle}`;
    setSearch(fullAddress);
    setSelectedAddress(fullAddress);
    setLatitude(lat);
    setLongitude(lng);
    cameraRef.current?.flyTo([lng, lat], 500);
  };

  // ── GPS: use current location ──
  const handleUseGPS = async () => {
    setGpsError("");
    setGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setGpsError(businessLocationMessages.errors.gpsDenied);
        setGpsLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude: lat, longitude: lng } = loc.coords;
      setLatitude(lat);
      setLongitude(lng);

      // Reverse geocode
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
        setSelectedAddress(parts.join(", "));
        setSearch(parts.join(", "));
      } else {
        setSelectedAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        setSearch(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }

      // Animate camera to GPS coords using Mapbox flyTo [lng, lat]
      cameraRef.current?.flyTo([lng, lat], 500);
    } catch {
      setGpsError(businessLocationMessages.errors.gpsFailed);
    }
    setGpsLoading(false);
  };

  // ── Draggable pin ──
  // onDragEnd receives a GeoJSON Feature; coordinates = [lng, lat]
  const onDragEnd = (feature: any) => {
    const [lng, lat] = feature.geometry.coordinates;
    setLatitude(lat);
    setLongitude(lng);
  };

  // ── Confirm ──
  const handleConfirm = async () => {
    if (!hasLocation || loading) return;
    setLoading(true);
    setGlobalLoading(true);
    const result = await saveLocation({
      address: selectedAddress,
      latitude,
      longitude,
    });
    if (result.success) {
      router.push("/auth/store-photos" as any);
      setTimeout(() => {
        setLoading(false);
        setGlobalLoading(false);
      }, 350);
    } else {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  return (
    <View className="flex-1">
      <View className="flex-1 px-6 pt-12">
        <ScreenTitle>Ubicación del negocio</ScreenTitle>

        {/* ── Search input ── */}
        <View className="relative z-10 mt-4">
          <View className="flex-row items-center rounded-xl border border-gray-300 bg-gray-50 px-4">
            <MaterialIcons name="search" size={22} color="#9ca3af" />
            <TextInput
              ref={searchInputRef}
              value={search}
              onChangeText={onSearchChange}
              placeholder={businessLocationMessages.placeholder}
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
              autoCorrect={false}
              className="ml-2 h-[48px] flex-1 text-base text-gray-900"
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
            />
            {search.length > 0 && (
              <Pressable
                onPress={() => {
                  setSearch("");
                  setSuggestions([]);
                  setShowSuggestions(false);
                }}
              >
                <MaterialIcons name="close" size={20} color="#9ca3af" />
              </Pressable>
            )}
          </View>

          {/* ── Suggestions dropdown (Mapbox Geocoding results) ── */}
          {showSuggestions && suggestions.length > 0 && (
            <View className="absolute left-0 right-0 top-[56px] z-20 max-h-52 rounded-xl border border-gray-200 bg-white shadow-lg">
              <FlatList
                data={suggestions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => selectSuggestion(item)}
                    className="flex-row items-center border-b border-gray-100 px-4 py-3"
                  >
                    <MaterialIcons
                      name="location-on"
                      size={20}
                      color="#f97316"
                    />
                    <View className="ml-3 flex-1">
                      <Text className="text-base text-gray-900">
                        {item.name}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {item.subtitle}
                      </Text>
                    </View>
                  </Pressable>
                )}
              />
            </View>
          )}

          {/* ── Geocoding error toast (non-blocking, auto-dismiss 3s) ── */}
          {geocodingError.length > 0 && (
            <View className="mt-2 rounded-lg bg-red-50 px-4 py-2">
              <Text className="text-sm text-red-600">{geocodingError}</Text>
            </View>
          )}
        </View>

        {/* ── GPS button ── */}
        <View className="mt-3">
          <Pressable
            onPress={handleUseGPS}
            disabled={gpsLoading}
            className="flex-row items-center justify-center gap-2 rounded-xl border border-orange-300 bg-orange-50 py-3"
          >
            <Feather
              name={gpsLoading ? "loader" : "map-pin"}
              size={18}
              color="#f97316"
            />
            <Text className="text-base font-medium text-orange-600">
              {gpsLoading
                ? businessLocationMessages.gps.loading
                : businessLocationMessages.gps.idle}
            </Text>
          </Pressable>
          {gpsError ? (
            <Text className="mt-1 text-sm text-gray-500">{gpsError}</Text>
          ) : null}
        </View>

        {/* ── Map (Mapbox) ── */}
        <View className="mt-3 h-40 rounded-xl border border-gray-200">
          <Mapbox.MapView
            style={{ flex: 1 }}
            styleURL="mapbox://styles/mapbox/streets-v12"
          >
            <Mapbox.Camera
              ref={cameraRef}
              centerCoordinate={[longitude, latitude]} // [lng, lat]
              zoomLevel={15}
              animationMode="flyTo"
              animationDuration={500}
            />
            <Mapbox.PointAnnotation
              id="business-pin"
              coordinate={[longitude, latitude]} // [lng, lat]
              draggable
              onDragEnd={onDragEnd}
              title="Tu negocio"
              subtitle={selectedAddress || "Arrastra para ajustar"}
            />
          </Mapbox.MapView>
        </View>

        {/* ── Map help text ── */}
        <Text className="mt-2 text-center text-sm leading-5 text-gray-500">
          {businessLocationMessages.mapHint}
        </Text>

        {/* ── Selected address preview ── */}
        {hasLocation ? (
          <View className="mt-3 flex-row items-center gap-2 rounded-lg bg-gray-50 px-4 py-3">
            <MaterialIcons name="check-circle" size={18} color="#22c55e" />
            <Text className="flex-1 text-sm text-gray-700" numberOfLines={2}>
              {selectedAddress}
            </Text>
          </View>
        ) : null}

        {/* ── Confirm button ── */}
        <View className="mt-auto">
          <FormButton
            label="Confirmar ubicación"
            valid={hasLocation}
            loading={loading}
            onPress={handleConfirm}
          />
        </View>
      </View>
    </View>
  );
}
