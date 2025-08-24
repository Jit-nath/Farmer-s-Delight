import React, { useEffect, useState } from "react";
import { 
    View, 
    Text, 
    Image, 
    StyleSheet, 
    ActivityIndicator, 
    ScrollView,
    Dimensions,
    TouchableOpacity,
    SafeAreaView
} from "react-native";
import { useLocalSearchParams } from "expo-router";

const { width, height } = Dimensions.get('window');

// Define the product type based on your database structure
interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    rating: number;
    reviews: number;
    sold: number;
    image?: string; // Optional if you add images later
}

export default function ProductPage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [imageLoading, setImageLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/products/${id}`)
                .then((res) => res.json())
                .then((data: Product) => setProduct(data))
                .catch((error) => console.error('Error fetching product:', error));
        }
    }, [id]);

    // Helper function to format numbers (e.g., 2100 -> "2.1k")
    const formatNumber = (num: number): string => {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toString();
    };

    if (!product) {
        return (
            <View style={styles.loadingContainer}>
                <View style={styles.loadingCard}>
                    <View style={styles.loadingSpinner}>
                        <ActivityIndicator size="large" color="#10b981" />
                    </View>
                    <Text style={styles.loadingText}>Preparing your product...</Text>
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView 
                style={styles.container}
                showsVerticalScrollIndicator={false}
                bounces={true}
            >
                {/* Hero Image Section */}
                <View style={styles.heroSection}>
                    <View style={styles.imageWrapper}>
                        <Image 
                            source={{ 
                                uri: product.image || 'https://via.placeholder.com/400x400?text=' + encodeURIComponent(product.name)
                            }} 
                            style={styles.productImage}
                            onLoadStart={() => setImageLoading(true)}
                            onLoadEnd={() => setImageLoading(false)}
                            resizeMode="cover"
                        />
                        {imageLoading && (
                            <View style={styles.imageLoadingOverlay}>
                                <ActivityIndicator size="large" color="#10b981" />
                            </View>
                        )}
                        
                        {/* Floating Elements */}
                        <View style={styles.floatingBadge}>
                            <Text style={styles.badgeText}>★ Premium</Text>
                        </View>
                    </View>
                    
                    {/* Gradient Overlay */}
                    <View style={styles.gradientOverlay} />
                </View>

                {/* Product Information Card */}
                <View style={styles.productCard}>
                    {/* Product Header */}
                    <View style={styles.productHeader}>
                        <View style={styles.titleContainer}>
                            <Text style={styles.productTitle}>{product.name}</Text>
                            <View style={styles.titleAccent} />
                        </View>
                        
                        {/* Price Display */}
                        <View style={styles.priceSection}>
                            <View style={styles.priceMainContainer}>
                                <Text style={styles.currencySymbol}>₹</Text>
                                <Text style={styles.mainPrice}>
                                    {Math.floor(product.price).toLocaleString()}
                                </Text>
                                <Text style={styles.priceCents}>
                                    .{((product.price % 1) * 100).toFixed(0).padStart(2, '0')}
                                </Text>
                            </View>
                            <View style={styles.priceBackground} />
                        </View>
                    </View>

                    {/* Product Stats - Now using real data from database */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{product.rating.toFixed(1)}</Text>
                            <Text style={styles.statLabel}>★ Rating</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{formatNumber(product.reviews)}</Text>
                            <Text style={styles.statLabel}>Reviews</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{product.sold.toLocaleString()}+</Text>
                            <Text style={styles.statLabel}>Sold</Text>
                        </View>
                    </View>

                    {/* Description Section - Now using real description from database */}
                    <View style={styles.descriptionContainer}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionIcon}>
                                <Text style={styles.iconText}>📝</Text>
                            </View>
                            <Text style={styles.sectionTitle}>Product Details</Text>
                        </View>
                        
                        <View style={styles.descriptionContent}>
                            <Text style={styles.description}>
                                {product.description}
                            </Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionSection}>
                        <TouchableOpacity style={styles.addToCartButton}>
                            <View style={styles.buttonGradient}>
                                <Text style={styles.addToCartText}>🛒 Add to Cart</Text>
                            </View>
                        </TouchableOpacity>
                        
                        <View style={styles.secondaryActions}>
                            <TouchableOpacity style={styles.wishlistButton}>
                                <Text style={styles.wishlistText}>♡</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.shareButton}>
                                <Text style={styles.shareText}>↗</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fafbfc',
    },
    
    // Loading Styles
    loadingContainer: {
        flex: 1,
        backgroundColor: '#fafbfc',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingCard: {
        backgroundColor: '#ffffff',
        padding: 50,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: '#2E7D32',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    loadingSpinner: {
        marginBottom: 20,
    },
    loadingText: {
        fontSize: 18,
        color: '#6b7280',
        fontWeight: '600',
    },
    
    // Main Container
    container: {
        flex: 1,
    },
    
    // Hero Section
    heroSection: {
        height: height * 0.5,
        position: 'relative',
        backgroundColor: '#f8fafc',
    },
    imageWrapper: {
        flex: 1,
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 30,
        overflow: 'hidden',
        backgroundColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.2,
        shadowRadius: 25,
        elevation: 15,
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    imageLoadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(248, 250, 252, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    floatingBadge: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: '#2E7D32',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        shadowColor: '#2E7D32',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    badgeText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '700',
    },
    gradientOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 20,
        right: 20,
        height: 80,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    
    // Product Card
    productCard: {
        flex: 1,
        backgroundColor: '#ffffff',
        marginHorizontal: 20,
        marginTop: -40,
        borderRadius: 30,
        padding: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        marginBottom: 30,
        zIndex: 1,
    },
    
    // Product Header
    productHeader: {
        marginBottom: 30,
    },
    titleContainer: {
        marginBottom: 20,
    },
    productTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#111827',
        lineHeight: 40,
        marginBottom: 8,
    },
    titleAccent: {
        width: 60,
        height: 4,
        backgroundColor: '#2E7D32',
        borderRadius: 2,
    },
    
    // Price Section
    priceSection: {
        position: 'relative',
        alignSelf: 'flex-start',
    },
    priceMainContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        paddingVertical: 12,
        zIndex: 1,
    },
    currencySymbol: {
        fontSize: 20,
        fontWeight: '600',
        color: '#2E7D32',
        marginTop: 4,
        marginRight: 2,
    },
    mainPrice: {
        fontSize: 36,
        fontWeight: '900',
        color: '#2E7D32',
    },
    priceCents: {
        fontSize: 20,
        fontWeight: '600',
        color: '#2E7D32',
        marginTop: 4,
    },
    priceBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#f0fdf4',
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#bbf7d0',
    },
    
    // Stats Container
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        borderRadius: 20,
        padding: 20,
        marginBottom: 30,
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#6b7280',
        fontWeight: '500',
    },
    statDivider: {
        width: 1,
        backgroundColor: '#e5e7eb',
        marginHorizontal: 10,
    },
    
    // Description Section
    descriptionContainer: {
        marginBottom: 30,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    iconText: {
        fontSize: 18,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    descriptionContent: {
        backgroundColor: '#f8fafc',
        padding: 20,
        borderRadius: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#2E7D32',
    },
    description: {
        fontSize: 16,
        color: '#4b5563',
        lineHeight: 26,
    },
    
    // Action Section
    actionSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    addToCartButton: {
        flex: 1,
        borderRadius: 20,
        overflow: 'hidden',
    },
    buttonGradient: {
        backgroundColor: '#2E7D32',
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: '#2E7D32',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    addToCartText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '700',
    },
    secondaryActions: {
        flexDirection: 'row',
        gap: 8,
    },
    wishlistButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#f8fafc',
        borderWidth: 2,
        borderColor: '#e5e7eb',
        justifyContent: 'center',
        alignItems: 'center',
    },
    wishlistText: {
        fontSize: 20,
        color: '#6b7280',
    },
    shareButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#f8fafc',
        borderWidth: 2,
        borderColor: '#e5e7eb',
        justifyContent: 'center',
        alignItems: 'center',
    },
    shareText: {
        fontSize: 20,
        color: '#6b7280',
    },
});

