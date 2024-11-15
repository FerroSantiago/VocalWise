import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Keyboard,
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
  getDocs,
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
  const itemRef = useRef(null);

  useEffect(() => {
    if (isWeb) {
      const handleClickOutside = (event) => {
        // Verificamos si el clic fue fuera del componente actual
        if (itemRef.current && !itemRef.current.contains(event.target)) {
          setShowDeleteIcon(false);
          setShowOptions(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isWeb]);

  const handleItemClick = (e) => {
    e.stopPropagation();
  };

  useEffect(() => {
    if (isWeb && itemRef.current) {
      itemRef.current.addEventListener("mousedown", handleItemClick);
      return () => {
        if (itemRef.current) {
          itemRef.current.removeEventListener("mousedown", handleItemClick);
        }
      };
    }
  }, [isWeb]);

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
      const confirmDelete = window.confirm(
        "¿Estás seguro que deseas eliminar este chat?"
      );
      if (confirmDelete) {
        onDeleteChat(item.id);
      }
    } else {
      Alert.alert(
        "Confirmar eliminación",
        "¿Estás seguro que deseas eliminar este chat?",
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: () => {
              onDeleteChat(item.id);
            },
          },
        ]
      );
    }
    setShowOptions(false);
    setShowDeleteIcon(false);
  };

  const handleMainPress = () => {
    onSelectChat(item.id);
    setShowDeleteIcon(false);
    setShowOptions(false);
  };

  return (
    <View
      ref={itemRef}
      style={[
        styles.historyItemContainer,
        selectedChatId === item.id && styles.selectedHistoryItem,
      ]}
      onMouseEnter={() => isWeb && setShowOptions(true)}
      onMouseLeave={() => isWeb && setShowOptions(false)}
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
            {showDeleteIcon && (
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

  const [hasEmptyChat, setHasEmptyChat] = useState(false);

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

  useEffect(() => {
    const checkEmptyChats = async () => {
      try {
        for (const chat of chats) {
          const messagesRef = collection(db, `chats/${chat.id}/messages`);
          const messagesSnapshot = await getDocs(messagesRef);
          if (messagesSnapshot.empty) {
            setHasEmptyChat(true);
            return;
          }
        }
        setHasEmptyChat(false);
      } catch (error) {
        console.error("Error al verificar chats vacíos:", error);
      }
    };

    checkEmptyChats();
  }, [chats, db]);

  const createNewChat = useCallback(async () => {
    try {
      if (hasEmptyChat) {
        const message =
          "Ya tienes un chat vacío. Por favor, utiliza ese chat o elimínalo antes de crear uno nuevo.";
        if (isWeb) {
          window.alert(message);
        } else {
          Alert.alert("Aviso", message);
        }
        return;
      }

      const chatData = {
        userId: user.uid,
        createdAt: serverTimestamp(),
        lastMessage: "Nuevo chat",
        lastMessageTime: serverTimestamp(),
      };

      const newChatRef = await addDoc(collection(db, "chats"), chatData);

      // Esperar un momento para que Firestore propague los cambios
      setTimeout(() => {
        onSelectChat(newChatRef.id);
        setMessages([]);
      }, 100);
    } catch (error) {
      console.error("Error al crear un nuevo chat:", error);
    }
  }, [user, onSelectChat, setMessages, hasEmptyChat, isWeb]);

  const handleDeleteChat = async (chatId) => {
    try {
      // Se obtienen los msj del chat
      const messagesRef = collection(db, `chats/${chatId}/messages`);
      const messagesSnapshot = await getDocs(messagesRef);

      // Se eliminan los msj de la subcoleccion
      const deletePromises = messagesSnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);

      // Se elimina el chat
      await deleteDoc(doc(db, "chats", chatId));

      // Si el chat eliminado era el seleccionado, limpiamos los mensajes
      if (chatId === selectedChatId) {
        setMessages([]);
        // Opcional: seleccionar otro chat si existe
        const remainingChats = chats.filter((chat) => chat.id !== chatId);
        if (remainingChats.length > 0) {
          onSelectChat(remainingChats[0].id);
        }
      }
    } catch (error) {
      console.error("Error al eliminar el chat:", error);
      const errorMessage = isWeb
        ? window.alert("No se pudo eliminar el chat y sus mensajes")
        : Alert.alert("Error", "No se pudo eliminar el chat y sus mensajes");
    }
  };

  const toggleMenu = () => {
    if (Platform.OS !== "web") {
      Keyboard.dismiss();
    }
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
          <Text style={styles.chatHistoryTitle}>Chats anteriores</Text>
          <Pressable
            onPress={createNewChat}
            style={({ pressed }) => [
              styles.newChatButton,
              hasEmptyChat && styles.disabledButton,
              pressed && !hasEmptyChat && styles.pressedButton,
            ]}
            disabled={hasEmptyChat}
          >
            <Icon
              name="plus"
              size={20}
              color={hasEmptyChat ? "#666" : "#CCC"}
            />
            <Text
              style={[
                styles.newChatButtonText,
                hasEmptyChat && styles.disabledButtonText,
              ]}
            >
              Nuevo chat
            </Text>
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
              style={styles.userDisplayName}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {user.displayName}
            </Text>
          ) : (
            <Text style={styles.userDisplayName}>Cargando usuario...</Text>
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
  userDisplayName: {
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
    padding: 5,
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
  disabledButton: {
    backgroundColor: "#444",
    opacity: 0.5,
  },
  disabledButtonText: {
    color: "#666",
  },
});

export default React.memo(SideMenu);
