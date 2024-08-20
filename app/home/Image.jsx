import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  View,
  Text,
} from "react-native";
import { BlurView } from "expo-blur";
import { hp, wp } from "../../helpers/common";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { theme } from "../../constants/theme";
import { Entypo, Octicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import Toast from "react-native-toast-message";

function ImageScreen() {
  const [status, setStatus] = useState("loading");
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] =
    useState(false);

  const router = useRouter();
  const item = useLocalSearchParams();
  let uri = item?.webformatURL;
  const fileName = item?.previewURL?.split("/").pop();
  const imageURL = uri;
  const filePath = `${FileSystem.documentDirectory}${fileName}`;

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setHasMediaLibraryPermission(status === "granted");
    })();
  }, []);

  const getSize = () => {
    const aspectRatio = item?.imageWidth / item?.imageHeight;
    const maxWidth = Platform.OS == "web" ? wp(50) : wp(92);
    let calculatedHeight = maxWidth / aspectRatio;
    let calculatedWidth = maxWidth;
    if (aspectRatio < 1) {
      //portrait image
      calculatedWidth = calculatedHeight * aspectRatio;
    }
    return {
      width: calculatedWidth,
      height: calculatedHeight,
    };
  };

  const onLoad = () => {
    setStatus("");
  };

  const handleDownloadImage = async () => {
    if (Platform.OS == "web") {
      const anchor = document.createElement("a");
      anchor.href = imageURL;
      anchor.target = "_blank";
      anchor.download = fileName || "download";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    } else {
      if (!hasMediaLibraryPermission) {
        showToast("Permission to access media library is required!");
        return;
      }
      setStatus("downloading");
      let uri = await downloadFile();
      if (uri) {
        await saveImageToGallery(uri);
        showToast("Image Downloaded");
      }
    }
  };

  const downloadFile = async () => {
    try {
      const { uri } = await FileSystem.downloadAsync(imageURL, filePath);
      setStatus("");
      return uri;
    } catch (error) {
      setStatus("");
      console.log("Got Error", error.message);
      Alert.alert("Image", error.message);
      return null;
    }
  };

  const saveImageToGallery = async (uri) => {
    try {
      await MediaLibrary.createAssetAsync(uri);
    } catch (error) {
      console.log("Error saving image to gallery", error.message);
      Alert.alert("Error", "Failed to save image to gallery");
    }
  };

  const handleShareImage = async () => {
    if (Platform.OS == "web") {
      showToast("Link Copied");
    } else {
      setStatus("sharing");
      let uri = await downloadFile();
      if (uri) {
        // share image
        await Sharing.shareAsync(uri);
      }
    }
  };

  const showToast = (message) => {
    Toast.show({
      type: "success",
      text1: message,
      position: "bottom",
    });
  };

  const toastConfig = {
    success: ({ text1, props, ...rest }) => {
      return (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{text1}</Text>
        </View>
      );
    },
  };

  return (
    <View style={styles.container}>
      <BlurView
        style={styles.blurContainer}
        tint="dark"
        intensity={60}
        pointerEvents="box-none"
      >
        <View style={styles.overlay} />
        <View style={styles.innerContainer}>
          <View style={getSize()}>
            <View style={styles.loading}>
              {status == "loading" && (
                <ActivityIndicator size="large" color="white" />
              )}
            </View>
            <Image
              source={uri}
              transition={100}
              onLoad={onLoad}
              style={[styles.image, getSize()]}
            />
          </View>
          <View style={styles.buttons}>
            <Animated.View entering={FadeInDown.springify()}>
              <Pressable style={styles.button} onPress={() => router.back()}>
                <Octicons size={24} color="white" name="x" />
              </Pressable>
            </Animated.View>
            <Animated.View entering={FadeInDown.springify().delay(100)}>
              {status == "downloading" ? (
                <View style={styles.button}>
                  <ActivityIndicator size="large" color="white" />
                </View>
              ) : (
                <Pressable style={styles.button} onPress={handleDownloadImage}>
                  <Octicons size={24} color="white" name="download" />
                </Pressable>
              )}
            </Animated.View>
            <Animated.View entering={FadeInDown.springify().delay(200)}>
              {status == "sharing" ? (
                <View style={styles.button}>
                  <ActivityIndicator size="large" color="white" />
                </View>
              ) : (
                <Pressable style={styles.button} onPress={handleShareImage}>
                  <Entypo size={24} color="white" name="share" />
                </Pressable>
              )}
            </Animated.View>
          </View>
          <Toast config={toastConfig} visibilityTime={2500} />
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  innerContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  loading: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  buttons: {
    marginTop: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 50,
  },
  button: {
    height: hp(6),
    width: hp(6),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: theme.radius.lg,
    borderCurve: "continuous",
  },
  toast: {
    padding: 15,
    paddingHorizontal: 30,
    borderRadius: theme.radius.xl,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  toastText: {
    fontSize: hp(1.8),
    color: theme.colors.white,
    fontWeight: theme.fontWeights.semibold,
  },
});

export default ImageScreen;
