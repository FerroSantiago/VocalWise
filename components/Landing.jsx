import React, { useState, useEffect } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import PlansSection from "./PlansSection";
import WalkthroughSection from "./WalkthroughSection";
import LogoAnimado from "./LogoAnimado";

import { useRouter } from "expo-router";

export default function Landing() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error checking user:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      setUser(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.navContainer}>
        <View style={styles.accountContainer}>
          {user ? (
            <>
              <Pressable
                onPress={handleLogout}
                style={[styles.navSectionButton, styles.registerButton]}
              >
                <Text style={styles.buttonText}>Cerrar sesión</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push("/chat")}
                style={[styles.navSectionButton, styles.logButton]}
              >
                <Text>Ir al Chat</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable
                onPress={() => router.push("/register")}
                style={[styles.navSectionButton, styles.registerButton]}
              >
                <Text style={styles.buttonText}>Registrarse</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push("/login")}
                style={[styles.navSectionButton, styles.logButton]}
              >
                <Text>Iniciar sesión</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingTop: 80 }}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Bienvenido a VocalWise</Text>
          <Text style={styles.welcomeDescription}>
            Descubre cómo nuestra plataforma puede cambiar tu vida.
          </Text>
          <LogoAnimado />
        </View>

        <WalkthroughSection />
        <PlansSection />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  navContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(68, 68, 68, 0.9)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    backdropFilter: "blur(4px)",
    zIndex: 10,
  },
  navSectionButton: {
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    minWidth: 120,
    alignItems: "center",
  },
  accountContainer: {
    flexDirection: "row",
    margin: 10,
  },
  registerButton: {
    borderColor: "white",
    borderWidth: 1,
  },
  logButton: {
    backgroundColor: "white",
  },
  welcomeSection: {
    alignItems: "center",
    padding: 16,
    marginTop: 30,
  },
  welcomeTitle: {
    fontSize: 55,
    color: "white",
  },
  welcomeDescription: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    marginVertical: 20,
  },
  buttonText: {
    color: "white",
  },
});
