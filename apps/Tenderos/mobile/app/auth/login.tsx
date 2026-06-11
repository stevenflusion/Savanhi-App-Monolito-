import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, SafeAreaView, Text, TextInput, View } from "react-native";
import { Link, Redirect, useRouter } from "expo-router";
import { useAuth } from "@/src/components/AuthProvider";

export default function LoginScreen() {
  const { isLoggedIn, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("demo@tenderos.app");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start();
  }, [fade, slide]);

  if (isLoggedIn) return <Redirect href={"/(tabs)" as never} />;

  const handleLogin = () => {
    const ok = login(email, password);
    if (!ok) {
      setError("Credenciales incorrectas. Revisa correo y clave.");
      return;
    }
    setError("");
    router.replace("/(tabs)" as never);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950 px-5">
      <Animated.View
        style={{ opacity: fade, transform: [{ translateY: slide }] }}
        className="flex-1 justify-center"
      >
        <View className="rounded-2xl bg-slate-900 p-5">
          <Text className="text-2xl font-semibold text-white">Iniciar sesion</Text>
          <Text className="mt-2 text-slate-300">
            Gestiona productos, inventario y stock desde tu tienda.
          </Text>

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Correo"
            placeholderTextColor="#64748b"
            autoCapitalize="none"
            keyboardType="email-address"
            className="mt-5 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
          />

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Clave"
            placeholderTextColor="#64748b"
            secureTextEntry
            className="mt-3 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
          />

          {error ? <Text className="mt-3 text-sm text-red-400">{error}</Text> : null}

          <Pressable
            onPress={handleLogin}
            className="mt-5 min-h-[44px] items-center justify-center rounded-xl bg-green-500"
          >
            <Text className="text-base font-semibold text-slate-950">Entrar</Text>
          </Pressable>

          <View className="mt-4 flex-row items-center justify-center gap-1">
            <Text className="text-slate-300">No tienes cuenta?</Text>
            <Link href="/auth/register" asChild>
              <Pressable>
                <Text className="font-semibold text-green-400">Registrate</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}
