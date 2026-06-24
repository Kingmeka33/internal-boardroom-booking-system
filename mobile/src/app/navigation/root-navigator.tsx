import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuthBootstrap } from "@features/auth/hooks/use-auth-bootstrap";
import { selectIsAuthenticated, selectIsHydratingAuth } from "@features/auth/auth-selectors";
import { useAppSelector } from "@app/hooks";
import { LoadingState } from "@shared/components";
import { colors } from "@shared/design-system/tokens";
import { LoginScreen } from "@features/auth/screens/login-screen";
import { ForgotPasswordScreen } from "@features/auth/screens/forgot-password-screen";
import { ResetPasswordScreen } from "@features/auth/screens/reset-password-screen";
import { DashboardScreen } from "@features/dashboard/screens/dashboard-screen";
import { BoardroomsScreen } from "@features/boardrooms/screens/boardrooms-screen";
import { BookingsScreen } from "@features/bookings/screens/bookings-screen";
import { NotificationsScreen } from "@features/notifications/screens/notifications-screen";
import { ProfileScreen } from "@features/profile/screens/profile-screen";
import type { RootStackParamList } from "./route-types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  useAuthBootstrap();

  const isHydrating = useAppSelector(selectIsHydratingAuth);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (isHydrating) {
    return <LoadingState message="Checking session" />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primaryDark,
        headerTitleStyle: { color: colors.text }
      }}
    >
      {isAuthenticated ? (
        <Stack.Group>
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Boardrooms" component={BoardroomsScreen} />
          <Stack.Screen name="Bookings" component={BookingsScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Group>
      ) : (
        <Stack.Group>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: "Forgot password" }} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: "Reset password" }} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}
