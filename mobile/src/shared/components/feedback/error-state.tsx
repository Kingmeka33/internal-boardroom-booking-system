import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@shared/design-system/tokens";
import { AppButton } from "../buttons/app-button";

export type ErrorStateProps = {
  title?: string;
  message: string;
  retryLabel?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = "Something went wrong",
  message,
  retryLabel = "Try again",
  onRetry
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? <AppButton title={retryLabel} onPress={onRetry} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    padding: spacing.xl
  },
  message: {
    color: colors.textMuted,
    fontSize: typography.body
  },
  title: {
    color: colors.danger,
    fontSize: typography.subheading,
    fontWeight: "700"
  }
});
