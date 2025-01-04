import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Constants from 'expo-constants';

const VersionDisplay = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.versionText}>
        Version {Constants.manifest.version}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    color: '#666',
    fontSize: 14,
  },
});

export default VersionDisplay; 