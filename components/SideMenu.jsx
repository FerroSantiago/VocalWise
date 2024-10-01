import React, { useState, useEffect, useRef } from "react";
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

import {
  getFirestore,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

const SideMenu = ({
  height,
  width,
  user,
  chats,
  selectedChatId,
  onSelectChat,
  setMessages,
}) => {
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

  const createNewChat = async () => {
    try {
      const db = getFirestore();
      const newChatRef = await addDoc(collection(db, "chats"), {
        userId: user.uid,
        createdAt: serverTimestamp(),
        lastMessage: "Nuevo chat",
        lastMessageTime: serverTimestamp(),
      });
      onSelectChat(newChatRef.id);
      setMessages([]);
    } catch (error) {
      console.error("Error al crear un nuevo chat:", error);
    }
  };

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
          <Pressable onPress={createNewChat} style={styles.newChatButton}>
            <Icon name="plus" size={20} color="#CCC" />
            <Text style={styles.newChatButtonText}>Nuevo Chat</Text>
          </Pressable>
          <ScrollView>
            {chats.map((chat) => (
              <Pressable
                key={chat.id}
                style={[
                  styles.historyItem,
                  selectedChatId === chat.id && styles.selectedHistoryItem,
                ]}
                onPress={() => onSelectChat(chat.id)}
              >
                <Text style={styles.historyItemText} numberOfLines={1}>
                  {chat.lastMessage || "Nuevo chat"}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
        <View style={{ alignSelf: "center" }}>
          <Pressable onPress={logout} style={styles.accountButton}>
            <Icon name="log-out" size={20} color="#CCC" />
          </Pressable>
          <Text style={{ color: "white", marginTop: 5 }}>{user?.email}</Text>
        </View>
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
  newChatButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#666",
    padding: 5,
    borderRadius: 5,
    marginBottom: 25,
  },
  newChatButtonText: {
    color: "#FFF",
    marginLeft: 10,
  },
  historyItem: {
    padding: 8,
    marginBottom: 8,
    borderRadius: 8,
    borderColor: "rgba(255, 255, 255, 0.5)",
    borderWidth: 1,
  },
  selectedHistoryItem: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  historyItemText: {
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
