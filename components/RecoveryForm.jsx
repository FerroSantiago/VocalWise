import React, { useState, useEffect } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import logoBlanco from "../assets/logoBlanco.webp";
import { auth } from "../credenciales";
import { sendPasswordResetEmail } from "firebase/auth";
import { useRouter } from "expo-router";

export default function RecoveryForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isFromLockout, setIsFromLockout] = useState(false);

  const router = useRouter();

  // Verificar si el usuario viene de un bloqueo
  useEffect(() => {
    const checkLockoutStatus = async () => {
      try {
        const lockoutData = await AsyncStorage.getItem("loginLockout");
        if (lockoutData) {
          setIsFromLockout(true);
        }
      } catch (error) {
        console.error("Error checking lockout status:", error);
      }
    };

    checkLockoutStatus();
  }, []);

  // Modificar el mensaje inicial si viene de un bloqueo
  const getSubtitleMessage = () => {
    if (isFromLockout) {
      return "Tu cuenta ha sido bloqueada por múltiples intentos fallidos. Por favor, recupera tu contraseña para continuar.";
    }
    return "Ingresa tu correo electrónico y te enviaremos las instrucciones para recuperar tu contraseña";
  };

  const handleRecovery = async () => {
    if (!email) {
      setErrorMessage("Por favor ingresa tu correo electrónico");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await sendPasswordResetEmail(auth, email);

      // Limpiar los intentos de login y el bloqueo
      await AsyncStorage.multiRemove(["loginAttempts", "loginLockout"]);

      setSuccessMessage(
        "Se ha enviado un correo con las instrucciones para recuperar tu contraseña"
      );

      // Redirigir al home
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (error) {
      console.error(error);
      switch (error.code) {
        case "auth/user-not-found":
          setErrorMessage("No existe una cuenta con este correo electrónico");
          break;
        case "auth/invalid-email":
          setErrorMessage("El correo electrónico no es válido");
          break;
        case "auth/too-many-requests":
          setErrorMessage("Demasiados intentos. Por favor intenta más tarde");
          break;
        default:
          setErrorMessage("Error al enviar el correo de recuperación");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={logoBlanco}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Logo de la aplicación"
          />
        </View>

        <Text style={styles.title}>Recuperar Contraseña</Text>
        <Text style={styles.subtitle}>{getSubtitleMessage()}</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#9CA3AF"
            autoComplete="email"
            autoCapitalize="none"
            inputMode="email"
            accessibilityLabel="Campo de email"
          />
        </View>

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        {successMessage ? (
          <Text style={styles.successText}>{successMessage}</Text>
        ) : null}

        <Pressable
          style={({ pressed }) => [
            styles.button,
            isLoading && styles.disabledButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleRecovery}
          disabled={isLoading}
          accessibilityLabel="Enviar correo de recuperación"
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Enviar correo</Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => router.push("/login")}
          style={styles.backButton}
          aria-label="Volver al login"
        >
          <Feather name="arrow-left" size={20} color="#94b1f3" />
          <Text style={styles.backButtonText}>Volver al login</Text>
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
    height: 53,
    width: 70,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 64,
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#fff",
    borderColor: "#4B5563",
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    color: "black",
  },
  button: {
    backgroundColor: "#4B5563",
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 16,
    width: 160,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  errorText: {
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 16,
  },
  successText: {
    color: "#10B981",
    textAlign: "center",
    marginBottom: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    padding: 8,
  },
  backButtonText: {
    color: "#94b1f3",
    marginLeft: 8,
  },
});
