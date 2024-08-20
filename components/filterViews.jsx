import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { theme } from ".././constants/theme";
import { capitalize, hp } from ".././helpers/common";

export const SectionView = ({ title, content }) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View>{content}</View>
    </View>
  );
};


export const ColorFilter = ({ data, filters, setFilters, filterName }) => {
    const onSelect = (item) => {
      setFilters({ ...filters, [filterName]: item });
    };
    return (
      <View style={styles.flexRowWrap}>
        {data &&
          data.map((item) => {
            let isActive = filters && filters[filterName] == item;
            let borderColor = isActive ? theme.colors.neutral(0.5) : "white";
  
            return (
              <Pressable
                onPress={() => onSelect(item)}
                key={item}
              >
                <View style = {[styles.colorWrapper,{borderColor}]}>
                    <View style = {[styles.color,{backgroundColor : item}]} />
                </View>
              </Pressable>
            );
          })}
      </View>
    );
  };



export const CommonFilterRow = ({ data, filters, setFilters, filterName }) => {
  const onSelect = (item) => {
    setFilters({ ...filters, [filterName]: item });
  };
  return (
    <View style={styles.flexRowWrap}>
      {data &&
        data.map((item) => {
          let isActive = filters && filters[filterName] == item;
          let backgroundColor = isActive ? theme.colors.neutral(0.7) : "white";
          let color = isActive ? "white" : theme.colors.neutral(0.7);

          return (
            <Pressable
              onPress={() => onSelect(item)}
              key={item}
              style={[styles.outlinedButton, { backgroundColor }]}
            >
              <Text style={[styles.outlinedButtonText, { color }]}>
                {capitalize(item)}
              </Text>
            </Pressable>
          );
        })}
    </View>
  );
};



const styles = StyleSheet.create({
  sectionContainer: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: hp(2.4),
    color: theme.colors.neutral(0.8),
    fontWeight: theme.fontWeights.semibold,
  },
  flexRowWrap: {
    gap: 10,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  outlinedButton: {
    padding: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.colors.grayBG,
    borderCurve: "continuous",
    borderRadius: theme.radius.xs,
  },
  outlinedButtonText: {},
  colorWrapper : {
    // padding : 3,
    borderRadius : theme.radius.xs-3,
    borderWidth : 2,
    borderCurve : "continuous",
  },
  color : {
    height : 30,
    width : 40,
    borderRadius : theme.radius.xs,
    borderWidth : 1,
    borderColor : theme.colors.grayBG,
    borderCurve : "continuous",
  }
});
