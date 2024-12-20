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
import { db } from "../../credenciales";
import {
  addDoc,
  collection,
  doc,
  runTransaction,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { BlobServiceClient } from "@azure/storage-blob";
import { Buffer } from "buffer";

// Inicializar el polyfill de Buffer
if (typeof global.Buffer === "undefined") {
  global.Buffer = Buffer;
}

// Función para subir archivo a Azure Blob Storage
const uploadFileToAzure = async (fileObject) => {
  try {
    console.log("Subiendo archivo a Azure Blob Storage...");

    // URL del contenedor con el SAS Token
    const containerURL = `https://${process.env.EXPO_PUBLIC_ACCOUNT_NAME}.blob.core.windows.net/${process.env.EXPO_PUBLIC_AZURE_BLOB_CONTAINER_NAME}?${process.env.EXPO_PUBLIC_SAS_TOKEN}`;
    const blobServiceClient = new BlobServiceClient(containerURL);

    // Crear cliente del contenedor
    const containerClient = blobServiceClient.getContainerClient();
    const blobName = `uploads/${Date.now()}_${fileObject.name}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Leer archivo como Blob nativo
    const response = await fetch(fileObject.uri);
    const blob = await response.blob();

    // Convertir Blob a ArrayBuffer
    const arrayBuffer = await blob.arrayBuffer();

    // Subir archivo
    await blockBlobClient.uploadData(new Uint8Array(arrayBuffer));
    const fullFileUrl = blockBlobClient.url;

    // Eliminar el SAS Token de la URL
    const fileUrlWithoutToken = fullFileUrl.split("?")[0];

    console.log("Archivo subido con éxito a Azure:", fullFileUrl);
    return fileUrlWithoutToken;
  } catch (error) {
    console.error("Error al subir a Azure Blob Storage:", error.message);
    throw error;
  }
};

const MessageInput = ({ user, chatId, onChatCreated, isWeb, isMobile }) => {
  const [inputText, setInputText] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileObject, setFileObject] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [inputHeight, setInputHeight] = useState(24);
  const [isProcessingAPI, setIsProcessingAPI] = useState(false);

  const uploadFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-powerpoint",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          "video/mp4",
          "video/mov",
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
      let azureFileUrl = null;
      let finalChatId = chatId;

      // Si hay un archivo, procesarlo primero
      if (fileObject) {
        // Subir archivo a Azure
        azureFileUrl = await uploadFileToAzure(fileObject);
        console.log("Azure File URL:", azureFileUrl);
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
        fileUrl: azureFileUrl,
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

      // Limpiar el estado local antes de continuar
      setInputText("");
      setFileName("");
      setFileObject(null);
      setInputHeight(24);

      // Llamar a la API si hay un video
      if (azureFileUrl) {
        setIsProcessingAPI(true);
        try {
          // Verificar qué se está enviando a la API
          console.log(
            "Enviando a la API:",
            JSON.stringify({
              url: azureFileUrl,
              VocalWise: inputText.trim(),
              nombre: "Video de análisis",
              descripcion: "Video subido desde VocalWise",
            })
          );
          const response = await fetch(process.env.EXPO_PUBLIC_API_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              url: azureFileUrl,
              VocalWise: inputText.trim(),
              nombre: "Video de análisis",
              descripcion: "Video subido desde VocalWise",
            }),
          });

          if (response.ok) {
            const apiResponse = await response.json();
            const textResult =
              apiResponse.videoAnalisis?.textResult ||
              "No se encontró el análisis.";
            console.log("Respuesta completa de la API:", apiResponse);
            console.log("Campo 'textResult':", textResult);

            // Guardar la respuesta en Firebase
            const autoResponseData = {
              text: textResult,
              createdAt: serverTimestamp(),
              userId: "vocalwise",
              userName: "VocalWise",
              fileUrl: null,
              fileName: null,
              author: "vocalwise",
            };

            await addDoc(
              collection(db, `chats/${finalChatId}/messages`),
              autoResponseData
            );
          } else {
            const errorText = await response.text();
            console.error("Error Response:", {
              status: response.status,
              statusText: response.statusText,
              body: errorText,
              headers: Object.fromEntries(response.headers.entries()),
            });
            throw new Error(
              `Error en la API: ${response.status} - ${errorText}`
            );
          }
        } catch (error) {
          console.error("=== Error detallado ===");
          console.error("Tipo de error:", error.constructor.name);
          console.error("Mensaje:", error.message);
          console.error("Stack:", error.stack);

          if (
            error instanceof TypeError &&
            error.message.includes("Failed to fetch")
          ) {
            console.error("Error de CORS o red detectado");
            // Intentar obtener más información sobre el error de red
            console.error("Navigator online:", navigator.onLine);
            console.error("User Agent:", navigator.userAgent);
          }

          throw error;
        } finally {
          setIsProcessingAPI(false);
        }
      }
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
      // Manejar el error específicamente
      if (error.code === "not-found") {
        console.log("El chat no existe, creando uno nuevo...");
        // Aquí podrías implementar la lógica para crear un nuevo chat
      }
    } finally {
      setIsSending(false);
      setIsProcessingAPI(false);
    }
  }, [inputText, fileObject, user, chatId, fileName, onChatCreated]);

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
      {(isSending || isProcessingAPI) && (
        <View style={styles.sendingIndicator}>
          <ActivityIndicator size="small" color="#999" />
          <Text style={styles.sendingText}>
            {isProcessingAPI
              ? "Procesando video con IA..."
              : "Enviando mensaje..."}
          </Text>
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
