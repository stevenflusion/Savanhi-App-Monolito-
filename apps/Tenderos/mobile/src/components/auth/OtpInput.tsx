import { useRef, useEffect } from "react"
import { TextInput, View, Text } from "react-native"

type Props = {
  value: string
  onChange: (code: string) => void
  error?: string
}

const CELLS = 6

export default function OtpInput({ value, onChange, error }: Props) {
  const refs = useRef<(TextInput | null)[]>(Array(CELLS).fill(null))

  // Auto-focus first cell on mount
  useEffect(() => {
    refs.current[0]?.focus()
  }, [])

  const handleChangeText = (text: string, index: number) => {
    // Paste: text has more than 1 character
    if (text.length > 1) {
      const digits = text.replace(/\D/g, "").slice(0, CELLS)
      onChange(digits)
      const nextIndex = Math.min(digits.length, CELLS - 1)
      refs.current[nextIndex]?.focus()
      return
    }

    const digit = text.replace(/\D/g, "")
    if (digit) {
      const newVal =
        value.slice(0, index) + digit + value.slice(index + 1)
      onChange(newVal)
      if (index < CELLS - 1) {
        refs.current[index + 1]?.focus()
      }
    }
  }

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace") {
      if (value[index]) {
        // Clear current cell content
        const newVal = value.slice(0, index) + value.slice(index + 1)
        onChange(newVal)
      } else if (index > 0) {
        // Go back and clear previous cell
        const newVal =
          value.slice(0, index - 1) + value.slice(index)
        onChange(newVal)
        refs.current[index - 1]?.focus()
      }
    }
  }

  return (
    <View>
      <View className="flex-row justify-center gap-3">
        {Array.from({ length: CELLS }, (_, i) => (
          <TextInput
            key={i}
            ref={(r) => {
              refs.current[i] = r
            }}
            value={value[i] ?? ""}
            onChangeText={(t) => handleChangeText(t, i)}
            onKeyPress={({ nativeEvent: { key } }) =>
              handleKeyPress(key, i)
            }
            keyboardType="number-pad"
            maxLength={CELLS}
            className={`h-14 w-12 rounded-xl border-2 text-center text-xl font-semibold ${
              error
                ? "border-red-400 bg-red-50"
                : "border-gray-300 bg-white"
            }`}
            textContentType="oneTimeCode"
          />
        ))}
      </View>
      {error ? (
        <Text className="mt-3 text-center text-sm text-red-500">
          {error}
        </Text>
      ) : null}
    </View>
  )
}
