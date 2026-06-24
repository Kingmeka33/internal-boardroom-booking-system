import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { colors, radii, shadows, spacing } from "@shared/design-system/tokens";

export type SectionCardProps = {
  children: ReactNode;
};

export function SectionCard({ children }: SectionCardProps) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
    ...shadows.card
  }
});
