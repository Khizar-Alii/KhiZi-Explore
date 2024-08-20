import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { theme } from "../../constants/theme";
import { hp, wp } from "../../helpers/common";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesome6 } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import Categories from "../../components/Categories";
import { apiCall } from "../../api/index";
import ImagesGrid from "@/components/ImagesGrid";
import { debounce } from "lodash";
import FiltersModel from "../../components/FiltersModel";
import { useRouter } from "expo-router";
var page = 1;
function index() {
  const [images, setImages] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const searchInputRef = useRef(null);
  const ModelRef = useRef(null);
  const [filters, setFilters] = useState(null);
  const scrollRef = useRef(null);
  const [isEndReached, setIsEndReached] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchImages();
  }, []);
  const fetchImages = async (params = { page: 1 }, append = true) => {
    let res = await apiCall(params);
    if (res?.success && res?.data?.hits) {
      if (append) {
        setImages([...images, ...res.data.hits]);
      } else {
        setImages([...res.data.hits]);
      }
    }
  };

  const handleChangeCategory = (cat) => {
    setActiveCategory(cat);
    clearSearch();
    setImages([]);
    page = 1;
    let params = {
      page,
      ...filters,
    };
    if (cat) params.category = cat;
    fetchImages(params, false);
  };
  const handleSearch = (text) => {
    setSearchText(text);
    if (text.length > 2) {
      // search for this text
      page = 1;
      setImages([]);
      setActiveCategory(null);
      let params = {
        page,
        ...filters,
        q: text,
      };
      fetchImages(params, false);
    }
    if (text == "") {
      // show all images
      page = 1;
      searchInputRef?.current?.clear();
      setImages([]);
      setActiveCategory(null);
      fetchImages({ page, ...filters }, false);
    }
  };
  const handleTextDebounce = useCallback(debounce(handleSearch, 400), []);

  const clearSearch = () => {
    setSearchText("");
    searchInputRef?.current?.clear();
  };
  const openFilterModel = () => {
    ModelRef?.current?.present();
  };
  const closeFilterModel = () => {
    ModelRef?.current?.close();
  };
  const applyFilter = () => {
    if (filters) {
      page = 1;
      setImages([]);
      let params = {
        page,
        ...filters,
      };
      if (activeCategory) params.category = activeCategory;
      if (searchText) params.q = searchText;
      fetchImages(params, false);
    }
    closeFilterModel();
  };

  const resetFilter = () => {
    if (filters) {
      setFilters(null);
      page = 1;
      setImages([]);
      let params = {
        page,
      };
      if (activeCategory) params.category = activeCategory;
      if (searchText) params.q = searchText;
      fetchImages(params, false);
    }
    closeFilterModel();
  };

  const clearThisFilter = (key) => {
    let filterz = { ...filters };
    delete filterz[key];
    setFilters(filterz);
    setImages([]);
    page = 1;
    let params = {
      page,
      ...filterz,
    };
    if (activeCategory) params.category = activeCategory;
    if (searchText) params.q = searchText;
    fetchImages(params, false);
  };
  const handleScroll = (event) => {
    const contentHeight = event.nativeEvent.contentSize.height;
    const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;
    const scrollOffSet = event.nativeEvent.contentOffset.y;
    const bottomPosition = contentHeight - scrollViewHeight;
    if (scrollOffSet >= bottomPosition - 1) {
      ++page;
      let params = {
        page,
        ...filters,
      };
      if (activeCategory) params.activeCategory = activeCategory;
      if (searchText) params.q = searchText;
      fetchImages(params);
    } else if (isEndReached) {
      setIsEndReached(false);
    }
  };
  const scrollToTop = () => {
    scrollRef?.current?.scrollTo({
      y: 0,
      animated: true,
    });
  };

  const { top } = useSafeAreaInsets();
  const paddingTop = top > 0 ? top + 10 : 30;
  return (
    <View style={[styles.container, { paddingTop }]}>
      {/* header */}
      <View style={styles.header}>
        <Pressable onPress={scrollToTop}>
          <Text style={styles.title}>Pixels</Text>
        </Pressable>
        <Pressable onPress={openFilterModel}>
          <FontAwesome6
            name="bars-staggered"
            size={22}
            color={theme.colors.neutral(0.7)}
          />
        </Pressable>
      </View>
      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={5}
        ref={scrollRef}
        contentContainerStyle={{ gap: 15 }}
      >
        {/* SearchBar */}
        <View style={styles.searchBar}>
          <View style={styles.searchIcon}>
            <Feather
              name="search"
              size={24}
              color={theme.colors.neutral(0.4)}
            />
          </View>
          <TextInput
            placeholder="Search Images Here..."
            style={styles.searchInput}
            onChangeText={handleTextDebounce}
            ref={searchInputRef}
          />
          {searchText && (
            <Pressable
              style={styles.closeIcon}
              onPress={() => handleSearch("")}
            >
              <Ionicons
                name="close"
                size={24}
                color={theme.colors.neutral(0.6)}
              />
            </Pressable>
          )}
        </View>
        {/* Categories */}
        <View style={styles.categories}>
          <Categories
            activeCategory={activeCategory}
            handleChangeCategory={handleChangeCategory}
          />
        </View>
        {/* Filters */}
        {filters && (
          <View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filters}
            >
              {Object.keys(filters).map((key, index) => {
                return (
                  <View style={styles.filterItem} key={key}>
                    {key == "colors" ? (
                      <View
                        style={{
                          height: 20,
                          width: 30,
                          borderRadius: 7,
                          backgroundColor: filters[key],
                        }}
                      />
                    ) : (
                      <Text style={styles.filterItemText}>{filters[key]}</Text>
                    )}
                    <Pressable
                      onPress={() => clearThisFilter(key)}
                      style={styles.filterCloseIcon}
                    >
                      <Ionicons
                        name="close"
                        size={14}
                        color={theme.colors.neutral(0.9)}
                      />
                    </Pressable>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}
        {/* Images Masonary Grid */}
        <View>{images.length > 0 && <ImagesGrid images={images} router={router} />}</View>

        {/* Loading */}

        <View
          style={{ marginBottom: 70, marginTop: images.length > 0 ? 10 : 70 }}
        >
          <ActivityIndicator size="large" />
        </View>
      </ScrollView>
      {/* Filters Model here */}
      <FiltersModel
        ModelRef={ModelRef}
        onApply={applyFilter}
        onReset={resetFilter}
        onClose={closeFilterModel}
        filters={filters}
        setFilters={setFilters}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 15,
  },
  header: {
    marginHorizontal: wp(4),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: hp(4),
    color: theme.colors.neutral(0.9),
    fontWeight: theme.fontWeights.bold,
  },
  searchBar: {
    marginHorizontal: wp(4),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.grayBG,
    backgroundColor: theme.colors.white,
    padding: 6,
    paddingLeft: 10,
    borderRadius: theme.radius.lg,
  },
  searchInput: {
    flex: 1,
    borderRadius: theme.radius.sm,
    fontSize: hp(1.8),
    paddingVertical: 10,
  },
  searchIcon: {
    padding: 8,
  },
  closeIcon: {
    backgroundColor: theme.colors.neutral(0.1),
    borderColor: theme.colors.grayBG,
    borderWidth: 1,
    padding: 8,
    borderRadius: theme.radius.md,
  },
  categories: {},
  filters: {
    paddingHorizontal: wp(4),
    gap: 10,
  },
  filterItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: theme.colors.grayBG,
    borderRadius: theme.radius.xs,
    gap: 8,
    paddingHorizontal: 10,
  },
  filterItemText: {
    fontSize: hp(1.9),
  },
  filterCloseIcon: {
    backgroundColor: theme.colors.neutral(0.2),
    padding: 4,
    borderRadius: 7,
  },
});
export default index;
