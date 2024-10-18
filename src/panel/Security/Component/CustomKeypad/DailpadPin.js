// DialpadPin.js

import React from "react";
import { StyleSheet, View, Text } from "react-native";

const DialpadPin = ({ pinLength, pinSize, code, dialPadContent }) => {
  return (
    <View style={styles.dialPadPinContainer}>
      {Array(pinLength)
        .fill()
        .map((_, index) => {
          const digit = code[index] !== undefined ? code[index].toString() : "";
          return (
            <View
              key={index}
              style={{
                width: pinSize,
                height: pinSize,
                overflow: "hidden",
                margin: 5,
                justifyContent: "center",
                alignItems: "center",
                borderColor: "#7d0431",
                borderBottomWidth: 1.2,
              }}
            >
              <Text style={styles.pinDigit}>{digit}</Text>
            </View>
          );
        })}
    </View>
  );
};

export default DialpadPin;

const styles = StyleSheet.create({
  dialPadPinContainer: {
    flexDirection: "row",
    backgroundColor: "#f6f6f6",
    alignItems: "flex-end",
    borderRadius: 10,
    paddingHorizontal: 8,
    marginTop: 40,
    paddingVertical: 8,
    elevation:6
  },
  pinDigit: {
    fontSize: 28,
    color: "#7d0431",
    marginBottom: 4
  },
});