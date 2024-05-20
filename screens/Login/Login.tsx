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
import UIHeader from '../../components/UIHeader';
import { NavigationProp, RouteProp, StackActions } from '@react-navigation/native';
import { isValidEmail, isValidPassword } from './Validation';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { 
    auth, 
    firebaseDatabase, 
    onAuthStateChanged, 
    firebaseDatabaseRef,
    firebaseDatabaseSet,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword, 
    get
} from './../../firebase/firebase'

import RSA from 'react-native-fast-rsa';



type SectionProps = {
    navigation: NavigationProp<any, any>
    route: RouteProp<any, any>;
};


function Login({navigation} : SectionProps): React.JSX.Element {
    const [keyBoardShow, setKeyBoardShow] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    // State để kiểm tra có valid không
    const [errorEmail, setErrorEmail] = useState('')
    const [errorPassword, setErrorPassword] = useState('')
    const isValidation = email.length > 0 && password.length > 0 && errorEmail === '' && errorPassword === ''

    // Lưu lại thông tin lỗi:
    const [error, setError] = useState('')


    useEffect(() => {
        Keyboard.addListener('keyboardDidShow', () => setKeyBoardShow(true))
        Keyboard.addListener('keyboardDidHide', () => setKeyBoardShow(false))
    }, [])
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={styles.container}>
            <ScrollView>
                <View style={styles.haveAccountWrapper}>
                    <Text style={styles.haveAccountText}>Already have an account? Sign in!</Text>
                    <Image tintColor={'red'} style={styles.haveAccountImage} source={require('./img/chat.png')}></Image>
                </View>
                <View style={styles.loginWrapper}>
                    <View style={styles.infoWrapper}>
                        <Text style={styles.info}>Email:</Text>
                        <TextInput style={{color: 'black'}} value={email} onChangeText={(text) => {
                            setErrorEmail(isValidEmail(text) ? '' : 'Email is not in correct format')
                            setEmail(text)}} 
                            placeholder='example@gmail.com' placeholderTextColor={'gray'}></TextInput>
                        <View style={styles.line}></View>
                        <Text style={styles.errorNoticeText}>{errorEmail}</Text>
                    </View>
                    <View style={styles.infoWrapper}>
                        <Text style={styles.info}>Enter your password</Text>
                        <TextInput style={{color: 'black'}} value={password} onChangeText={(text) => {
                            setErrorPassword(isValidPassword(text) ? '' : 'Password must at least 6 characters')
                            setPassword(text)}} 
                            secureTextEntry={true} placeholder='Enter your password' placeholderTextColor={'gray'}></TextInput>
                        <View style={styles.line}></View>
                        <Text style={styles.errorNoticeText}>{errorPassword}</Text>
                    </View>
                </View>
                <View style={styles.errorWrapper}>
                    <Text style={{color: 'red'}}>{error}</Text>
                </View>
                <View>
                    <TouchableOpacity onPress={() => {signInWithEmailAndPassword(auth, email, password).then((userCredenial) => {
                        const user = userCredenial.user
                        // console.log(userId)
                            
                        const dbRef = firebaseDatabaseRef(firebaseDatabase, `users/${user.uid}`)
                        get(dbRef).then(snapshot => {
                            if (snapshot.exists()) {
                                // Lấy dữ liệu người dùng hiện tại từ snapshot
                                const userData = snapshot.val();
                                const dbRef2 = firebaseDatabaseRef(firebaseDatabase, `usersPrivateKey/${user.uid}`)
                                let allUserData = {}
                                get(dbRef2).then(snapshot => {
                                    if (snapshot.exists()) {
                                        const userPrivateKey = snapshot.val()
                                        allUserData = {...userData, ...userPrivateKey}
                                        //save user to local storage (react-native-async-storage/async-storage)
                                        AsyncStorage.setItem('user', JSON.stringify(allUserData))   //Lưu user dưới dạng string
                                        // Khi lưu xong vào local storage thì mới chuyển đến UITab
                                        navigation.navigate('UITab')
                                    }
                                })
                                // Không lưu vào db ở đây nữa 
                                // firebaseDatabaseSet(firebaseDatabaseRef(firebaseDatabase, `users/${userId}`), currentUser)
                                // navigation.navigate('UITab')
                            } else {
                                // console.log('User data does not exist');
                            }
                        })
                        }).catch((error) => {
                            // Alert.alert(`error: ${error.message}`)
                            setError(error.message)
                        })}
                    }
                        disabled={!isValidation} style={{...styles.loginButton, backgroundColor: isValidation ? 'red' : 'gray'}}>
                        <Text style={{padding: 10, color: 'white', fontSize: 16}}>Login</Text>
                    </TouchableOpacity>
                    {keyBoardShow == false && <TouchableOpacity style={{marginTop: 10}} onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.registerText}>Doesn't have account? Register Now</Text>
                    </TouchableOpacity>}
                </View>
            </ScrollView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
    },

    haveAccountWrapper: {
        flex: 20,
        flexDirection: 'row',
        height: 160,
        alignItems: 'center',
        justifyContent: 'space-around',
    },

    haveAccountText: {
        color: 'black',
        fontSize: 20,
        fontWeight: 'bold',
        width: '50%',
    },

    haveAccountImage: {
        width: 100,
        height: 100,
        alignSelf: 'center',
    },

    loginWrapper:{
        marginBottom: 6,
        marginHorizontal: 6,
    },

    signIn: {
        flex: 30,
    },

    infoWrapper: {
        marginHorizontal: 15,
    },

    line: {
        height: 1, 
        width: '100%',
        backgroundColor: 'red',
    },

    errorNoticeText: {
        color: 'red',
        marginBottom: 10,
    },

    info: {
        color: 'red',
        fontSize: 16,
    },

    loginButton: {
        // backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        width: '50%',
        alignSelf: 'center',
        borderRadius: 15,
        marginTop: 40,
    },

    registerText: {
        color: 'red', 
        fontSize: 12, 
        alignSelf: 'center',
        padding: 5,
    },

    errorWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default Login;
