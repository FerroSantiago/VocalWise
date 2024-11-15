import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";
import defaultProfilePic from "../assets/defaultProfilePic.jpg";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import logoBlanco from "../assets/logoBlanco.webp";
import appFirebase from "../credenciales";
import {
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile,
} from "firebase/auth";
import { getFirestore, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useRouter } from "expo-router";

const auth = getAuth(appFirebase);
const firestore = getFirestore(appFirebase);

export default function RegistrationForm() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateFields = () => {
    let valid = true;
    let newErrors = {};

    if (!displayName) {
      newErrors.displayName = "El campo de usuario no puede estar vacío.";
      valid = false;
    }

    if (!email) {
      newErrors.email = "El campo de email no puede estar vacío.";
      valid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = "Por favor ingrese un email válido.";
      valid = false;
    }

    if (!password) {
      newErrors.password = "El campo de contraseña no puede estar vacío.";
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres.";
      valid = false;
    }

    if (!repeatPassword) {
      newErrors.repeatPassword =
        "El campo de repetir contraseña no puede estar vacío.";
      valid = false;
    } else if (password !== repeatPassword) {
      newErrors.repeatPassword = "Las contraseñas no coinciden.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const register = async () => {
    if (!validateFields()) return;
    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Actualizar el perfil del usuario
      await updateProfile(user, {
        displayName: displayName,
      });

      // Actualizar Firestore
      await setDoc(doc(firestore, "users", user.uid), {
        email: email,
        displayName: displayName,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        photoURL: null,
      });

      await AsyncStorage.setItem(
        "user",
        JSON.stringify({
          ...user,
          displayName: displayName, // Asegurar que el displayName se guarda en AsyncStorage
        })
      );

      console.log("Registro OK");
      setTimeout(() => {
        setIsLoading(false);
        router.push("/chat");
      }, 1000);
    } catch (error) {
      console.log(error);

      // Verificar si el el email ya está en uso
      if (error.code === "auth/email-already-in-use") {
        setErrors((prevErrors) => ({
          ...prevErrors,
          email: "El email ya está en uso.",
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          general: "No se pudo registrar el usuario. Intente nuevamente.",
        }));
      }
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <View style={styles.logoContainer}>
          <Image source={logoBlanco} style={styles.logo} resizeMode="contain" />
        </View>
        <View style={styles.inputsContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                errors.displayName ? styles.errorInput : null,
              ]}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Usuario"
              placeholderTextColor="#9CA3AF"
            />
            {errors.displayName && (
              <Text style={styles.errorText}>{errors.displayName}</Text>
            )}
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, errors.email ? styles.errorInput : null]}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.passwordInput,
                  errors.password ? styles.errorInput : null,
                ]}
                value={password}
                onChangeText={setPassword}
                placeholder="Contraseña"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={24}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.passwordInput,
                  errors.repeatPassword ? styles.errorInput : null,
                ]}
                value={repeatPassword}
                onChangeText={setRepeatPassword}
                placeholder="Repetir Contraseña"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showRepeatPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowRepeatPassword(!showRepeatPassword)}
              >
                <Feather
                  name={showRepeatPassword ? "eye-off" : "eye"}
                  size={24}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>
            {errors.repeatPassword && (
              <Text style={styles.errorText}>{errors.repeatPassword}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.disabledButton]}
            onPress={register}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Registrarse</Text>
            )}
          </TouchableOpacity>
          {errors.general && (
            <Text style={[styles.errorText]}>{errors.general}</Text>
          )}
          <Pressable
            onPress={() => router.push("/")}
            style={styles.backButton}
            aria-label="Volver al home"
          >
            <Feather name="arrow-left" size={20} color="#94b1f3" />
            <Text style={styles.backButtonText}>Volver a Home</Text>
          </Pressable>
        </View>
        <Text style={styles.termsText}>
          Al crear una cuenta aquí, aceptas nuestras{" "}
          <Text style={styles.link}>Condiciones de Uso</Text> y el{" "}
          <Text style={styles.link}>Aviso de Privacidad</Text>.
        </Text>
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
    width: "80%",
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
  inputsContainer: {
    width: "100%",
    marginTop: 64,
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#fff",
    borderColor: "#4B5563",
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    color: "black",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
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
  button: {
    backgroundColor: "#4B5563",
    padding: 12,
    marginTop: 10,
    borderRadius: 4,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.7,
  },
  errorText: {
    color: "red",
    fontSize: 12,
  },
  errorInput: {
    borderColor: "red",
    borderWidth: 2.5,
  },
  termsText: {
    marginTop: 10,
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
  },
  link: {
    color: "#60A5FA",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 24,
    padding: 8,
  },
  backButtonText: {
    color: "#94b1f3",
    marginLeft: 8,
  },
});
