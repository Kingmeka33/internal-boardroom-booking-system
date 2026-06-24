import { StyleSheet, Text } from "react-native";
import { useAppSelector } from "@app/hooks";
import { selectAuthUser } from "@features/auth/auth-selectors";
import { useLogout } from "@features/auth/hooks/use-logout";
import { AppButton, PageHeader, ScreenContainer, SectionCard } from "@shared/components";
import { colors, spacing, typography } from "@shared/design-system/tokens";

export function ProfileScreen() {
  const user = useAppSelector(selectAuthUser);
  const { submitLogout } = useLogout();

  return (
    <ScreenContainer>
      <PageHeader
        eyebrow="Account"
        title="Profile"
        description="Signed-in account foundation screen."
      />
      <SectionCard>
        <Text style={styles.name}>
          {user ? `${user.firstName} ${user.lastName}` : "Signed-in user"}
        </Text>
        <Text style={styles.meta}>{user?.email || "No email loaded"}</Text>
        <Text style={styles.meta}>{user?.role || "No role loaded"}</Text>
        <AppButton
          onPress={() => void submitLogout()}
          style={styles.logout}
          title="Logout"
          variant="danger"
        />
      </SectionCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  logout: {
    marginTop: spacing.lg
  },
  meta: {
    color: colors.textMuted,
    fontSize: typography.body,
    marginTop: spacing.xs
  },
  name: {
    color: colors.text,
    fontSize: typography.heading,
    fontWeight: "800"
  }
});
