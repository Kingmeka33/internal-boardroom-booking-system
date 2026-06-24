import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { colors, layout, radii, spacing, typography } from "@shared/design-system/tokens";

type ButtonVariant = "primary" | "secondary" | "danger";

export type AppButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: ViewStyle;
};

export function AppButton({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  style
}: AppButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style
      ]}
    >
      <Text style={[styles.text, variant === "secondary" && styles.secondaryText]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    borderRadius: radii.md,
    height: layout.buttonHeight,
    justifyContent: "center",
    paddingHorizontal: spacing.lg
  },
  danger: {
    backgroundColor: colors.danger
  },
  disabled: {
    opacity: 0.55
  },
  pressed: {
    opacity: 0.85
  },
  primary: {
    backgroundColor: colors.primary
  },
  secondary: {
    backgroundColor: colors.secondary
  },
  secondaryText: {
    color: colors.primaryDark
  },
  text: {
    color: colors.white,
    fontSize: typography.button,
    fontWeight: "700"
  }
});
