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
    Switch,
    PermissionsAndroid,
    Button,
    Modal,
    Pressable,
} from 'react-native';

import {
    Colors,
    DebugInstructions,
    Header,
    LearnMoreLinks,
    ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import { auth, firebaseDatabase, firebaseDatabaseRef, firebaseDatabaseSet, get, onValue } from '../../firebase/firebase'
import { NavigationProp, RouteProp, StackActions } from '@react-navigation/native';
import SwitchToggle from 'react-native-switch-toggle';
import { getDownloadURL, getStorage, uploadBytes, uploadBytesResumable } from 'firebase/storage';
import { ref as firebaseStorageRef} from 'firebase/storage';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Menu, MenuOption, MenuOptions, MenuProvider, MenuTrigger } from 'react-native-popup-menu';
import ImageViewer from 'react-native-image-zoom-viewer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorContext } from '../Setting/ColorContext';

type SectionProps = {
    navigation: NavigationProp<any, any>
    route: RouteProp<any, any>;
};

function Profile({navigation} : SectionProps): React.JSX.Element {
    // Màu
    const { colors } = useColorContext();
    // Dark mode
    const { darkMode } = useColorContext();

    const [isSync, setIsSync] = useState(false)
    const [avatarUrl, setAvarUrl] = useState()
    const [cameraPhoto, setCameraPhoto] = useState()
    const [galleryPhoto, setGalleryPhoto] = useState()

    let options = {
        // saveToPhotos: true,
        mediaType: 'photo',
    }

    // const openCamera = async () => {
    //     const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA)
    //     if (granted === PermissionsAndroid.RESULTS.GRANTED) {
    //         const result = await launchCamera(options)
    //         console.log(result)
    //         // setCameraPhoto(result.assets[0].uri)
    //     }
    // }

    const openCamera = async () => {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            const result = await launchCamera(options);
            if (!result.didCancel && result.assets && result.assets.length > 0) {
                const capturedImageUri = result.assets[0].uri;
                setCameraPhoto(capturedImageUri);
    
                try {
                    const storage = getStorage();
                    const storageReference = firebaseStorageRef(storage, `/users/${auth.currentUser?.uid}/avatar.jpg`);
    
                    // Tải dữ liệu từ URI
                    const response = await fetch(capturedImageUri);
                    const imageBlob = await response.blob();
                    await uploadBytes(storageReference, imageBlob).then(async () => {
                        const now = new Date().getTime();
                        const avatar = {
                            url: `/users/${auth.currentUser?.uid}/avatar.jpg`,
                            timestamp: now,
                        };
                        await firebaseDatabaseSet(firebaseDatabaseRef(firebaseDatabase, `users/${auth.currentUser?.uid}/avatar`), avatar);
    
                        // Update avatar URL state
                        const downloadUrl = await getDownloadURL(storageReference);
                        setAvarUrl(downloadUrl);
                    });
                } catch (error) {
                    Alert.alert('Error', error.message);
                }
            }
        }
    };

    const openGallery = async () => {
        try {
            const result = await launchImageLibrary(options);
            if (!result.didCancel && result.assets && result.assets.length > 0) {
                const selectedImageUri = result.assets[0].uri;
                setGalleryPhoto(selectedImageUri);
    
                const storage = getStorage();
                const storageReference = firebaseStorageRef(storage, `/users/${auth.currentUser?.uid}/avatar.jpg`);
    
                // Tải dữ liệu từ URI
                const response = await fetch(selectedImageUri);
                const imageBlob = await response.blob();
                await uploadBytes(storageReference, imageBlob).then(async () => {
                    const now = new Date().getTime();
                    const avatar = {
                        url: `/users/${auth.currentUser?.uid}/avatar.jpg`,
                        timestamp: now,
                    };
                    await firebaseDatabaseSet(firebaseDatabaseRef(firebaseDatabase, `users/${auth.currentUser?.uid}/avatar`), avatar);
    
                    // Update avatar URL state
                    const downloadUrl = await getDownloadURL(storageReference);
                    setAvarUrl(downloadUrl);
                });
            }
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    // Lấy avatar
    const getAvatar = async () => {
        const storage = getStorage()
        const reference = firebaseStorageRef(storage,`/users/${auth.currentUser?.uid}/avatar.jpg`)
        let url 
        try {
            url = await getDownloadURL(reference)
        }
        catch {
            url = null
        }
        setAvarUrl(url)
    }


    // Kiểm tra người dùng được sync hay chưa
    useEffect(() => {
		// Lấy collection users, dùng onValue để khi db có thay đổi thì sẽ thay đổi components
		onValue(firebaseDatabaseRef(firebaseDatabase, `users/${auth.currentUser?.uid}`), async (snapshot) => 
		{
			if (snapshot.exists()) 
			{
				// Lấy ra người dùng hiện tại
                const user = snapshot.val()
                setIsSync(user.isSync)
                await getAvatar()
			}
			else 
				console.log('No data availble')
		})
	}, [])

    // Load avatar lần đầu
    useEffect(() => {
        getAvatar()
    }, [])

    // Cho thanh slider khi nhấn vào avatar
    const [visible, setVisible] = useState(false)
    // Cho ảnh khi nhấn vào xem avatar
    const [imageVisible, setImageVisible] = useState(false) 
    const show = () => setVisible(true)
    const hide = () => setVisible(false)
    const showImage = () => setImageVisible(true)
    const hideImage = () => setImageVisible(false)

    return (
        <View style={{...styles.container, backgroundColor: darkMode.background}}>
            <View style={styles.body}>
                <View style={{...styles.subBody, backgroundColor: colors.primary}}>
                    <TouchableOpacity onPress={show}>
                        <Image style={styles.img} source={{uri: avatarUrl ? avatarUrl : 'https://www.shutterstock.com/image-vector/blank-avatar-photo-place-holder-600nw-1114445501.jpg'}}></Image>
                    </TouchableOpacity>
                    <Modal visible={visible} animationType='slide' onRequestClose={hide} transparent={true}>
                        <Pressable style={{height: 240}} onPress={hide}></Pressable>
                        <SafeAreaView style={{flex: 1, backgroundColor: 'white', borderRadius: 20}}>
                            {/* <View style={{height: 10, width: 100, backgroundColor: '#bdc7c0', borderRadius: 20, marginVertical: 20, alignSelf: 'center'}}></View> */}
                            <View style={{height: 10}}></View>
                            <TouchableOpacity style={styles.imageOption} onPress={showImage}>
                                <Image source={require('./img/user.png')} style={styles.imageIcon}></Image>
                                <Text style={{fontSize: 18, color: 'black'}}>Xem Avatar</Text>
                            </TouchableOpacity>
                            <View style={styles.line}></View>
                            <TouchableOpacity style={styles.imageOption} onPress={openGallery}>
                                <Image source={require('./img/image.png')} style={styles.imageIcon}></Image>
                                <Text style={{fontSize: 18, color: 'black'}}>Chọn ảnh từ thư viện</Text>
                            </TouchableOpacity>
                            <View style={styles.line}></View>
                            <TouchableOpacity style={styles.imageOption} onPress={openCamera}>
                                <Image source={require('./img/camera.png')} style={styles.imageIcon}></Image>
                                <Text style={{fontSize: 18, color: 'black'}}>Chụp ảnh mới</Text>
                            </TouchableOpacity>
                            <View style={styles.line}></View>
                        </SafeAreaView>
                        <Modal visible={imageVisible} animationType='fade' onRequestClose={hideImage} transparent={true}>
                            <ImageViewer imageUrls={[{url: avatarUrl ? avatarUrl : 'https://www.shutterstock.com/image-vector/blank-avatar-photo-place-holder-600nw-1114445501.jpg'}]}></ImageViewer>
                            <TouchableOpacity style={{position: 'absolute', width: 30, height: 30, left: 20, top: 20, backgroundColor: 'white', borderRadius: 20}} onPress={hideImage}>
                                    <Text style={{alignSelf: 'center', fontWeight: 'bold', fontSize: 20, color: 'black'}}>X</Text>
                            </TouchableOpacity>
                        </Modal>
                    </Modal>
                    {/* <SafeAreaView>
                        <Button title='Show' onPress={show}></Button>
                        <Modal visible={visible} animationType='slide' onRequestClose={hide} transparent={true}>
                            <Pressable style={{height: 200, backgroundColor: "#DDD", opacity: 0.5}} onPress={hide}></Pressable>
                            <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
                                <Button title='Hide' onPress={hide}></Button>
                            </SafeAreaView>
                        </Modal>
                    </SafeAreaView> */}
                    <View style={styles.infoWrapper}>
                        <Text style={styles.infoName}>Email:</Text>
                        <Text style={styles.info}>{auth.currentUser?.email}</Text>
                    </View>
                    <View style={styles.infoWrapper}>
                        <Text style={styles.infoName}>UID:</Text>
                        <Text style={styles.info}>{auth.currentUser?.uid}</Text>
                    </View>
                    <View style={styles.infoWrapper}>
                        <Text style={styles.infoName}>Email verified:</Text>
                        <Text style={styles.info}>{auth.currentUser?.emailVerified ? 'Verified' : 'Not Verified'}</Text>
                    </View>
                    <View style={{...styles.infoWrapper, paddingBottom: 10}}>
                        <Text style={styles.infoName}>Message Sync:</Text>
                        {/* <Switch value={isSync} onValueChange={() => {
                            firebaseDatabaseSet(firebaseDatabaseRef(firebaseDatabase, `users/${auth.currentUser?.uid}/isSync`), !isSync)
                        }}></Switch> */}
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
                        switchOn={isSync}
                        onPress={() => firebaseDatabaseSet(firebaseDatabaseRef(firebaseDatabase, `users/${auth.currentUser?.uid}/isSync`), !isSync)}
                        circleColorOff='#fff'
                        circleColorOn='#fff'
                        backgroundColorOn='#05f551'
                        backgroundColorOff='#c4c4c4'
                        />
                    </View>
                </View>
                <View style={{marginHorizontal: 10, marginVertical: 10,}}>
                        <Text style={{color: 'red'}}>- Mặc định tin nhắn phía người gửi sẽ được lưu ở local storage</Text>
                        <Text style={{color: 'red'}}>- Bật tính năng đồng bộ tin nhắn để lưu lại tin nhắn đã gửi một cách bảo mật (tự mã hoá lại bằng public key của mình) trên Server, hiệu năng sẽ thấp hơn</Text>
                        <Text style={{color: 'red'}}>- Chỉ tin nhắn được gửi khi bật tính năng đồng bộ mới được lưu trữ trên Server</Text>

                </View>
            </View>

            <TouchableOpacity style={{...styles.signOut, backgroundColor: colors.secondary}} onPress={() => {
                    auth.signOut()
                    AsyncStorage.removeItem('user');
                    navigation.dispatch(StackActions.popToTop)      //Pop stack

                }}>
                <Text style={{color: 'white', fontWeight: 'bold'}}>Đăng xuất</Text>
            </TouchableOpacity>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    body: {
        flex: 1,
        marginHorizontal: 10,
        marginTop: 10,
    },

    subBody: {
        // backgroundColor: 'rgba(255, 0, 0, 0.3)',
        borderRadius: 16,
    },

    img: {
        width: 140,
        height: 140,
        alignSelf: 'center',
        borderRadius: 80,
        marginVertical: 10,
        borderWidth: 4,
        borderColor: 'white',
    },

    infoWrapper: {
        flexDirection: 'row',
        marginTop: 10,
        justifyContent: 'space-between',
        marginHorizontal: 10,
        alignItems: 'center',
    },

    infoName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'black',
    },

    info: {
        marginHorizontal: 5,
        color: 'black',
    },

    signOut: {
        // backgroundColor: 'red',
        width: 90,
        height: 40,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        marginBottom: 10,
    },

    imageOption: {
        flexDirection: 'row',
        marginHorizontal: 10,
        marginVertical: 10,
        alignItems: 'center',
        padding: 6,
    },

    imageIcon: {
        width: 20,
        height: 20,
        marginHorizontal: 10,
    },

    line: {
        height: 1.5, 
        marginHorizontal: 20,
        backgroundColor: '#afb5bd'
    },
})

export default Profile;