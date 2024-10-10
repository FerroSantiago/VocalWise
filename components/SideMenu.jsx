import React, { useEffect, useRef } from "react";
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
  isMenuOpen,
  setIsMenuOpen,
}) => {
  const isWeb = Platform.OS === "web";
  const slideAnim = useRef(new Animated.Value(-width * 0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const router = useRouter();

  useEffect(() => {
    if (!isWeb) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: isMenuOpen ? 0 : -width * 0.85,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: isMenuOpen ? 1 : 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
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
    <>
      {!isWeb && (
        <Pressable
          onPress={() => setIsMenuOpen(true)}
          style={styles.menuButton}
        >
          <Icon name="menu" size={40} color="#CCC" />
        </Pressable>
      )}
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
            display: isWeb ? "none" : "flex",
          },
        ]}
        pointerEvents={isMenuOpen ? "auto" : "none"}
        onTouchStart={() => setIsMenuOpen(false)}
      />

      {/* Sidebar Menu */}
      <Animated.View
        style={[
          styles.sidebarMenu,
          {
            width: isWeb ? "100%" : width * 0.8,
            transform: [{ translateX: isWeb ? 0 : slideAnim }],
            height: height,
            left: 0,
          },
        ]}
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
    </>
  );
};

const styles = StyleSheet.create({
  menuButton: {
    position: "absolute",
    top: 10,
    left: 5,
    zIndex: 11,
  },
  sidebarMenu: {
    position: "absolute",
    backgroundColor: "#333",
    padding: 16,
    zIndex: 12,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    zIndex: 11,
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
    padding: 10,
    backgroundColor: "#444",
    borderRadius: 10,
    alignSelf: "center",
    alignItems: "center",
    width: "70%",
    marginBottom: Platform.OS === "web" ? 0 : 80,
  },
});

export default SideMenu;
