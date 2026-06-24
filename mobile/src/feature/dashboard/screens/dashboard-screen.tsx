import { StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@app/navigation/route-types";
import { AppButton, PageHeader, ScreenContainer, SectionCard } from "@shared/components";
import { colors, spacing, typography } from "@shared/design-system/tokens";

type Props = NativeStackScreenProps<RootStackParamList, "Dashboard">;

export function DashboardScreen({ navigation }: Props) {
  return (
    <ScreenContainer>
      <PageHeader
        eyebrow="Main"
        title="Dashboard"
        description="Foundation hub for the protected mobile app area."
      />
      <SectionCard>
        <Text style={styles.title}>Application sections</Text>
        <Text style={styles.description}>
          These placeholders confirm the protected navigation structure.
        </Text>
        <View style={styles.actions}>
          <AppButton title="Boardrooms" onPress={() => navigation.navigate("Boardrooms")} />
          <AppButton title="Bookings" variant="secondary" onPress={() => navigation.navigate("Bookings")} />
          <AppButton title="Notifications" variant="secondary" onPress={() => navigation.navigate("Notifications")} />
          <AppButton title="Profile" variant="secondary" onPress={() => navigation.navigate("Profile")} />
        </View>
      </SectionCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.md
  },
  description: {
    color: colors.textMuted,
    fontSize: typography.body,
    marginBottom: spacing.lg
  },
  title: {
    color: colors.text,
    fontSize: typography.subheading,
    fontWeight: "800",
    marginBottom: spacing.sm
  }
});
