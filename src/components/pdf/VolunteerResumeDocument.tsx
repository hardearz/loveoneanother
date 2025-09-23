import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts for better typography
Font.register({
  family: 'Open Sans',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/opensans/v34/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4gaVc.woff2' },
    { src: 'https://fonts.gstatic.com/s/opensans/v34/memQYaGs126MiZpBA-UFUIcVXSCEkx2cmqvXlWq8tWZ0Pw86hd0Rk8ZkWVAewA.woff2', fontWeight: 'bold' }
  ]
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Open Sans',
    fontSize: 11,
    lineHeight: 1.4,
  },
  header: {
    marginBottom: 30,
    borderBottom: 2,
    borderBottomColor: '#2563eb',
    paddingBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  title: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 10,
  },
  contactInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 10,
    color: '#6b7280',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    borderBottom: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  statLabel: {
    fontSize: 9,
    color: '#6b7280',
    marginTop: 2,
  },
  taskItem: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 5,
    borderLeft: 3,
    borderLeftColor: '#10b981',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  taskTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  taskDate: {
    fontSize: 9,
    color: '#6b7280',
    marginLeft: 10,
  },
  taskDescription: {
    fontSize: 10,
    color: '#4b5563',
    marginBottom: 5,
    lineHeight: 1.3,
  },
  taskDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 9,
    color: '#6b7280',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
    borderTop: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
});

interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  luv_balance: number;
  created_at: string;
}

interface TaskData {
  id: string;
  title: string;
  description: string;
  location_address: string;
  reward_luvs: number;
  deadline: string;
  status: string;
  created_at: string;
  categories?: {
    name: string;
  };
}

interface VolunteerResumeProps {
  profile: ProfileData;
  completedTasks: TaskData[];
}

export const VolunteerResumeDocument: React.FC<VolunteerResumeProps> = ({ profile, completedTasks }) => {
  const totalLuvsEarned = completedTasks.reduce((sum, task) => sum + task.reward_luvs, 0);
  const totalTasks = completedTasks.length;
  const memberSince = new Date(profile.created_at).getFullYear();
  
  // Group tasks by category
  const tasksByCategory = completedTasks.reduce((acc, task) => {
    const category = task.categories?.name || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(task);
    return acc;
  }, {} as Record<string, TaskData[]>);

  const categories = Object.keys(tasksByCategory).length;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{profile.first_name} {profile.last_name}</Text>
          <Text style={styles.title}>Community Volunteer</Text>
          <View style={styles.contactInfo}>
            <Text>{profile.email}</Text>
            <Text>Member since {memberSince}</Text>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Volunteer Impact Summary</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalTasks}</Text>
              <Text style={styles.statLabel}>Tasks Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalLuvsEarned}</Text>
              <Text style={styles.statLabel}>LUVs Earned</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{categories}</Text>
              <Text style={styles.statLabel}>Categories</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile.luv_balance}</Text>
              <Text style={styles.statLabel}>Current Balance</Text>
            </View>
          </View>
        </View>

        {/* Completed Tasks by Category */}
        {totalTasks === 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>No Completed Tasks Yet</Text>
            <Text style={{ fontSize: 10, color: '#6b7280', textAlign: 'center', padding: 20 }}>
              Complete tasks to build your volunteer resume and showcase your community contributions.
            </Text>
          </View>
        ) : (
          Object.entries(tasksByCategory).map(([category, tasks]) => (
          <View key={category} style={styles.section}>
            <Text style={styles.sectionTitle}>{category} ({tasks.length} task{tasks.length !== 1 ? 's' : ''})</Text>
            {tasks.map((task) => (
              <View key={task.id} style={styles.taskItem}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskDate}>
                    {new Date(task.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.taskDescription}>
                  {task.description.length > 150 
                    ? `${task.description.substring(0, 150)}...` 
                    : task.description}
                </Text>
                <View style={styles.taskDetails}>
                  <Text>📍 {task.location_address}</Text>
                  <Text>💰 {task.reward_luvs} LUVs earned</Text>
                </View>
              </View>
            ))}
          </View>
          ))
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Generated from LOA Community Volunteer Platform • {new Date().toLocaleDateString()}
        </Text>
      </Page>
    </Document>
  );
};