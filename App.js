import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";

import Chat from "./components/Chat";

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Chat />
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
