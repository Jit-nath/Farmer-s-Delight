import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from "react-native";

interface Products {
  id: number;
  name: string;
  price: number;
  image: string;
}

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2; 

const Marketplace = () => {
  const [products, setProducts] = useState<Products[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Products[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://10.50.61.220:5000/products");
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const ProductCard = ({ item }: { item: Products }) => {
    return (
      <TouchableOpacity
        onPress={() => router.push(`/products/${item.id}`)}
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 16,
          marginBottom: 16,
          width: CARD_WIDTH,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
          borderWidth: 0.5,
          borderColor: "#f0f0f0",
        }}
        activeOpacity={0.95}
      >
        <View style={{ position: "relative" }}>
          <Image
            source={{ uri: item.image }}
            style={{
              width: "100%",
              height: 140,
              backgroundColor: "#f5f5f5"
            }}
            resizeMode="cover"
          />
          <View
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: "rgba(0,0,0,0.6)",
              borderRadius: 12,
              paddingHorizontal: 8,
              paddingVertical: 4,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 10, fontWeight: "600" }}>
              NEW
            </Text>
          </View>
        </View>

        <View style={{ padding: 14 }}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "700",
              marginBottom: 6,
              color: "#1a1a1a",
              lineHeight: 20,
            }}
            numberOfLines={2}
          >
            {item.name}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text
              style={{
                fontSize: 17,
                color: "#2E7D32",
                fontWeight: "800",
              }}
            >
              ${item.price.toFixed(2)}
            </Text>

            <View
              style={{
                backgroundColor: "#E8F5E8",
                borderRadius: 6,
                paddingHorizontal: 6,
                paddingVertical: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  color: "#2E7D32",
                  fontWeight: "600",
                }}
              >
                ORGANIC
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: "#4CAF50",
              borderRadius: 8,
              paddingVertical: 8,
              marginTop: 10,
              alignItems: "center",
            }}
            activeOpacity={0.8}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 12,
                fontWeight: "600",
                letterSpacing: 0.5,
              }}
            >
              ADD TO CART
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

const HeaderComponent = React.useMemo(() => (
  <View style={{ marginBottom: 20 }}>
    {/* Header */}
    <View style={{ marginBottom: 24 }}>
      <Text
        style={{
          fontSize: 32,
          fontWeight: "800",
          color: "#1a1a1a",
          marginBottom: 4,
        }}
      >
        Farm Fresh
      </Text>
      <Text
        style={{
          fontSize: 16,
          color: "#666",
          fontWeight: "400",
        }}
      >
        Quality products from local farmers
      </Text>
    </View>

    {/* Search Bar */}
    <View
      style={{
        backgroundColor: "#ffffff",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
        borderWidth: 1,
        borderColor: "#f0f0f0",
      }}
    >
      <TextInput
        placeholder="Search fresh products..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={{
          fontSize: 16,
          color: "#333",
          padding: 0,
        }}
        placeholderTextColor="#999"
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
      />
    </View>

    {/* Stats Row */}
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
        paddingHorizontal: 4,
      }}
    >
      <View style={{ alignItems: "center" }}>
        <Text style={{ fontSize: 24, fontWeight: "700", color: "#4CAF50" }}>
          {filteredProducts.length}
        </Text>
        <Text style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
          Products
        </Text>
      </View>

      <View style={{ alignItems: "center" }}>
        <Text style={{ fontSize: 24, fontWeight: "700", color: "#FF9800" }}>
          24h
        </Text>
        <Text style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
          Delivery
        </Text>
      </View>

      <View style={{ alignItems: "center" }}>
        <Text style={{ fontSize: 24, fontWeight: "700", color: "#2196F3" }}>
          100%
        </Text>
        <Text style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
          Organic
        </Text>
      </View>
    </View>
  </View>
), [filteredProducts.length]);

if (loading) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8faf8" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8faf8" />
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text
          style={{
            marginTop: 16,
            fontSize: 16,
            color: "#666",
            fontWeight: "500",
          }}
        >
          Loading fresh products...
        </Text>
      </View>
    </SafeAreaView>
  );
}

return (
  <SafeAreaView style={{ flex: 1, backgroundColor: "#f8faf8" }}>
    <StatusBar barStyle="dark-content" backgroundColor="#f8faf8" />

    <FlatList
      data={filteredProducts}
      keyExtractor={(item: Products) => item.id.toString()}
      renderItem={({ item }) => <ProductCard item={item} />}
      numColumns={2}
      key="2"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        padding: 20,
        paddingBottom: 40,
      }}
      columnWrapperStyle={{
        justifyContent: "space-between",
      }}
      ListHeaderComponent={HeaderComponent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#4CAF50"]}
          tintColor="#4CAF50"
        />
      }
      ListEmptyComponent={() => (
        <View
          style={{
            alignItems: "center",
            marginTop: 60,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              color: "#666",
              fontWeight: "500",
            }}
          >
            No products found
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#999",
              marginTop: 8,
            }}
          >
            Try adjusting your search
          </Text>
        </View>
      )}
    />
  </SafeAreaView>
);
};

export default Marketplace;