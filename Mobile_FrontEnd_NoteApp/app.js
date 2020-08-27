import 'react-native-gesture-handler';
import React from 'react';
import Login from './components/login';
import DetailAuthor from './components/detail_author';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={Login} />
        <Stack.Screen name="Details" component={DetailAuthor} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
