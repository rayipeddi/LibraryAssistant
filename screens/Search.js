import * as React from 'react'
import {Text, View, StyleSheet, TouchableOpacity, TextInput, FlatList, Alert} from 'react-native'
import db from '../config'

export default class Search extends React.Component{
    constructor(props){
        super(props)
        this.state ={
            allTransactions : [],
            transactionHistory : '',
            search : ''
        }        
    }

    searchTransactions= async(input)=>{
        var thetext = input.split("")
        if(thetext[0].toLowerCase() === "b"){
            const transaction = await db.collection("transaction").where("bookId", "==", input).get()
            transaction.docs.map((doc)=>{
            this.setState({
                allTransactions: [...this.state.allTransactions, doc.data()],
                transactionHistory: doc
            })
            })
        }

        else if(thetext[0].toLowerCase() === "s"){
            const transaction = await db.collection("transaction").where("studentId", "==", input).get()
            transaction.docs.map((doc) =>{
                this.setState({
                    allTransactions: [...this.state.allTransactions, doc.data()],
                    transactionHistory: doc
                })
            })
        }

        else{
            Alert.alert("We Cannot Find The ID That You Are Looking For")
            alert("We Cannot Find The ID That You Are Looking For")
            this.setState({
                allTransactions: [],
                transactionHistory: ''
            })
        }
        console.log("Search Transactions")
    }

    loadUp = async()=>{
        var input = this.state.search
        var thetext = input.split("")
        if(thetext[0].toLowerCase() === "b"){
            const transaction = await db.collection("transaction").where("bookId", "==", input).startAfter(this.state.transactionHistory).limit(10).get()
            transaction.docs.map((doc)=>{
            this.setState({
                allTransactions: [...this.state.allTransactions, doc.data()],
                transactionHistory: doc
            })
            })
        }

        else if(thetext[0].toLowerCase() === "s"){
            const transaction = await db.collection("transaction").where("studentId", "==", input).startAfter(this.state.transactionHistory).limit(10).get()
            transaction.docs.map((doc) =>{
                this.setState({
                    allTransactions: [...this.state.allTransactions, doc.data()],
                    transactionHistory: doc
                })
            })
        }
        console.log("Load Up")
    }

    componentDidMount=async()=>{
        const transaction = await db.collection("transaction").limit(10).get()
        transaction.docs.map((doc)=>{
            this.setState({
                allTransactions: '',
                transactionHistory: doc
            })
        })
        console.log("Component Did Mount")
    }

    render(){
        return(
          <View style = {styles.container}>
              <View style = {styles.searchBar}>
                  <TextInput 
                  style = {styles.bar}
                  placeholder = "Type Book or Student ID Here"
                  onChangeText = {text => this.setState({search: text})}
                  />
                  <TouchableOpacity style = {styles.searchButton} onPress ={()=>{
                      this.searchTransactions(this.state.search)
                  }}>
                      <Text>
                          Search
                      </Text>
                  </TouchableOpacity>
              </View>
              <FlatList>
                  data = {this.state.allTransactions}
                  renderItem = {({item})=>(
                     <View>
                         <Text>{"Book ID:" +item.bookId}</Text>
                         <Text>{"Student ID:" + item.studentId}</Text>
                         <Text>{"Transaction Type:" + item.transactionType}</Text>
                         <Text>{"Date:" + item.date.toDate()}</Text>
                     </View>
                  )}
                  keyExtractor = {(item,index)=> index.toString()}
                  onEndReached = {this.loadUp}
                  onEndReachedThreshold = {0.7}
              </FlatList>
          </View>  
        )
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginTop: 20
    },
    searchBar:{
      flexDirection:'row',
      height:40,
      width:'auto',
      borderWidth:0.5,
      alignItems:'center',
      backgroundColor:'grey',
  
    },
    bar:{
      borderWidth:2,
      height:30,
      width:300,
      paddingLeft:10,
    },
    searchButton:{
      borderWidth:1,
      height:30,
      width:50,
      alignItems:'center',
      justifyContent:'center',
      backgroundColor: 'green'
    }
})