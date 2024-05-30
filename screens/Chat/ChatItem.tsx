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
import { useColorContext } from '../Setting/ColorContext';

type SectionProps = {
    user: {
        url: string,
        name: string,
        message: string,
        numberOfUnreadMessages: number,
    }
    onPress: () => void,
}

function ChatItem({user, onPress}: SectionProps): React.JSX.Element {
    // Dark mode
    const { darkMode } = useColorContext();
	return (
        <View>
            <TouchableOpacity style={styles.container} onPress={onPress}>
                <View>
                    <Image style={styles.img} source={{uri: user.url}}></Image>
                    {user.numberOfUnreadMessages > 0 && 
                    <Text style={{...styles.unread, color: darkMode.text}}>{user.numberOfUnreadMessages}</Text>
                    }
                </View>
                <View style={{borderBottomWidth: 1, width: '60%', borderBlockColor: darkMode.text}}>
                    <Text style={{...styles.name, color: darkMode.text}}>{user.name}</Text>
                    <Text style={{...styles.lastMessage, color: darkMode.text}}>{user.message}</Text>
                </View>
                {/* <View style={styles.time}>
                    <Text style={styles.textTime}>5 minutes ago</Text>
                </View> */}
            </TouchableOpacity>
        </View>
	);
}

const styles = StyleSheet.create({
    container: {
        height: 80,
        paddingTop: 20,
        paddingStart: 10,
        flexDirection: 'row',
    },

    img: {
        width: 50,
        height: 50,
        resizeMode: 'cover',
        borderRadius: 25,
        flexDirection: 'row',
        marginRight: 15,
        marginStart: 10,
    },

    unread: {
        color: 'white',
        backgroundColor: 'red',
        position: 'absolute',
        right: 10,
        fontSize: 12,
        borderRadius: 10,
        paddingHorizontal: 2,
    },

    name: {
        color: 'black',
        fontSize: 14,
        fontWeight: 'bold'
    },

    lastMessage: {
        color: 'black',
        fontSize: 13,
    },

    time: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    
    textTime: {
        color: 'black',
        fontSize: 13,
        marginEnd: 10,
    },
});

export default ChatItem;
