import React from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import LogoAnimado from "../LogoAnimado";

const WelcomeSection = ({ navbarHeight }) => {
  const { height } = useWindowDimensions();
  const welcomeSectionHeight = height - navbarHeight;

  return (
    <View style={[styles.container, { height: welcomeSectionHeight }]}>
      <View style={styles.content}>
        <Text style={styles.title}>Bienvenido a VocalWise</Text>
        <Text style={styles.description}>
          Descubre cómo nuestra plataforma puede cambiar tu vida.
        </Text>
        <LogoAnimado />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  content: {
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 55,
    color: "white",
  },
  description: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 50,
  },
});

export default WelcomeSection;
