import React, { useState, useEffect, useRef } from "react";
import {
  Animated,
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Feather";

import { useRouter } from "expo-router";

import { getAuth, signOut } from "firebase/auth";

import logoBlanco from "../assets/logoBlanco.png";

import FileUploading from "./FlieUploading";

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
  const { height, width } = useWindowDimensions();
  const [isMenuOpen, setIsMenuOpen] = useState(Platform.OS === "web");
  const [user, setUser] = useState(null);
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

  useEffect(() => {
    const checkUser = async () => {
      // Verifica si hay un usuario autenticado en AsyncStorage
      const storedUser = await AsyncStorage.getItem("user");

      if (storedUser) {
        setUser(JSON.parse(storedUser)); // Si hay usuario, lo guardamos en el estado
      } else {
        // Verifica con Firebase si el usuario está autenticado
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (currentUser) {
          setUser(currentUser); // Si el usuario está autenticado, lo guardamos en el estado
        } else {
          router.push("/login"); // Si no hay usuario, redirige a la pantalla de login
        }
      }
    };

    checkUser();
  }, []);

  const logout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      await AsyncStorage.removeItem("user");
      setUser(null);
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
    <View style={{ height: "100%", width: "100%" }}>
      {/* VocalWise Logo */}
      <Image
        source={logoBlanco}
        style={[
          {
            width: Platform.OS === "web" ? width * 0.4 : width * 0.85,
            height: Platform.OS === "web" ? height * 0.4 : height * 0.85,
            transform: [
              {
                translateX:
                  Platform.OS === "web" ? -width * 0.185 : -width * 0.37,
              },
            ],
          },
          styles.logo,
        ]}
        resizeMode="contain"
      />

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
        {user ? (
          <Pressable onPress={logout} style={styles.accountButton}>
            <Icon name="user" size={25} color="#CCC" />
            <Text style={[{ fontSize: 12 }, styles.chatHistoryText]}>
              Cerrar sesión
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => router.push("/login")}
            style={styles.accountButton}
          >
            <Icon name="user" size={25} color="#CCC" />
            <Text style={[{ fontSize: 12 }, styles.chatHistoryText]}>
              Iniciar sesión
            </Text>
          </Pressable>
        )}
      </Animated.View>

      {/* Chat content */}
      <View
        style={[
          {
            width: Platform.OS === "web" ? width - 200 : "100%",
            marginLeft: Platform.OS === "web" ? width * 0.15 : 0,
          },
          styles.chatContent,
        ]}
      >
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
        <FileUploading></FileUploading>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    top: Platform.OS === "web" ? "25%" : "0",
    left: Platform.OS === "web" ? "55%" : "45%",
    opacity: 0.1,
    //probar inset:0, margin: auto y position relative para centrar
  },
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
    height: "100%",
    backgroundColor: "#333",
    padding: 16,
  },
  chatHistoryContent: {
    marginTop: Platform.OS === "web" ? 4 : 50,
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
  chatContent: {
    zIndex: Platform.OS === "web" ? 10 : 4,
    flex: "auto",
    justifyContent: "flex-end",

    marginTop: 55,
  },
});
