import { useState } from "react";
import { AppButton, AppTextInput, ErrorModal, PageHeader, ScreenContainer, SectionCard, SuccessModal } from "@shared/components";
import { useFormErrors } from "@shared/forms/use-form-errors";
import { email as emailValidator } from "@shared/validation/validators";
import { useForgotPassword } from "../hooks/use-forgot-password";

type Field = "email";

export function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [successVisible, setSuccessVisible] = useState(false);
  const { clearError, errorMessage, isLoading, requestPasswordReset } = useForgotPassword();
  const { errors, setErrors } = useFormErrors<Field>();

  async function handleSubmit(): Promise<void> {
    const validationError = emailValidator(email);
    setErrors({ email: validationError || undefined });
    if (validationError) return;

    const succeeded = await requestPasswordReset(email);
    if (succeeded) setSuccessVisible(true);
  }

  return (
    <ScreenContainer keyboardAvoiding>
      <PageHeader
        title="Forgot password"
        description="Request a password reset link for your account."
      />
      <SectionCard>
        <AppTextInput
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect={false}
          error={errors.email}
          keyboardType="email-address"
          label="Email address"
          onChangeText={setEmail}
          value={email}
        />
        <AppButton
          disabled={isLoading}
          onPress={() => void handleSubmit()}
          title={isLoading ? "Sending" : "Send reset link"}
        />
      </SectionCard>
      <SuccessModal
        message="If the account exists, a reset message will be sent."
        onClose={() => setSuccessVisible(false)}
        title="Request sent"
        visible={successVisible}
      />
      <ErrorModal
        message={errorMessage || ""}
        onClose={clearError}
        title="Unable to send reset"
        visible={Boolean(errorMessage)}
      />
    </ScreenContainer>
  );
}
