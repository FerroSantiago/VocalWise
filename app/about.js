import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient"; // Biblioteca para el fondo degradado
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Link } from "expo-router";

export default function About() {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={["rgba(51, 102, 204, 0.8)", "#222"]}
      style={{
        height: "100%",
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <View style={styles.container}>
        <Link style={styles.returnButton} href="/">
          Volver
        </Link>
        <Text style={styles.teamText}>
          Este proyecto esta siendo motorizado a base de videos de MiduDev y
          codigo de ChatGPT
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  returnButton: {
    color: "#FFF",
    textAlign: "center",
    fontSize: 20,
    borderWidth: 2,
    padding: 5,
    borderRadius: 20,
  },
  teamText: {
    color: "#CCC",
    fontSize: 30,
  },
});
