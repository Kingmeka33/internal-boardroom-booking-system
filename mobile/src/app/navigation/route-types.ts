export type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token?: string } | undefined;
};

export type MainStackParamList = {
  Dashboard: undefined;
  Boardrooms: undefined;
  Bookings: undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type RootStackParamList = AuthStackParamList & MainStackParamList;
