import React from "react";
import {
  View,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Feather"; // Biblioteca de iconos
import { LinearGradient } from "expo-linear-gradient"; // Biblioteca para el fondo degradado

import logoBlanco from "../assets/logoBlanco.png";

const { width } = Dimensions.get("window"); // Tamaño de la pantalla

export default function Chat() {
  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={["rgba(51, 102, 204, 0.8)", "#222"]}
        style={styles.gradient}
      >
        {/* VocalWise Logo */}
        <Image source={logoBlanco} style={styles.logo} resizeMode="contain" />

        {/* Menu icon */}
        <View style={styles.menuIcon}>
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
        </View>

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
                <Text style={styles.promptText}>Ejemplo Prompt</Text>
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
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  gradient: {
    flex: 1,
    width: "100%",
  },
  logo: {
    position: "absolute",
    top: "30%", // Posición ajustada para que quede en el fondo
    left: "7%",
    width: width * 0.85, // Tamaño del logo
    height: width * 0.85,
    opacity: 0.1, // Transparencia del logo
  },
  menuIcon: {
    position: "absolute",
    top: 20,
    left: 20,
    width: 24,
    height: 20,
    justifyContent: "space-between",
  },
  menuLine: {
    width: "100%",
    height: 2,
    backgroundColor: "#FFF",
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
