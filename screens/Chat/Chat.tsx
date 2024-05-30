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
} from 'react-native';

import {
	Colors,
	DebugInstructions,
	Header,
	LearnMoreLinks,
	ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import UIHeader from '../../components/UIHeader';
import ChatItem from './ChatItem';
import { NavigationProp, RouteProp } from '@react-navigation/native';

import { 
    auth, 
    firebaseDatabase, 
    onAuthStateChanged, 
    firebaseDatabaseRef,
    firebaseDatabaseSet,
    createUserWithEmailAndPassword,
	child,
	get,
	onValue,
} from './../../firebase/firebase'
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ref as firebaseStorageRef, getDownloadURL, getStorage} from 'firebase/storage';
import { useColorContext } from '../Setting/ColorContext';


type SectionProps = {
    navigation: NavigationProp<any, any>
	route: RouteProp<any, any>;
  };

function Chat({navigation} : SectionProps): React.JSX.Element {
	// Dark mode
    const { darkMode } = useColorContext();

    const leftIcon = require('./img/back.png')
    const rightIcon = require('./img/search.png')
	const trash = require('./img/trash.png')

	// Kiểu dữ liệu cho user
	type User = {
		url: string;
		name: string;
		message: string,
		email: string;
		userId: string;
		numberOfUnreadMessages: number;
	};

	const [users, setUsers] = useState<User[]>([
		// {
		// 	url: 'https://randomuser.me/portraits/men/70.jpg',
		// 	name: 'Johnny',
		// 	message: 'Hello',	//Message gần nhất
		// 	numberOfUnreadMessages: 2
		// },
	])

	useEffect(() => {
		const dbRef = firebaseDatabaseRef(firebaseDatabase)
		// Lấy collection users, dùng onValue để khi db có thay đổi thì sẽ thay đổi components
		onValue(firebaseDatabaseRef(firebaseDatabase, 'users'), async (snapshot) => {
			if (snapshot.exists()) {
				let stringUser = await AsyncStorage.getItem('user')		//lấy user từ lúc lưu ở Login (kiểu string)
				let myUserId = JSON.parse(stringUser)['uid']
				let snapShotObject = snapshot.val()
				// console.log(snapShotObject)
				let users = (Object.keys(snapShotObject).filter((eachKey) => eachKey != myUserId)	// render người dùng không phải bản thân
					.map(async (eachKey: any) => {
					let eachObject = snapShotObject[eachKey]
					const storage = getStorage()
					const storageReference = firebaseStorageRef(storage,`users/${eachKey}/avatar.jpg`)
					let avatarUri
					try {
						avatarUri = await getDownloadURL(storageReference)
					}
					catch {
						avatarUri = null
					}
					
					return {
						url: avatarUri ? avatarUri : 'https://www.shutterstock.com/image-vector/blank-avatar-photo-place-holder-600nw-1114445501.jpg',		//Mặc định
						name: eachObject['email'],
						message: '',
						email: eachObject['email'],
						userId: eachKey,
						numberOfUnreadMessages: 0,
					}
				}))
				setUsers(await Promise.all(users))
			}
			else {
				console.log('No data availble')
			}
		})
	}, [])		//array dependency (rỗng để chỉ chạy 1 lần)
	// Nghĩa là không có gì thay đổi thì sẽ ko chạy lại

	return (
        <View style={{flex: 1, backgroundColor: darkMode.background}}>
            <UIHeader title='Chat'
			onPressLeft={() => {
				Alert.alert('Left')
			}}
			onPressRight={() => {
				let uid = auth.currentUser?.uid
				// Test phân quyền
				get(firebaseDatabaseRef(firebaseDatabase, `usersPrivateKey/0ayi220wJ0WOHfPftAwaxAAJh3P2`)).then((snapshot) => {
					if (snapshot.exists()) {
					  const userData = snapshot.val();
					  console.log(userData)
					} else {
					  console.log('No data available');
					}
				  }).catch((error) => {
					console.error('Error fetching data:', error);
				  });
			}}

			></UIHeader>
			{/* <Image style={{width: 50, height: 50}} source={{uri: 'https://randomuser.me/portraits/men/60.jpg'}}></Image> */}
            <View style={styles.unreadMessages}>
				{/* <Text style={{color: 'black', fontSize: 14}}>6 unread messages</Text>
				<TouchableOpacity style={{padding: 15}} onPress={() => Alert.alert('You pressed delete')}>
                	<ImageBackground style={{width: 16, height: 16,}} source={trash}></ImageBackground>
            	</TouchableOpacity> */}
				<View style={{ height: 20,}}>
				</View>
			</View>
			{/* <FlatList style={styles.flatList} data={users}
			renderItem={({item}) => <ChatItem onPress={() => {
				navigation.navigate('Messenger', {user: item})		// Cái user: item là để truyền prop cho route của Messenger
			}}
			user = {item} key = {item.name}/>}	
			keyExtractor={item => item.name}
			/> */}
			<ScrollView style={{...styles.flatList, backgroundColor: darkMode.background}}>
				{users.map((user) => {
					return <ChatItem onPress={() => {
						navigation.navigate('Messenger', {user: user})		// Cái user: item là để truyền prop cho route của Messenger
					}}
					user = {user} key = {user.name}/>
				})}
				<View style={{height: 70,}}></View>	
			</ScrollView>
        </View>
	);
}

const styles = StyleSheet.create({
	unreadMessages: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
        marginStart: 10,

	},

	flatList: {
		// backgroundColor: 'red',
		bottom: 20,
	}
});

export default Chat;
