import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  Alert,
  TouchableOpacity,
} from 'react-native';
import io from 'socket.io-client';
import RSAKey from 'react-native-rsa';
import Spinner from 'react-native-loading-spinner-overlay';

var currentObj;
class Login extends Component {
  constructor(props) {
    super(props);
    this.bits = 1024;
    this.exponent = '10001'; // must be a string
    this.rsa = '';
    this.publicKey = '';
    this.privateKey = '';
    currentObj = this;
    this.state = {
      txtInputEmail: 'interviewer-002@asimtelecom.vn',
      txtInputPassword: 'asimtelecom2',
      containerColor: '#f5f5f5',
      publicKeyServer: '',
      nodelist: [],
      verifiedAcc: '',
      spinner: false,
    };

    // Socket io is connect to local host
    this.socket = io(
      'https://note-app-demo.herokuapp.com/:' + process.env.PORT,
    ); //('http://localhost:3000');

    this.socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        // the disconnection was initiated by the server, you need to reconnect manually
        socket.connect();
      } else {
        currentObj.setState({publicKeyServer: ''});
        this.hintShowLoading(2000, false);
      }
    });

    // The sever will be sent a public key to the mobile
    this.socket.on('server-sent-pubickey', function (publicKey) {
      currentObj.setState({publicKeyServer: publicKey});
      console.log(
        'Mobile received publickey= ' + currentObj.state.publicKeyServer,
      );
    });

    // firebase check email and password then the server will be sent data
    // if data = 'auth/ok' => email and password is correct else fail
    this.socket.on('server-sent-verify-email', function (data) {
      currentObj.setState({verifiedAcc: data});
      console.log('\n\nClient login= ' + currentObj.state.verifiedAcc);
    });

    // The server will be sent list note data
    this.socket.on('server-sent-listnote', function (data) {
      console.log('vvvvvvv= ' + currentObj.state.verifiedAcc);

      currentObj.hintShowLoading(0, false);
      if (currentObj.state.verifiedAcc === 'auth/ok') {
        currentObj.setState({notelist: data});
        currentObj.moveDetailScreen();
        console.log('\n+++++list note= ' + currentObj.state.notelist);
      } else {
        console.log('vvvvvvv= ' + currentObj.state.verifiedAcc);
        setTimeout(() => {
          Alert.alert('Some thing wrong!');
        }, 10);
      }
    });
  }

  /**
   * @return {*The public key is json encoded string} publicKey
   * @return {*The private key is json encoded string}} privateKey
   */
  generateRSAKeys() {
    rsa = new RSAKey();
    rsa.generate(this.bits, this.exponent);
    publicKey = rsa.getPublicString(); // return json encoded string
    privateKey = rsa.getPrivateString(); // return json encoded string
  }

  /**
   * @return {*The email encrypted} encryptedEmail
   * @return {*The password encrypted} encryptedPassword
   */
  encryptRSA() {
    rsa.setPublicString(this.state.publicKeyServer);
    encryptedEmail = rsa.encrypt(this.state.txtInputEmail);
    encryptedPassword = rsa.encrypt(this.state.txtInputPassword);
    return [encryptedEmail, encryptedPassword];
  }

  /**
   * Button login
   */
  nextContinue() {
    // encrypt with RSA
    this.generateRSAKeys();
    let [encryptedEmail, encryptedPassword] = this.encryptRSA();
    // The mobile sents event(with socketio) to server
    this.socket.emit('client-sent-login', encryptedEmail, encryptedPassword);
    console.log('\n\nhet ham nexct continue\n\n');
  }

  // Move to deatail screen
  moveDetailScreen() {
    console.log('\n\nchuan bi list note= ' + currentObj.state.notelist);
    this.props.navigation.push('Details', {
      notelist: currentObj.state.notelist,
    });
  }

  hintShowLoading(time, status) {
    setTimeout(() => {
      this.setState({
        spinner: status,
      });
    }, time);
  }

  render() {
    return (
      <View
        style={styles.container}
        backgroundColor={this.state.containerColor}>
        <Text style={styles.header}>Login</Text>
        <Spinner
          visible={this.state.spinner}
          textContent={'Loading...'}
          textStyle={styles.spinnerTextStyle}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          onChangeText={(txtInputEmail) => this.setState({txtInputEmail})}
          value={this.state.txtInputEmail}></TextInput>
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry={true}
          onChangeText={(txtInputPassword) => this.setState({txtInputPassword})}
          value={this.state.txtInputPassword}></TextInput>
        <View style={styles.continue}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              this.hintShowLoading(0, true);
              if (currentObj.state.publicKeyServer != '') {
                this.nextContinue();
              } else {
                this.hintShowLoading(3000, false);
                setTimeout(() => {
                  Alert.alert('Some thing wrong!');
                }, 3050);
              }
            }}>
            <Image
              style={styles.logo}
              source={require('../assets/images/next.png')}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 40,
    paddingRight: 40,
  },
  input: {
    height: 40,
    borderWidth: 0.5,
    borderRadius: 5,
    fontSize: 18,
    marginTop: 20,
    color: '#a52a2a',
  },
  header: {
    fontSize: 30,
    fontWeight: '800',
    marginTop: -70,
    color: '#808080',
    textAlign: 'center',
  },
  continue: {
    alignItems: 'flex-end',
  },
  button: {
    width: 70,
    height: 70,
    borderRadius: 70 / 2,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#808000',
  },
  logo: {
    width: 30,
    height: 30,
    alignContent: 'center',
  },
  spinnerTextStyle: {
    color: '#FFF',
  },
});
export default Login;
