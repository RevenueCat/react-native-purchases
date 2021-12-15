import React, { useState } from 'react';
import { Alert, Button, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { PurchaserInfo, PurchasesEntitlementInfo } from 'react-native-purchases';

import Purchases from 'react-native-purchases';

export type Props = {
  appUserID: String | null;
  customerInfo: PurchaserInfo | null;
  isAnonymous: boolean
};

// Taken from https://reactnative.dev/docs/typescript
const CustomerInfoHeader: React.FC<Props> = ({appUserID, customerInfo, isAnonymous}) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");

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
    setInputValue("")
    toggleModalVisibility()
  }

  const onModalClose = async () => {
    if (inputValue && inputValue.length > 0) {
      await Purchases.logIn(inputValue);
    }
    toggleModalVisibility()
  }

  const logout = async () => {
    try {
      await Purchases.logOut();
    } catch {
      console.log("error logging out")
    }
  }

  const toggleModalVisibility = () => {
    setModalVisible(!isModalVisible);
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
      <View>
        <TouchableOpacity
          style={styles.button}
          onPress={ isAnonymous ? login : logout } >
          <Text>
            { isAnonymous ? "Login" : "Logout"}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal animationType="slide" 
              transparent visible={isModalVisible} 
              presentationStyle="overFullScreen" 
              onDismiss={() => {}}>
          <View style={styles.viewWrapper}>
              <View style={styles.modalView}>
                  <Text>Enter identifier for login</Text>
                  <TextInput placeholder="Enter something..." 
                    autoCapitalize='none'
                    autoCorrect={false}
                    value={inputValue} style={styles.textInput} 
                    onChangeText={(value) => setInputValue(value)} />

                  <Button title="Close" onPress={onModalClose} />
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
    borderRadius: 4
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