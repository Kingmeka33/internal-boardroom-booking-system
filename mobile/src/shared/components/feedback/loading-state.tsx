import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@shared/design-system/tokens";

export type LoadingStateProps = {
  message?: string;
};

export function LoadingState({ message = "Loading" }: LoadingStateProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.primary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.xl
  },
  message: {
    color: colors.textMuted,
    fontSize: typography.body
  }
});
