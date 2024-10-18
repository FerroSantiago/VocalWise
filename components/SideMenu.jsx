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
  const [activeChatId, setActiveChatId] = useState(null);
  const [showOptionsForChatId, setShowOptionsForChatId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);

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

  useEffect(() => {
    if (isWeb) {
      const handleClickOutside = (event) => {
        if (activeChatId && !event.target.closest(".history-item")) {
          setActiveChatId(null);
          setShowOptionsForChatId(null);
        }
      };
      document.addEventListener("click", handleClickOutside);
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, [isWeb, activeChatId]);

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleShowOptions = (chatId, event) => {
    if (isWeb && event) {
      event.stopPropagation();
    }
    setShowOptionsForChatId(chatId);
  };

  const handleDeleteChat = (chatId, event) => {
    if (isWeb && event) {
      event.stopPropagation();
    }
    setChatToDelete(chatId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteChat = async () => {
    if (chatToDelete) {
      try {
        const db = getFirestore();
        await deleteDoc(doc(db, "chats", chatToDelete));
        setShowDeleteConfirm(false);
        setChatToDelete(null);
        setShowOptionsForChatId(null);
        setActiveChatId(null);
        // You might want to update the chats list here or trigger a refresh
      } catch (error) {
        console.error("Error al eliminar el chat:", error);
      }
    }
  };

  const renderChatItem = ({ item }) => (
    <Pressable
      className="history-item"
      style={({ pressed }) => [
        styles.historyItem,
        selectedChatId === item.id && styles.selectedHistoryItem,
        pressed && styles.pressedButton,
      ]}
      onPress={() => onSelectChat(item.id)}
      onLongPress={() => !isWeb && handleShowOptions(item.id)}
      onHoverIn={() => isWeb && setActiveChatId(item.id)}
      onClick={() => isWeb && setActiveChatId(item.id)}
    >
      <Text style={styles.historyItemText} numberOfLines={1}>
        {item.lastMessage || "Nuevo chat"}
      </Text>
      {isWeb && activeChatId === item.id && (
        <Pressable
          style={styles.actionButton}
          onPress={(event) =>
            showOptionsForChatId === item.id
              ? handleDeleteChat(item.id, event)
              : handleShowOptions(item.id, event)
          }
        >
          <Icon
            name={
              showOptionsForChatId === item.id ? "trash-2" : "more-vertical"
            }
            size={20}
            color={showOptionsForChatId === item.id ? "#d9534f" : "#CCC"}
          />
        </Pressable>
      )}
      {!isWeb && showOptionsForChatId === item.id && (
        <Pressable
          style={styles.actionButton}
          onPress={(event) => handleDeleteChat(item.id, event)}
        >
          <Icon name="trash-2" size={20} color="#d9534f" />
        </Pressable>
      )}
    </Pressable>
  );

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
            renderItem={renderChatItem}
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
      {showDeleteConfirm && (
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmText}>
              ¿Estás seguro de que quieres eliminar este chat?
            </Text>
            <View style={styles.confirmButtons}>
              <Pressable
                style={[styles.confirmButton, styles.cancelButton]}
                onPress={() => {
                  setShowDeleteConfirm(false);
                  setChatToDelete(null);
                }}
              >
                <Text style={styles.confirmButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.confirmButton, styles.deleteConfirmButton]}
                onPress={confirmDeleteChat}
              >
                <Text style={styles.confirmButtonText}>Eliminar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
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
  optionsButton: {
    position: "absolute",
    right: 5,
    top: 5,
    padding: 5,
  },
  deleteButton: {
    position: "absolute",
    right: 5,
    top: 5,
    padding: 5,
  },
  confirmOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
  confirmBox: {
    backgroundColor: "#444",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    maxWidth: 300,
  },
  confirmText: {
    color: "#FFF",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  confirmButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  confirmButton: {
    padding: 10,
    borderRadius: 5,
    width: "40%",
  },
  cancelButton: {
    backgroundColor: "#666",
  },
  deleteConfirmButton: {
    backgroundColor: "#d9534f",
  },
  confirmButtonText: {
    color: "#FFF",
    textAlign: "center",
  },
  actionButton: {
    position: "absolute",
    right: 5,
    top: 5,
    padding: 5,
    zIndex: 1,
  },
});

export default React.memo(SideMenu);
