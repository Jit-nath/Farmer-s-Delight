import { View, Text, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'

const LikeButton = (styles: { wishListButton: object }) => {

    const [liked, setLiked] = useState(false);

    const handlePress = () => {
        setLiked(!liked);
    };

    return (
        <TouchableOpacity
            style={[
                styles.wishListButton,
                { backgroundColor: liked ? 'red' : 'white' }
            ]}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={20}
                color={liked ? 'white' : 'red'}
            />
        </TouchableOpacity>
    );
};

export default LikeButton;

// Usage:
// <LikeButton styles={styles} />

