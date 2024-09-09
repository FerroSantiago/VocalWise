import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";

import Component from "./chatInput";

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar
        style="auto
      "
      />
      <Component />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#222",
  },
});
