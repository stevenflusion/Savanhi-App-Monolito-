import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  Platform,
  Pressable,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, useRouter } from "expo-router";
import { useAuth } from "@/src/components/AuthProvider";

import EmailStep from "@/src/components/auth/EmailStep";
import PasswordStep from "@/src/components/auth/PasswordStep";
import ConfirmPasswordStep from "@/src/components/auth/ConfirmPasswordStep";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function LoginScreen() {
  const { isLoggedIn, isReady, login } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ── Keyboard height tracking ──
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => setKeyboardHeight(e.endCoordinates.height),
    );
    const hide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardHeight(0),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  // ── Step transition animation ──
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const direction = useRef(1); // 1 = forward, -1 = backward

  const goToStep = (next: number) => {
    direction.current = next > step ? 1 : -1;
    fadeAnim.setValue(0);
    slideAnim.setValue(direction.current * 40);
    setStep(next);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  };

  if (!isReady) return null;
  if (isLoggedIn) return <Redirect href={"/(tabs)" as never} />;

  const handleBack = () => {
    if (step === 0) {
      router.push("/auth/welcome");
    } else {
      goToStep(step - 1);
    }
  };

  const handleLogin = async () => {
    const ok = await login(email, password);
    if (!ok) return;
    router.replace("/(tabs)" as never);
  };

  const stepContent =
    step === 0 ? (
      <EmailStep email={email} onChange={setEmail} onNext={() => goToStep(1)} />
    ) : step === 1 ? (
      <PasswordStep
        password={password}
        onChange={setPassword}
        onNext={() => goToStep(2)}
      />
    ) : (
      <ConfirmPasswordStep
        password={password}
        confirmPassword={confirmPassword}
        onChange={setConfirmPassword}
        onConfirm={handleLogin}
        onBackToPassword={() => goToStep(1)}
      />
    );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* ── Back button ── */}
        <Pressable
          onPress={handleBack}
          className="absolute left-6 top-14 z-10 items-center justify-center active:bg-gray-100"
        >
          <MaterialIcons name="arrow-back" color="#787f8f" size={26} />
        </Pressable>

        {/* ── Animated step content ── */}
        <Animated.View
          style={{
            flex: 1,
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
            paddingBottom: keyboardHeight,
          }}
        >
          {stepContent}
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
