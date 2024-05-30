import React, { useEffect, useRef, useState } from 'react';
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
} from 'react-native';

import {
	Colors,
	DebugInstructions,
	Header,
	LearnMoreLinks,
	ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import UIHeader from '../../components/UIHeader';
import MessengerItem from './MessengerItem';
import { NavigationProp, RouteProp } from '@react-navigation/native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, firebaseDatabase, firebaseDatabaseRef, firebaseDatabaseSet, get, onValue } from '../../firebase/firebase';

import RSA from 'react-native-fast-rsa'
import { limitToLast, orderByChild, orderByKey, query } from 'firebase/database';
import { ref as firebaseStorageRef, getDownloadURL, getStorage, uploadBytes} from 'firebase/storage';
import { launchImageLibrary } from 'react-native-image-picker';
import { MenuProvider } from 'react-native-popup-menu';
import MessengerItemTest from './MessengerItem';
import { useColorContext } from '../Setting/ColorContext';


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

function Messenger({ navigation, route }: SectionProps): React.JSX.Element {
	const { user } = route.params;

	// Màu
    const { colors } = useColorContext();
	// Dark mode
    const { darkMode } = useColorContext();

	const leftIcon = require('./img/back.png')
	const rightIcon = require('./img/menu-dots.png')

	const [typedText, setTypedText] = useState('')

	const [chatHistory, setChatHistory] = useState([
		// {
		// 	url: 'https://randomuser.me/portraits/men/70.jpg',
		// 	isSender: true,
		// 	showUrl: false,
		// 	messenger: 'Hello',
		// 	timestamp: 1711888114000,		//Dạng millisecond
		// },
	])

	const [galleryPhoto, setGalleryPhoto] = useState()

	const [allLoaded, setAllLoaded] = useState(false)		//Kiểm tra xem đã load hết tin nhắn chưa

	const yourAvatarUrl = user.url
	const [myAvatarUrlState, setMyAvatarUrlState] = useState()
	let myAvatarUrl: string | null

	// Khi mới load màn hình, sẽ lấy dữ liệu từ cơ sở dữ liệu Firebase
	useEffect(() => {

		// Lấy collection users, dùng onValue để khi db có thay đổi thì sẽ thay đổi components
		get(firebaseDatabaseRef(firebaseDatabase, 'chats')).then( async (snapshot) => 
		{
			const storage = getStorage()
			const reference = firebaseStorageRef(storage,`/users/${auth.currentUser?.uid}/avatar.jpg`)
			try {
				myAvatarUrl  = await getDownloadURL(reference)
				setMyAvatarUrlState(myAvatarUrl)
			}
			catch {
				myAvatarUrl  = null
			}
			if (snapshot.exists()) 
			{
				// Lấy ra người dùng hiện tại
				await AsyncStorage.getItem('user').then(async (stringUser) => {
					let myUserId = JSON.parse(stringUser)['uid']		//Lấy dữ liệu từ local, từ string -> json
					let myPrivateKey = JSON.parse(stringUser)['privateKey']		//Lấy dữ liệu từ local, từ string -> json
					let snapShotObject = snapshot.val()

					// Tạo cả hai trường hợp key
					const chatKey1 = `${myUserId}-${user.userId}`
					const chatKey2 = `${user.userId}-${myUserId}`

					// // Lấy danh sách messageId từ cả hai trường hợp từ cấu trúc dữ liệu Firebase
					let messageIdList = Object.keys(snapShotObject[chatKey1] || {}).concat(Object.keys(snapShotObject[chatKey2] || {}))
					// let messageIdList = Object.keys(snapShotObject[chatKey2] || {})
					// Tạo mảng mới chứa thông tin của mỗi tin nhắn, từ messageId
					let updatedChatHistoryPromises = messageIdList.map(async (messageId) => {
						let messageData = snapShotObject[chatKey1]?.[messageId]
						// Nếu messageId đó có tồn tại (chatKey1 là phía mình gửi) thì sẽ check xem user có bật đồng bộ tin nhắn không.
						// Nếu có thì lấy tin nhắn từ server về rồi giải mã, không thì lấy trực tiếp trong local storage
						if (messageData)
						{
							// Nếu không bật tính năng đồng bộ thì sẽ lấy tin nhắn từ local storage
							let isSync = await (await get(firebaseDatabaseRef(firebaseDatabase, `users/${auth.currentUser?.uid}/isSync`))).val()
							if (!isSync)
							{
								let messageData = await AsyncStorage.getItem(`chats/${chatKey1}/${messageId}`).then((data) => JSON.parse(data))
								
								if (messageData)		// Nếu message có trong local storage thì lấy ra, không thì thôi
									return {
										url: myAvatarUrl ? myAvatarUrl : 'https://www.shutterstock.com/image-vector/blank-avatar-photo-place-holder-600nw-1114445501.jpg',
										messageId: messageId,
										senderId: messageData.senderId,
										receiverId: messageData.receiverId,
										isImage: messageData.isImage,
										content: messageData.content,
										timestamp: messageData.timestamp,
										isSender: messageData.senderId === myUserId,
										isDeleted: messageData.isDeleted,
									}
								else
									return null
							}
							// Nếu đã bật thì sẽ lấy từ server về và giải mã
							else 
							{
								let messageData = (await get(firebaseDatabaseRef(firebaseDatabase, `syncChats/${chatKey1}/${messageId}`))).val()
								// null nghĩa là tin nhắn có trên chat database nhưng không được đồng bộ từ trước, cái này sẽ không được load
								let decryptMessage = messageData != null ? await RSA.decryptPKCS1v15(messageData.content, myPrivateKey) : null
								if (messageData)		// Nếu message có trong phần sync của server thì lấy ra
									return {
										url: myAvatarUrl ? myAvatarUrl : 'https://www.shutterstock.com/image-vector/blank-avatar-photo-place-holder-600nw-1114445501.jpg',
										messageId: messageId,
										senderId: messageData.senderId,
										receiverId: messageData.receiverId,
										isImage: messageData.isImage,
										content: decryptMessage,
										timestamp: messageData.timestamp,
										isSender: messageData.senderId === myUserId,
										isDeleted: messageData.isDeleted,
									}
								else
									return null

							}
						}
						// Nếu tin nhắn do người khác gửi thì lấy trên database về rồi giải mã
						if (!messageData)
						{
							let messageData = snapShotObject[chatKey2]?.[messageId]
							
							let decryptMessage = await RSA.decryptPKCS1v15(messageData.content, myPrivateKey)
						
							return {
								url: yourAvatarUrl ? yourAvatarUrl : 'https://www.shutterstock.com/image-vector/blank-avatar-photo-place-holder-600nw-1114445501.jpg',
								messageId: messageId,
								senderId: messageData.senderId,
								receiverId: messageData.receiverId,
								isImage: messageData.isImage,
								content: decryptMessage,
								timestamp: messageData.timestamp,
								isSender: messageData.senderId === myUserId,
								isDeleted: messageData.isDeleted,
							};
						}
					});
					let updatedChatHistory = await Promise.all(updatedChatHistoryPromises);
					updatedChatHistory = updatedChatHistory.filter((item) => item !== null)		// Lọc ra những item null
					updatedChatHistory.sort((a, b) => b?.timestamp - a?.timestamp)		// Nếu khác null thì sắp xếp
					// Đặt chatHistory bằng danh sách các tin nhắn đã được xử lý
					setChatHistory(updatedChatHistory)
					setAllLoaded(true)
				})
				// .catch((error) => {
				// 	console.error(`Cannot get user data from AsyncStorage: ${error}`);
				// });
			}
			else 
				console.log('No data availble')
		})
	}, [])

	// Event listener để canh khi nào có tin nhắn mới nhắn đến
	useEffect(() => {
		// Khi đã load hết tin nhắn thì mới chạy cái này
			AsyncStorage.getItem('user').then(async (stringUser) => {
			let myUserId = JSON.parse(stringUser)['uid'];		//Lấy dữ liệu từ local, từ string -> json
			let myPrivateKey = JSON.parse(stringUser)['privateKey'];		//Lấy dữ liệu từ local, từ string -> json

			// Tạo cả hai trường hợp key
			const chatKey1 = `${myUserId}-${user.userId}`
			const chatKey2 = `${user.userId}-${myUserId}`
			// Lấy 1 giá trị cuối
			let queryRef = query(firebaseDatabaseRef(firebaseDatabase, `chats/${chatKey2}`), orderByKey(), limitToLast(1))
			onValue(queryRef, async (snapshot) => {
				if (snapshot.exists()) {
					let messageId =  Object.keys(snapshot.val())[0]
					let messageData = snapshot.val()[messageId]
					let decryptMessage = await RSA.decryptPKCS1v15(messageData.content, myPrivateKey)
					let newMessageObject = {
						url: yourAvatarUrl ? yourAvatarUrl : 'https://www.shutterstock.com/image-vector/blank-avatar-photo-place-holder-600nw-1114445501.jpg',
						messageId: messageId,
						senderId: messageData.senderId,
						receiverId: messageData.receiverId,
						isImage: messageData.isImage,
						content: decryptMessage,
						timestamp: messageData.timestamp,
						isSender: messageData.senderId === myUserId,
						isDeleted: messageData.isDeleted,
					};
					// // Thêm giá trị vào mảng, performace stonk :)
					setChatHistory(prevChatHistory => {
						const messageIndex = prevChatHistory.findIndex(msg => msg.messageId === messageId);
						if (messageIndex !== -1) {
							// Tin nhắn đã tồn tại, cập nhật isDeleted
							const updatedChatHistory = [...prevChatHistory];
							updatedChatHistory[messageIndex] = {
								...updatedChatHistory[messageIndex],
								isDeleted: messageData.isDeleted,
							};
							return updatedChatHistory;
						} 
						else {
							// Tin nhắn mới, thêm vào mảng
							return [newMessageObject, ...prevChatHistory];
						}
					});
				}
			})
		})
	}, [])

	const [visibleMessages, setVisibleMessages] = useState(15); // State để lưu số lượng tin nhắn đã hiển thị

    // Function để xử lý sự kiện cuộn lên
    const handleScrollUp = () => {
        setVisibleMessages(prevVisibleMessages => prevVisibleMessages + 10);
    };

	const sendMessage = async () => {
		if (typedText.trim().length == 0)	//Nếu input ko có j thì thôi
			return
		//get user id
		//"id1:id2": newMesageObject	
		// 1 gửi 2 nhận
		setTypedText('')	//reset input
		let stringUser = await AsyncStorage.getItem('user')		//lấy user từ lúc lưu ở Login (kiểu string)
		if (stringUser != null) {
			let myUserId = JSON.parse(stringUser)['uid']
			let yourUserId = user.userId

			// Lấy public key từ người nhận ở db
			const dbRef = firebaseDatabaseRef(firebaseDatabase, `users/${yourUserId}`)
			get(dbRef).then(snapshot => {
				if (snapshot.exists()) {
					// Lấy dữ liệu người dùng hiện tại từ snapshot
					const publicKey = snapshot.val()['publicKey']
					let now = new Date().getTime()
					
					RSA.encryptPKCS1v15(typedText, publicKey).then(async (encryptText) => {
						// console.log(encryptText)
						let newMessageObject = {
							senderId: myUserId,
							receiverId: yourUserId,
							content: encryptText,
							timestamp: now,
						}
															// Tạo một ID duy nhất cho tin nhắn mới sử dụng timestamp
						let messageId = String(newMessageObject.timestamp);

						// Lưu tin nhắn vào một node mới trong Firebase
						firebaseDatabaseSet(firebaseDatabaseRef(firebaseDatabase, `chats/${myUserId}-${yourUserId}/${messageId}`), newMessageObject)
						.catch(() => Alert.alert('Không gửi được'));
						
						let plainMessageObject = {
							senderId: myUserId,
							receiverId: yourUserId,
							content: typedText,
							timestamp: now,
						}
						// Lưu vào database local

						AsyncStorage.setItem(`chats/${myUserId}-${yourUserId}/${messageId}`, JSON.stringify(plainMessageObject))

						// Nếu người dùng có bật tính năng đồng bộ thì lưu tin nhắn trên server với mã hoá bằng publicKey của bản thân
						let myUser = await (await get(firebaseDatabaseRef(firebaseDatabase, `users/${auth.currentUser?.uid}`))).val()
						let isSync = myUser.isSync
						// console.log(isSync)
						if (isSync) {
							RSA.encryptPKCS1v15(typedText, myUser.publicKey).then(async (encryptText) => {
								let newMessageObject = {
									senderId: myUserId,
									receiverId: yourUserId,
									content: encryptText,
									timestamp: now,
								}
																	// Tạo một ID duy nhất cho tin nhắn mới sử dụng timestamp
								firebaseDatabaseSet(firebaseDatabaseRef(firebaseDatabase, `syncChats/${myUserId}-${yourUserId}/${messageId}`), newMessageObject)
								.catch(() => Alert.alert('Không gửi được'));
							})
						}

						// Để hiển thị tin nhắn mới (ko cần đọc lại, performance stonk)
						let messageToDisplay = {
							url: myAvatarUrlState ? myAvatarUrlState : 'https://www.shutterstock.com/image-vector/blank-avatar-photo-place-holder-600nw-1114445501.jpg',
							messageId: messageId,
							senderId: myUserId,
							receiverId: yourUserId,
							content: typedText,
							timestamp: now,
							isSender: true,			// Vì bản thân gửi nên luôn đúng
						}
						// Sau khi xong sẽ tải lên ngay tin vừa nhắn
						setChatHistory(prevChatHistory => [messageToDisplay, ...prevChatHistory])
					})
					
				} else {
					console.log('User data does not exist');
				}
			})
		}
	}

	const options = {
        // saveToPhotos: true,
        mediaType: 'photo',
    }

	const sendImage = async () => {
        try {
            const result = await launchImageLibrary(options);
            if (!result.didCancel && result.assets && result.assets.length > 0) {
                const selectedImageUri = result.assets[0].uri;
                setGalleryPhoto(selectedImageUri);
				const now = new Date().getTime()
                const storage = getStorage();
                const storageReference = firebaseStorageRef(storage, `/chats/${auth.currentUser?.uid}/${now}.jpg`);
				console.log(storageReference.fullPath)
                // Tải dữ liệu từ URI
                const response = await fetch(selectedImageUri);
                const imageBlob = await response.blob();

                await uploadBytes(storageReference, imageBlob).then(async () => {
					let stringUser = await AsyncStorage.getItem('user')		//lấy user từ lúc lưu ở Login (kiểu string)
					if (stringUser != null) {
						let myUserId = JSON.parse(stringUser)['uid']
						let yourUserId = user.userId

						// Lấy public key từ người nhận ở db
						const dbRef = firebaseDatabaseRef(firebaseDatabase, `users/${yourUserId}`)
						get(dbRef).then(snapshot => {
							if (snapshot.exists()) {
								// Lấy dữ liệu người dùng hiện tại từ snapshot
								const publicKey = snapshot.val()['publicKey']
								let now = new Date().getTime()
								
								RSA.encryptPKCS1v15(storageReference.fullPath, publicKey).then(async (encryptText) => {
									// console.log(encryptText)
									let newMessageObject = {
										senderId: myUserId,
										receiverId: yourUserId,
										isImage: true,
										content: encryptText,
										timestamp: now,
									}
																		// Tạo một ID duy nhất cho tin nhắn mới sử dụng timestamp
									let messageId = String(newMessageObject.timestamp);

									// Lưu tin nhắn vào một node mới trong Firebase
									firebaseDatabaseSet(firebaseDatabaseRef(firebaseDatabase, `chats/${myUserId}-${yourUserId}/${messageId}`), newMessageObject)
									.catch(() => Alert.alert('Không gửi được'));
									
									let plainMessageObject = {
										senderId: myUserId,
										receiverId: yourUserId,
										isImage: true,
										content: storageReference.fullPath,
										timestamp: now,
									}
									// Lưu vào database local

									AsyncStorage.setItem(`chats/${myUserId}-${yourUserId}/${messageId}`, JSON.stringify(plainMessageObject))

									// Nếu người dùng có bật tính năng đồng bộ thì lưu tin nhắn trên server với mã hoá bằng publicKey của bản thân
									let myUser = await (await get(firebaseDatabaseRef(firebaseDatabase, `users/${auth.currentUser?.uid}`))).val()
									let isSync = myUser.isSync
									// console.log(isSync)
									if (isSync) {
										RSA.encryptPKCS1v15(storageReference.fullPath, myUser.publicKey).then(async (encryptText) => {
											let newMessageObject = {
												senderId: myUserId,
												receiverId: yourUserId,
												isImage: true,
												content: encryptText,
												timestamp: now,
											}
																				// Tạo một ID duy nhất cho tin nhắn mới sử dụng timestamp
											firebaseDatabaseSet(firebaseDatabaseRef(firebaseDatabase, `syncChats/${myUserId}-${yourUserId}/${messageId}`), newMessageObject)
											.catch(() => Alert.alert('Không gửi được'));
										})
									}

									// Để hiển thị tin nhắn mới (ko cần đọc lại, performance stonk)
									let messageToDisplay = {
										url: myAvatarUrlState ? myAvatarUrlState : 'https://www.shutterstock.com/image-vector/blank-avatar-photo-place-holder-600nw-1114445501.jpg',
										messageId: messageId,
										senderId: myUserId,
										receiverId: yourUserId,
										isImage: true,
										content: storageReference.fullPath,
										timestamp: now,
										isSender: true,			// Vì bản thân gửi nên luôn đúng
									}
									// Sau khi xong sẽ tải lên ngay tin vừa nhắn
									setChatHistory(prevChatHistory => [messageToDisplay, ...prevChatHistory])
								})
								
							} else {
								console.log('User data does not exist');
							}
						})
					}
				})
            }
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<KeyboardAvoidingView style={{...styles.container, backgroundColor: darkMode.background}} behavior={Platform.OS === 'ios' || 'android' ? 'padding' : 'height'}>
				<MenuProvider>
					<UIHeader title={user.name} leftIcon={leftIcon} rightIcon={rightIcon}
						onPressLeft={() => navigation.goBack()}
						// onPressRight={() => AsyncStorage.clear()
						// 	.then(() => {
						// 	  console.log('Cleared AsyncStorage successfully.');
						// 	})}

					></UIHeader>
					{!allLoaded ? <ActivityIndicator style={{...styles.loadingView, backgroundColor: darkMode.background}} animating={!allLoaded}></ActivityIndicator> : null}

					{/* <FlatList style={styles.flatList} data={chatHistory}
						renderItem={({ item }) => <MessengerItem onPress={() => {
							Alert.alert(`You pressed item name ${item.timestamp}`)
						}}
							item={item} key={`${item.timestamp}`} />}
					/> */}

					<FlatList
						style={styles.flatList}
						data={chatHistory.slice(0, visibleMessages)} // Chỉ hiển thị số lượng tin nhắn đã được xác định
						extraData={chatHistory}
						renderItem={({ item }) => (
							<MessengerItem
								// onPress={() => {
								// 	Alert.alert(`You pressed item name ${item?.timestamp}`);
								// }}
								item={item}
								key={item?.timestamp}		// Khác null thì lấy timestamp làm key
							/>
						)}
						keyExtractor={item => item?.timestamp.toString()}
						onEndReached={handleScrollUp} // Khi người dùng cuộn lên, gọi hàm để tăng số lượng tin nhắn hiển thị
						onEndReachedThreshold={0.1} // Khoảng cách từ cuối danh sách để gọi hàm onEndReached
						inverted // Đảo ngược danh sách để hiển thị tin nhắn mới nhất ở phía trên
					/>

					<View style={{...styles.chatInputWrapper, backgroundColor: darkMode.background == '#21211f' ? '#47453f' : 'white'}}>
						<TouchableOpacity onPress={sendImage}>
							<Image style={styles.img} source={require('./img/image.png')} tintColor={colors.primary}></Image>
						</TouchableOpacity>
						<TextInput
							selectTextOnFocus={true}
							style={{...styles.chatInput, borderColor: colors.primary, color: darkMode.text}} value={typedText} onChangeText={(typedText) => {
							setTypedText(typedText)
						}} placeholder='Enter your message' placeholderTextColor={darkMode.background == '#21211f' ? 'white' : 'gray'}></TextInput>
						<TouchableOpacity onPress={sendMessage}>
							<Image style={styles.img} source={require('./img/send.png')} tintColor={colors.primary}></Image>
						</TouchableOpacity>
					</View>
				</MenuProvider>
			</KeyboardAvoidingView>
		</TouchableWithoutFeedback >
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},

	unreadMessages: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginStart: 10,

	},

	flatList: {
		marginBottom: 20,
	},

	chatInputWrapper: {
		height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        borderRadius: 10,
        backgroundColor: 'white',
	},

	chatInput: {
		paddingStart: 10,
		width: '70%',
		// borderColor: 'red',
		borderWidth: 2,
		borderRadius: 20,
		color: 'black',
	},

	img: {
		width: 25,
		height: 25,
		marginHorizontal: 10,
	},

	loadingView: {
		position: 'absolute',
		top: 60,		//UI Header
		bottom: 60,		//Chat input
		left: 0,
		right: 0,
		backgroundColor: 'white',
		zIndex: 9999,
		alignItems: 'center',
		justifyContent: 'center',
	},
});

export default Messenger;
