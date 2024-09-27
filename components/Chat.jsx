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

import logoBlanco from "../assets/logoBlanco.png";

import MessageInput from "./MessageInput";
import SideMenu from "./SideMenu";

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
  const [user, setUser] = useState(null);

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

      <SideMenu height={height} width={width} user={user}></SideMenu>

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
        <MessageInput></MessageInput>
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
