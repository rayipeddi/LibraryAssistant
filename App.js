import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import {createAppContainer} from 'react-navigation';
import {createBottomTabNavigator} from 'react-navigation-tabs';
import Transaction from './screens/Transaction';
import Search from './screens/Search';
export default class App extends React.Component{
  render(){
    return(
      <AppContainer/>
    )
  }
}

const TabNavigator = createBottomTabNavigator({
  Transaction: {screen:Transaction},
  Search: {screen:Search},
},
{defaultNavigationOptions: ({navigation})=>({
tabBarIcon: ()=>{
  const routename = navigation.state.routeName
  console.log(routename)
  if(routename === "Transaction"){
    return(<Image source = {require("./assets/book.png")}
    style = {{width: 35, height: 35}}
    />)
  }
  else if(routename === "Search"){
      return(<Image source = {require("./assets/searchingbook.png")}
      style = {{width: 35, height: 35}}
      />)
    }
}
})
})


const AppContainer = createAppContainer(TabNavigator)