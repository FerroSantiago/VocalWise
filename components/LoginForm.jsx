import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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

      setIsLoading(false);
      router.push("/chat");
    } catch (error) {
      console.log(error);
      setErrorMessage("Usuario o contraseña incorrecta.");
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <View style={styles.logoContainer}>
          <Image source={logoBlanco} style={styles.logo} resizeMode="contain" />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={(text) => setEmail(text)}
            placeholder="Email"
            placeholderTextColor="#9CA3AF"
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
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Feather
              name={showPassword ? "eye" : "eye-off"}
              size={24}
              color="#999"
            />
          </TouchableOpacity>
        </View>

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text> // Mostrar error si existe
        ) : null}

        <View style={styles.rememberMeContainer}>
          <TouchableOpacity
            style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
            onPress={() => setRememberMe(!rememberMe)}
          />
          <Text style={styles.rememberMeText}>Recordarme</Text>
        </View>
        <TouchableOpacity
          style={[styles.button, isLoading && styles.disabledButton]}
          onPress={login}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>
        <View style={styles.links}>
          <TouchableOpacity onPress={() => router.push("/register")}>
            <Text style={styles.linkText}>Registrarme</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.linkText}>Olvidé mi contraseña</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.separator} />
        <TouchableOpacity style={styles.socialButton}>
          <Feather name="mail" size={24} color="#fff" />
          <Text style={styles.socialButtonText}>Iniciar sesión con Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.socialButton, styles.metaButton]}>
          <Feather name="facebook" size={24} color="#fff" />
          <Text style={styles.socialButtonText}>Iniciar sesión con Meta</Text>
        </TouchableOpacity>
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
    color: "#3498db",
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
  },
  errorText: {
    color: "red", // Color para el mensaje de error
    textAlign: "center",
    marginBottom: 16,
  },
});
