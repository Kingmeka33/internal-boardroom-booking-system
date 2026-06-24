import { ReactNode } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors, layout, radii, typography } from "@shared/design-system/tokens";

export type IconButtonProps = {
  label: string;
  icon: ReactNode;
  onPress: () => void;
  disabled?: boolean;
};

export function IconButton({ label, icon, onPress, disabled = false }: IconButtonProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed
      ]}
    >
      {typeof icon === "string" ? <Text style={styles.icon}>{icon}</Text> : icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.primaryDark,
    borderRadius: radii.md,
    height: layout.buttonHeight,
    justifyContent: "center",
    width: layout.buttonHeight
  },
  disabled: {
    opacity: 0.55
  },
  icon: {
    color: colors.white,
    fontSize: typography.heading,
    fontWeight: "700"
  },
  pressed: {
    opacity: 0.85
  }
});
