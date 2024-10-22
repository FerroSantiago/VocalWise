import React, { useState, useCallback, useEffect } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import * as DocumentPicker from "expo-document-picker";
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  serverTimestamp,
  doc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const MessageInput = ({ user, chatId }) => {
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

    try {
      setIsSending(true);
      const db = getFirestore();
      const storage = getStorage();
      let fileUrl = null;

      if (fileObject) {
        const fileRef = ref(storage, `chat_files/${Date.now()}_${fileName}`);
        await uploadBytes(fileRef, fileObject);
        fileUrl = await getDownloadURL(fileRef);
      }

      const messageData = {
        text: inputText.trim(),
        createdAt: serverTimestamp(),
        userId: user.uid,
        userName: user.displayName || user.email,
        fileUrl: fileUrl,
        fileName: fileName,
      };

      if (!chatId) {
        const newChatRef = await addDoc(collection(db, "chats"), {
          userId: user.uid,
          createdAt: serverTimestamp(),
          lastMessage: inputText.trim(),
          lastMessageTime: serverTimestamp(),
        });
        chatId = newChatRef.id;
      }
      // Actualizar el último mensaje del chat existente
      await setDoc(
        doc(db, "chats", chatId),
        {
          lastMessage: inputText.trim(),
          lastMessageTime: serverTimestamp(),
        },
        { merge: true }
      );

      // Añadir el mensaje a la subcolección de mensajes del chat
      await addDoc(collection(db, `chats/${chatId}/messages`), messageData);

      setInputText("");
      setFileName("");
      setFileObject(null);
      setInputHeight(24);
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
    } finally {
      setIsSending(false);
    }
  }, [inputText, fileObject, user, chatId, fileName]);

  const handleKeyPress = (e) => {
    if (Platform.OS === "web" && e.key === "Enter") {
      if (e.shiftKey) {
        // Permitir nueva línea solo si no excede el máximo de 5 líneas
        const lines = inputText.split("\n");
        if (lines.length < 5) {
          return; // Permite el salto de línea
        } else {
          e.preventDefault(); // Previene más saltos de línea
        }
      } else {
        e.preventDefault();
        sendMessage();
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
    // Solo ajustar la altura si hay texto
    if (inputText) {
      const newHeight = Math.min(Math.max(24, contentSize.height), 24 * 5);
      setInputHeight(newHeight);
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
    <View style={styles.container}>
      <View style={[styles.inputContainer, { minHeight: inputHeight + 20 }]}>
        {fileObject && (
          <View style={styles.filePreview}>
            <Icon name="file" size={20} color="#DDD" />
            <Text style={styles.fileName}>{fileName}</Text>
            <Pressable
              onPress={removeFile}
              style={({ pressed }) => [
                styles.removeButton,
                { opacity: pressed ? 0.5 : 1 },
              ]}
            >
              <Icon name="x" size={10} color="#FFF" />
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
            textAlignVertical="center"
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
              <Icon name="paperclip" size={20} color="#999" />
            </Pressable>
            <Pressable
              onPress={sendMessage}
              disabled={isSending}
              style={({ pressed }) => [
                styles.button,
                { opacity: pressed ? 0.5 : 1 },
              ]}
            >
              <Icon name="send" size={20} color="#999" />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  inputContainer: {
    padding: 5,
    backgroundColor: "#444",
    width: Platform.OS === "web" ? "70%" : "95%",
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
    paddingHorizontal: 15,
    marginLeft: 10,
    outlineStyle: "none",
    fontSize: 16,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 8,
  },
  button: {
    padding: 10,
    marginRight: 5,
  },
});

export default MessageInput;
