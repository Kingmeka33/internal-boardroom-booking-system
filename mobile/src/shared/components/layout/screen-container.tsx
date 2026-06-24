import { ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";
import { colors, layout } from "@shared/design-system/tokens";

export type ScreenContainerProps = {
  children: ReactNode;
  keyboardAvoiding?: boolean;
  scroll?: boolean;
};

export function ScreenContainer({
  children,
  keyboardAvoiding = false,
  scroll = true
}: ScreenContainerProps) {
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    children
  );

  if (keyboardAvoiding) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", android: undefined })}
          style={styles.keyboard}
        >
          {content}
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return <SafeAreaView style={styles.container}>{content}</SafeAreaView>;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1
  },
  content: {
    padding: layout.screenPadding
  },
  keyboard: {
    flex: 1
  }
});
