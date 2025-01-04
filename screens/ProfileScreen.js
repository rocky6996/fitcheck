import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Modal,
  Platform,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const [profileData, setProfileData] = useState({
    steps: '',
    heartPoints: '',
    gender: '',
    birthday: '',
    weight: '',
    height: '',
  });
  const [activityStats, setActivityStats] = useState({
    totalSteps: 0,
    totalCalories: 0,
    totalDistance: 0,
    bestStreak: 0,
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editMode, setEditMode] = useState({
    steps: false,
    heartPoints: false,
    weight: false,
    height: false,
  });

  useEffect(() => {
    loadProfileData();
    loadActivityStats();
  }, []);

  const loadProfileData = async () => {
    try {
      const savedData = await AsyncStorage.getItem('profileData');
      if (savedData) {
        setProfileData(JSON.parse(savedData));
        if (savedData.birthday) {
          setSelectedDate(new Date(savedData.birthday));
        }
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const loadActivityStats = async () => {
    try {
      const statsData = await AsyncStorage.getItem('activityStats');
      if (statsData) {
        setActivityStats(JSON.parse(statsData));
      }
    } catch (error) {
      console.error('Error loading activity stats:', error);
    }
  };

  const updateMetrics = async (newData) => {
    try {
      const userMetrics = {
        weight: parseFloat(newData.weight),
        height: parseFloat(newData.height),
        gender: newData.gender.toLowerCase(),
        age: calculateAge(newData.birthday),
        dailyGoal: parseInt(newData.steps),
      };
      await AsyncStorage.setItem('userMetrics', JSON.stringify(userMetrics));
    } catch (error) {
      console.error('Error updating metrics:', error);
    }
  };

  const saveProfileData = async (newData) => {
    try {
      const updatedData = { ...profileData, ...newData };
      await AsyncStorage.setItem('profileData', JSON.stringify(updatedData));
      setProfileData(updatedData);
      await updateMetrics(updatedData);
    } catch (error) {
      console.error('Error saving profile data:', error);
    }
  };

  const calculateAge = (birthday) => {
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const renderEditableField = (label, field, unit = '') => {
    return (
      <TouchableOpacity 
        style={styles.settingItem} 
        onPress={() => setEditMode({ ...editMode, [field]: true })}
      >
        <Text style={styles.settingLabel}>{label}</Text>
        <View style={styles.settingValueContainer}>
          {editMode[field] ? (
            <TextInput
              style={styles.input}
              value={profileData[field].toString()}
              onChangeText={(text) => {
                setProfileData({ ...profileData, [field]: text });
              }}
              onBlur={() => {
                setEditMode({ ...editMode, [field]: false });
                saveProfileData({ [field]: profileData[field] });
              }}
              keyboardType="numeric"
              autoFocus
            />
          ) : (
            <>
              <Text style={styles.settingValue}>
                {profileData[field] || 'Set'} {unit}
              </Text>
              <Ionicons name="pencil" size={20} color="#666" />
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderGenderSelector = () => (
    <TouchableOpacity style={styles.settingItem}>
      <Text style={styles.settingLabel}>Gender</Text>
      <View style={styles.genderButtons}>
        <TouchableOpacity
          style={[
            styles.genderButton,
            profileData.gender === 'Male' && styles.activeGenderButton
          ]}
          onPress={() => saveProfileData({ gender: 'Male' })}
        >
          <Text style={styles.genderButtonText}>Male</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.genderButton,
            profileData.gender === 'Female' && styles.activeGenderButton
          ]}
          onPress={() => saveProfileData({ gender: 'Female' })}
        >
          <Text style={styles.genderButtonText}>Female</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderDatePicker = () => {
    const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    return (
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.datePickerContainer}>
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>Select Birthday</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.datePickerContent}>
              <ScrollView 
                style={styles.datePickerColumn}
                showsVerticalScrollIndicator={false}
              >
                {months.map((month, index) => (
                  <TouchableOpacity
                    key={month}
                    style={[
                      styles.dateOption,
                      selectedDate.getMonth() === index && styles.selectedDateOption
                    ]}
                    onPress={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setMonth(index);
                      setSelectedDate(newDate);
                    }}
                  >
                    <Text style={[
                      styles.dateOptionText,
                      selectedDate.getMonth() === index && styles.selectedDateOptionText
                    ]}>{month}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <ScrollView 
                style={styles.datePickerColumn}
                showsVerticalScrollIndicator={false}
              >
                {days.map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dateOption,
                      selectedDate.getDate() === day && styles.selectedDateOption
                    ]}
                    onPress={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setDate(day);
                      setSelectedDate(newDate);
                    }}
                  >
                    <Text style={[
                      styles.dateOptionText,
                      selectedDate.getDate() === day && styles.selectedDateOptionText
                    ]}>{day}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <ScrollView 
                style={styles.datePickerColumn}
                showsVerticalScrollIndicator={false}
              >
                {years.map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.dateOption,
                      selectedDate.getFullYear() === year && styles.selectedDateOption
                    ]}
                    onPress={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setFullYear(year);
                      setSelectedDate(newDate);
                    }}
                  >
                    <Text style={[
                      styles.dateOptionText,
                      selectedDate.getFullYear() === year && styles.selectedDateOptionText
                    ]}>{year}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => {
                const dateString = selectedDate.toISOString().split('T')[0];
                saveProfileData({ birthday: dateString });
                setShowDatePicker(false);
              }}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const renderActivityStats = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Activity Statistics</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="footsteps" size={24} color="#76C7C0" />
          <Text style={styles.statValue}>{activityStats.totalSteps.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Steps</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="flame" size={24} color="#76C7C0" />
          <Text style={styles.statValue}>{activityStats.totalCalories.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Calories Burned</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="map" size={24} color="#76C7C0" />
          <Text style={styles.statValue}>{activityStats.totalDistance.toFixed(1)} km</Text>
          <Text style={styles.statLabel}>Distance</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="trophy" size={24} color="#76C7C0" />
          <Text style={styles.statValue}>{activityStats.bestStreak}</Text>
          <Text style={styles.statLabel}>Best Streak</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Profile</Text>

        {renderActivityStats()}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity goals</Text>
          {renderEditableField('Steps', 'steps', 'steps')}
          {renderEditableField('Heart Points', 'heartPoints', 'points')}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About you</Text>
          {renderGenderSelector()}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.settingLabel}>Birthday</Text>
            <View style={styles.settingValueContainer}>
              <Text style={styles.settingValue}>
                {profileData.birthday ? new Date(profileData.birthday).toLocaleDateString() : 'Set date'}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#666" />
            </View>
          </TouchableOpacity>
          {renderEditableField('Weight', 'weight', 'kg')}
          {renderEditableField('Height', 'height', 'cm')}
        </View>

        <View style={styles.bottomSpacing} />
        {renderDatePicker()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
    padding: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
  },
  section: {
    backgroundColor: '#161b22',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d2d',
  },
  settingLabel: {
    fontSize: 16,
    color: '#fff',
  },
  settingValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  input: {
    color: '#fff',
    fontSize: 16,
    padding: 4,
    minWidth: 60,
    textAlign: 'right',
    borderBottomWidth: 1,
    borderBottomColor: '#76C7C0',
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  genderButton: {
    backgroundColor: '#21262d',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeGenderButton: {
    backgroundColor: '#76C7C0',
  },
  genderButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContainer: {
    width: width * 0.9,
    backgroundColor: '#161b22',
    borderRadius: 15,
    padding: 20,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  datePickerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 4,
  },
  datePickerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 200,
    marginBottom: 20,
  },
  datePickerColumn: {
    flex: 1,
    marginHorizontal: 4,
  },
  dateOption: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    marginVertical: 2,
    width: '100%',
  },
  selectedDateOption: {
    backgroundColor: '#76C7C0',
  },
  dateOptionText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    width: '100%',
    flexShrink: 1,
  },
  selectedDateOptionText: {
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#76C7C0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  statCard: {
    backgroundColor: '#21262d',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    marginBottom: 10,
  },
  statValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default ProfileScreen; 