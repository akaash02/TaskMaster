import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Icon } from 'react-native-elements';
import { ThemeContext } from '../navigation/AppNavigator';

const CircularDropdown = ({ icon, options, onSelect }) => {
  const { theme } = useContext(ThemeContext);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSelect = (option) => {
    onSelect(option);
    setIsModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.card, borderColor: theme.colors.text }]}
        onPress={() => setIsModalVisible(true)}
      >
        <Icon name={icon} type="material" size={30} color={theme.colors.text} />
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.option}
                onPress={() => handleSelect(option)}
              >
                <Text style={[styles.optionText, { color: theme.colors.text }]}>{option.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.option, styles.backButton]}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={[styles.optionText, { color: theme.colors.text }]}>Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    paddingTop: 13,
  },
  button: {
    borderRadius: 50,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 10,
    padding: 10,
  },
  option: {
    paddingVertical: 5,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 25,
  },
  backButton: {
    marginTop: 10,
  },
});

export default CircularDropdown;
