import { Slot } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Layout() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ height: "100%" }}>
      <LinearGradient
        colors={["rgba(51, 102, 204, 0.8)", "#222"]}
        style={[
          styles.gradient,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <Slot />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: "100%",
  },
});
