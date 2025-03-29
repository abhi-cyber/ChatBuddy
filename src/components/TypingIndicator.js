import React, {useEffect, useRef} from "react";
import {View, Text, StyleSheet, Animated, Easing} from "react-native";

const TypingIndicator = () => {
  // Create animated values for each dot
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Animation sequence for the dots
    const animateDots = () => {
      // Reset all dots
      dot1Opacity.setValue(0.3);
      dot2Opacity.setValue(0.3);
      dot3Opacity.setValue(0.3);

      // Sequence of animations
      Animated.sequence([
        // First dot
        Animated.timing(dot1Opacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        // Second dot
        Animated.timing(dot2Opacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        // Third dot
        Animated.timing(dot3Opacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Loop the animation
        animateDots();
      });
    };

    animateDots();

    return () => {
      // Cleanup
      dot1Opacity.stopAnimation();
      dot2Opacity.stopAnimation();
      dot3Opacity.stopAnimation();
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatarInner}>
          <Text style={styles.avatarText}>AI</Text>
        </View>
      </View>
      <View style={styles.bubbleContainer}>
        <Animated.View style={[styles.dot, {opacity: dot1Opacity}]} />
        <Animated.View style={[styles.dot, {opacity: dot2Opacity}]} />
        <Animated.View style={[styles.dot, {opacity: dot3Opacity}]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "flex-end",
  },
  avatarContainer: {
    marginRight: 8,
  },
  avatarInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E4DAFF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6C5CE7",
  },
  bubbleContainer: {
    backgroundColor: "#F0F0F0",
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6C5CE7",
    marginHorizontal: 2,
  },
});

export default TypingIndicator;
