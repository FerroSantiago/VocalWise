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
  KeyboardAvoidingView,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";

import logoBlanco from "../assets/logoBlanco.png";

const { width, height } = Dimensions.get("window");

function BubbleMessage({ author, message }) {
  return (
    <View
      style={{
        maxWidth: "80%",
        borderRadius: 15,
        padding: 10,
        alignSelf: author === "user" ? "flex-end" : "flex-start",
        backgroundColor:
          author === "user" ? "rgba(51,51,51,.5)" : "rgba(102,102,102,.5)",
      }}
    >
      <Text style={{ color: "#EEE" }}>{message}</Text>
    </View>
  );
}

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

  const chatHistory = [
    "Final Análisis Matemático II",
    "Mejora de muletillas",
    "Presentación Paradigmas de Programación",
    "Aprendiendo oratoria",
  ];

  const fakeConversation = [
    {
      author: "user",
      message:
        "Que onda señor VocalWise, hoy tengo ganas de aprender sobre la mitocondria",
    },
    {
      author: "bot",
      message: "De una perro, dejame que pienso un toque y te tiro la data",
    },
    {
      author: "user",
      message: "Dale si total yo tengo todo el tiempo del mundo",
    },
    {
      author: "bot",
      message:
        "Bueno ahi va. Las mitocondrias son orgánulos celulares eucariotas encargados de suministrar la mayor parte de la energía necesaria para la actividad celular a través del proceso denominado respiración celular",
    },
    {
      author: "user",
      message: "Ah claro, la famosa 'fábrica de energía' de la célula, ¿no?",
    },
    {
      author: "bot",
      message:
        "Exacto, las mitocondrias actúan como la planta de energía de la célula. Dentro de ellas ocurre el ciclo de Krebs y la cadena de transporte de electrones, que producen ATP, la molécula de energía.",
    },
    {
      author: "user",
      message: "¿Y cuántas mitocondrias tiene una célula?",
    },
    {
      author: "bot",
      message:
        "Depende del tipo de célula. Algunas células tienen solo unas pocas mitocondrias, mientras que otras, como las musculares, pueden tener miles debido a la alta demanda de energía.",
    },
    {
      author: "user",
      message:
        "¡Qué locura! Entonces si hago mucho ejercicio, ¿mis células musculares tienen más mitocondrias?",
    },
    {
      author: "bot",
      message:
        "Tal cual, el ejercicio físico regular estimula la biogénesis mitocondrial, lo que significa que tus células musculares producen más mitocondrias para satisfacer las necesidades energéticas adicionales.",
    },
  ];

  return (
    <LinearGradient
      colors={["rgba(51, 102, 204, 0.8)", "#222"]}
      style={[
        styles.gradient,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
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
          <View style={styles.chatHistoryContent}>
            <Text style={styles.chatHistoryTitle}>Chats Anteriores</Text>
            <ScrollView>
              {chatHistory.map((chat, index) => (
                <TouchableOpacity key={index} style={styles.chatHistoryItem}>
                  <Text style={styles.chatHistoryText}>{chat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Animated.View>

        {/* Chat content */}
        <View style={styles.chatContent}>
          <FlatList
            data={fakeConversation}
            keyExtractor={(_, index) => index}
            renderItem={({ item }) => <BubbleMessage {...item} />}
            contentContainerStyle={{
              gap: 15,
              paddingLeft: 15,
              paddingRight: 23,
              paddingBottom: 15,
            }}
            automaticallyAdjustKeyboardInsets
          />
          <KeyboardAvoidingView
            behavior="position"
            keyboardVerticalOffset={100}
          >
            {/* Input field */}
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="¿Listo para aprender?"
                placeholderTextColor="#CCC"
                style={styles.input}
              />
              <TouchableOpacity style={styles.addFile}>
                <Icon name="paperclip" size={20} color="#999" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.sendButton}>
                <Icon name="send" size={20} color="#999" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    height: "100%",
    width: "100%",
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
    top: 5,
    left: 16,
    zIndex: 6,
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
  chatHistoryContent: {
    marginTop: Platform.OS === "web" ? 4 : 50,
    height: "100%",
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
  chatContent: {
    zIndex: Platform.OS === "web" ? 10 : 4,
    flex: 1,
    justifyContent: "flex-end",
    width: Platform.OS === "web" ? width - 256 : "100%",
    marginLeft: Platform.OS === "web" ? "256px" : "2%",
    marginTop: 55,
  },
  icon: {
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: "row",
    width: Platform.OS === "web" ? "75%" : "95%",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: "#444",
    marginLeft: Platform.OS === "web" ? 150 : 2,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    color: "#CCC",
  },
  addFile: {
    marginRight: 10,
  },
  sendButton: {
    paddingLeft: 10,
  },
});
