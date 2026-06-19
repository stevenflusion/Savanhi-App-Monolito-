import { useCallback, useEffect, useRef, useState } from "react"
import {
  FlatList,
  Image,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import * as Location from "expo-location"
import MapView, { MapMarker } from "react-native-maps"
import { useAuth } from "@/src/components/AuthProvider"
import ProgressBar from "@/src/components/auth/ProgressBar"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import Feather from "@expo/vector-icons/Feather"

// ── Google Places config ──
// Get your API key from https://console.cloud.google.com/apis/credentials
// Enable: Places API
const GOOGLE_API_KEY = "YOUR_GOOGLE_API_KEY"

// Default center: Quito, Ecuador
const DEFAULT_REGION = {
  latitude: -0.22985,
  longitude: -78.52495,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
}

type Suggestion = {
  place_id: string
  description: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
}

export default function BusinessLocationScreen() {
  const { saveLocation } = useAuth()
  const router = useRouter()
  const mapRef = useRef<MapView>(null)

  const [search, setSearch] = useState("")
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState("")
  const [latitude, setLatitude] = useState(DEFAULT_REGION.latitude)
  const [longitude, setLongitude] = useState(DEFAULT_REGION.longitude)
  const [loading, setLoading] = useState(false)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsError, setGpsError] = useState("")

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchInputRef = useRef<TextInput>(null)

  const hasLocation = selectedAddress.length > 0

  // ── Google Places Autocomplete (debounced 400ms) ──
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&components=country:ec&key=${GOOGLE_API_KEY}`
      const res = await fetch(url)
      const data = await res.json()
      if (data.predictions) {
        setSuggestions(data.predictions)
        setShowSuggestions(true)
      }
    } catch {
      // Silently fail — search stays usable
    }
  }, [])

  const onSearchChange = (text: string) => {
    setSearch(text)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(text), 400)
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  // ── Select suggestion → get coords via Place Details ──
  const selectSuggestion = async (suggestion: Suggestion) => {
    Keyboard.dismiss()
    setShowSuggestions(false)
    setSearch(suggestion.description)
    setSelectedAddress(suggestion.description)

    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${suggestion.place_id}&fields=geometry,formatted_address&key=${GOOGLE_API_KEY}`
      const res = await fetch(url)
      const data = await res.json()
      if (data.result?.geometry?.location) {
        const { lat, lng } = data.result.geometry.location
        setLatitude(lat)
        setLongitude(lng)
        mapRef.current?.animateToRegion(
          {
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          500,
        )
      }
    } catch {
      // Coords stay at default
    }
  }

  // ── GPS: use current location ──
  const handleUseGPS = async () => {
    setGpsError("")
    setGpsLoading(true)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        setGpsError(
          "No dimos acceso a tu ubicación. Podés buscar la dirección manualmente.",
        )
        setGpsLoading(false)
        return
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })
      const { latitude: lat, longitude: lng } = loc.coords
      setLatitude(lat)
      setLongitude(lng)

      // Reverse geocode to get address text
      const revGeo = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng })
      if (revGeo.length > 0 && revGeo[0]) {
        const addr = revGeo[0]
        const parts = [addr.street, addr.streetNumber, addr.city, addr.region].filter((s): s is string => !!s)
        setSelectedAddress(parts.join(", "))
        setSearch(parts.join(", "))
      } else {
        setSelectedAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
        setSearch(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
      }

      mapRef.current?.animateToRegion(
        {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500,
      )
    } catch {
      setGpsError("No pudimos obtener tu ubicación. Intentá con el buscador.")
    }
    setGpsLoading(false)
  }

  // ── Draggable pin ──
  const onMarkerDragEnd = (e: any) => {
    const { latitude: lat, longitude: lng } = e.nativeEvent.coordinate
    setLatitude(lat)
    setLongitude(lng)
  }

  // ── Confirm ──
  const handleConfirm = async () => {
    if (!hasLocation || loading) return
    setLoading(true)
    const result = await saveLocation({
      address: selectedAddress,
      latitude,
      longitude,
    })
    setLoading(false)
    if (result.success) {
      router.push("/auth/account-created" as any)
    }
  }

  const handleBack = () => {
    Keyboard.dismiss()
    setTimeout(() => router.back(), 50)
  }

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1">
        {/* ── Header ── */}
        <View className="flex-row items-center justify-between px-6 pt-2">
          <Pressable onPress={handleBack} className="h-14 w-14 justify-center">
            <MaterialIcons name="arrow-back" size={26} color="#798091" />
          </Pressable>
          <Text className="text-lg font-semibold text-[#25262a]">
            Ubicación del negocio
          </Text>
          <Text className="text-base text-gray-500">Paso 2 de 3</Text>
        </View>

        {/* ── ProgressBar ── */}
        <View className="mt-2 px-6">
          <ProgressBar current={2} total={3} />
        </View>

        {/* ── Search input ── */}
        <View className="relative z-10 mt-4 px-6">
          <View className="flex-row items-center rounded-xl border border-gray-300 bg-gray-50 px-4">
            <MaterialIcons name="search" size={22} color="#9ca3af" />
            <TextInput
              ref={searchInputRef}
              value={search}
              onChangeText={onSearchChange}
              placeholder="Buscar dirección en Ecuador"
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
              autoCorrect={false}
              className="ml-2 h-[48px] flex-1 text-base text-gray-900"
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true)
              }}
            />
            {search.length > 0 && (
              <Pressable
                onPress={() => {
                  setSearch("")
                  setSuggestions([])
                  setShowSuggestions(false)
                }}
              >
                <MaterialIcons name="close" size={20} color="#9ca3af" />
              </Pressable>
            )}
          </View>

          {/* ── Suggestions dropdown ── */}
          {showSuggestions && suggestions.length > 0 && (
            <View className="absolute left-6 right-6 top-[56px] z-20 max-h-52 rounded-xl border border-gray-200 bg-white shadow-lg">
              <FlatList
                data={suggestions}
                keyExtractor={(item) => item.place_id}
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
                        {item.structured_formatting.main_text}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {item.structured_formatting.secondary_text}
                      </Text>
                    </View>
                  </Pressable>
                )}
              />
            </View>
          )}
        </View>

        {/* ── GPS button ── */}
        <View className="mt-3 px-6">
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
                ? "Obteniendo ubicación..."
                : "Usar mi ubicación actual"}
            </Text>
          </Pressable>
          {gpsError ? (
            <Text className="mt-1 text-sm text-gray-500">{gpsError}</Text>
          ) : null}
        </View>

        {/* ── Map ── */}
        <View className="mx-6 mt-3 h-40 overflow-hidden rounded-xl border border-gray-200">
          <MapView
            ref={mapRef}
            className="h-full w-full"
            initialRegion={DEFAULT_REGION}
            region={{
              latitude,
              longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <MapMarker
              draggable
              coordinate={{ latitude, longitude }}
              onDragEnd={onMarkerDragEnd}
              title="Tu negocio"
              description={selectedAddress || "Arrastra para ajustar"}
            />
          </MapView>
        </View>

        {/* ── Map help text ── */}
        <Text className="mt-2 px-6 text-center text-sm leading-5 text-gray-500">
          Podés mover el pin para ajustar la posición exacta
        </Text>

        {/* ── Selected address preview ── */}
        {hasLocation ? (
          <View className="mx-6 mt-3 flex-row items-center gap-2 rounded-lg bg-gray-50 px-4 py-3">
            <MaterialIcons name="check-circle" size={18} color="#22c55e" />
            <Text className="flex-1 text-sm text-gray-700" numberOfLines={2}>
              {selectedAddress}
            </Text>
          </View>
        ) : null}

        {/* ── Confirm button (pinned bottom) ── */}
        <View className="mt-auto px-6 pb-5">
          <Pressable
            onPress={handleConfirm}
            disabled={!hasLocation || loading}
            className={`min-h-[50px] items-center justify-center rounded-full ${
              hasLocation && !loading ? "bg-orange-400" : "bg-gray-100"
            }`}
          >
            <Text
              className={`text-base font-semibold ${
                hasLocation && !loading ? "text-white" : "text-gray-400"
              }`}
            >
              {loading ? "Guardando..." : "Confirmar ubicación"}
            </Text>
          </Pressable>
        </View>
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
  )
}
