import * as ImagePicker from "expo-image-picker";
import defaultProfilePic from "../assets/defaultProfilePic.jpg";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
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
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "expo-router";
import { Asset } from "expo-asset";

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
  const [profileImage, setProfileImage] = useState(null);
  const [scale, setScale] = useState(1);

  const storage = getStorage();
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

  useEffect(() => {
    if (Platform.OS === "web") {
      const handleResize = () => {
        // Cambiamos el divisor para hacer el formulario más grande
        const baseScale = 1.3; // Factor de escala base
        setScale(Math.min(baseScale, (window.innerHeight / 900) * baseScale));
      };
      window.addEventListener("resize", handleResize);
      handleResize();
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const register = async () => {
    if (!validateFields()) return;
    setIsLoading(true);

    try {
      // 1. Crear usuario
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 2. Subir imagen y obtener URL
      const photoURL = await uploadImage(user.uid);

      // 3. Actualizar Firestore primero
      await setDoc(doc(firestore, "users", user.uid), {
        email: email,
        displayName: displayName,
        photoURL: photoURL,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });

      // 4. Actualizar perfil de Auth
      await updateProfile(user, {
        displayName: displayName,
        photoURL: photoURL,
      });

      // 5. Recargar usuario y guardar en AsyncStorage
      await user.reload();
      const updatedUser = auth.currentUser;
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

      setIsLoading(false);
      router.push("/chat");
    } catch (error) {
      console.error("Error completo:", error);
      if (error.code === "auth/email-already-in-use") {
        setErrors((prev) => ({
          ...prev,
          email: "El email ya está en uso.",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          general: "Error en el registro: " + error.message,
        }));
      }
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Se necesitan permisos para acceder a la galería");
        return;
      }
    }

    try {
      if (Platform.OS === "web") {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = async (e) => {
          const file = e.target.files[0];
          setProfileImage(file);
        };
        input.click();
      } else {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.5,
        });

        if (!result.canceled) {
          setProfileImage(result.assets[0]);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error al seleccionar imagen");
    }
  };

  const uploadImage = async (uid) => {
    try {
      const storageRef = ref(storage, `profilePics/${uid}`);

      if (!profileImage) {
        // Manejar la imagen por defecto
        const asset = Asset.fromModule(defaultProfilePic);
        await asset.downloadAsync();
        const response = await fetch(asset.localUri || asset.uri);
        const blob = await response.blob();
        await uploadBytes(storageRef, blob);
      } else if (Platform.OS === "web") {
        await uploadBytes(storageRef, profileImage);
      } else {
        const response = await fetch(profileImage.uri);
        const blob = await response.blob();
        await uploadBytes(storageRef, blob);
      }

      // Obtener la URL de la imagen subida
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.formContainer, { transform: [{ scale }] }]}>
        <View style={styles.logoContainer}>
          <Image source={logoBlanco} style={styles.logo} resizeMode="contain" />
        </View>
        <View style={styles.imageSection}>
          <Pressable onPress={pickImage} style={styles.imageButton}>
            <Text style={styles.imageButtonText}>Elegir foto de perfil</Text>
          </Pressable>
          <View style={styles.imageContainer}>
            <Image
              source={
                profileImage
                  ? Platform.OS === "web"
                    ? { uri: URL.createObjectURL(profileImage) }
                    : { uri: profileImage.uri }
                  : defaultProfilePic
              }
              style={styles.profileImage}
            />
          </View>
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
    minHeight: Platform.OS === "web" ? "100vh" : "100%",
  },
  formContainer: {
    width: Platform.OS === "web" ? 400 : "90%",
    backgroundColor: "#333",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    transform: [
      {
        scale:
          Platform.OS === "web" ? Math.min(1, window.innerHeight / 850) : 1,
      },
    ],
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
    marginTop: 10,
  },
  inputContainer: {
    marginBottom: 10,
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
  imageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 60,
    backgroundColor: "#444",
  },
  imageButton: {
    backgroundColor: "#4B5563",
    padding: 10,
    borderRadius: 8,
    flex: 1,
  },
  imageButtonText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
  imageSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    width: "100%",
    gap: 20,
    paddingRight: 20,
    marginBottom: 10,
  },
});
