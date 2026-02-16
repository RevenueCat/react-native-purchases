import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
} from 'react-native';

type VariableType = 'string' | 'number' | 'boolean';

interface CustomVariablesEditorProps {
  isVisible: boolean;
  variables: { [key: string]: string };
  onSave: (variables: { [key: string]: string }) => void;
  onCancel: () => void;
}

interface VariableItem {
  key: string;
  value: string;
}

const CustomVariablesEditor: React.FC<CustomVariablesEditorProps> = ({
  isVisible,
  variables,
  onSave,
  onCancel,
}) => {
  const [localVariables, setLocalVariables] = useState<VariableItem[]>(
    Object.entries(variables).map(([key, value]) => ({ key, value }))
  );
  const [isAdding, setIsAdding] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  // Reset state when modal becomes visible
  React.useEffect(() => {
    if (isVisible) {
      setLocalVariables(
        Object.entries(variables).map(([key, value]) => ({ key, value }))
      );
      setIsAdding(false);
      setNewKey('');
      setNewValue('');
    }
  }, [isVisible, variables]);

  const handleSave = () => {
    const result: { [key: string]: string } = {};
    localVariables.forEach(item => {
      if (item.key.trim()) {
        result[item.key.trim()] = item.value;
      }
    });
    onSave(result);
  };

  const handleAddVariable = () => {
    if (newKey.trim()) {
      setLocalVariables([
        ...localVariables,
        { key: newKey.trim(), value: newValue },
      ]);
      setNewKey('');
      setNewValue('');
      setIsAdding(false);
    }
  };

  const handleDeleteVariable = (index: number) => {
    const updated = [...localVariables];
    updated.splice(index, 1);
    setLocalVariables(updated);
  };

  const renderVariableItem = ({ item, index }: { item: VariableItem; index: number }) => (
    <View style={styles.variableRow}>
      <View style={styles.variableInfo}>
        <Text style={styles.variableKey}>{item.key}</Text>
        <Text style={styles.variableValue}>{item.value || '(empty)'}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteVariable(index)}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onCancel}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.title}>Custom Variables</Text>
          <Text style={styles.subtitle}>
            Pass dynamic values to your paywall using {'{{ custom.variable_name }}'} syntax
          </Text>

          {localVariables.length === 0 && !isAdding ? (
            <Text style={styles.emptyText}>
              No custom variables defined. Tap "Add Variable" to create one.
            </Text>
          ) : (
            <FlatList
              data={localVariables}
              renderItem={renderVariableItem}
              keyExtractor={(item, index) => `${item.key}-${index}`}
              style={styles.list}
            />
          )}

          {isAdding ? (
            <View style={styles.addForm}>
              <Text style={styles.formLabel}>Variable Name</Text>
              <TextInput
                style={styles.textInput}
                value={newKey}
                onChangeText={setNewKey}
                placeholder="e.g., player_name"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.formLabel}>Value</Text>
              <TextInput
                style={styles.textInput}
                value={newValue}
                onChangeText={setNewValue}
                placeholder="e.g., John"
              />
              <View style={styles.addFormButtons}>
                <Button
                  title="Cancel"
                  onPress={() => {
                    setIsAdding(false);
                    setNewKey('');
                    setNewValue('');
                  }}
                  color="#888"
                />
                <Button
                  title="Add"
                  onPress={handleAddVariable}
                  disabled={!newKey.trim()}
                />
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setIsAdding(true)}>
              <Text style={styles.addButtonText}>+ Add Variable</Text>
            </TouchableOpacity>
          )}

          <View style={styles.buttonContainer}>
            <Button title="Cancel" onPress={onCancel} color="#888" />
            <Button title="Done" onPress={handleSave} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginVertical: 20,
  },
  list: {
    maxHeight: 200,
    marginBottom: 10,
  },
  variableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  variableInfo: {
    flex: 1,
  },
  variableKey: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  variableValue: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
  },
  addForm: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  textInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  addFormButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignSelf: 'center',
    marginBottom: 10,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});

export default CustomVariablesEditor;
