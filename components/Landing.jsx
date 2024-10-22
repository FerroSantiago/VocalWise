import React, { useState, useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import LogoAnimado from "./LogoAnimado";
import { Feather } from "@expo/vector-icons";

import { useRouter } from "expo-router";

export default function Landing() {
  const { height, width } = useWindowDimensions();
  const [user, setUser] = useState(null);
  const scrollViewRef = useRef(null);
  const scrollIndicatorAnim = useRef(new Animated.Value(0)).current;

  const router = useRouter();

  useEffect(() => {
    checkUser();
    if (Platform.OS !== "web") {
      startScrollIndicatorAnimation();
    }
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

  const startScrollIndicatorAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scrollIndicatorAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scrollIndicatorAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const PlanCard = ({ title, price, features }) => (
    <View
      style={[
        styles.planCard,
        { width: Platform.OS === "web" ? "45%" : width - 40 },
      ]}
    >
      <Text style={styles.planTitle}>{title}</Text>
      <Text style={styles.planPrice}>{price}</Text>
      {features.map((feature, index) => (
        <Text key={index} style={styles.planFeature}>
          • {feature}
        </Text>
      ))}
      <Pressable style={styles.planButton}>
        <Text style={styles.planButtonText}>Seleccionar Plan</Text>
      </Pressable>
    </View>
  );

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
          <Text
            style={{
              fontSize: 55,
              color: "white",
            }}
          >
            Bienvenido a VocalWise
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "white",
              textAlign: "center",
              marginVertical: 20,
            }}
          >
            Descubre cómo nuestra plataforma puede cambiar tu vida.
          </Text>
          <>
            <LogoAnimado></LogoAnimado>
          </>
        </View>

        <View style={styles.plansSection}>
          <Text style={styles.plansTitle}>Nuestros Planes</Text>
          {Platform.OS !== "web" && (
            <Text style={styles.scrollHint}>
              Desliza horizontalmente para ver más
            </Text>
          )}
          <ScrollView
            ref={scrollViewRef}
            horizontal={Platform.OS !== "web"}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={
              Platform.OS === "web"
                ? styles.webPlansContainer
                : styles.mobilePlansContainer
            }
            pagingEnabled={Platform.OS !== "web"}
          >
            <PlanCard
              title="Plan Base"
              price="$0.00/mes"
              features={[
                "Chat con IA a través de mensajes",
                "Guardado de chats",
                "Análisis de exposición oral",
              ]}
            />
            <PlanCard
              title="Plan Premium"
              price="$9.99/mes"
              features={[
                "Caracterísiticas del plan base +",
                "Análisis de documentos",
                "Trazado de progreso del usuario",
                "Sesiones de coaching personalizadas",
              ]}
            />
          </ScrollView>
          {Platform.OS !== "web" && (
            <Animated.View
              style={[
                styles.scrollIndicator,
                {
                  transform: [
                    {
                      translateX: scrollIndicatorAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 20],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Feather name="chevron-right" size={24} color="white" />
            </Animated.View>
          )}
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
    backgroundColor: "rgba(	68, 68, 68, 0.9)",
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
  buttonText: {
    color: "white",
  },
  welcomeText: {
    color: "white",
    fontSize: 16,
    marginBottom: 10,
  },
  title: {
    fontSize: 55,
    color: "white",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    marginTop: 8,
  },
  plansSection: {
    padding: 20,
    marginTop: 100,
  },
  plansTitle: {
    fontSize: 24,
    color: "white",
    textAlign: "center",
    marginBottom: 20,
  },
  webPlansContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
  },
  mobilePlansContainer: {
    paddingRight: 20,
  },
  planCard: {
    backgroundColor: "#2a2a2a",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  planTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  planPrice: {
    fontSize: 20,
    color: "rgb(51, 102, 204)",
    marginBottom: 20,
  },
  planFeature: {
    color: "white",
    marginBottom: 5,
  },
  planButton: {
    backgroundColor: "rgb(51, 102, 204)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  planButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  scrollHint: {
    color: "white",
    textAlign: "center",
    marginBottom: 10,
    fontSize: 14,
  },
  mobilePlansContainer: {
    paddingRight: 20,
  },
  scrollIndicator: {
    position: "absolute",
    right: 30,
    bottom: 50,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 5,
  },
});
