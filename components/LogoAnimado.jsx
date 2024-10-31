import React, { useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import Svg, { Path, Defs, Filter, FeGaussianBlur } from "react-native-svg";

const LogoAnimado = () => {
  const [offsetLeft, setOffsetLeft] = useState(1000);
  const [offsetRight, setOffsetRight] = useState(0);
  const animationFrameRef = useRef();
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    if (Platform.OS === "web") {
      let startTime;

      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = (timestamp - startTime) / 10000;

        const newOffsetLeft = 1000 - (progress % 1) * 1000;
        const newOffsetRight = (progress % 1) * 1000;

        setOffsetLeft(newOffsetLeft);
        setOffsetRight(newOffsetRight);

        animationFrameRef.current = requestAnimationFrame(animate);
      };

      animationFrameRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    } else {
      // Animación más suave para mobile
      const animateNative = () => {
        const now = Date.now();
        const elapsed = now - startTimeRef.current;
        const progress = (elapsed % 10000) / 10000; // Ciclo completo cada 10 segundos

        setOffsetLeft(1000 - progress * 1000);
        setOffsetRight(progress * 1000);
      };

      // Usar un intervalo más corto para una animación más suave
      const interval = setInterval(animateNative, 16); // Aproximadamente 60fps

      return () => clearInterval(interval);
    }
  }, []);

  const totalLength = 1000;
  const visibleLength = 300;
  const gapLength = totalLength - visibleLength;
  const strokeDasharray = `${visibleLength}, ${gapLength}`;

  // Renderizado condicional del filtro solo para web
  const Filters =
    Platform.OS === "web" ? (
      <Defs>
        <Filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <FeGaussianBlur in="SourceGraphic" stdDeviation="2" />
        </Filter>
      </Defs>
    ) : null;

  const basePathProps = {
    strokeWidth: Platform.OS === "web" ? 6 : 7,
    strokeDasharray,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  return (
    <View style={styles.container}>
      <Svg width="318" height="240" viewBox="0 0 424 319">
        {Filters}

        {/* Base logo shape */}
        <Path
          d="M77.5 1H1L93.5 318.5H171L263.5 1H186.5L131 215L77.5 1Z M345.5 1H423L330.5 318.5H252.5L222 213.5H290L345.5 1Z"
          fill="white"
          stroke="white"
        />

        {/* Background glow - ajustado para mobile */}
        <Path
          d="M77.5 1H1L93.5 318.5H171L263.5 1H186.5L131 215L77.5 1Z M345.5 1H423L330.5 318.5H252.5L222 213.5H290L345.5 1Z"
          fill="rgba(255, 255, 255, 0.8)"
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth="4"
        />

        {/* Left animated path */}
        <Path
          d="M77.5 1H1L93.5 318.5H171L263.5 1H186.5L131 215L77.5 1Z"
          fill="none"
          stroke="#326EF3"
          strokeDashoffset={offsetLeft}
          {...basePathProps}
          {...(Platform.OS === "web" && { filter: "url(#glow)" })}
        />

        {/* Right animated path */}
        <Path
          d="M345.5 1H423L330.5 318.5H252.5L222 213.5H290L345.5 1Z"
          fill="none"
          stroke="#326EF3"
          strokeDashoffset={offsetRight}
          {...basePathProps}
          {...(Platform.OS === "web" && { filter: "url(#glow)" })}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Platform.OS === "web" ? 60 : 0,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LogoAnimado;
