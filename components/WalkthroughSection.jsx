import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Platform,
  ScrollView,
  Pressable,
} from "react-native";
import { Video } from "expo-av";

const WalkthroughSection = () => {
  const { width } = useWindowDimensions();
  const scrollViewRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);

  // Calculamos el ancho exacto que necesitamos para el contenedor del slide
  const containerWidth = width;
  const slideWidth =
    Platform.OS === "web" ? Math.min(width * 0.8, 1200) : width;

  const slides = [
    {
      id: 1,
      title: "Versión Web",
      description: "Descubre cómo utilizar VocalWise en tu navegador",
      videoSource: {
        uri: "URL_DE_TU_VIDEO_WEB",
      },
    },
    {
      id: 2,
      title: "Versión Mobile",
      description: "VocalWise en la palma de tu mano",
      videoSource: {
        uri: "URL_DE_TU_VIDEO_MOBILE",
      },
    },
  ];

  const handleScroll = (event) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / containerWidth);
    setActiveSlide(index);
  };

  const SlideItem = ({ item }) => (
    <View style={[styles.slideWrapper, { width: containerWidth }]}>
      <View style={[styles.slide, { width: slideWidth }]}>
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideDescription}>{item.description}</Text>
        <Video
          source={item.videoSource}
          rate={1.0}
          volume={1.0}
          isMuted={false}
          resizeMode="contain"
          shouldPlay={false}
          useNativeControls
          style={styles.video}
        />
      </View>
    </View>
  );

  const Pagination = () => (
    <View style={styles.paginationContainer}>
      {slides.map((_, index) => (
        <Pressable
          key={index}
          onPress={() => {
            scrollViewRef.current?.scrollTo({
              x: index * containerWidth,
              animated: true,
            });
            setActiveSlide(index);
          }}
        >
          <View
            style={[
              styles.paginationDot,
              {
                backgroundColor: index === activeSlide ? "#3366CC" : "#FFFFFF",
              },
            ]}
          />
        </Pressable>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>¿Cómo funciona VocalWise?</Text>
      <View style={[styles.carouselContainer, { width: containerWidth }]}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
          snapToInterval={containerWidth}
          snapToAlignment="center"
          style={{ width: containerWidth }}
          contentContainerStyle={{ width: containerWidth * slides.length }}
        >
          {slides.map((item) => (
            <SlideItem key={item.id} item={item} />
          ))}
        </ScrollView>
      </View>
      <Pagination />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 50,
    alignItems: "center",
    width: "100%",
  },
  carouselContainer: {
    alignItems: "center",
    overflow: "hidden",
  },
  slideWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  slide: {
    backgroundColor: "rgba(68, 68, 68, 0.6)",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 32,
    color: "white",
    textAlign: "center",
    marginBottom: 30,
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  slideDescription: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    marginBottom: 20,
  },
  video: {
    width: "100%",
    height: 300,
    borderRadius: 10,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
});

export default WalkthroughSection;
