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
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { isValidEmail, isValidPassword } from './Validation';

import { auth, firebaseDatabase, createUserWithEmailAndPassword, sendEmailVerification, firebaseDatabaseSet, firebaseDatabaseRef } from './../../firebase/firebase'
import RSA from 'react-native-fast-rsa';

type SectionProps = {
    navigation: NavigationProp<any, any>
    route: RouteProp<any, any>;
};

function Register({navigation} : SectionProps): React.JSX.Element {
    const [keyBoardShow, setKeyBoardShow] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [rePassword, setRePassword] = useState('')
    // State để kiểm tra có valid không
    const [errorEmail, setErrorEmail] = useState('')
    const [errorPassword, setErrorPassword] = useState('')
    const [errorRePassword, setErrorRePassword] = useState('')
    const isValidation = 
    email.length > 0 && password.length > 0 && rePassword.length > 0 
    && errorEmail === '' && errorPassword === '' && errorRePassword === ''
    && password === rePassword



    useEffect(() => {
        Keyboard.addListener('keyboardDidShow', () => setKeyBoardShow(true))
        Keyboard.addListener('keyboardDidHide', () => setKeyBoardShow(false))
    })
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={styles.container}>
            <ScrollView>
                <View style={styles.haveAccountWrapper}>
                    <Text style={styles.haveAccountText}>Chưa có tài khoản? Đăng ký ngay!</Text>
                    <Image tintColor={'red'} style={styles.haveAccountImage} source={require('./img/sign-up.png')}></Image>
                </View>
                <View>
                    <View style={styles.infoWrapper}>
                        <Text style={styles.info}>Email:</Text>
                        <TextInput style={{color: 'black'}} value={email} onChangeText={(text) => {
                            setErrorEmail(isValidEmail(text) ? '' : 'Email không đúng chuẩn')
                            setEmail(text)}} 
                            placeholder='example@gmail.com' placeholderTextColor={'gray'}></TextInput>
                        <View style={styles.line}></View>
                        <Text style={styles.errorNoticeText}>{errorEmail}</Text>
                    </View>
                    <View style={styles.infoWrapper}>
                        <Text style={styles.info}>Mật khẩu:</Text>
                        <TextInput style={{color: 'black'}} value={password} onChangeText={(text) => {
                            setErrorPassword(isValidPassword(text) ? '' : 'Mật khẩu ít nhất 6 ký tự')
                            setPassword(text)}} 
                            secureTextEntry={true} placeholder='Nhập mật khẩu' placeholderTextColor={'gray'}></TextInput>
                        <View style={styles.line}></View>
                        <Text style={styles.errorNoticeText}>{errorPassword}</Text>
                    </View>
                    <View style={styles.infoWrapper}>
                        <Text style={styles.info}>Nhập lại mật khẩu:</Text>
                        <TextInput style={{color: 'black'}} value={rePassword} onChangeText={(text) => {
                            setErrorRePassword(isValidPassword(text) ? '' : 'Mật khẩu ít nhất 6 ký tự')
                            setRePassword(text)}} 
                            secureTextEntry={true} placeholder='Nhập mật khẩu' placeholderTextColor={'gray'}></TextInput>
                        <View style={styles.line}></View>
                        <Text style={styles.errorNoticeText}>{errorRePassword}</Text>
                    </View>
                </View>
                <View>
                    <TouchableOpacity 
                        onPress={() => createUserWithEmailAndPassword(auth, email, password).then((userCredenial) => {
                            const user = userCredenial.user
                            // sendEmailVerification(user).then(() => console.log('Email verification sent'))
                            RSA.generate(1024)
                            .then(keys => {
                                let currentUser = {
                                    uid: user.uid,
                                    email: user.email,
                                    emailVerified: user.emailVerified,
                                    isSync: false,
                                    publicKey: keys.publicKey,
                                }
                                let usersPrivateKey = {
                                    privateKey: keys.privateKey,
                                }
                                firebaseDatabaseSet(firebaseDatabaseRef(firebaseDatabase, `users/${user.uid}`), currentUser)
                                firebaseDatabaseSet(firebaseDatabaseRef(firebaseDatabase, `usersPrivateKey/${user.uid}`), usersPrivateKey)
                            })
                            Alert.alert('Đăng ký thành công, vui lòng đăng nhập.')
                        }).catch((error) => {
                            Alert.alert(`Không thể đăng ký, error: ${error.message}`)
                        })}
                        disabled={!isValidation} style={{...styles.loginButton, backgroundColor: isValidation ? 'red' : 'gray'}}>
                        <Text style={{padding: 10, color: 'white', fontSize: 16}}>Đăng Ký</Text>
                    </TouchableOpacity>
                    {keyBoardShow == false && <TouchableOpacity style={{marginTop: 10}} onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.registerText}>Có tài khoản rồi? Đăng nhập!</Text>
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
        flexDirection: 'row',
        height: 100,
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
});

export default Register;
