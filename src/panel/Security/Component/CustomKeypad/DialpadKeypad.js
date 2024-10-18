import React from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const DialpadKeypad = ({
  dialPadContent,
  pinLength,
  code,
  setCode,
  dialPadSize,
  dialPadTextSize,
}) => {
  const navigation = useNavigation();
  return (
    <View style={{height: 430}}>
      <FlatList
        data={dialPadContent}
        numColumns={3}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity
              disabled={item === ""}
              onPress={() => {
                if (item === "X") {
                  setCode((prev) => prev.slice(0, -1));
                } else if (item !== "Y") {
                  if (code.length < pinLength) {
                    setCode((prev) => [...prev, item]);
                  }
                } 
                else {
                  navigation.navigate('Scanner');
                }
              }}
            >
              <View
                style={[
                  {
                    backgroundColor: item === "Y" ? "#f6f6f6" : "#7d0431",
                    elevation:3,
                    width: dialPadSize,
                    height: dialPadSize,
                  },
                  styles.dialPadContainer,
                ]}
              >
                {item === "X" ? (
                  <Feather name="delete" size={24} color="#fff" />
                ) : item === "Y" ? (
                  <MaterialIcons name="qr-code-scanner" size={32} color="#7d0431" />
                ) : (
                  <Text style={[{ fontSize: dialPadTextSize }, styles.dialPadText]}>{item}</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

export default DialpadKeypad;

const styles = StyleSheet.create({
  dialPadContainer: {
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
    borderRadius: 50,
    borderColor: "transparent",
  },
  dialPadText: {
    color: "#fff",
  },
});