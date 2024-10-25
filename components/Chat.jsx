import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useRouter } from "expo-router";

import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
} from "firebase/firestore";

import Logo from "./Logo";
import MessageInput from "./MessageInput";
import SideMenu from "./SideMenu";

import Icon from "react-native-vector-icons/Feather";

const BubbleMessage = React.memo(({ author, message, fileName }) => {
  const isUserMessage = author === "user";
  return (
    <View
      style={{
        margin: 8,
        maxWidth: "80%",
        borderRadius: 15,
        padding: 10,
        alignSelf: isUserMessage ? "flex-end" : "flex-start",
        backgroundColor: isUserMessage
          ? "rgba(51,51,51,.4)"
          : "rgba(102,102,102,.4)",
      }}
    >
      {fileName ? (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Icon name="file" size={15} color="#999" />
          <Text style={{ color: "#BBB", marginLeft: 5 }}>{fileName}</Text>
        </View>
      ) : null}
      <Text style={{ color: "#EEE" }}>{message}</Text>
    </View>
  );
});

export default function Chat() {
  const { height, width } = useWindowDimensions();
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(Platform.OS === "web");
  const [isLoading, setIsLoading] = useState(true);

  const isWeb = Platform.OS === "web";

  const router = useRouter();

  const handleSelectChat = useCallback((chatId) => {
    setIsLoading(true);
    setSelectedChatId(chatId);
  }, []);

  const handleSetIsMenuOpen = useCallback((isOpen) => {
    if (Platform.OS !== "web") {
      if (isOpen) {
        Keyboard.dismiss();
      }
    }
    setIsMenuOpen(isOpen);
  }, []);

  const handleSetMessages = useCallback((newMessages) => {
    setMessages(newMessages);
  }, []);

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
  }, [router]);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      const db = getFirestore();
      const chatsQuery = query(
        collection(db, "chats"),
        where("userId", "==", user.uid),
        orderBy("lastMessageTime", "desc")
      );

      const unsubscribeChats = onSnapshot(chatsQuery, (querySnapshot) => {
        const fetchedChats = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setChats(fetchedChats);

        // Seleccionar el primer chat por defecto si no hay ninguno seleccionado
        if (fetchedChats.length > 0 && !selectedChatId) {
          setSelectedChatId(fetchedChats[0].id);
        }
        setIsLoading(false);
      });

      return () => unsubscribeChats();
    }
  }, [user, selectedChatId]);

  useEffect(() => {
    if (selectedChatId && user) {
      setIsLoading(true);
      const db = getFirestore();
      const messagesQuery = query(
        collection(db, `chats/${selectedChatId}/messages`),
        orderBy("createdAt", "asc")
      );

      const unsubscribeMessages = onSnapshot(messagesQuery, (querySnapshot) => {
        const fetchedMessages = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          author: doc.data().userId === user.uid ? "user" : "other",
        }));
        setMessages(fetchedMessages);
        setIsLoading(false);
      });

      return () => unsubscribeMessages();
    }
  }, [selectedChatId, user]);

  return (
    <View style={styles.container}>
      <SideMenu
        height={height}
        width={width}
        user={user}
        chats={chats}
        selectedChatId={selectedChatId}
        onSelectChat={handleSelectChat}
        setMessages={handleSetMessages}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={handleSetIsMenuOpen}
      />

      {/* Chat content */}
      <View
        style={[{ marginLeft: isWeb ? width * 0.15 : 0 }, styles.chatContent]}
      >
        {/* VocalWise Logo */}
        <View style={styles.logo}>
          <Logo />
        </View>

        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#FFF" />
            <Text style={styles.loadingText}>Cargando mensajes...</Text>
          </View>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <BubbleMessage
                author={item.author}
                message={item.text}
                fileName={item.fileName}
                fileUrl={item.fileUrl}
              />
            )}
            contentContainerStyle={{
              gap: 15,
              paddingLeft: 15,
              paddingRight: Platform.OS === "web" ? "15%" : 5,
              paddingBottom: Platform.OS !== "web" ? 70 : 5,
            }}
            automaticallyAdjustKeyboardInsets={true}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={() => (
              <Text style={{ color: "#999", textAlign: "center", padding: 20 }}>
                No hay mensajes aún. ¡Comienza la conversación!
              </Text>
            )}
          />
        )}
        {user && <MessageInput user={user} chatId={selectedChatId} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
  },
  chatContent: {
    flex: 1,
    marginTop: 55,
    zIndex: Platform.OS === "web" ? 10 : 4,
  },
  logo: {
    position: "absolute",
    alignSelf: "center",
    top: "25%",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFF",
    marginTop: 10,
  },
});
