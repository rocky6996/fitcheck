import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, SafeAreaView, Modal } from 'react-native';
import { Pedometer } from 'expo-sensors';
import * as Location from 'expo-location';
import CircularProgress from 'react-native-circular-progress-indicator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import GoalSettingModal from '../components/GoalSettingModal';

const PedometerScreen = () => {
  const [stepCount, setStepCount] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [distanceCovered, setDistanceCovered] = useState(0);
  const [moveMinutes, setMoveMinutes] = useState(0);
  const [locationPermission, setLocationPermission] = useState(false);
  const [achievedDays, setAchievedDays] = useState(0);
  const [isGoalModalVisible, setIsGoalModalVisible] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(10000);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [isAchievementsModalVisible, setIsAchievementsModalVisible] = useState(false);
  const [totalDistance, setTotalDistance] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [achievements, setAchievements] = useState({
    distances: [
      { id: 'nyc_wash', title: 'New York to Washington', km: 450, unlocked: false },
      { id: '800km', title: 'Eight Hundred Kilometers', km: 800, unlocked: false },
      { id: 'europe', title: 'Across Europe', km: 1900, unlocked: false },
      { id: 'earth_core', title: "To Earth's Core", km: 6350, unlocked: false }
    ],
    steps: [
      { id: 'first_1k', title: 'First 1,000 Steps', steps: 1000, unlocked: false },
      { id: 'step_master', title: 'Step Master', steps: 10000, unlocked: false },
      { id: 'marathon', title: 'Marathon Walker', steps: 50000, unlocked: false },
      { id: 'step_legend', title: 'Step Legend', steps: 100000, unlocked: false }
    ],
    streaks: [
      { id: 'week_streak', title: '7 Day Streak', days: 7, unlocked: false },
      { id: 'month_streak', title: 'Monthly Dedication', days: 30, unlocked: false },
      { id: 'quarter_streak', title: 'Quarterly Champion', days: 90, unlocked: false },
      { id: 'year_streak', title: 'Year of Fitness', days: 365, unlocked: false }
    ],
    keyMoments: [
      { id: 'first_exercise', title: 'First Exercise', icon: 'walk', unlocked: true },
      { id: 'step_goal', title: 'Step Goal', icon: 'speedometer', unlocked: false },
      { id: 'new_record', title: 'New Record', icon: 'trophy', unlocked: false },
      { id: 'complete_sweep', title: 'Complete Sweep', icon: 'ribbon', unlocked: false }
    ]
  });
  const [userMetrics, setUserMetrics] = useState({
    weight: 70, // default values
    height: 170,
    age: 30,
    gender: 'male'
  });
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [lastSavedDate, setLastSavedDate] = useState(null);

  useEffect(() => {
    setupPedometer();
    loadLastSavedStats();
  }, []);

  useEffect(() => {
    // Check for achievements when steps change
    checkAchievements(stepCount);
  }, [stepCount]);

  const setupPedometer = () => {
    const subscription = Pedometer.watchStepCount(result => {
      setStepCount(result.steps);
      calculateStats(result.steps);
      updateStreak(result.steps);
    });

    return () => subscription && subscription.remove();
  };

  const loadStreakData = async () => {
    try {
      const streak = await AsyncStorage.getItem('currentStreak');
      const best = await AsyncStorage.getItem('bestStreak');
      if (streak) setCurrentStreak(parseInt(streak));
      if (best) setBestStreak(parseInt(best));
    } catch (error) {
      console.error('Error loading streak data:', error);
    }
  };

  const updateStreak = async (steps) => {
    try {
      const lastUpdate = await AsyncStorage.getItem('lastUpdateDate');
      const today = new Date().toDateString();

      if (steps >= dailyGoal) {
        if (lastUpdate !== today) {
          const newStreak = currentStreak + 1;
          setCurrentStreak(newStreak);
          if (newStreak > bestStreak) {
            setBestStreak(newStreak);
            await AsyncStorage.setItem('bestStreak', newStreak.toString());
          }
          await AsyncStorage.setItem('currentStreak', newStreak.toString());
          await AsyncStorage.setItem('lastUpdateDate', today);
        }
      } else if (lastUpdate !== today) {
        setCurrentStreak(0);
        await AsyncStorage.setItem('currentStreak', '0');
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  const loadAchievements = async () => {
    try {
      const savedAchievements = await AsyncStorage.getItem('achievements');
      const savedDistance = await AsyncStorage.getItem('totalDistance');
      const savedTotalSteps = await AsyncStorage.getItem('totalSteps');
      
      if (savedAchievements) {
        setAchievements(JSON.parse(savedAchievements));
      }
      if (savedDistance) {
        setTotalDistance(parseFloat(savedDistance));
      }
      if (savedTotalSteps) {
        setTotalSteps(parseInt(savedTotalSteps));
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const checkAchievements = async (steps) => {
    const newAchievements = [...achievements];
    const milestones = [
      { id: 'beginner', steps: 5000, icon: 'star-outline', title: 'Beginner Walker' },
      { id: 'intermediate', steps: 10000, icon: 'star-half', title: 'Regular Walker' },
      { id: 'advanced', steps: 20000, icon: 'star', title: 'Star Walker' },
      { id: 'expert', steps: 30000, icon: 'trophy', title: 'Expert Walker' },
    ];

    let achievementAdded = false;
    milestones.forEach(milestone => {
      if (steps >= milestone.steps && !achievements.find(a => a.id === milestone.id)) {
        newAchievements.push(milestone);
        achievementAdded = true;
      }
    });

    if (achievementAdded) {
      setAchievements(newAchievements);
      await AsyncStorage.setItem('achievements', JSON.stringify(newAchievements));
    }
  };

  const setupLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const loadUserMetrics = async () => {
    try {
      const savedMetrics = await AsyncStorage.getItem('userMetrics');
      if (savedMetrics) {
        setUserMetrics(JSON.parse(savedMetrics));
      }
    } catch (error) {
      console.error('Error loading user metrics:', error);
    }
  };

  const loadLastSavedDate = async () => {
    try {
      const savedDate = await AsyncStorage.getItem('lastPedometerSaveDate');
      if (savedDate) {
        setLastSavedDate(new Date(savedDate));
      }
    } catch (error) {
      console.error('Error loading last saved date:', error);
    }
  };

  const loadLastSavedStats = async () => {
    try {
      const statsData = await AsyncStorage.getItem('activityStats');
      if (statsData) {
        const stats = JSON.parse(statsData);
        // Initialize with saved stats
        setStepCount(stats.totalSteps || 0);
        setCaloriesBurned(stats.totalCalories || 0);
        setDistanceCovered(stats.totalDistance || 0);
      }
    } catch (error) {
      console.error('Error loading saved stats:', error);
    }
  };

  const updateActivityStats = async (steps, calories, distance) => {
    try {
      const statsData = await AsyncStorage.getItem('activityStats');
      const currentStats = statsData ? JSON.parse(statsData) : {
        totalSteps: 0,
        totalCalories: 0,
        totalDistance: 0,
        bestStreak: 0
      };

      const newStats = {
        totalSteps: currentStats.totalSteps + steps,
        totalCalories: currentStats.totalCalories + calories,
        totalDistance: currentStats.totalDistance + distance,
        bestStreak: Math.max(currentStats.bestStreak, currentStreak)
      };

      await AsyncStorage.setItem('activityStats', JSON.stringify(newStats));
    } catch (error) {
      console.error('Error updating activity stats:', error);
    }
  };

  const onStepCountUpdate = (result) => {
    const newSteps = result.steps;
    const newCalories = calculateCalories(newSteps);
    const newDistance = calculateDistance(newSteps);
    
    setStepCount(newSteps);
    setCaloriesBurned(newCalories);
    setDistanceCovered(newDistance);
    
    updateActivityStats(newSteps, newCalories, newDistance);
  };

  // Calculate BMR using Harris-Benedict equation
  const calculateBMR = () => {
    const { weight, height, age, gender } = userMetrics;
    if (gender.toLowerCase() === 'male') {
      return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
  };

  const calculateStats = (steps) => {
    // Calculate calories based on BMR and activity
    const bmr = calculateBMR();
    const activeMinutes = Math.round(steps / 100);
    const metValue = 3.5; // MET value for walking at moderate pace
    const caloriesPerMinute = (metValue * 3.5 * userMetrics.weight) / 200;
    const activeCalories = Math.round(caloriesPerMinute * activeMinutes);
    const bmrCalories = Math.round((bmr / 24) * (activeMinutes / 60));
    const totalCalories = activeCalories + bmrCalories;
    
    setCaloriesBurned(totalCalories);

    // Calculate distance based on stride length (which varies by height)
    const strideLength = userMetrics.height * 0.414 / 100; // stride length in meters based on height
    const distanceInKm = ((steps * strideLength) / 1000).toFixed(2);
    setDistanceCovered(distanceInKm);

    setMoveMinutes(activeMinutes);
  };

  const handleSaveGoal = async (newGoal) => {
    setDailyGoal(newGoal);
    try {
      await AsyncStorage.setItem('dailyGoal', newGoal.toString());
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  const updateAchievements = async (steps) => {
    const distanceInKm = (steps * 0.762) / 1000;
    const newTotalDistance = totalDistance + distanceInKm;
    const newTotalSteps = totalSteps + steps;
    
    setTotalDistance(newTotalDistance);
    setTotalSteps(newTotalSteps);

    const updatedAchievements = { ...achievements };
    
    // Update distance achievements
    updatedAchievements.distances = updatedAchievements.distances.map(achievement => ({
      ...achievement,
      unlocked: newTotalDistance >= achievement.km
    }));

    // Update steps achievements
    updatedAchievements.steps = updatedAchievements.steps.map(achievement => ({
      ...achievement,
      unlocked: newTotalSteps >= achievement.steps
    }));

    // Update streak achievements
    updatedAchievements.streaks = updatedAchievements.streaks.map(achievement => ({
      ...achievement,
      unlocked: currentStreak >= achievement.days
    }));

    // Update key moments
    if (steps >= dailyGoal && !updatedAchievements.keyMoments[1].unlocked) {
      updatedAchievements.keyMoments[1].unlocked = true;
    }
    
    // Check for new record
    if (steps > bestStreak && !updatedAchievements.keyMoments[2].unlocked) {
      updatedAchievements.keyMoments[2].unlocked = true;
    }

    // Check for complete sweep (all achievements unlocked)
    const allUnlocked = [
      ...updatedAchievements.distances,
      ...updatedAchievements.steps,
      ...updatedAchievements.streaks,
      ...updatedAchievements.keyMoments.slice(0, -1)
    ].every(achievement => achievement.unlocked);

    if (allUnlocked) {
      updatedAchievements.keyMoments[3].unlocked = true;
    }

    setAchievements(updatedAchievements);
    await AsyncStorage.setItem('achievements', JSON.stringify(updatedAchievements));
    await AsyncStorage.setItem('totalDistance', newTotalDistance.toString());
    await AsyncStorage.setItem('totalSteps', newTotalSteps.toString());
  };

  const renderMetricsRow = () => (
    <View style={styles.metricsRow}>
      <View style={styles.metricBox}>
        <View style={styles.metricContent}>
          <Text style={styles.metricValue}>{caloriesBurned}</Text>
          <Text style={styles.metricLabel}>Calories</Text>
        </View>
      </View>
      <View style={styles.metricDivider} />
      <View style={styles.metricBox}>
        <View style={styles.metricContent}>
          <Text style={styles.metricValue}>{distanceCovered}</Text>
          <Text style={styles.metricLabel}>Kilometers</Text>
        </View>
      </View>
      <View style={styles.metricDivider} />
      <View style={styles.metricBox}>
        <View style={styles.metricContent}>
          <Text style={styles.metricValue}>{moveMinutes}</Text>
          <Text style={styles.metricLabel}>Move Min</Text>
        </View>
      </View>
    </View>
  );

  const renderStreak = () => (
    <View style={styles.streakContainer}>
      <View style={styles.streakBox}>
        <Icon name="flame" size={24} color="#FF6B6B" />
        <Text style={styles.streakCount}>{currentStreak}</Text>
        <Text style={styles.streakLabel}>Day Streak</Text>
      </View>
      <View style={styles.streakBox}>
        <Icon name="trophy" size={24} color="#FFD700" />
        <Text style={styles.streakCount}>{bestStreak}</Text>
        <Text style={styles.streakLabel}>Best Streak</Text>
      </View>
    </View>
  );

  const renderAchievementsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isAchievementsModalVisible}
      onRequestClose={() => setIsAchievementsModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setIsAchievementsModalVisible(false)}
            >
              <Icon name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Achievements</Text>
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalScrollContent}
          >
            <View style={styles.achievementsSection}>
              <Text style={styles.categoryTitle}>Distance Milestones</Text>
              <View style={styles.achievementGrid}>
                {achievements.distances.map((achievement, index) => (
                  <View key={index} style={styles.achievementBox}>
                    <View style={[styles.medalCircle, achievement.unlocked && styles.medalUnlocked]}>
                      <Text style={styles.distanceText}>{achievement.km}km</Text>
                    </View>
                    <Text style={[styles.achievementTitle, !achievement.unlocked && styles.lockedText]}>
                      {achievement.title}
                    </Text>
                  </View>
                ))}
              </View>

              <Text style={styles.categoryTitle}>Step Goals</Text>
              <View style={styles.achievementGrid}>
                {achievements.steps.map((achievement, index) => (
                  <View key={index} style={styles.achievementBox}>
                    <View style={[styles.medalCircle, achievement.unlocked && styles.medalUnlocked]}>
                      <Text style={styles.stepsText}>{(achievement.steps/1000).toFixed(0)}k</Text>
                    </View>
                    <Text style={[styles.achievementTitle, !achievement.unlocked && styles.lockedText]}>
                      {achievement.title}
                    </Text>
                  </View>
                ))}
              </View>

              <Text style={styles.categoryTitle}>Streaks</Text>
              <View style={styles.achievementGrid}>
                {achievements.streaks.map((achievement, index) => (
                  <View key={index} style={styles.achievementBox}>
                    <View style={[styles.medalCircle, achievement.unlocked && styles.medalUnlocked]}>
                      <Text style={styles.daysText}>{achievement.days}d</Text>
                    </View>
                    <Text style={[styles.achievementTitle, !achievement.unlocked && styles.lockedText]}>
                      {achievement.title}
                    </Text>
                  </View>
                ))}
              </View>

              <Text style={styles.categoryTitle}>Key Moments</Text>
              <View style={styles.achievementGrid}>
                {achievements.keyMoments.map((moment, index) => (
                  <View key={index} style={styles.achievementBox}>
                    <View style={[styles.medalCircle, moment.unlocked && styles.medalUnlocked]}>
                      <Icon name={moment.icon} size={28} color={moment.unlocked ? "#fff" : "#666"} />
                    </View>
                    <Text style={[styles.achievementTitle, !moment.unlocked && styles.lockedText]}>
                      {moment.title}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.bottomSpacing} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.circularProgressContainer}>
            <CircularProgress
              value={stepCount}
              maxValue={dailyGoal}
              radius={80}
              duration={2000}
              progressValueColor={'#fff'}
              activeStrokeColor={'#76C7C0'}
              inActiveStrokeColor={'#2d2d2d'}
              title={'Steps'}
              titleColor={'#fff'}
              titleStyle={{ fontWeight: 'bold' }}
            />
          </View>

          {renderMetricsRow()}
          {renderStreak()}

          <TouchableOpacity 
            style={styles.achievementsContainer}
            onPress={() => setIsAchievementsModalVisible(true)}
          >
            <Text style={styles.sectionTitle}>Achievements</Text>
            <View style={styles.achievementsPreview}>
              <Icon name="trophy" size={24} color="#FFD700" />
              <Text style={styles.achievementsCount}>
                {[
                  ...achievements.distances,
                  ...achievements.steps,
                  ...achievements.streaks,
                  ...achievements.keyMoments
                ].filter(a => a.unlocked).length} / {
                  achievements.distances.length +
                  achievements.steps.length +
                  achievements.streaks.length +
                  achievements.keyMoments.length
                }
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.goalsContainer}
            onPress={() => setIsGoalModalVisible(true)}
          >
            <Text style={styles.sectionTitle}>Your daily goals</Text>
            <Text style={styles.subTitle}>Last 7 days</Text>
            <Text style={styles.achievementText}>{achievedDays}/7 Achieved</Text>
            <View style={styles.weekDays}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                <View key={index} style={styles.dayIndicator}>
                  <View style={[styles.dayDot, index < achievedDays && styles.dayDotActive]} />
                  <Text style={styles.dayText}>{day}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomSpacing} />
      </ScrollView>

      <GoalSettingModal
        visible={isGoalModalVisible}
        onClose={() => setIsGoalModalVisible(false)}
        onSave={handleSaveGoal}
        currentGoal={dailyGoal}
        currentSteps={stepCount}
      />
      {renderAchievementsModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  container: {
    flex: 1,
  },
  circularProgressContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
    backgroundColor: '#161b22',
    borderRadius: 15,
    padding: 15,
  },
  metricBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  metricContent: {
    alignItems: 'center',
    width: '100%',
  },
  metricValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricLabel: {
    color: '#76C7C0',
    fontSize: 14,
  },
  metricDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#2d2d2d',
    marginHorizontal: 10,
  },
  goalsContainer: {
    backgroundColor: '#161b22',
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  subTitle: {
    color: '#666',
    fontSize: 14,
  },
  achievementText: {
    color: '#76C7C0',
    fontSize: 16,
    marginVertical: 10,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  dayIndicator: {
    alignItems: 'center',
  },
  dayDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2d2d2d',
    marginBottom: 5,
  },
  dayDotActive: {
    backgroundColor: '#76C7C0',
  },
  dayText: {
    color: '#fff',
    fontSize: 12,
  },
  streakContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#161b22',
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
  },
  streakBox: {
    flex: 1,
    alignItems: 'center',
  },
  streakCount: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  streakLabel: {
    color: '#76C7C0',
    fontSize: 14,
  },
  achievementsContainer: {
    backgroundColor: '#161b22',
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
  },
  achievementsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  achievementsCount: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  modalContent: {
    flex: 1,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  closeButton: {
    padding: 5,
  },
  achievementsSection: {
    marginTop: 10,
  },
  categoryTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 20,
  },
  achievementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementBox: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 20,
  },
  medalCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#21262d',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  medalUnlocked: {
    backgroundColor: '#76C7C0',
  },
  distanceText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepsText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  daysText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  achievementTitle: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  lockedText: {
    color: '#666',
  },
  modalScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  bottomSpacing: {
    height: 60,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#76C7C0',
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  saveModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  saveModalContent: {
    backgroundColor: '#21262d',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  saveModalText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  lastSavedText: {
    color: '#666',
    fontSize: 14,
    marginTop: 5,
  },
});

export default PedometerScreen;
