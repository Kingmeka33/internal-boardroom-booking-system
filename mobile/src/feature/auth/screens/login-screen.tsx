import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@app/navigation/route-types";
import { useFormErrors } from "@shared/forms/use-form-errors";
import { email as emailValidator, password as passwordValidator } from "@shared/validation/validators";
import { AppButton, AppTextInput, ErrorState, PageHeader, PasswordInput, ScreenContainer, SectionCard } from "@shared/components";
import { colors, spacing, typography } from "@shared/design-system/tokens";
import { useLogin } from "../hooks/use-login";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;
type LoginField = "email" | "password";

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { errors, setErrors, clearErrors } = useFormErrors<LoginField>();
  const { errorMessage, isLoading, submitLogin } = useLogin();

  async function handleSubmit(): Promise<void> {
    const nextErrors = {
      email: emailValidator(email) || undefined,
      password: passwordValidator(password) || undefined
    };
    setErrors(nextErrors);

    if (nextErrors.email || nextErrors.password) return;
    clearErrors();
    await submitLogin(email, password);
  }

  return (
    <ScreenContainer keyboardAvoiding>
      <PageHeader
        eyebrow="Secure access"
        title="Sign in"
        description="Use your Internal Boardroom Booking account to continue."
      />
      <SectionCard>
        {errorMessage ? <ErrorState message={errorMessage} /> : null}
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
        <PasswordInput
          autoComplete="current-password"
          error={errors.password}
          label="Password"
          onChangeText={setPassword}
          value={password}
        />
        <AppButton
          disabled={isLoading}
          onPress={() => void handleSubmit()}
          title={isLoading ? "Signing in" : "Sign in"}
        />
        <View style={styles.links}>
          <Pressable onPress={() => navigation.navigate("ForgotPassword")}>
            <Text style={styles.link}>Forgot password?</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate("ResetPassword")}>
            <Text style={styles.link}>Have a reset token?</Text>
          </Pressable>
        </View>
      </SectionCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  link: {
    color: colors.primary,
    fontSize: typography.small,
    fontWeight: "700"
  },
  links: {
    gap: spacing.sm,
    marginTop: spacing.lg
  }
});
