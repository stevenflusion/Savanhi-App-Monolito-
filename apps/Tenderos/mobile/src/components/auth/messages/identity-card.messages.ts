export const identityCardMessages = {
  placeholder: "10 dígitos sin puntos ni guiones",
  hint: "La cédula es necesaria para poder emitir facturas electrónicas.",
  errors: {
    empty: "Ingresá tu número de cédula para continuar.",
    invalidLength:
      "La cédula ecuatoriana tiene exactamente 10 dígitos. " +
      "Llevás {count}.",
    invalidProvince: "El código de provincia no es válido (debe ser 00-24).",
    invalidThirdDigit: "El tercer dígito de la cédula no puede ser 6 o mayor.",
    invalidChecksum:
      "El número no pasó la validación. Revisalo e intentá de nuevo.",
  },
  success: "Cédula válida",
} as const;
