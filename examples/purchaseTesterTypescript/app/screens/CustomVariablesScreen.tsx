import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useCustomVariables } from '../context/CustomVariablesContext';

const CustomVariablesScreen: React.FC = () => {
  const {
    customVariables,
    setCustomVariables,
    stringMapToCustomVariables,
    customVariablesToStringMap,
  } = useCustomVariables();

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [keyInput, setKeyInput] = useState('');
  const [valueInput, setValueInput] = useState('');

  const variablesList = Object.entries(customVariablesToStringMap(customVariables)).sort(
    (a, b) => a[0].localeCompare(b[0])
  );

  const isValidVariableName = (name: string): boolean => {
    if (!name) return false;
    return /^[a-zA-Z][a-zA-Z0-9_]*$/.test(name);
  };

  const handleAdd = () => {
    setKeyInput('');
    setValueInput('');
    setEditingKey(null);
    setIsAddModalVisible(true);
  };

  const handleEdit = (key: string, value: string) => {
    setKeyInput(key);
    setValueInput(value);
    setEditingKey(key);
    setIsAddModalVisible(true);
  };

  const handleDelete = (key: string) => {
    Alert.alert('Delete Variable', `Delete "${key}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const stringMap = customVariablesToStringMap(customVariables);
          delete stringMap[key];
          setCustomVariables(stringMapToCustomVariables(stringMap));
        },
      },
    ]);
  };

  const handleSave = () => {
    const key = keyInput.trim();
    const value = valueInput;

    if (!key) {
      Alert.alert('Error', 'Variable name is required');
      return;
    }

    if (!isValidVariableName(key)) {
      Alert.alert(
        'Error',
        'Variable name must start with a letter and contain only alphanumeric characters and underscores'
      );
      return;
    }

    const stringMap = customVariablesToStringMap(customVariables);

    // Check for duplicate keys (except when editing the same key)
    if (editingKey !== key && stringMap[key] !== undefined) {
      Alert.alert('Error', 'A variable with this name already exists');
      return;
    }

    // If editing and key changed, delete old key
    if (editingKey && editingKey !== key) {
      delete stringMap[editingKey];
    }

    stringMap[key] = value;
    setCustomVariables(stringMapToCustomVariables(stringMap));
    setIsAddModalVisible(false);
  };

  const renderItem = ({ item }: { item: [string, string] }) => {
    const [key, value] = item;
    return (
      <TouchableOpacity style={styles.item} onPress={() => handleEdit(key, value)}>
        <View style={styles.itemContent}>
          <Text style={styles.itemKey}>{key}</Text>
          <Text style={styles.itemValue} numberOfLines={1}>
            {value}
          </Text>
        </View>
        <View style={styles.itemActions}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>String</Text>
          </View>
          <TouchableOpacity onPress={() => handleDelete(key)} style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {variablesList.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>{'{ }'}</Text>
          <Text style={styles.emptyTitle}>No custom variables</Text>
          <Text style={styles.emptySubtitle}>Tap + to add a variable</Text>
          <Text style={styles.emptyHint}>
            Use {'{{ custom.variable_name }}'} in paywalls
          </Text>
        </View>
      ) : (
        <FlatList
          data={variablesList}
          renderItem={renderItem}
          keyExtractor={item => item[0]}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={handleAdd}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={isAddModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingKey ? 'Edit Variable' : 'Add Variable'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Variable name (e.g., player_name)"
              value={keyInput}
              onChangeText={setKeyInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              style={styles.input}
              placeholder="Value (e.g., John)"
              value={valueInput}
              onChangeText={setValueInput}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setIsAddModalVisible(false)}>
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleSave}>
                <Text style={styles.modalButtonTextPrimary}>
                  {editingKey ? 'Save' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    fontSize: 48,
    color: '#ccc',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  emptyHint: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
  },
  item: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
  },
  itemKey: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  itemValue: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeBadge: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  typeBadgeText: {
    fontSize: 12,
    color: '#007AFF',
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 24,
    color: '#FF3B30',
    fontWeight: '300',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    fontSize: 32,
    color: 'white',
    fontWeight: '300',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  modalButtonPrimary: {
    backgroundColor: '#007AFF',
  },
  modalButtonTextCancel: {
    color: '#007AFF',
    fontSize: 16,
  },
  modalButtonTextPrimary: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CustomVariablesScreen;
