import { useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@app/navigation/route-types";
import { AppButton, AppTextInput, ErrorModal, PageHeader, PasswordInput, ScreenContainer, SectionCard, SuccessModal } from "@shared/components";
import { useFormErrors } from "@shared/forms/use-form-errors";
import { firstError, minLength, password as passwordValidator, required } from "@shared/validation/validators";
import { useResetPassword } from "../hooks/use-reset-password";

type Props = NativeStackScreenProps<RootStackParamList, "ResetPassword">;
type Field = "token" | "password";

export function ResetPasswordScreen({ route }: Props) {
  const [token, setToken] = useState(route.params?.token || "");
  const [password, setPassword] = useState("");
  const [successVisible, setSuccessVisible] = useState(false);
  const { clearError, errorMessage, isLoading, submitPasswordReset } = useResetPassword();
  const { errors, setErrors } = useFormErrors<Field>();

  async function handleSubmit(): Promise<void> {
    const tokenError = firstError(required(token, "Reset token"), minLength(token, 6, "Reset token"));
    const passwordError = passwordValidator(password);
    setErrors({
      token: tokenError || undefined,
      password: passwordError || undefined
    });
    if (tokenError || passwordError) return;

    const succeeded = await submitPasswordReset(token, password);
    if (succeeded) setSuccessVisible(true);
  }

  return (
    <ScreenContainer keyboardAvoiding>
      <PageHeader
        title="Reset password"
        description="Enter your reset token and choose a new password."
      />
      <SectionCard>
        <AppTextInput
          autoCapitalize="none"
          error={errors.token}
          label="Reset token"
          onChangeText={setToken}
          value={token}
        />
        <PasswordInput
          autoComplete="new-password"
          error={errors.password}
          label="New password"
          onChangeText={setPassword}
          value={password}
        />
        <AppButton
          disabled={isLoading}
          onPress={() => void handleSubmit()}
          title={isLoading ? "Resetting" : "Reset password"}
        />
      </SectionCard>
      <SuccessModal
        message="Your password has been reset."
        onClose={() => setSuccessVisible(false)}
        title="Password reset"
        visible={successVisible}
      />
      <ErrorModal
        message={errorMessage || ""}
        onClose={clearError}
        title="Unable to reset password"
        visible={Boolean(errorMessage)}
      />
    </ScreenContainer>
  );
}
