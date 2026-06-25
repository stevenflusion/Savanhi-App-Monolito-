import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import MerchantContractForm from "@/src/components/auth/forms/MerchantContractForm";

// ── Mocks ──

const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
}));

const mockSaveContract = jest.fn();
const mockSetGlobalLoading = jest.fn();

jest.mock("@/src/components/AuthProvider", () => ({
  useAuth: () => ({
    user: {
      id: "user-1",
      fullName: "Juan Pérez",
      cedula: "1712345678",
      storeName: "Tienda Don Juan",
      email: "juan@email.com",
      address: "Av. Amazonas 123",
      paymentMethod: "efectivo",
    },
    saveContract: mockSaveContract,
  }),
}));

jest.mock("@/src/components/auth/AuthLoadingContext", () => ({
  useAuthLoading: () => ({ setLoading: mockSetGlobalLoading }),
}));

// ── Helpers ──

function getCheckbox(view: ReturnType<typeof render>) {
  // The checkbox is the Pressable with the checkbox text
  return view.getByText(
    "He leído y acepto los Términos y Condiciones y la Política de Privacidad",
  );
}

// ── Tests ──

describe("MerchantContractForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── User Data Summary ──

  it("renders user data summary with all registration fields", () => {
    const view = render(<MerchantContractForm />);

    expect(view.getByText("Juan Pérez")).toBeTruthy();
    expect(view.getByText("1712345678")).toBeTruthy();
    expect(view.getByText("Tienda Don Juan")).toBeTruthy();
    expect(view.getByText("juan@email.com")).toBeTruthy();
    expect(view.getByText("Av. Amazonas 123")).toBeTruthy();
    expect(view.getByText("efectivo")).toBeTruthy();
  });

  // ── Terms ──

  it("renders scrollable terms with version label", () => {
    const view = render(<MerchantContractForm />);

    expect(view.getByText("Versión: 1.0.0")).toBeTruthy();
    expect(view.getByText("Términos y condiciones")).toBeTruthy();
  });

  // ── Acceptance Checkbox ──

  it("renders checkbox label", () => {
    const view = render(<MerchantContractForm />);

    expect(
      view.getByText(
        "He leído y acepto los Términos y Condiciones y la Política de Privacidad",
      ),
    ).toBeTruthy();
  });

  it("accept button is disabled when checkbox is unchecked", () => {
    const view = render(<MerchantContractForm />);

    const button = view.getByText("Aceptar");
    fireEvent.press(button);

    expect(mockSaveContract).not.toHaveBeenCalled();
  });

  it("accept button becomes enabled when checkbox is checked", async () => {
    mockSaveContract.mockResolvedValueOnce({ success: true });

    const view = render(<MerchantContractForm />);

    // Check the checkbox
    const checkbox = getCheckbox(view);
    fireEvent.press(checkbox);

    // Now the button should be enabled. Press "Aceptar"
    const button = view.getByText("Aceptar");
    fireEvent.press(button);

    await waitFor(() => {
      expect(mockSaveContract).toHaveBeenCalledTimes(1);
    });
  });

  // ── Payload ──

  it("builds correct payload on submit", () => {
    mockSaveContract.mockResolvedValueOnce({ success: true });

    const view = render(<MerchantContractForm />);

    // Check checkbox
    fireEvent.press(getCheckbox(view));

    // Press accept
    fireEvent.press(view.getByText("Aceptar"));

    expect(mockSaveContract).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        fullName: "Juan Pérez",
        cedula: "1712345678",
        storeName: "Tienda Don Juan",
        email: "juan@email.com",
        address: "Av. Amazonas 123",
        paymentMethod: "efectivo",
        termsVersion: "1.0.0",
        signature: "digital",
      }),
    );

    // Check that dates and unknown fields exist
    const callArg = mockSaveContract.mock.calls[0][0];
    expect(callArg).toHaveProperty("acceptedAt");
    expect(typeof callArg.acceptedAt).toBe("string");
    expect(callArg.ipAddress).toBe("unknown");
    expect(callArg.userAgent).toBe("unknown");
  });

  // ── Navigation ──

  it("navigates to account-created on success", async () => {
    mockSaveContract.mockResolvedValueOnce({ success: true });

    const view = render(<MerchantContractForm />);

    fireEvent.press(getCheckbox(view));
    fireEvent.press(view.getByText("Aceptar"));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/auth/account-created");
    });
  });

  // ── Error State ──

  it("shows error and stays on screen when saveContract fails", async () => {
    mockSaveContract.mockResolvedValueOnce({
      success: false,
      error: "Error de conexión",
    });

    const view = render(<MerchantContractForm />);

    fireEvent.press(getCheckbox(view));
    fireEvent.press(view.getByText("Aceptar"));

    await waitFor(() => {
      expect(view.getByText("Error de conexión")).toBeTruthy();
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  // ── Loading States ──

  it("shows loading overlay during submission", async () => {
    // Never resolve — keep loading
    mockSaveContract.mockImplementationOnce(
      () => new Promise(() => {}), // pending forever
    );

    const view = render(<MerchantContractForm />);

    fireEvent.press(getCheckbox(view));
    fireEvent.press(view.getByText("Aceptar"));

    // The button should show loading label
    expect(view.getByText("Guardando...")).toBeTruthy();

    // Global loading should be set
    expect(mockSetGlobalLoading).toHaveBeenCalledWith(true);
  });

  it("checkbox is disabled during loading", async () => {
    mockSaveContract.mockImplementationOnce(
      () => new Promise(() => {}), // pending forever
    );

    const view = render(<MerchantContractForm />);

    fireEvent.press(getCheckbox(view));
    fireEvent.press(view.getByText("Aceptar"));

    // The checkbox Pressable should be disabled
    const checkbox = getCheckbox(view);
    fireEvent.press(checkbox);

    // Should still have called saveContract only once (the first submit)
    expect(mockSaveContract).toHaveBeenCalledTimes(1);
  });

  // ── Retry ──

  it("allows retry after error", async () => {
    // First call fails
    mockSaveContract.mockResolvedValueOnce({
      success: false,
      error: "Error de red",
    });
    // Second call succeeds
    mockSaveContract.mockResolvedValueOnce({ success: true });

    const view = render(<MerchantContractForm />);

    // First attempt
    fireEvent.press(getCheckbox(view));
    fireEvent.press(view.getByText("Aceptar"));

    await waitFor(() => {
      expect(view.getByText("Error de red")).toBeTruthy();
    });

    // Second attempt — checkbox is still checked, press accept
    fireEvent.press(view.getByText("Aceptar"));

    await waitFor(() => {
      expect(mockSaveContract).toHaveBeenCalledTimes(2);
      expect(mockPush).toHaveBeenCalledWith("/auth/account-created");
    });
  });
});
