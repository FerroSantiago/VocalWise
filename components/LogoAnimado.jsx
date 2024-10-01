import React, { useEffect, useRef } from "react";
import { Animated, Easing, Platform, StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";

const AnimatedPath = Animated.createAnimatedComponent(Path);

const LogoAnimado = () => {
  const animatedValueLeft = useRef(new Animated.Value(0)).current;
  const animatedValueRight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animationLeft = Animated.loop(
      Animated.timing(animatedValueLeft, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== "web",
      }),
      { iterations: -1 }
    );

    // Animación de la figura derecha con retraso de 3 segundos
    const animationRight = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValueRight, {
          toValue: 1,
          duration: 10000,
          easing: Easing.linear,
          useNativeDriver: Platform.OS !== "web",
        }),
      ]),
      { iterations: -1 }
    );
    animationLeft.start();
    animationRight.start();

    return () => {
      animationLeft.stop();
      animationRight.stop();
    };
  }, []);

  const totalLength = 1000;
  const visibleLength = 300;
  const gapLength = totalLength - visibleLength;

  const animatedPropsLeft = {
    strokeDashoffset: animatedValueLeft.interpolate({
      inputRange: [0, 1],
      outputRange: [totalLength, 0],
      extrapolate: "extend",
    }),
  };

  const animatedPropsRight = {
    strokeDashoffset: animatedValueRight.interpolate({
      inputRange: [0, 1],
      outputRange: [0, totalLength],
      extrapolate: "extend",
    }),
  };

  const strokeDasharray = `${visibleLength}, ${gapLength}`;

  return (
    <View style={styles.container}>
      <Svg width="318" height="240" viewBox="0 0 424 319">
        {/* Logo shape */}
        <Path
          d="M77.5 1H1L93.5 318.5H171L263.5 1H186.5L131 215L77.5 1Z M345.5 1H423L330.5 318.5H252.5L222 213.5H290L345.5 1Z"
          fill="white"
          stroke="white"
        />
        <Path
          d="M77.5 1H1L93.5 318.5H171L263.5 1H186.5L131 215L77.5 1Z M345.5 1H423L330.5 318.5H252.5L222 213.5H290L345.5 1Z"
          fill="rgba(255, 255, 255, 0.8)"
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth="4"
        />

        {/* Figura izquierda */}
        <AnimatedPath
          d="M77.5 1H1L93.5 318.5H171L263.5 1H186.5L131 215L77.5 1Z"
          fill="none"
          stroke="#326EF3"
          strokeWidth="5"
          strokeDasharray={strokeDasharray}
          {...animatedPropsLeft}
          filter="url(#glow)"
        />

        {/* Figura derecha */}
        <AnimatedPath
          d="M345.5 1H423L330.5 318.5H252.5L222 213.5H290L345.5 1Z"
          fill="none"
          stroke="#326EF3"
          strokeWidth="5"
          strokeDasharray={strokeDasharray}
          {...animatedPropsRight}
          filter="url(#glow)"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LogoAnimado;
