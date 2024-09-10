import React, { useState } from 'react';
import {
  View,
  Image,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from "react-native-vector-icons/Feather"; // Biblioteca de iconos
import { LinearGradient } from "expo-linear-gradient"; // Biblioteca para el fondo degradado

import logoBlanco from "../assets/logoBlanco.png";

const { width, height } = Dimensions.get("window"); // Tamaño de la pantalla

export default function Chat() {
  const insets = useSafeAreaInsets();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const previousChats = [
    'Chat sobre IA',
    'Discusión de películas',
    'Recetas de cocina',
    'Viaje a Japón',
    'Programación en React',
  ];

  return (
    <LinearGradient
        colors={["rgba(51, 102, 204, 0.8)", "#222"]} style={{ height: "100%", paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
      <View style={{ height: "100%"}}>
          {/* VocalWise Logo */}
          <Image source={logoBlanco} style={styles.logo} resizeMode="contain" />

          {/* Menu icon */}
          <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </TouchableOpacity>

          {/* Sidebar Menu */}
          {isMenuOpen && (
            <View style={styles.sidebarMenu}>
              <TouchableOpacity onPress={toggleMenu} style={styles.closeButton}>
              </TouchableOpacity>
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
            </View>
          )}

          {/* Chat content */}
          <View style={styles.chatContent}>
            {/* Example prompts */}
            <View style={styles.prompts}>
              {/* Right Prompt */}
              <View style={styles.promptRight}>
                <View style={styles.promptBox}>
                  <Text style={styles.promptText}>Ejemplo Prompt</Text>
                  <Text style={styles.icon}>💡</Text>
                </View>
              </View>

              {/* Left Prompt */}
              <View style={styles.promptLeft}>
                <View style={styles.promptBox}>
                  <Text style={styles.promptText}>Ejemplo Pormpt</Text>
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
    top: Platform.OS === "web" ? "25%" : "10%", // Posición ajustada para que quede en el fondo
    left: Platform.OS === "web" ? "50%" : "45%",
    transform: [{ translateX: Platform.OS === "web" ? -width * 0.185 : -width * 0.35 }], // Centrado dinámico
    width: Platform.OS === "web" ? width * 0.4 : width * 0.85, // Tamaño del logo
    height: Platform.OS === "web" ? height * 0.4 : height * 0.85,
    opacity: 0.1, // Transparencia del logo
  },
  menuButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: 20,
  },  
  menuLine: {
    width: 20,
    height: 2,
    backgroundColor: 'white',
    borderRadius: 2,
  },
  sidebarMenu: {
    position: "absolute",
    top: 0,
    left: 0,
    height: '100%',
    width: 256, // w-64
    backgroundColor: '#1e3a8a', // bg-blue-900
    zIndex: 5,
    padding: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  sidebarContent: {
    marginTop: 64, // mt-12
  },
  sidebarTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chatItem: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#1e40af', // hover:bg-blue-800
    marginBottom: 8,
  },
  chatText: {
    color: 'white',
  },
  chatContent: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 16,
    width: "100%",
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
    backgroundColor: "#333",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    maxWidth: "80%", // Limita el ancho máximo al 80% de la pantalla
    flexShrink: 1, // Evita que el cuadro crezca más allá del contenido
  },
  promptText: {
    color: "#FFF",
  },
  icon: {
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#444",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: "100%",
  },
  input: {
    flex: 1,
    color: "#FFF",
  },
  iconLeft: {
    marginRight: 10,
  },
  sendButton: {
    paddingLeft: 10,
  },
});
