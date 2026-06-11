import { SafeAreaView, Text } from "react-native"
import LottieView from "lottie-react-native"
import splashLogoScreen from "@/assets/lotties"

export default function SplashScreen() {
    return (
        <>
            <SafeAreaView className="flex-1 justify-center items-center">
                <LottieView
                    source={splashLogoScreen}
                    autoPlay
                    resizeMode="cover"
                    loop={false}
                    style={
                        {
                            flex: 1,
                            width: "100%"
                        }
                    }
                />
            </SafeAreaView>
        </>
    )
}