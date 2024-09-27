import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import LogoAnimado from "./LogoAnimado";

import { useRouter } from "expo-router";

export default function Landing() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.navContainer}>
        <View style={styles.sectionsContainer}>
          <View style={{ flexDirection: "row" }}>
            <Pressable style={styles.navSectionButton}>
              <Text style={styles.navSectionText}>Características</Text>
            </Pressable>
            <Pressable style={styles.navSectionButton}>
              <Text style={styles.navSectionText}>Equipo</Text>
            </Pressable>
            <Pressable style={styles.navSectionButton}>
              <Text style={styles.navSectionText}>Contacto</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.accountContainer}>
          <Pressable
            onPress={() => router.push("/register")}
            style={[
              { borderColor: "white", borderWidth: 1 },
              styles.navSectionButton,
            ]}
          >
            <Text style={styles.navSectionText}>Registrarse</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/login")}
            style={[{ backgroundColor: "white" }, styles.navSectionButton]}
          >
            <Text style={{ color: "#444" }}>Iniciar sesion</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingTop: 80 }}>
        <View style={styles.welcomeSection}>
          <Text style={{ fontSize: 55, fontWeight: "bold", color: "white" }}>
            Bienvenido a VocalWise
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "white",
              textAlign: "center",
              marginTop: 8,
            }}
          >
            Descubre cómo nuestra plataforma puede cambiar tu vida.
          </Text>
          <View>
            <LogoAnimado></LogoAnimado>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: "100%" },
  navContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "rgba(	68, 68, 68, 0.8)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backdropFilter: "blur(4px)",
    zIndex: 10,
  },
  sectionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 250,
    height: 250,
    margin: 40,
    resizeMode: "contain",
  },
  navSectionButton: {
    marginHorizontal: 8,
    padding: 7,
    borderRadius: 10,
  },
  navSectionText: {
    color: "white",
  },
  accountContainer: {
    flexDirection: "row",
  },
  welcomeSection: {
    alignItems: "center",
    padding: 16,
    marginTop: 30,
  },
});
