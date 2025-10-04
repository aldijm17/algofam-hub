// src/app/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import Header from '@/components/Header';
import StatsGrid from '@/components/StatsGrid';
import BottomNav from '@/components/BottomNav';
import Search from '@/components/Search';
import DetailModal from '@/components/DetailModal';
import { Task, Schedule } from '@/types/database';
import { requestNotificationPermission, subscribeToNewTaskNotifications } from '@/utils/notifications';

// Helper function to parse time string HH:MM
const parseTime = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('beranda');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // State for filters
  const [scheduleDayFilter, setScheduleDayFilter] = useState(new Date().toLocaleDateString('id-ID', { weekday: 'long' }));
  const [taskFilter, setTaskFilter] = useState<'all' | 'recent' | 'deadline'>('all');

  // State for Modal
  const [selectedItem, setSelectedItem] = useState<{ type: 'task' | 'schedule'; data: Task | Schedule } | null>(null);
  
  // State for class status colors
  const [scheduleStatuses, setScheduleStatuses] = useState<Record<number, string>>({});

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    if(!isRefreshing) setLoading(true);
    const [tasksRes, schedulesRes] = await Promise.all([
      supabase.from('tugas').select('*').order('deadline', { ascending: true }),
      supabase.from('jadwal').select('*').order('waktu_masuk', { ascending: true })
    ]);
    setTasks((tasksRes.data as Task[]) || []);
    setSchedules((schedulesRes.data as Schedule[]) || []);
    setLoading(false);
    setIsRefreshing(false);
  }, [isRefreshing]);

  // Initial data fetch and notification setup
  useEffect(() => {
    fetchData();
    requestNotificationPermission();
    
    // Subscribe to real-time new task inserts
    const channel = subscribeToNewTaskNotifications(supabase);
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  // Interval to update class status colors
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const newStatuses: Record<number, string> = {};
      schedules.forEach(schedule => {
        const startTime = parseTime(schedule.waktu_masuk);
        const endTime = parseTime(schedule.waktu_keluar);
        const tenMinutesBefore = new Date(startTime.getTime() - 10 * 60000);

        if (now >= tenMinutesBefore && now < startTime) {
          newStatuses[schedule.id] = 'upcoming'; // Biru
        } else if (now >= startTime && now <= endTime) {
          newStatuses[schedule.id] = 'ongoing'; // Hijau
        } else if (now > endTime && now.toDateString() === endTime.toDateString()) {
          newStatuses[schedule.id] = 'finished'; // Merah
        }
      });
      setScheduleStatuses(newStatuses);
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [schedules]);

  // Pull to refresh logic
  useEffect(() => {
    let startY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) startY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      if (window.scrollY === 0 && e.changedTouches[0].clientY > startY + 100) {
        setIsRefreshing(true);
        fetchData();
      }
    };
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [fetchData]);

  // Data for StatsGrid
  const pendingTasksCount = tasks.filter(t => t.status === 'belum').length;
  const todayClassesCount = schedules.filter(s => s.hari === new Date().toLocaleDateString('id-ID', { weekday: 'long' })).length;
  const totalCoursesCount = [...new Set([...schedules.map(s => s.mata_kuliah), ...tasks.map(t => t.matkul || '')])].length;
  const completionPercentage = tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'selesai').length / tasks.length) * 100) : 0;
  
  // Filtered data for rendering
  const filteredSchedules = schedules.filter(s => s.hari === scheduleDayFilter);
  const filteredTasks = tasks.filter(task => {
    if (taskFilter === 'recent') {
      const oneDayAgo = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
      return new Date(task.created_at) > oneDayAgo;
    }
    // Implement 'deadline' filter logic if needed
    return true;
  });


  const renderContent = () => {
    if (loading) return <div className="loading">Memuat data...</div>;

    switch (activeTab) {
      case 'beranda':
        return (
          <div key="beranda" className="page-content">
            <StatsGrid pendingTasks={pendingTasksCount} todayClasses={todayClassesCount} totalCourses={totalCoursesCount} completion={completionPercentage} />
            <div className="glass-card">
              <h2>Jadwal Hari Ini</h2>
              <div className="day-filter">
                {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].map(day => (
                  <button key={day} className={`day-btn ${scheduleDayFilter === day ? 'active' : ''}`} onClick={() => setScheduleDayFilter(day)}>{day}</button>
                ))}
              </div>
              {filteredSchedules.length > 0 ? filteredSchedules.map(schedule => (
                <div key={schedule.id} className={`list-item schedule-${scheduleStatuses[schedule.id] || 'default'}`} onClick={() => setSelectedItem({ type: 'schedule', data: schedule })}>
                  <div className="list-title">{schedule.mata_kuliah}</div>
                  <div className="list-meta">{schedule.waktu_masuk} - {schedule.waktu_keluar}</div>
                </div>
              )) : <p className="empty-state">Tidak ada jadwal untuk hari ini.</p>}
            </div>
             {/* Tugas filter bisa ditambahkan di sini juga */}
          </div>
        );
      case 'jadwal':
        return (
          <div key="jadwal" className="page-content">
            <div className="glass-card">
              <h2>Semua Jadwal</h2>
              {schedules.map(schedule => (
                 <div key={schedule.id} className={`list-item schedule-${scheduleStatuses[schedule.id] || 'default'}`} onClick={() => setSelectedItem({ type: 'schedule', data: schedule })}>
                  <div>
                    <div className="list-title">{schedule.mata_kuliah}</div>
                    <div className="list-meta">{schedule.hari}, {schedule.waktu_masuk}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'tugas':
        return (
          <div key="tugas" className="page-content">
            <div className="glass-card">
              <h2>Daftar Tugas</h2>
              <div className="task-filter">
                  <button className={`filter-btn ${taskFilter === 'all' ? 'active' : ''}`} onClick={() => setTaskFilter('all')}>Semua</button>
                  <button className={`filter-btn ${taskFilter === 'recent' ? 'active' : ''}`} onClick={() => setTaskFilter('recent')}>Terbaru</button>
              </div>
              {filteredTasks.map(task => (
                <div key={task.id} className="list-item" onClick={() => setSelectedItem({ type: 'task', data: task })}>
                  <div className="list-title">{task.tugas}</div>
                  <div className={`list-action ${task.status === 'belum' ? 'warning' : ''}`}>{task.status}</div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      {isRefreshing && <div className="pull-to-refresh-indicator show">Menyegarkan data...</div>}
      <Header />
      <Search tasks={tasks} schedules={schedules} />
      <main>{renderContent()}</main>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      {selectedItem && (
        <DetailModal
          item={selectedItem}
          allTasks={tasks}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}