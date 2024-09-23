import React, { useState } from "react";
import { Pressable, StyleSheet, View, Platform } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import Icon from "react-native-vector-icons/Feather";

const FileUploading = () => {
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
    <View style={{ flexDirection: "row" }}>
      <Pressable
        onPress={uploadFile}
        style={({ pressed }) => [
          // Cambia la opacidad cuando está presionado
          { opacity: pressed ? 0.5 : 1 },
          styles.addFile,
        ]}
      >
        <Icon name="paperclip" size={20} color="#999" />
      </Pressable>
      <Pressable
        onPress={sendMessage}
        style={({ pressed }) => [
          // Cambia la opacidad cuando está presionado
          { opacity: pressed ? 0.5 : 1 },
          styles.sendButton,
        ]}
      >
        <Icon name="send" size={20} color="#999" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  addFile: {
    marginLeft: 5,
    marginRight: 10,
  },
  sendButton: {
    paddingLeft: 10,
  },
});

export default FileUploading;
