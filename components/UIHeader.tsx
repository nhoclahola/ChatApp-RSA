/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import type { PropsWithChildren } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    useColorScheme,
    View,
    FlatList,
    ImageBackground,
    TouchableOpacity,
    Image,
} from 'react-native';

import {
    Colors,
    DebugInstructions,
    Header,
    LearnMoreLinks,
    ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import { useColorContext } from '../screens/Setting/ColorContext';


type SectionProps = {
    title: string,
    leftIcon: any,
    rightIcon: any,
    onPressLeft: () => void,
    onPressRight: () => void,
}

function UIHeader({ title, leftIcon, rightIcon, onPressLeft, onPressRight }: SectionProps): React.JSX.Element {
    const { colors } = useColorContext();
    return (
        <View style={{...styles.container, backgroundColor: colors.primary}}>
            {/* Nếu không có icon thì sẽ không hiện gì */}
            {leftIcon != undefined ? 
            <TouchableOpacity onPress={onPressLeft} style={styles.imgWrapper}>
                <Image tintColor={'white'} style={styles.img} source={leftIcon}></Image>
            </TouchableOpacity> 
            : <View style={{width: 25}}/>}
            <Text style={styles.text}>{title}</Text>
            {rightIcon != undefined ? 
            <TouchableOpacity onPress={onPressRight} style={styles.imgWrapper}>
                <Image tintColor={'white'} style={styles.img} source={rightIcon}></Image>
            </TouchableOpacity> 
            : <View style={{width: 25}}/>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 55,
        // backgroundColor: 'red',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 3,
    },

    text: {
        fontSize: 18,
        alignSelf: 'center',
        lineHeight: 45,
        color: 'white',
        fontWeight: 'bold',
    },

    imgWrapper: {
        padding: 10,
        // backgroundColor: 'white'
    },

    img: {
        width: 20,
        height: 20,
    }
});

export default UIHeader;
