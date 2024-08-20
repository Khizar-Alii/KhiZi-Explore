import { getColumnCount, wp } from "@/helpers/common";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MasonryFlashList } from "@shopify/flash-list";
import ImageCard from "./ImageCard";

const ImagesGrid = ({ images,router }) => {    
    const columns = getColumnCount();
  return (
    <View style={styles.container}>
      <MasonryFlashList
        contentContainerStyle = {styles.listContainer}
        data={images}
        renderItem={({ item, index }) => <ImageCard router={router}  item = {item} index = {index} columns = {columns} />}
        estimatedItemSize={200}
        numColumns={columns}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    minHeight: 3,
    width: wp(100),
  },
  listContainer : { 
    paddingHorizontal : wp(4),
  },
});

export default ImagesGrid;
