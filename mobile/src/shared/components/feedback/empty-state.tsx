import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@shared/design-system/tokens";

export type EmptyStateProps = {
  title: string;
  message?: string;
};

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl
  },
  message: {
    color: colors.textMuted,
    fontSize: typography.body,
    marginTop: spacing.sm
  },
  title: {
    color: colors.text,
    fontSize: typography.subheading,
    fontWeight: "700"
  }
});
