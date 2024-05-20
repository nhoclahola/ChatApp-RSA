/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState } from 'react';
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
	Alert,
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
import UIHeader from '../../components/UIHeader';

type SectionProps = {
    item: {
        url: string,
        messageId: string,
        senderId: string,
        receiverId: string,
        content: string,
        timestamp: string,
        isSender: boolean,
    }
    onPress: () => void,
}

function MessengerItem({item, onPress}: SectionProps): React.JSX.Element {
	return (
        <TouchableOpacity style={{...styles.container, flexDirection: item.isSender ? 'row-reverse' : 'row'}} onPress={onPress}>
            {/* {item.showUrl == true ?  */}
            {item.isSender ? null : <Image style={styles.img} source={{uri: item.url}}></Image>}
            {/* <Image style={styles.img} source={{uri: item.url}}></Image>  */}
            {/* : <View style={styles.img}></View> */}
            {/* } */}
            <View style={{...styles.msgWrapper, justifyContent: item.isSender ? 'flex-end' : 'flex-start', marginHorizontal: item.isSender ? 10 : 0}}>
                <View>
                    <Text style={styles.msg}>{item.content}</Text>
                </View>
            </View>
            <View style={{width: 30}}></View>
            {/* Để chặn cuối */}
        </TouchableOpacity>
	);
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 10,
        // paddingStart: 10,
        flexDirection: 'row',       //Thay thế trong component
        alignItems: 'center',   
        // marginTop: 10,
    },

    img: {
        width: 40,
        height: 40,
        resizeMode: 'cover',
        borderRadius: 20,
        flexDirection: 'row',
        marginRight: 10,
        marginStart: 10,
    },

    /***********/
    msgWrapper: {
        flex: 1,
        flexDirection: 'row',        // Để align thành chiều dọc ~ component chap
        justifyContent: 'flex-start',   // Mặc định flex-start, thay thế dựa trên isSender
    },

    msg: {
        color: 'black',
        fontSize: 13,
        backgroundColor: 'rgba(238, 130, 238, 0.5)',
        paddingVertical: 10,
        paddingHorizontal: 7,
        borderRadius: 10,
    },

});

export default MessengerItem;
