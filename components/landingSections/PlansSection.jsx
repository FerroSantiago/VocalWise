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

const PlansSection = () => {
  const { width } = useWindowDimensions();
  const scrollViewRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);

  // Calculamos el ancho para mobile
  const containerWidth = width;
  // Para web, usamos un ancho fijo máximo con un porcentaje como fallback
  const webCardWidth = Math.min(400, width * 0.35);

  const plans = [
    {
      id: 1,
      title: "Plan Base",
      price: "$0.00/mes",
      features: [
        "Chat con IA a través de mensajes",
        "Guardado de chats",
        "Análisis de exposición oral",
      ],
    },
    {
      id: 2,
      title: "Plan Premium",
      price: "$9.99/mes",
      features: [
        "Caracterísiticas del plan base +",
        "Análisis de documentos",
        "Trazado de progreso del usuario",
        "Sesiones de coaching personalizadas",
      ],
    },
  ];

  const handleScroll = (event) => {
    if (Platform.OS !== "web") {
      const contentOffset = event.nativeEvent.contentOffset.x;
      const index = Math.round(contentOffset / containerWidth);
      setActiveSlide(index);
    }
  };

  const PlanCard = ({ title, price, features }) => (
    <View
      style={[
        styles.planCard,
        Platform.OS === "web"
          ? { width: webCardWidth }
          : { width: containerWidth - 40 },
      ]}
    >
      <Text style={styles.planTitle}>{title}</Text>
      <Text style={styles.planPrice}>{price}</Text>
      {features.map((feature, index) => (
        <Text key={index} style={styles.planFeature}>
          • {feature}
        </Text>
      ))}
      <Pressable style={styles.planButton}>
        <Text style={styles.planButtonText}>Seleccionar Plan</Text>
      </Pressable>
    </View>
  );

  const Pagination = () => (
    <View style={styles.paginationContainer}>
      {plans.map((_, index) => (
        <Pressable
          key={index}
          onPress={() => {
            if (Platform.OS !== "web") {
              scrollViewRef.current?.scrollTo({
                x: index * containerWidth,
                animated: true,
              });
              setActiveSlide(index);
            }
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

  if (Platform.OS === "web") {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Nuestros Planes</Text>
        <View style={styles.webPlansContainer}>
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              title={plan.title}
              price={plan.price}
              features={plan.features}
            />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Nuestros Planes</Text>
      <Text style={styles.scrollHint}>
        Desliza horizontalmente para ver más
      </Text>
      <View style={styles.plansContainer}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          onMomentumScrollEnd={handleScroll}
          snapToInterval={containerWidth}
          snapToAlignment="center"
          decelerationRate="fast"
          contentContainerStyle={[
            styles.mobilePlansContainer,
            { width: containerWidth * plans.length },
          ]}
        >
          {plans.map((plan) => (
            <View
              key={plan.id}
              style={[styles.slideWrapper, { width: containerWidth }]}
            >
              <PlanCard
                title={plan.title}
                price={plan.price}
                features={plan.features}
              />
            </View>
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
    width: "100%",
  },
  plansContainer: {
    alignItems: "center",
    overflow: "hidden",
  },
  webPlansContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 40,
    paddingHorizontal: 20,
  },
  slideWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 24,
    color: "white",
    textAlign: "center",
    marginBottom: 20,
  },
  scrollHint: {
    color: "white",
    textAlign: "center",
    marginBottom: 10,
    fontSize: 14,
  },
  mobilePlansContainer: {
    alignItems: "center",
  },
  planCard: {
    backgroundColor: "rgba(68, 68, 68, 0.6)",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  planTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  planPrice: {
    fontSize: 20,
    color: "rgb(51, 102, 204)",
    marginBottom: 20,
  },
  planFeature: {
    color: "white",
    marginBottom: 5,
  },
  planButton: {
    backgroundColor: "rgb(51, 102, 204)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  planButtonText: {
    color: "white",
    fontWeight: "bold",
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

export default PlansSection;
