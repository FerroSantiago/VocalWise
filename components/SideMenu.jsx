import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Platform,
  Pressable,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  serverTimestamp,
} from "firebase/firestore";

const ChatItem = ({
  item,
  selectedChatId,
  onSelectChat,
  onDeleteChat,
  isWeb,
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [showDeleteIcon, setShowDeleteIcon] = useState(false);

  const handleLongPress = () => {
    if (!isWeb) {
      setShowDeleteIcon(true);
    }
  };

  const handleOptionsPress = (e) => {
    e.stopPropagation();
    setShowDeleteIcon(true);
  };

  const handleDeletePress = (e) => {
    e.stopPropagation();
    if (isWeb) {
      // Para web, usamos window.confirm en lugar de Alert
      const confirmDelete = window.confirm(
        "¿Estás seguro que deseas eliminar este chat?"
      );
      if (confirmDelete) {
        onDeleteChat(item.id);
        setShowOptions(false);
        setShowDeleteIcon(false);
      }
    } else {
      // Para mobile, usamos Alert
      Alert.alert(
        "Confirmar eliminación",
        "¿Estás seguro que deseas eliminar este chat?",
        [
          {
            text: "Cancelar",
            style: "cancel",
            onPress: () => {
              setShowOptions(false);
              setShowDeleteIcon(false);
            },
          },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: () => {
              onDeleteChat(item.id);
              setShowOptions(false);
              setShowDeleteIcon(false);
            },
          },
        ]
      );
    }
  };

  const handleMainPress = () => {
    if (!showDeleteIcon) {
      onSelectChat(item.id);
    }
  };

  return (
    <View
      style={[
        styles.historyItemContainer,
        selectedChatId === item.id && styles.selectedHistoryItem,
      ]}
      onMouseEnter={() => isWeb && setShowOptions(true)}
      onMouseLeave={() => isWeb && !showDeleteIcon && setShowOptions(false)}
    >
      <Pressable
        style={({ pressed }) => [
          styles.historyItemContent,
          pressed && styles.pressedButton,
        ]}
        onPress={handleMainPress}
        onLongPress={handleLongPress}
      >
        <Text style={styles.historyItemText} numberOfLines={1}>
          {item.lastMessage || "Nuevo chat"}
        </Text>
        <View style={styles.iconsContainer}>
          <View style={styles.iconSlot}>
            {isWeb && showOptions && !showDeleteIcon && (
              <Pressable
                onPress={handleOptionsPress}
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed && styles.pressedIcon,
                ]}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="more-vertical" size={20} color="#CCC" />
              </Pressable>
            )}
            {(showDeleteIcon || (!isWeb && showDeleteIcon)) && (
              <Pressable
                onPress={handleDeletePress}
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed && styles.pressedIcon,
                ]}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="trash-2" size={20} color="#ff4444" />
              </Pressable>
            )}
          </View>
        </View>
      </Pressable>
    </View>
  );
};

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
  const db = getFirestore();

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
  }, [isMenuOpen, width, isWeb, slideAnim, fadeAnim]);

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const createNewChat = useCallback(async () => {
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
  }, [user, onSelectChat, setMessages]);

  const handleDeleteChat = async (chatId) => {
    try {
      // Primero eliminamos el documento del chat
      await deleteDoc(doc(db, "chats", chatId));
      if (chatId === selectedChatId) {
        setMessages([]);
      }
    } catch (error) {
      console.error("Error al eliminar el chat:", error);
      const errorMessage = isWeb
        ? window.alert("No se pudo eliminar el chat")
        : Alert.alert("Error", "No se pudo eliminar el chat");
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
            display: isWeb ? "none" : "flex",
            pointerEvents: isMenuOpen ? "auto" : "none",
          },
        ]}
        onTouchStart={() => setIsMenuOpen(false)}
      />
      <Animated.View
        style={[
          styles.sidebarMenu,
          {
            width: isWeb ? width * 0.15 : width * 0.8,
            transform: [{ translateX: isWeb ? 0 : slideAnim }],
            height: height,
            left: 0,
          },
        ]}
      >
        {!isWeb && (
          <Pressable
            onPress={toggleMenu}
            style={({ pressed }) => [
              styles.menuButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Icon name={isMenuOpen ? "x" : "menu"} size={30} color="#CCC" />
          </Pressable>
        )}
        <View style={styles.chatHistoryContent}>
          <Text style={styles.chatHistoryTitle}>Chats Anteriores</Text>
          <Pressable
            onPress={createNewChat}
            style={({ pressed }) => [
              styles.newChatButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Icon name="plus" size={20} color="#CCC" />
            <Text style={styles.newChatButtonText}>Nuevo Chat</Text>
          </Pressable>
          <FlatList
            data={chats}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ChatItem
                item={item}
                selectedChatId={selectedChatId}
                onSelectChat={onSelectChat}
                onDeleteChat={handleDeleteChat}
                isWeb={isWeb}
              />
            )}
          />
        </View>
        <View style={styles.userInfoContainer}>
          <Pressable
            onPress={logout}
            style={({ pressed }) => [
              styles.accountButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Icon name="log-out" size={20} color="#CCC" />
          </Pressable>
          {user ? (
            <Text
              style={styles.userEmail}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {user.email}
            </Text>
          ) : (
            <Text style={styles.userEmail}>Cargando usuario...</Text>
          )}
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  menuButton: {
    position: "absolute",
    top: 10,
    right: -70,
    padding: 10,
    zIndex: 15,
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
    backgroundColor: "#666",
  },
  historyItemText: {
    color: "white",
    flex: 1,
    marginRight: 8,
  },
  userInfoContainer: {
    alignItems: "center",
    marginBottom: Platform.OS === "web" ? 20 : 60,
  },
  accountButton: {
    padding: 5,
    backgroundColor: "#444",
    borderRadius: 10,
    alignItems: "center",
    width: "50%",
    marginBottom: 5,
  },
  userEmail: {
    color: "white",
    textAlign: "center",
    maxWidth: "100%",
    ...(Platform.OS === "web" ? { userSelect: "text" } : {}),
  },
  pressedButton: {
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    transform: [{ scale: 0.97 }],
  },
  historyItemContainer: {
    marginBottom: 8,
    borderRadius: 8,
    borderColor: "rgba(255, 255, 255, 0.5)",
    borderWidth: 1,
    overflow: "hidden",
  },
  historyItemContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 8,
    minHeight: 40,
  },
  iconsContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: 30,
    justifyContent: "flex-end",
  },
  iconSlot: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  optionsIcon: {
    padding: 5,
    marginLeft: 8,
  },
  iconButton: {
    padding: 5,
    borderRadius: 4,
    backgroundColor: "transparent",
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteIcon: {
    padding: 5,
    marginLeft: 8,
  },
  historyItemText: {
    color: "white",
    flex: 1,
    marginRight: 8,
  },
  selectedHistoryItem: {
    backgroundColor: "#666",
  },
  pressedButton: {
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    transform: [{ scale: 0.97 }],
  },
});

export default React.memo(SideMenu);
