import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { db, storage } from "../../credenciales";
import {
  addDoc,
  collection,
  doc,
  runTransaction,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const MessageInput = ({ user, chatId, onChatCreated, isWeb, isMobile }) => {
  const [inputText, setInputText] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileObject, setFileObject] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [inputHeight, setInputHeight] = useState(24);

  const uploadFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-powerpoint",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ],
        copyToCacheDirectory: false,
      });

      console.log("Resultado de DocumentPicker:", result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        console.log("Archivo seleccionado con éxito:", file.name);
        setFileName(file.name);
        setFileObject(file);
      } else {
        console.log(
          "Selección de archivo cancelada o no se seleccionó ningún archivo"
        );
      }
    } catch (error) {
      console.error("Error al seleccionar el archivo:", error);
      console.log(
        "Error",
        "No se pudo seleccionar el archivo: " + error.message
      );
    }
  };

  const removeFile = () => {
    setFileName("");
    setFileObject(null);
  };

  const sendMessage = useCallback(async () => {
    if (!inputText.trim() && !fileObject) return;
    if (isSending) return;

    try {
      setIsSending(true);
      let fileUrl = null;
      let finalChatId = chatId;

      // Si hay un archivo, procesarlo primero
      if (fileObject) {
        const fileRef = ref(storage, `chat_files/${Date.now()}_${fileName}`);
        await uploadBytes(fileRef, fileObject);
        fileUrl = await getDownloadURL(fileRef);
      }

      // Si no hay chatId, crear un nuevo chat
      if (!finalChatId) {
        const chatData = {
          userId: user.uid,
          createdAt: serverTimestamp(),
          lastMessage: inputText.trim(),
          lastMessageTime: serverTimestamp(),
        };

        const newChatRef = await addDoc(collection(db, "chats"), chatData);
        finalChatId = newChatRef.id;

        if (onChatCreated) {
          onChatCreated(finalChatId);
        }

        // Esperar para asegurar que el chat se creó
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      const messageData = {
        text: inputText.trim(),
        createdAt: serverTimestamp(),
        userId: user.uid,
        userName: user.displayName || user.email,
        fileUrl: fileUrl,
        fileName: fileName,
        author: "user",
      };

      // Verificar si el chat existe antes de la transacción
      const chatRef = doc(db, "chats", finalChatId);
      const chatDoc = await getDoc(chatRef);

      if (!chatDoc.exists()) {
        // Si el chat no existe, crearlo primero
        await setDoc(chatRef, {
          userId: user.uid,
          createdAt: serverTimestamp(),
          lastMessage: inputText.trim(),
          lastMessageTime: serverTimestamp(),
        });
      }

      // Ahora realizar la transacción
      await runTransaction(db, async (transaction) => {
        // Actualizar el último mensaje del chat
        transaction.update(chatRef, {
          lastMessage: messageData.text,
          lastMessageTime: serverTimestamp(),
        });

        // Añadir el mensaje
        const newMessageRef = doc(
          collection(db, `chats/${finalChatId}/messages`)
        );
        transaction.set(newMessageRef, messageData);
      });

      // Limpiar el estado local
      setInputText("");
      setFileName("");
      setFileObject(null);
      setInputHeight(24);

      // Enviar respuesta automática después de un delay
      setTimeout(() => {
        sendAutoResponse(finalChatId);
      }, 1000);
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
      // Manejar el error específicamente
      if (error.code === "not-found") {
        console.log("El chat no existe, creando uno nuevo...");
        // Aquí podrías implementar la lógica para crear un nuevo chat
      }
    } finally {
      setIsSending(false);
    }
  }, [inputText, fileObject, user, chatId, fileName, onChatCreated]);

  const sendAutoResponse = async (chatId) => {
    const autoResponseData = {
      text: "Actualmente me encuentro en etapa de desarrollo y no cuento con la capacidad de proveerte una respuesta en este momento. ¡Espero que podamos trabajar juntos en un futuro!",
      createdAt: serverTimestamp(),
      userId: "vocalwise",
      userName: "VocalWise",
      fileUrl: null,
      fileName: null,
      author: "vocalwise",
    };

    await addDoc(collection(db, `chats/${chatId}/messages`), autoResponseData);

    // Actualizar el último mensaje del chat
    await setDoc(
      doc(db, "chats", chatId),
      {
        lastMessage: autoResponseData.text,
        lastMessageTime: serverTimestamp(),
      },
      { merge: true }
    );
  };

  const handleKeyPress = (e) => {
    if (Platform.OS === "web" && e.key === "Enter") {
      if (!e.shiftKey) {
        e.preventDefault();
        if (!isSending) {
          sendMessage();
        }
      }
    }
  };

  const handleTextChange = (text) => {
    setInputText(text);
    // Si el texto está vacío, resetear la altura
    if (!text) {
      setInputHeight(24);
    }
  };

  const handleContentSizeChange = (event) => {
    const { contentSize } = event.nativeEvent;
    // Solo ajustar la altura si hay texto y no excede el máximo
    if (inputText) {
      const maxHeight = 24 * 5;
      // No permitimos que la altura crezca más allá del máximo
      if (contentSize.height <= maxHeight) {
        setInputHeight(Math.max(24, contentSize.height));
      }
    } else {
      setInputHeight(24);
    }
  };

  useEffect(() => {
    if (!inputText) {
      setInputHeight(24);
    }
  }, [inputText]);

  return (
    <KeyboardAvoidingView
      behavior={!isWeb ? "padding" : "height"}
      keyboardVerticalOffset={!isWeb ? 90 : 0}
      style={styles.keyboardAvoidingView}
    >
      {isSending && (
        <View style={styles.sendingIndicator}>
          <ActivityIndicator size="small" color="#999" />
          <Text style={styles.sendingText}>Enviando mensaje...</Text>
        </View>
      )}
      <View style={styles.container}>
        <View
          style={[
            styles.inputContainer,
            {
              minHeight: inputHeight + 20,
              width: isWeb && !isMobile ? "70%" : "95%",
            },
          ]}
        >
          {fileObject && (
            <View style={styles.filePreview}>
              <Feather name="file" size={20} color="#DDD" />
              <Text style={styles.fileName}>{fileName}</Text>
              <Pressable
                onPress={removeFile}
                style={({ pressed }) => [
                  styles.removeButton,
                  { opacity: pressed ? 0.5 : 1 },
                ]}
              >
                <Feather name="x" size={10} color="#FFF" />
              </Pressable>
            </View>
          )}
          <View style={styles.textInputContainer}>
            <TextInput
              id="message-input"
              style={[
                styles.input,
                {
                  height: inputHeight,
                  maxHeight: 24 * 5,
                },
              ]}
              placeholder="¿Listo para aprender?"
              placeholderTextColor="#CCC"
              value={inputText}
              onChangeText={handleTextChange}
              onKeyPress={handleKeyPress}
              multiline={true}
              onContentSizeChange={handleContentSizeChange}
              verticalAlign="middle"
              maxLength={1000}
            />
            <View style={styles.buttonContainer}>
              <Pressable
                onPress={uploadFile}
                style={({ pressed }) => [
                  styles.button,
                  { opacity: pressed ? 0.5 : 1 },
                ]}
              >
                <Feather name="paperclip" size={20} color="#999" />
              </Pressable>
              <Pressable
                onPress={sendMessage}
                disabled={isSending}
                style={({ pressed }) => [
                  styles.button,
                  { opacity: pressed ? 0.5 : 1 },
                ]}
              >
                <Feather name="send" size={20} color="#999" />
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    width: "100%",
    position: Platform.OS !== "web" ? "absolute" : "relative",
    bottom: 0,
  },
  container: {
    alignItems: "center",
    paddingBottom: Platform.OS !== "wbe" ? 10 : 0,
  },
  inputContainer: {
    padding: 5,
    backgroundColor: "#444",
    borderRadius: 28,
    marginBottom: 10,
  },
  filePreview: {
    backgroundColor: "#2C2C2E",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 10,
    maxWidth: 250,
  },
  fileName: {
    color: "#CCC",
    marginLeft: 8,
    fontWeight: "bold",
  },
  removeButton: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "gray",
    borderRadius: 15,
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  textInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    color: "#CCC",
    paddingHorizontal: 10,
    outlineStyle: "none",
    fontSize: 16,
    lineHeight: 24,
    verticalAlign: "middle",
    minHeight: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    padding: 10,
    marginRight: 5,
  },
  sendingIndicator: {
    position: "absolute",
    top: -30,
    left: Platform.OS === "web" ? "15%" : "2.5%",
    right: Platform.OS === "web" ? "15%" : "2.5%",
    backgroundColor: "#333",
    padding: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  sendingText: {
    color: "#999",
    marginLeft: 8,
    fontSize: 14,
  },
});

export default MessageInput;
