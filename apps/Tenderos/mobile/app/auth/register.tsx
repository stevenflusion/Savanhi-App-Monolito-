import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, SafeAreaView, Text, TextInput, View } from "react-native";
import { Link, Redirect, useRouter } from "expo-router";
import { useAuth } from "@/src/components/AuthProvider";

export default function RegisterScreen() {
  const { isLoggedIn, register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const handleRegister = () => {
    const ok = register(name, email, password);
    if (!ok) {
      setError("Completa datos validos. Clave minima: 6 caracteres.");
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
          <Text className="text-2xl font-semibold text-white">Crear cuenta</Text>
          <Text className="mt-2 text-slate-300">
            Registra tu negocio para empezar a administrar inventario.
          </Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Nombre del tendero"
            placeholderTextColor="#64748b"
            className="mt-5 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
          />

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Correo"
            placeholderTextColor="#64748b"
            autoCapitalize="none"
            keyboardType="email-address"
            className="mt-3 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
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
            onPress={handleRegister}
            className="mt-5 min-h-[44px] items-center justify-center rounded-xl bg-green-500"
          >
            <Text className="text-base font-semibold text-slate-950">Registrarme</Text>
          </Pressable>

          <View className="mt-4 flex-row items-center justify-center gap-1">
            <Text className="text-slate-300">Ya tienes cuenta?</Text>
            <Link href="/auth/login" asChild>
              <Pressable>
                <Text className="font-semibold text-green-400">Inicia sesion</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}
