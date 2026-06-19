/**
 * Ecuadorian cédula validation (módulo 10 algorithm).
 *
 * Rules:
 * 1. Must be exactly 10 digits
 * 2. All numeric
 * 3. First 2 digits (province code): 01-24 or 00 (Ecuatorianos en el exterior)
 * 4. Third digit cannot be 6 or higher
 * 5. Verification digit algorithm (módulo 10 with coefficients [2,1,2,1,2,1,2,1,2])
 * 6. Returns { valid: true } or { valid: false, error: "mensaje descriptivo" }
 */

const COEFFICIENTS = [2, 1, 2, 1, 2, 1, 2, 1, 2] as const

export function validateCedula(cedula: string): {
  valid: boolean
  error?: string
} {
  if (!/^\d{10}$/.test(cedula)) {
    return { valid: false, error: "La cédula debe tener exactamente 10 dígitos numéricos" }
  }

  const provinceCode = Number.parseInt(cedula.substring(0, 2), 10)
  if (provinceCode > 24) {
    return { valid: false, error: "El código de provincia no es válido (debe ser 00-24)" }
  }

  const thirdDigit = Number.parseInt(cedula.charAt(2), 10)
  if (thirdDigit >= 6) {
    return { valid: false, error: "El tercer dígito no puede ser mayor o igual a 6" }
  }

  // Módulo 10 verification digit algorithm
  let sum = 0
  for (let i = 0; i < 9; i++) {
    let product = Number.parseInt(cedula.charAt(i), 10) * COEFFICIENTS[i]!
    if (product >= 10) {
      product -= 9
    }
    sum += product
  }

  const verificationDigit = Number.parseInt(cedula.charAt(9), 10)

  let expectedDigit: number
  if (sum % 10 === 0) {
    expectedDigit = 0
  } else {
    expectedDigit = 10 - (sum % 10)
  }

  if (verificationDigit !== expectedDigit) {
    return { valid: false, error: "El dígito verificador de la cédula no coincide" }
  }

  return { valid: true }
}
