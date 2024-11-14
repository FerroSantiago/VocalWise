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

// Componentes
import Logo from "./Logo";
import MessageInput from "./chatComponents/MessageInput";
import SideMenu from "./chatComponents/SideMenu";
import BubbleMessage from "./chatComponents/BubbleMessage"; // Importamos el nuevo componente separado

export default function Chat() {
  const { height, width } = useWindowDimensions();
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(Platform.OS === "web");
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const isWeb = Platform.OS === "web";
  const router = useRouter();

  const handleSelectChat = useCallback(
    (chatId) => {
      console.log("handleSelectChat llamado con:", chatId);
      if (chatId !== selectedChatId) {
        setIsLoading(true);
        setSelectedChatId(chatId);
      }
    },
    [selectedChatId]
  );

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

  // Efecto para verificar la autenticación del usuario
  useEffect(() => {
    const checkUser = async () => {
      try {
        const auth = getAuth();
        const storedUser = await AsyncStorage.getItem("user");

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);

          if (auth.currentUser) {
            const token = await auth.currentUser.getIdToken(true);
            setIsAuthReady(true);
          } else {
            router.push("/login");
          }
        } else {
          const currentUser = auth.currentUser;
          if (currentUser) {
            await currentUser.getIdToken(true);
            setUser(currentUser);
            setIsAuthReady(true);
          } else {
            router.push("/login");
          }
        }
      } catch (error) {
        console.error("Error during auth check:", error);
        router.push("/login");
      }
    };

    checkUser();
  }, [router]);

  // Efecto para cargar los chats
  useEffect(() => {
    if (user && isAuthReady) {
      setIsLoading(true);
      const db = getFirestore();
      const chatsQuery = query(
        collection(db, "chats"),
        where("userId", "==", user.uid),
        orderBy("lastMessageTime", "desc")
      );

      const unsubscribeChats = onSnapshot(
        chatsQuery,
        (querySnapshot) => {
          const fetchedChats = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setChats(fetchedChats);

          if (fetchedChats.length > 0) {
            // Si hay un chat seleccionado y ya no existe, seleccionar el primero
            if (
              !selectedChatId ||
              !fetchedChats.find((chat) => chat.id === selectedChatId)
            ) {
              setSelectedChatId(fetchedChats[0].id);
            }
          } else {
            // Si no hay chats, limpiar la selección y los mensajes
            setSelectedChatId(null);
            setMessages([]);
          }
          setIsLoading(false);
        },
        (error) => {
          console.error("Error fetching chats:", error);
          if (error.code === "permission-denied") {
            const auth = getAuth();
            if (auth.currentUser) {
              auth.currentUser
                .getIdToken(true)
                .then(() => setIsAuthReady(true))
                .catch((err) => console.error("Error refreshing token:", err));
            }
          }
          setIsLoading(false);
        }
      );

      return () => unsubscribeChats();
    }
  }, [user, isAuthReady]);

  // Efecto para cargar los mensajes del chat seleccionado
  useEffect(() => {
    let unsubscribe = null;

    const loadMessages = async () => {
      if (selectedChatId && user) {
        setIsLoading(true);
        const db = getFirestore();

        try {
          const messagesQuery = query(
            collection(db, `chats/${selectedChatId}/messages`),
            orderBy("createdAt", "desc")
          );

          unsubscribe = onSnapshot(
            messagesQuery,
            (querySnapshot) => {
              const fetchedMessages = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
              }));
              setMessages(fetchedMessages.reverse());
              setIsLoading(false);
            },
            (error) => {
              console.error("Error fetching messages:", error);
              // Si hay un error de permisos o el documento no existe
              if (
                error.code === "permission-denied" ||
                error.code === "not-found"
              ) {
                setMessages([]);
              }
              setIsLoading(false);
            }
          );
        } catch (error) {
          console.error("Error setting up messages listener:", error);
          setIsLoading(false);
        }
      } else {
        // Si no hay chat seleccionado, limpiar mensajes y quitar loading
        setMessages([]);
        setIsLoading(false);
      }
    };

    loadMessages();

    // Cleanup función
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [selectedChatId, user]);

  // Renderizar el componente EmptyChat cuando no hay mensajes
  const EmptyChat = () => (
    <Text style={styles.emptyText}>
      No hay mensajes aún. ¡Comienza la conversación!
    </Text>
  );

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

      <View
        style={[{ marginLeft: isWeb ? width * 0.15 : 0 }, styles.chatContent]}
      >
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
                id={item.id}
                createdAt={item.createdAt}
              />
            )}
            contentContainerStyle={styles.flatListContent}
            automaticallyAdjustKeyboardInsets={true}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={EmptyChat}
          />
        )}

        {user && selectedChatId && (
          <MessageInput
            user={user}
            chatId={selectedChatId}
            onChatCreated={(newChatId) => {
              setSelectedChatId(newChatId);
              handleSelectChat(newChatId);
            }}
          />
        )}
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
  flatListContent: {
    gap: 15,
    paddingLeft: 15,
    paddingRight: Platform.OS === "web" ? "10%" : 5,
    paddingLeft: Platform.OS === "web" ? "8%" : 0,
    paddingBottom: Platform.OS !== "web" ? 70 : 5,
  },
  emptyText: {
    color: "#999",
    textAlign: "center",
    padding: 20,
  },
});
