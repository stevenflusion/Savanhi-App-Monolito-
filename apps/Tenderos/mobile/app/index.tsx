import { StatusBar } from "expo-status-bar";
import { SafeAreaView, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-full max-w-sm rounded-2xl bg-slate-900 p-6">
          <Text className="text-2xl font-bold text-white">Tenderos Mobile</Text>
          <Text className="mt-3 text-slate-300">
            Expo Router + NativeWind conectado al preset global del monorepo.
          </Text>
        </View>
      </View>
      <StatusBar style="light" />
    </SafeAreaView>
  );
}
