import { View, Image } from "react-native"

export default function LoadingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Image
        source={require("../../assets/images/logo.png")}
        className="h-40 w-40"
        resizeMode="contain"
      />
    </View>
  )
}
