import React, { useState } from 'react';
import { Alert, Button, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { PurchaserInfo, PurchaserInfoUpdateListener } from 'react-native-purchases';

import Purchases from 'react-native-purchases';
import { useRoute } from '@react-navigation/native';

export type Props = {
  appUserID: String | null;
  customerInfo: PurchaserInfo | null;
  isAnonymous: boolean,
  refreshData: Function
};

// Taken from https://reactnative.dev/docs/typescript
const CustomerInfoHeader: React.FC<Props> = ({appUserID, customerInfo, isAnonymous, refreshData}) => {
  const [isLoginModalVisible, setLoginModalVisible] = useState(false);
  const [isAttributeModalVisible, setAttributeModalVisible] = useState(false);
  const [inputUserID, setInputUserID] = useState("");
  const [inputAttributeKey, setInputAttributeKey] = useState("");
  const [inputAttributeValue, setInputAttributeValue] = useState("");

  const activeEntitlements = () => {
    const entitlements = Object.entries(customerInfo?.entitlements?.active ?? {});
    if (entitlements.length > 0) {
      return entitlements.map(([key, value]) => {
        return value.identifier;
      }).join(', ');
    } else {
      return "No active entitlements";
    }
  };

  const login = () => {
    setInputUserID("")
    toggleLoginModalVisibility()
  }

  const logout = async () => {
    try {
      await Purchases.logOut();
      await refreshData();
    } catch {
      console.log("error logging out")
    }
  }

  const toggleLoginModalVisibility = async () => {
    if (isLoginModalVisible && inputUserID && inputUserID.length > 0) {
      await Purchases.logIn(inputUserID);
      await refreshData();
    }

    setLoginModalVisible(!isLoginModalVisible);
  };

  const toggleAttributeModalVisibility = async () => {
    if (isAttributeModalVisible) {
      if (inputAttributeKey.length > 0) {
        const value = inputAttributeValue.length == 0 ? null : inputAttributeValue;
        await Purchases.setAttributes({
          [inputAttributeKey]: value
        })
        await refreshData();
      }
    } else {
      setInputAttributeKey("");
      setInputAttributeValue("");
    }

    setAttributeModalVisible(!isAttributeModalVisible);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        CustomerInfo
      </Text>
      <Text>
        User ID: {appUserID ?? 'N/A'}
      </Text>
      <Text style={styles.entitlements}>
        Entitlements: { activeEntitlements() }
      </Text>
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.button}
          onPress={ isAnonymous ? login : logout } >
          <Text>
            { isAnonymous ? "Login" : "Logout"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={ toggleAttributeModalVisibility } >
          <Text>
            Add Attribute
          </Text>
        </TouchableOpacity>
      </View>

      <Modal animationType="slide" 
              transparent visible={isLoginModalVisible} 
              presentationStyle="overFullScreen">
          <View style={styles.viewWrapper}>
              <View style={styles.modalView}>
                  <Text>Enter identifier for login</Text>
                  <TextInput placeholder="Enter User ID..." 
                    autoCapitalize='none'
                    autoCorrect={false}
                    value={inputUserID} style={styles.textInput} 
                    onChangeText={(value) => setInputUserID(value)} />

                  <Button title="Close" onPress={toggleLoginModalVisibility} />
              </View>
          </View>
      </Modal>

      <Modal animationType="slide" 
              transparent visible={isAttributeModalVisible} 
              presentationStyle="overFullScreen">
          <View style={styles.viewWrapper}>
              <View style={styles.modalView}>
                  <Text>Enter attriute key and value</Text>
                  <TextInput placeholder="Enter key..." 
                    autoCapitalize='none'
                    autoCorrect={false}
                    value={inputAttributeKey} style={styles.textInput} 
                    onChangeText={(value) => setInputAttributeKey(value)} />
                  <TextInput placeholder="Enter value..." 
                    autoCapitalize='none'
                    autoCorrect={false}
                    value={inputAttributeValue} style={styles.textInput} 
                    onChangeText={(value) => setInputAttributeValue(value)} />

                  <Button title="Close" onPress={toggleAttributeModalVisibility} />
              </View>
          </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 20
  },
  buttons: {
    flex: 1,
    flexDirection: "row"
  },
  entitlements: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center'
  },
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8
  },
  button: {
    backgroundColor: "lightcoral",
    paddingVertical: 5,
    paddingHorizontal: 20,
    marginTop: 20,
    borderRadius: 4,
    marginHorizontal: 5
  },
  viewWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  modalView: {
      alignItems: "center",
      justifyContent: "center",
      position: "absolute",
      width: "90%",
      elevation: 5,
      height: 180,
      backgroundColor: "#fff",
      borderRadius: 7,
  },
  textInput: {
      width: "80%",
      borderRadius: 5,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderColor: "rgba(0, 0, 0, 0.2)",
      borderWidth: 1,
      marginBottom: 8,
  },
});

export default CustomerInfoHeader;