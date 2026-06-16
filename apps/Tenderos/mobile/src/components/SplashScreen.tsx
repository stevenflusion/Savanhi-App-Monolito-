import { View, StyleSheet } from "react-native"
import LottieView from "lottie-react-native"
import { useCallback, useRef } from "react"
import * as ExpoSplashScreen from "expo-splash-screen"

ExpoSplashScreen.preventAutoHideAsync()

type SplashScreenProps = {
  onReady: () => void
}

export default function SplashScreen({ onReady }: SplashScreenProps) {
  const animationRef = useRef<LottieView>(null)
  const hasFinished = useRef(false)

  const handleAnimationFinish = useCallback(() => {
    if (hasFinished.current) return
    hasFinished.current = true
    ExpoSplashScreen.hide()
    onReady()
  }, [onReady])

  const handleLayout = useCallback(() => {
    animationRef.current?.play()
  }, [])

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <LottieView
        ref={animationRef}
        source={require("@/assets/lotties/LottieSplashScreen.json")}
        autoPlay
        loop={false}
        resizeMode="cover"
        onAnimationFinish={handleAnimationFinish}
        style={styles.animation}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  animation: {
    flex: 1,
    width: "100%",
  },
})
