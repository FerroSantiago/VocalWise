import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TypingAnimation = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const index = useRef(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!text) return;

    setDisplayedText("");
    setIsTyping(true);
    index.current = 0;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const typeText = () => {
      if (index.current < text.length) {
        setDisplayedText(text.slice(0, index.current + 1));
        index.current += 1;
        timeoutRef.current = setTimeout(typeText, 30);
      } else {
        setIsTyping(false);
        onComplete?.();
      }
    };

    typeText();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, onComplete]);

  return (
    <View style={{ width: "100%" }}>
      <Text style={styles.animatedText}>
        {displayedText}
        {isTyping && (
          <Text style={{ color: "#999" }} selectable={false}>
            ▎
          </Text>
        )}
      </Text>
    </View>
  );
};

class AnimationStateManager {
  static instance = null;
  animatedMessages = new Set();
  isInitialized = false;

  static getInstance() {
    if (!this.instance) {
      this.instance = new AnimationStateManager();
    }
    return this.instance;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      const saved = await AsyncStorage.getItem("animatedMessages");
      if (saved) {
        const parsed = JSON.parse(saved);
        this.animatedMessages = new Set(parsed);
      }
    } catch (error) {
      console.error("Error initializing animation state:", error);
    } finally {
      this.isInitialized = true;
    }
  }

  async markAsAnimated(messageId) {
    if (!this.animatedMessages.has(messageId)) {
      this.animatedMessages.add(messageId);
      try {
        await AsyncStorage.setItem(
          "animatedMessages",
          JSON.stringify([...this.animatedMessages])
        );
      } catch (error) {
        console.error("Error saving animation state:", error);
      }
    }
  }

  hasBeenAnimated(messageId) {
    return this.animatedMessages.has(messageId);
  }
}

const animationManager = AnimationStateManager.getInstance();

const BubbleMessage = React.memo(
  ({ author, message, fileName, id, createdAt }) => {
    const [shouldAnimate, setShouldAnimate] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const isUserMessage = author === "user";
    const isSystemMessage = author === "vocalwise";
    const hasInitialized = useRef(false);

    useEffect(() => {
      const initializeAnimation = async () => {
        if (hasInitialized.current) return;

        await animationManager.initialize();
        hasInitialized.current = true;

        const shouldAnimateMessage =
          isSystemMessage && !animationManager.hasBeenAnimated(id);

        if (shouldAnimateMessage) {
          console.log("Iniciando animación para mensaje:", id);
          setShouldAnimate(true);
          fadeAnim.setValue(0);

          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
        } else {
          fadeAnim.setValue(1);
        }
      };

      initializeAnimation();
    }, [id, isSystemMessage]);

    const handleAnimationComplete = useCallback(async () => {
      console.log("Animación completada para mensaje:", id);
      if (isSystemMessage) {
        await animationManager.markAsAnimated(id);
      }
      setShouldAnimate(false);
    }, [id, isSystemMessage]);

    const bubbleStyle = [
      styles.bubble,
      isUserMessage ? styles.userBubble : styles.systemBubble,
    ];

    return (
      <Animated.View
        style={[
          bubbleStyle,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        {fileName && (
          <View style={styles.fileContainer}>
            <Feather name="file" size={15} color="#999" />
            <Text style={styles.fileName}>{fileName}</Text>
          </View>
        )}

        {shouldAnimate && isSystemMessage ? (
          <TypingAnimation
            text={message}
            onComplete={handleAnimationComplete}
          />
        ) : (
          <Text
            style={[
              styles.messageText,
              isUserMessage && styles.userMessageText,
            ]}
          >
            {message}
          </Text>
        )}
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  bubble: {
    margin: 8,
    maxWidth: "80%",
    borderRadius: 15,
    padding: 10,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(200,200,200,.1)",
  },
  systemBubble: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(102,102,102,.4)",
  },
  fileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  fileName: {
    color: "#DDD",
    marginLeft: 5,
  },
  messageText: {
    color: "#EEE",
  },
  userMessageText: {
    color: "#FFF",
  },
  animatedText: {
    color: "#EEE",
  },
});

BubbleMessage.displayName = "BubbleMessage";

export default BubbleMessage;
