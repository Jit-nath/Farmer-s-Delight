import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function ProductPage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [product, setProduct] = useState<any>(null);

    useEffect(() => {
        if (id) {
            fetch(`http://10.50.61.220:5000/products/${id}`)
                .then((res) => res.json())
                .then((data) => setProduct(data));
        }
    }, [id]);

    if (!product) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4CAF50" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Image source={{ uri: product.image }} style={styles.image} />
            <Text style={styles.title}>{product.name}</Text>
            <Text style={styles.price}>${Number(product.price).toFixed(2)}</Text>
            <Text style={styles.description}>{product.description}</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    image: { width: "100%", height: 220, borderRadius: 12, marginBottom: 20 },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
    price: { fontSize: 20, color: "#4CAF50", marginBottom: 20 },
    description: { fontSize: 16, color: "#555", lineHeight: 22 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
