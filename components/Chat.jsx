import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Image,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";

import logoBlanco from "../assets/logoBlanco.png";

const { width, height } = Dimensions.get("window");

export default function Chat() {
  const insets = useSafeAreaInsets();
  const [isMenuOpen, setIsMenuOpen] = useState(Platform.OS === "web");
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
  }, [isMenuOpen]);

  const toggleMenu = () => {
    if (Platform.OS !== "web") {
      setIsMenuOpen(!isMenuOpen);
    }
  };

  const previousChats = [
    "Final Análisis Matemático II",
    "Mejora de muletillas",
    "Presentación Paradigmas de Programación",
    "Aprendiendo oratoria",
  ];

  return (
    <LinearGradient
      colors={["rgba(51, 102, 204, 0.8)", "#222"]}
      style={{
        height: "100%",
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <View style={{ height: "100%" }}>
        {/* VocalWise Logo */}
        <Image source={logoBlanco} style={styles.logo} resizeMode="contain" />

        {/* Menu icon */}
        {Platform.OS !== "web" && (
          <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
            <Icon name="menu" size={40} color="#CCC" />
          </TouchableOpacity>
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
            { transform: [{ translateX: slideAnim }] },
          ]}
          pointerEvents={isMenuOpen ? "auto" : "none"} // Control de la interactividad
        >
          <TouchableOpacity
            onPress={toggleMenu}
            style={styles.closeButton}
          ></TouchableOpacity>
          <View style={styles.sidebarContent}>
            <Text style={styles.sidebarTitle}>Chats Anteriores</Text>
            <ScrollView>
              {previousChats.map((chat, index) => (
                <TouchableOpacity key={index} style={styles.chatItem}>
                  <Text style={styles.chatText}>{chat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Animated.View>

        {/* Chat content */}
        <View style={styles.chatContent}>
          {/* Example prompts */}
          <View style={styles.prompts}>
            {/* Right Prompt */}
            <View style={styles.promptRight}>
              <View style={styles.promptBox}>
                <Text style={styles.promptText}>Idea de Prompt</Text>
                <Text style={styles.icon}>💡</Text>
              </View>
            </View>

            {/* Left Prompt */}
            <View style={styles.promptLeft}>
              <View style={styles.promptBox}>
                <Text style={styles.promptText}>Idea de Pormpt</Text>
                <Text style={styles.icon}>💡</Text>
              </View>
            </View>
          </View>

          {/* Input field */}
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="¿Listo para aprender?"
              placeholderTextColor="#CCC"
              style={styles.input}
            />
            <Icon
              name="paperclip"
              size={20}
              color="#999"
              style={styles.iconLeft}
            />
            <TouchableOpacity style={styles.sendButton}>
              <Icon name="send" size={20} color="#999" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  logo: {
    position: "absolute",
    width: Platform.OS === "web" ? width * 0.4 : width * 0.85,
    height: Platform.OS === "web" ? height * 0.4 : height * 0.85,
    top: Platform.OS === "web" ? "25%" : "0",
    left: Platform.OS === "web" ? "55%" : "45%",
    transform: [
      { translateX: Platform.OS === "web" ? -width * 0.185 : -width * 0.37 },
    ], // Centrado dinámico
    opacity: 0.1,
  },
  menuButton: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 6,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  sidebarMenu: {
    zIndex: 5,
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    backgroundColor: "#333",
    padding: 16,
    width: Platform.OS === "web" ? 256 : width * 0.8,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  sidebarContent: {
    marginTop: 50,
  },
  sidebarTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  overlay: {
    zIndex: 5,
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.55)", // Fondo oscuro semitransparente
  },
  chatItem: {
    padding: 8,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: "#444",
  },
  chatText: {
    color: "white",
  },
  chatContent: {
    zIndex: Platform.OS === "web" ? 10 : 4,
    flex: 1,
    justifyContent: "flex-end",
    width: Platform.OS === "web" ? width - 256 : "100%",
    paddingLeft: Platform.OS === "web" ? 256 : 0,
    marginLeft: Platform.OS === "web" ? "10%" : "2%",
    padding: 16,
  },
  prompts: {
    marginBottom: 16,
  },
  promptRight: {
    alignItems: "flex-end", // Alinea el prompt a la derecha
  },
  promptLeft: {
    alignItems: "flex-start", // Alinea el prompt a la izquierda
  },
  promptBox: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1, // Evita que el cuadro crezca más allá del contenido
    maxWidth: "80%",
    paddingHorizontal: 20,
    paddingVertical: 13,
    marginBottom: 12,
    backgroundColor: "#333",
    borderRadius: 20,
  },
  promptText: {
    color: "#CCC",
  },
  icon: {
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: "#444",
  },
  input: {
    flex: 1,
    color: "#CCC",
  },
  iconLeft: {
    marginRight: 10,
  },
  sendButton: {
    paddingLeft: 10,
  },
});
