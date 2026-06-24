import { Text, StyleSheet, View } from "react-native";
import { colors, spacing, typography } from "@shared/design-system/tokens";

export type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <View style={styles.header}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  description: {
    color: colors.textMuted,
    fontSize: typography.body,
    lineHeight: typography.heading
  },
  eyebrow: {
    color: colors.primary,
    fontSize: typography.small,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  header: {
    marginBottom: spacing.xl
  },
  title: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: "800",
    marginBottom: spacing.sm
  }
});
