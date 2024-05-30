/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useContext, useEffect, useRef, useState } from 'react';
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
	TouchableWithoutFeedback,
	KeyboardAvoidingView,
	Platform,
	ActivityIndicator,
	Animated,
	Button,
} from 'react-native';

import {
	Colors,
	DebugInstructions,
	Header,
	LearnMoreLinks,
	ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import { NavigationProp, RouteProp } from '@react-navigation/native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import RSA from 'react-native-fast-rsa'
import { limitToLast, orderByChild, orderByKey, query } from 'firebase/database';
import { ref as firebaseStorageRef, getDownloadURL, getStorage} from 'firebase/storage';
import { Menu, MenuOption, MenuOptions, MenuProvider, MenuTrigger } from 'react-native-popup-menu';
import ColorPicker from 'react-native-wheel-color-picker';
import { useColorContext, ColorProvider } from './ColorContext';
import UIHeader from '../../components/UIHeader';
import SwitchToggle from 'react-native-switch-toggle';

type User = {
	user: {
		url: string,
		name: string,
		content: string,
		numberOfUnreadMessages: number,
		userId: string,
	}
}

// Định nghĩa kiểu của route.params
type SectionRouteParams = {
	user: User;
};

type SectionProps = {
	navigation: NavigationProp<any, any>
	route: RouteProp<SectionRouteParams, 'user'>;
};

function Setting(): React.JSX.Element {
	let currentColor = '#000000'

	const onColorChange = (color: string) => {
		currentColor = color
	}
	const { colors, setPrimaryColor, setSecondaryColor } = useColorContext();
	const { darkMode, setDarkModeBackground, setDarkModeText } = useColorContext();

	const [isDarkMode, setIsDarkMode] = useState(darkMode.background == '#21211f')


	const changePrimaryColor = (color: string) => {
		setPrimaryColor(color)
		// AsyncStorage.setItem('primaryColor', color)
	}

	const changeSecondaryColor = (color: string) => {
		setSecondaryColor(color)
	}

	const changeDarkMode = () => {
		setDarkModeBackground(isDarkMode ? '#e6e1d1' : '#21211f')
		setDarkModeText(isDarkMode ? '#000000' : '#ffffff')
		setIsDarkMode(!isDarkMode)
	}

	return (
		<View>
			<UIHeader title='Cài đặt'></UIHeader>
			<ScrollView style={{...styles.container, backgroundColor: darkMode.background}}>
				<View style={{marginHorizontal: 10}}>
					<View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}> 
						<Text style={{...styles.text, color: darkMode.text}}>Chế độ tối:</Text>
						<SwitchToggle
								containerStyle={{
									width: 50,
									height: 24,
									borderRadius: 25,
								}}
								circleStyle={{
									width: 24,
									height: 24,
									borderRadius: 20,
								}}
								switchOn={isDarkMode}
								onPress={() => changeDarkMode()}
								circleColorOff='#fff'
								circleColorOn='#fff'
								backgroundColorOn='#05f551'
								backgroundColorOff='#c4c4c4'
								/>
					</View>
					<Text style={{...styles.text, color: darkMode.text}}>Màu chính (Primary Color):</Text>
					<View style={{width: '80%', alignSelf: 'center'}}>
						<ColorPicker
							color={currentColor}
							onColorChange={onColorChange}
						/>
					</View>
					<View style={styles.buttonWrapper}>
						<TouchableOpacity onPress={() => changePrimaryColor('#3498db')} style={{...styles.changeColor, backgroundColor: colors.secondary}}>
							<Text style={{color: 'white', fontSize: 16, fontWeight: 'bold'}}>Mặc định</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={() => changePrimaryColor(currentColor)} style={{...styles.changeColor, backgroundColor: colors.secondary}}>
							<Text style={{color: 'white', fontSize: 16, fontWeight: 'bold'}}>Đổi</Text>
						</TouchableOpacity>
					</View>
					<Text style={{...styles.text, color: darkMode.text}}>Màu phụ (Secondary Color):</Text>
					<View style={{width: '80%', alignSelf: 'center'}}>
						<ColorPicker
							color={currentColor}
							onColorChange={onColorChange}
						/>
					</View>
					<View style={styles.buttonWrapper}>
					<TouchableOpacity onPress={() => changeSecondaryColor('#2ecc71')} style={{...styles.changeColor, backgroundColor: colors.secondary}}>
						<Text style={{color: 'white', fontSize: 16, fontWeight: 'bold'}}>Mặc định</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => changeSecondaryColor(currentColor)} style={{...styles.changeColor, backgroundColor: colors.secondary}}>
						<Text style={{color: 'white', fontSize: 16, fontWeight: 'bold'}}>Đổi</Text>
					</TouchableOpacity>
					</View>
				</View>
				<View style={{height: 60}}></View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
	},

	primaryText: {
		fontSize: 24,
		lineHeight: 45,
		color: 'white',
		fontWeight: 'bold',
		alignSelf: 'center'
	},

	text: {
		fontSize: 16,
		lineHeight: 45,
		color: 'black',
		fontWeight: 'bold',
	},

	changeColor: {
		marginTop: 20,
		width: 80,
		height: 40,
		// backgroundColor: 'red',
		justifyContent: 'center',
		alignItems: 'center',
		alignSelf: 'center',
		borderRadius: 10,
		marginBottom: 20,
	},

	buttonWrapper: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		marginTop: 20,
	},
});

export default Setting;
