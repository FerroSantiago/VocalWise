import React, { useState, useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import PlansSection from "./landingSections/PlansSection";
import WalkthroughSection from "./landingSections/WalkthroughSection";
import WelcomeSection from "./landingSections/WelcomeSection";

import { useRouter } from "expo-router";

const NAVBAR_HEIGHT = 60;

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
      <View style={[styles.navContainer, { height: NAVBAR_HEIGHT }]}>
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

      <ScrollView contentContainerStyle={{ paddingTop: NAVBAR_HEIGHT }}>
        <WelcomeSection navbarHeight={NAVBAR_HEIGHT} />
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
    paddingHorizontal: 5,
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
  buttonText: {
    color: "white",
  },
});
