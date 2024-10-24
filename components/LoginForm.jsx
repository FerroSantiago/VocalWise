import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import logoBlanco from "../assets/logoBlanco.png";

import appFirebase from "../credenciales";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useRouter } from "expo-router";

const auth = getAuth(appFirebase);

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const login = async () => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      await AsyncStorage.setItem("user", JSON.stringify(userCredential.user));

      setTimeout(() => {
        setIsLoading(false);
        router.push("/chat");
      }, 1000);
    } catch (error) {
      console.log(error);
      setErrorMessage("Usuario o contraseña incorrecta.");
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} role="form">
      <View style={styles.formContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={logoBlanco}
            style={styles.logo}
            resizeMode="contain"
            aria-label="Logo de la aplicación"
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={(text) => setEmail(text)}
            placeholder="Email"
            placeholderTextColor="#9CA3AF"
            aria-label="Campo de email"
            textContentType="emailAddress"
            autoComplete="email"
            autoCapitalize="none"
            inputMode="email-address"
          />
        </View>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            value={password}
            onChangeText={(text) => setPassword(text)}
            placeholder="Contraseña"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showPassword}
            aria-label="Campo de contraseña"
            textContentType="password"
            autoComplete="password"
            autoCapitalize="none"
          />
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
            role="button"
          >
            <Feather
              name={showPassword ? "eye" : "eye-off"}
              size={24}
              color="#999"
            />
          </Pressable>
        </View>

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text> // Mostrar error si existe
        ) : null}

        <View style={styles.rememberMeContainer}>
          <Pressable
            style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
            onPress={() => setRememberMe(!rememberMe)}
            role="checkbox"
            aria-label="Recordar credenciales"
            aria-checked={rememberMe}
          />
          <Text style={styles.rememberMeText}>Recordarme</Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            isLoading && styles.disabledButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={login}
          disabled={isLoading}
          role="button"
          aria-label="Iniciar sesion"
          aria-checked={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </Pressable>
        <View style={styles.links}>
          <Pressable
            onPress={() => router.push("/register")}
            role="link"
            aria-label="Ir a registro"
          >
            <Text style={styles.linkText}>Registrarme</Text>
          </Pressable>
          <Pressable role="link" aria-label="Recuperar contraseña">
            <Text style={styles.linkText}>Olvidé mi contraseña</Text>
          </Pressable>
        </View>
        <View style={styles.separator} />
        <Pressable
          style={styles.socialButton}
          role="button"
          aria-label="Iniciar sesión con Google"
        >
          <Feather name="mail" size={24} color="#fff" />
          <Text style={styles.socialButtonText}>Iniciar sesión con Google</Text>
        </Pressable>
        <Pressable
          style={[styles.socialButton, styles.metaButton]}
          role="button"
          aria-label="Iniciar sesión con Meta"
        >
          <Feather name="facebook" size={24} color="#fff" />
          <Text style={styles.socialButtonText}>Iniciar sesión con Meta</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    width: 350,
    backgroundColor: "#333",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  logoContainer: {
    position: "absolute",
    top: -48,
    alignSelf: "center",
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#444",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    height: 70,
    width: 70,
  },
  inputContainer: {
    width: "100%",
    marginTop: 64,
  },
  input: {
    backgroundColor: "#fff",
    borderColor: "#4B5563",
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    color: "black",
    marginBottom: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderColor: "#4B5563",
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    color: "black",
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#fff",
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: "#fff",
  },
  rememberMeText: {
    color: "#fff",
    userSelect: "none",
  },
  button: {
    backgroundColor: "#4B5563",
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
    marginBottom: 15,
    width: 120,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    userSelect: "none",
  },
  disabledButton: {
    opacity: 0.7,
  },
  links: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  linkText: {
    color: "#94b1f3",
    userSelect: "none",
  },
  separator: {
    width: "100%",
    height: 1,
    backgroundColor: "#7f8c8d",
    marginBottom: 20,
    marginTop: 20,
  },
  socialButton: {
    width: "100%",
    height: 40,
    backgroundColor: "#db4437",
    borderRadius: 5,
    paddingLeft: 15,
    flexDirection: "row",
    justifyContent: "start",
    alignItems: "center",
    marginBottom: 10,
  },
  metaButton: {
    backgroundColor: "#3b5998",
  },
  socialButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
    userSelect: "none",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 16,
    userSelect: "none",
  },
});
