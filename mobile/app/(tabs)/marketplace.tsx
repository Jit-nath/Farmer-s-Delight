import React, { useEffect, useState, useCallback } from "react";
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
  Alert,
} from "react-native";

interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  isNew?: boolean
  // Optional property for new products
}

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

const Marketplace = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchProducts = async () => {
    try {
      setError(null);
      const response = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/products`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products. Please try again.");
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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts();
  }, []);

  const handleAddToCart = useCallback((product: Product) => {
    // Add your cart logic here
    Alert.alert("Added to Cart", `${product.name} has been added to your cart!`);
  }, []);

  const handleProductPress = useCallback((productId: number) => {
    // Check if the route exists before navigating
    try {
      router.push(`/products/${productId}` as never);
    } catch (error) {
      console.error("Navigation error:", error);
      Alert.alert("Error", "Unable to open product details");
    }
  }, [router]);

  const ProductCard = React.memo(({ item }: { item: Product }) => {
    return (
      <TouchableOpacity
        onPress={() => handleProductPress(item.id)}
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
            source={{ uri: item.image_url }}
            style={{
              width: "100%",
              height: 140,
              backgroundColor: "#f5f5f5"
            }}
            resizeMode="cover"
            onError={() => console.log("Failed to load image:", item.image_url)}
          />
          {item.isNew && (
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
          )}
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

          <View style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <Text
              style={{
                fontSize: 17,
                color: "#2E7D32",
                fontWeight: "800",
              }}
            >
              ₹{item.price.toFixed(2)}
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
            onPress={() => handleAddToCart(item)}
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
  });

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

  const ErrorComponent = () => (
    <View style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20
    }}>
      <Text style={{
        fontSize: 18,
        color: "#d32f2f",
        textAlign: "center",
        marginBottom: 16
      }}>
        {error}
      </Text>
      <TouchableOpacity
        onPress={fetchProducts}
        style={{
          backgroundColor: "#4CAF50",
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>
          Retry
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f8faf8" }}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8faf8" />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={{
            marginTop: 16,
            fontSize: 16,
            color: "#666",
            fontWeight: "500",
          }}>
            Loading fresh products...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f8faf8" }}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8faf8" />
        <ErrorComponent />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8faf8" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8faf8" />

      <FlatList
        data={filteredProducts}
        keyExtractor={(item: Product) => item.id.toString()}
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
          <View style={{ alignItems: "center", marginTop: 60 }}>
            <Text style={{ fontSize: 18, color: "#666", fontWeight: "500" }}>
              No products found
            </Text>
            <Text style={{ fontSize: 14, color: "#999", marginTop: 8 }}>
              Try adjusting your search
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default Marketplace;