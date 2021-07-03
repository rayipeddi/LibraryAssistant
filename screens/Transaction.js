import React from 'react';
import { Text, View, TouchableOpacity, TextInput, Image, StyleSheet, KeyboardAvoidingView, Alert} from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import firebase from 'firebase'
import db from '../config'

export default class TransactionScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        scannedBookId: '',
        scannedStudentId:'',
        buttonState: 'normal',
        transactionMessage: ""
      }
    }

    getCameraPermissions = async (id) =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
        hasCameraPermissions: status === "granted",
        buttonState: id,
        scanned: false
      });
    }

    handleBarCodeScanned = async({type, data})=>{
      const {buttonState} = this.state

      if(buttonState==="BookId"){
        this.setState({
          scanned: true,
          scannedBookId: data,
          buttonState: 'normal'
        });
      }
      else if(buttonState==="StudentId"){
        this.setState({
          scanned: true,
          scannedStudentId: data,
          buttonState: 'normal'
        });
      }
      
    }

    initBookIssue = async()=>{
//      alert("book issued")
      db.collection("transaction").add({
        'studentId' : this.state.scannedStudentId,
        'bookId': this.state.scannedBookId,
        'date': firebase.firestore.Timestamp.now().toDate(),
        'transactionType': "Issue"
      })
      db.collection("books").doc(this.state.scannedBookId).update({
        'bookAvailability': false
      })
      db.collection("students").doc(this.state.scannedStudentId).update({
        'issuedBooks': firebase.firestore.FieldValue.increment(1)
      })
      this.setState({
        scannedStudentId: '',
        scannedBookId: ''
      })
      
    }

    initBookReturn = async()=>{
      db.collection("transaction").add({
        'studentId': this.state.scannedStudentId,
        'bookId': this.state.scannedBookId,
        'date': firebase.firestore.Timestamp.now().toDate(),
        'transactionType': "Returned"
      })
      db.collection("books").doc(this.state.scannedBookId).update({
        'bookAvailability': true,
      })
      db.collection("students").doc(this.state.scannedStudentId).update({
        'issuedBooks': firebase.firestore.FieldValue.increment(-1)
      })
      this.setState({
        scannedStudentId: '',
        scannedBookId: ''
      })

    }


    handleTransaction = async()=>{
      var transactionType = await this.checkBookEligibility()
      
      if(transactionType == 'issue'){
        var studentEligibility = await this.checkStudentEligibilityIssue()
        console.log(studentEligibility)
        if(studentEligibility == 'true'){
          this.initBookIssue()
          Alert.alert("Issue Was Succesful... Have A Great Read!")
        }
      }
      if(transactionType === 'return'){
        console.log("Return Is Initiated")
        this.initBookReturn()
      }
      if(transactionType == 'false'){
        Alert.alert("Sorry, This Book Does Not Exist")
        this.setState({
          scannedBookId: '',
          scannedStudentId: ''
        })
      }
    }

    checkBookEligibility = async()=>{
      const bookRef = await db.collection("books").where("bookID", "==", this.state.scannedBookId).get()
      var transactionType = ''
      if(bookRef.docs.length == 0){
        transactionType = 'false'
      }
      else{
        bookRef.docs.map((doc =>{
          var book = doc.data()

          if(book.bookAvailability === true){
            transactionType = 'issue'
          }
          else{
            transactionType = 'return'
          }
        }))
      }
      console.log(transactionType)
      return transactionType
    }

    checkStudentEligibilityIssue = async()=>{
      const studentRef = await db.collection("students").where("studentID", "==", this.state.scannedStudentId).get()
      var studentEligibility = ''
      if(studentRef.docs.length == 0){
        this.setState({
          scannedBookId : '',
          scannedStudentId: ''
        })
        studentEligibility = 'false'
        Alert.alert("Student Does Not Exist")
      }
      else{
        studentRef.docs.map((doc =>{
          var student = doc.data()

          if(student.issuedBooks < 4){
            studentEligibility = 'true'
            console.log("Under Limit")
          }
          else{
            studentEligibility = 'false'
            console.log("Limit Exceeded")
            this.setState({
              scannedBookId:'',
              scannedStudentId:''
            })
            Alert.alert("Student Has Reached Maximum Limit of Books That Can Be Issued")
          }
        }))
      }
      return studentEligibility
    }

    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState !== "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <KeyboardAvoidingView behavior = "padding" enabled>

          <View style={styles.container}>
            <View>
              <Image
                source={require("../assets/Books.jpg")}
                style={{width:200, height: 200}}/>
              <Text style={{textAlign: 'center', fontSize: 30}}>Atlas 🧭</Text>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Book Id"
              onChangeText = {text => this.setState({scannedBookId: text})}
              value={this.state.scannedBookId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("BookId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Student Id"
              onChangeText = {text => this.setState({scannedStudentId: text})}
              value={this.state.scannedStudentId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("StudentId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <Text>
              {this.state.transactionMessage}
            </Text>
            <TouchableOpacity style = {styles.submitButton} onPress = {async() =>{
             var transactionMessage = await this.handleTransaction(); 
             this.setState({
               scannedBookId: '',
               scannedStudentId: ''
             })
            }
            }>
              <Text style = {styles.submitButtonText}>Submit!</Text>
            </TouchableOpacity>
            
          </View>
          </KeyboardAvoidingView>
        );
      }
    }
  }

  const styles = StyleSheet.create({
    container: {
      backgroundColor: "grey",
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: '#66BB6A',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    },
    submitButton:{
      backgroundColor: '#FBC02D',
      width: 100,
      height:50
    },
    submitButtonText:{
      padding: 10,
      textAlign: 'center',
      fontSize: 20,
      fontWeight:"bold",
      color: 'white'
    }
  
  });