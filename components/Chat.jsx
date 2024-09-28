import React, { useState, useEffect } from "react";
import {
  FlatList,
  Image,
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

import logoBlanco from "../assets/logoBlanco.png";

import MessageInput from "./MessageInput";
import SideMenu from "./SideMenu";

function BubbleMessage({ author, message, fileName, fileUrl }) {
  const isUserMessage = author === "user";
  return (
    <View
      style={{
        maxWidth: "80%",
        borderRadius: 15,
        padding: 10,
        alignSelf: isUserMessage ? "flex-end" : "flex-start",
        backgroundColor: isUserMessage
          ? "rgba(51,51,51,.5)"
          : "rgba(102,102,102,.5)",
      }}
    >
      <Text style={{ color: "#EEE" }}>{message}</Text>
      {fileName && (
        <Text style={{ color: "#BBB", marginTop: 5 }}>
          Archivo adjunto: {fileName}
        </Text>
      )}
    </View>
  );
}

export default function Chat() {
  const { height, width } = useWindowDimensions();
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messages, setMessages] = useState([]);

  const router = useRouter();

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

  useEffect(() => {
    if (user) {
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
      });

      return () => unsubscribeChats();
    }
  }, [user]);

  useEffect(() => {
    if (selectedChatId) {
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
      });

      return () => unsubscribeMessages();
    }
  }, [selectedChatId, user]);

  return (
    <View style={styles.container}>
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

      <SideMenu
        height={height}
        width={width}
        user={user}
        chats={chats}
        selectedChatId={selectedChatId}
        onSelectChat={setSelectedChatId}
      ></SideMenu>

      {/* Chat content */}
      <View
        style={[
          {
            marginLeft: Platform.OS === "web" ? width * 0.15 : 0,
          },
          styles.chatContent,
        ]}
      >
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
            paddingRight: 23,
            paddingBottom: 15,
          }}
          automaticallyAdjustKeyboardInsets
        />
        {user && <MessageInput user={user} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
    top: Platform.OS === "web" ? "25%" : "0",
    left: Platform.OS === "web" ? "55%" : "45%",
    opacity: 0.1,
    //probar inset:0, margin: auto y position relative para centrar
  },
  chatContent: {
    zIndex: Platform.OS === "web" ? 10 : 4,
    flex: 1,
    justifyContent: "flex-end",

    marginTop: 55,
  },
});
