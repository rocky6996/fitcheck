import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  ScrollView 
} from 'react-native';

const GoalSettingModal = ({ visible, onClose, onSave, currentGoal, currentSteps }) => {
  const [stepGoal, setStepGoal] = useState(currentGoal?.toString() || '10000');

  const calculateProgress = () => {
    return Math.min((currentSteps / parseInt(stepGoal)) * 100, 100).toFixed(1);
  };

  const renderGoalPresets = () => {
    const presets = [5000, 7500, 10000, 12500, 15000];
    return (
      <View style={styles.presetsContainer}>
        <Text style={styles.presetsTitle}>Quick Goals</Text>
        <View style={styles.presetButtons}>
          {presets.map((preset) => (
            <TouchableOpacity
              key={preset}
              style={[
                styles.presetButton,
                parseInt(stepGoal) === preset && styles.activePresetButton
              ]}
              onPress={() => setStepGoal(preset.toString())}
            >
              <Text style={styles.presetButtonText}>{preset.toLocaleString()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Set Daily Step Goal</Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${calculateProgress()}%` }
                ]} 
              />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressText}>
                {currentSteps?.toLocaleString() || '0'} steps
              </Text>
              <Text style={styles.progressText}>
                {calculateProgress()}%
              </Text>
            </View>
          </View>

          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={stepGoal}
            onChangeText={setStepGoal}
            placeholder="Enter step goal"
            placeholderTextColor="#666"
          />

          {renderGoalPresets()}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={() => {
                onSave(parseInt(stepGoal));
                onClose();
              }}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#2d2d2d',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#76C7C0',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    color: '#76C7C0',
    fontSize: 14,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#2d2d2d',
    borderRadius: 10,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  presetsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  presetsTitle: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  presetButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  presetButton: {
    backgroundColor: '#2d2d2d',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    width: '48%',
  },
  activePresetButton: {
    backgroundColor: '#76C7C0',
  },
  presetButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    borderRadius: 10,
    padding: 15,
    width: '45%',
  },
  cancelButton: {
    backgroundColor: '#2d2d2d',
  },
  saveButton: {
    backgroundColor: '#76C7C0',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GoalSettingModal; 