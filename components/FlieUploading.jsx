import React, { useState } from "react";
import {
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  View,
  Platform,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import Icon from "react-native-vector-icons/Feather";

const FileUploading = () => {
  const [inputText, setInputText] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileObject, setFileObject] = useState(null);

  const uploadFile = async () => {
    try {
      console.log("Iniciando selección de archivo...");
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

  const sendMessage = async () => {
    //Agregar implementacion de enviar mensaje
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {fileObject && (
          <View style={styles.filePreview}>
            <Icon name="file" size={20} color="#DDD" />
            <Text style={styles.fileName}>{fileName}</Text>
          </View>
        )}
        <View style={styles.textInputContainer}>
          <TextInput
            style={styles.input}
            placeholder="¿Listo para aprender?"
            placeholderTextColor="#CCC"
            value={inputText}
            onChangeText={setInputText}
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
  textInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    color: "#CCC",
    paddingHorizontal: 15,
    marginLeft: 10,
  },
  buttonContainer: {
    flexDirection: "row",
  },
  button: {
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 7,
  },
});

export default FileUploading;
