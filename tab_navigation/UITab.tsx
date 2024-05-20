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
    TextInput,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
} from 'react-native';

import {
    Colors,
    DebugInstructions,
    Header,
    LearnMoreLinks,
    ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Chat from '../screens/Chat/Chat';
import { NavigationContainer } from '@react-navigation/native';
import Profile from '../screens/Profile/Profile';


const Tab = createBottomTabNavigator()


function UITab(): React.JSX.Element {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => {
                let iconName = ''

                if (route.name === 'Chat') {
                    iconName = 'chat.png';
                } else if (route.name === 'Profile') {
                    iconName = 'profile.png';
                }

                return {
                    tabBarIcon: ({ focused, color, size }) => (
                        <Image
                            source={iconName == 'chat.png' ? require(`./img/chat.png`) : require(`./img/user.png`)}
                            style={{ width: 20, height: 20 }}
                            tintColor={focused ? 'red' : 'gray'}
                        />
                    ),
                    // tabBarShowLabel: false,
                    headerShown: false
                };
            }}
        >
            <Tab.Screen name='Chat' component={Chat}></Tab.Screen>
            <Tab.Screen name='Profile' component={Profile}></Tab.Screen>
        </Tab.Navigator>
    )
}

export default UITab;