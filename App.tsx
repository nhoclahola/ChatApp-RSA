import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
} from 'react-native';

import {
	Colors,
	DebugInstructions,
	Header,
	LearnMoreLinks,
	ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import Chat from './screens/Chat/Chat'
import Messenger from './screens/Messenger/Messenger'
import Login from './screens/Login/Login';
import Register from './screens/Register/Register';
import UITab from './tab_navigation/UITab';
import { ColorProvider } from './screens/Setting/ColorContext';


function App(): React.JSX.Element {
	const Stack = createNativeStackNavigator()
	return (
		<ColorProvider>
		<NavigationContainer>
			<Stack.Navigator initialRouteName='Login' screenOptions={{headerShown: false}}>
				<Stack.Screen name='Login' component={Login}/>
				<Stack.Screen name='Register' component={Register}/>
				<Stack.Screen name='UITab' component={UITab}/>
				{/* <Stack.Screen name='Chat' component={Chat}/> */}

				<Stack.Screen name='Messenger' component={Messenger}/>
			</Stack.Navigator>
		</NavigationContainer>
		</ColorProvider>
	)
}

const styles = StyleSheet.create({
	sectionContainer: {
		marginTop: 32,
		paddingHorizontal: 24,
	},
	sectionTitle: {
		fontSize: 24,
		fontWeight: '600',
	},
	sectionDescription: {
		marginTop: 8,
		fontSize: 18,
		fontWeight: '400',
	},
	highlight: {
		fontWeight: '700',
	},
});

export default App;
