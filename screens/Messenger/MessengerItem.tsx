/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
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
    Dimensions,
} from 'react-native';

import {
	Colors,
	DebugInstructions,
	Header,
	LearnMoreLinks,
	ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import UIHeader from '../../components/UIHeader';
import { getDownloadURL, getStorage } from 'firebase/storage';
import { ref as firebaseStorageRef} from 'firebase/storage';
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu';
import Clipboard from '@react-native-clipboard/clipboard';
import { firebaseDatabase, firebaseDatabaseRef, firebaseDatabaseSet, get, onValue } from '../../firebase/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { query } from 'firebase/database';
import { useColorContext } from '../Setting/ColorContext';


type SectionProps = {
    item: {
        url: string,
        messageId: string,
        senderId: string,
        receiverId: string,
        isImage: boolean,
        content: string,
        timestamp: string,
        isSender: boolean,
        isDeleted: boolean,
    }
}

function MessengerItem({item}: SectionProps): React.JSX.Element {
    // Màu
    const { colors } = useColorContext();
    // Dark mode
    const { darkMode } = useColorContext();

    const [isDeleted, setIsDeleted] = useState(item.isDeleted)
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

    // Define the max width and height for the image
    const maxImageWidth = screenWidth * 0.6;
    const maxImageHeight = screenHeight * 0.4;

    const [imageUrl, setImageUrl] = useState()

    const getImage = async (path: string) => {
        const storage = getStorage()
        const reference = firebaseStorageRef(storage, path)
        let url 
        try {
            url = await getDownloadURL(reference)
        }
        catch {
            url = null
        }
        setImageUrl(url)
    }

    useEffect(() => {
        getImage(item.content)
    }, [])

    if (!item.isSender)
    {
        useEffect(() => {
            let queryRef = query(firebaseDatabaseRef(firebaseDatabase, `chats/${item.senderId}-${item.receiverId}/${item.timestamp}/isDeleted`))
            onValue(queryRef, async (snapshot) => setIsDeleted(snapshot.val()))
        }, [])
    }
    const copyToClipboard = (text: string) => {
        Clipboard.setString(text)
    }
    
    const deleteMessage = async () => {
        const accountSync = await (await get(firebaseDatabaseRef(firebaseDatabase, `users/${item.senderId}/isSync`))).val()
        if (accountSync) 
            firebaseDatabaseSet(firebaseDatabaseRef(firebaseDatabase, `syncChats/${item.senderId}-${item.receiverId}/${item.timestamp}/isDeleted`), true)

        firebaseDatabaseSet(firebaseDatabaseRef(firebaseDatabase, `chats/${item.senderId}-${item.receiverId}/${item.timestamp}/isDeleted`), true)
            .catch(() => Alert.alert('Không xoá được'));
        AsyncStorage.setItem(`chats/${item.senderId}-${item.receiverId}/${item.timestamp}/isDeleted`, true.toString())
        
        try {
            const messageId = `chats/${item.senderId}-${item.receiverId}/${item.timestamp}`; // thay thế bằng key thực tế của bạn
            const jsonString = await AsyncStorage.getItem(messageId);
        
            if (jsonString !== null) {
                // Chuyển đổi chuỗi JSON thành đối tượng JavaScript
                const messageObject = JSON.parse(jsonString);
                // Thêm thuộc tính isDeleted vào đối tượng
                messageObject.isDeleted = true;
                // Chuyển đổi đối tượng trở lại chuỗi JSON
                const updatedJsonString = JSON.stringify(messageObject);
                // Lưu lại đối tượng đã cập nhật vào AsyncStorage
                await AsyncStorage.setItem(messageId, updatedJsonString);
            }
        } 
        catch (error) {
            console.error('Lỗi khi xoá message:', error);
        }
        // Cập nhật cho giao diện ngay
        setIsDeleted(true);
    }

	return (
        <TouchableOpacity style={{...styles.container, flexDirection: item.isSender ? 'row-reverse' : 'row'}}>
            {/* {item.showUrl == true ?  */}
            {item.isSender ? null : <Image style={styles.img} source={{uri: item.url}}></Image>}
            {/* <Image style={styles.img} source={{uri: item.url}}></Image>  */}
            {/* : <View style={styles.img}></View> */}
            {/* } */}
            {isDeleted ?
            <View style={{...styles.msgWrapper, justifyContent: item.isSender ? 'flex-end' : 'flex-start', marginHorizontal: item.isSender ? 10 : 0}}>
                <View>
                    <Text style={{...styles.deletedMsg, color: darkMode.text}}>Tin nhắn đã bị thu hồi</Text>
                </View>
            </View>
            :
            <Menu>
                <MenuTrigger>
                    <View style={{...styles.msgWrapper, justifyContent: item.isSender ? 'flex-end' : 'flex-start', marginHorizontal: item.isSender ? 10 : 0}}>
                        <View>
                            { item.isImage ? <Image style={{...styles.imgSent, maxWidth: maxImageWidth, maxHeight: maxImageHeight}} source={{uri: imageUrl}}></Image> : <Text style={{...styles.msg, color: darkMode.text, backgroundColor: colors.secondary}}>{item.content}</Text> }
                        </View>
                    </View>
                </MenuTrigger>
                <MenuOptions>
						<MenuOption style={{margin: 2}} onSelect={() => copyToClipboard(item.content)}>
                            <Text style={{color: 'blue'}}>Sao chép</Text>
                        </MenuOption>
                        {item.isSender ?
						<MenuOption style={{margin: 2}} onSelect={deleteMessage}>
						    <Text style={{color: 'red'}}>Thu hồi tin nhắn</Text>
						</MenuOption>
                        :
                        null
                        }
                </MenuOptions>
            </Menu>
            }
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
        // backgroundColor: 'rgba(238, 130, 238, 0.5)',
        paddingVertical: 10,
        paddingHorizontal: 7,
        borderRadius: 10,
    },

    deletedMsg: {
        color: 'black',
        fontSize: 13,
        backgroundColor: 'rgba(163, 157, 157, 0.3)',
        paddingVertical: 10,
        paddingHorizontal: 7,
        borderRadius: 10,
    },

    imgSent: {
        width: '100%',
        height: undefined,
        aspectRatio: 1, // This will keep the aspect ratio of the image
        resizeMode: 'contain', // Ensure the image scales correctly
    },
});

export default MessengerItem;
