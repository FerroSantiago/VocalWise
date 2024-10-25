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
import logoBlanco from "../assets/logoBlanco.webp";
import appFirebase from "../credenciales";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { useRouter } from "expo-router";

const auth = getAuth(appFirebase);
const firestore = getFirestore(appFirebase);

export default function RegistrationForm() {
  const [username, setUsername] = useState("");
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

    if (!username) {
      newErrors.username = "El campo de usuario no puede estar vacío.";
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
    // Validar que los campos no estén vacíos
    if (!validateFields()) return;

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(firestore, "users", user.uid), {
        username: username,
        email: email,
        userId: user.uid,
      });

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
              style={[styles.input, errors.username ? styles.errorInput : null]}
              value={username}
              onChangeText={setUsername}
              placeholder="Usuario"
              placeholderTextColor="#9CA3AF"
            />
            {errors.username && (
              <Text style={styles.errorText}>{errors.username}</Text>
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
});
