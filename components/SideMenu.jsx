import { useState, useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { useRouter } from "expo-router";

const SideMenu = ({ height, width }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(Platform.OS === "web");

  const router = useRouter();

  const slideAnim = useRef(
    new Animated.Value(Platform.OS === "web" ? 0 : -256)
  ).current;
  const fadeAnim = useRef(
    new Animated.Value(Platform.OS === "web" ? 0 : -256)
  ).current;

  useEffect(() => {
    if (Platform.OS !== "web") {
      // Solo aplicamos animación en dispositivos móviles
      Animated.timing(slideAnim, {
        toValue: isMenuOpen ? 0 : -width * 0.8, // Ancho ajustado en móviles
        duration: 300,
        useNativeDriver: true,
      }).start();

      Animated.timing(fadeAnim, {
        toValue: isMenuOpen ? 1 : 0, // Opacidad para el fondo
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isMenuOpen, width]);

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      router.push("/login"); // Redirigir al login
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const toggleMenu = () => {
    if (Platform.OS !== "web") {
      setIsMenuOpen(!isMenuOpen);
    }
  };

  const chatHistory = ["Prueba", "Prueba2", "Prueba3"];

  return (
    <View style={styles.container}>
      {/* Menu icon */}
      {Platform.OS !== "web" && (
        <Pressable onPress={toggleMenu} style={styles.menuButton}>
          <Icon name="menu" size={40} color="#CCC" />
        </Pressable>
      )}

      {/* Background overlay with fading effect */}
      <Animated.View
        style={[styles.overlay, { opacity: fadeAnim }]}
        pointerEvents={isMenuOpen ? "auto" : "none"} // Control de la interactividad
      />

      {/* Sidebar Menu */}
      <Animated.View
        style={[
          styles.sidebarMenu,
          {
            width: Platform.OS === "web" ? width * 0.15 : width * 0.8,
            transform: [{ translateX: slideAnim }],
            height: height,
          },
        ]}
        pointerEvents={isMenuOpen ? "auto" : "none"} // Control de la interactividad
      >
        <View style={styles.chatHistoryContent}>
          <Text style={styles.chatHistoryTitle}>Chats Anteriores</Text>
          <ScrollView>
            {chatHistory.map((chat, index) => (
              <Pressable
                key={index}
                style={({ pressed }) => [
                  { opacity: pressed ? 0.5 : 1 },
                  styles.chatHistoryItem,
                ]}
              >
                <Text
                  numberOfLines={1}
                  ellipsizeMode="head"
                  style={styles.chatHistoryText}
                >
                  {chat}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
        <Pressable onPress={logout} style={styles.accountButton}>
          <Icon name="user" size={25} color="#CCC" />
          <Text style={[{ fontSize: 12 }, styles.chatHistoryText]}>
            Cerrar sesión
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  menuButton: {
    position: "absolute",
    top: 10,
    left: 5,
    zIndex: 6,
  },
  sidebarMenu: {
    zIndex: 5,
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "#333",
    padding: 16,
  },
  chatHistoryContent: {
    marginTop: Platform.OS === "web" ? 4 : 50,
    flex: 1,
  },
  chatHistoryTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  chatHistoryItem: {
    padding: 8,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: "#444",
  },
  chatHistoryText: {
    color: "white",
  },
  accountButton: {
    paddingVertical: 5,
    backgroundColor: "#444",
    borderRadius: 10,
    marginTop: 20,
    alignSelf: "center",
    alignItems: "center",
    width: "70%",
  },
});

export default SideMenu;
