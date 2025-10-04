// src/app/page.tsx
'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import Header from '@/components/Header';
import StatsGrid from '@/components/StatsGrid';
import BottomNav from '@/components/BottomNav';
import Search from '@/components/Search';
import { Task, Schedule } from '@/types/database';
import { requestNotificationPermission, subscribeToNewTaskNotifications } from '@/utils/notifications';

// Helper function to parse time string HH:MM. Placed outside component.
const parseTime = (timeStr: string) => {
  if (!timeStr || !timeStr.includes(':')) return new Date(0); // Return a default invalid date
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
  const [taskFilter, setTaskFilter] = useState<'all' | 'recent'>('all');

  // State for expanded dropdown item
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  
  // State for class status colors
  const [scheduleStatuses, setScheduleStatuses] = useState<Record<number, string>>({});

  // Refs for parallax effect
  const appContainerRef = useRef<HTMLDivElement>(null);
  const headerContainerRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  // Handler for clicking a list item to expand/collapse details
  const handleItemClick = (type: 'task' | 'schedule', id: number) => {
    const itemId = `${type}-${id}`;
    setExpandedItemId(prevId => (prevId === itemId ? null : itemId));
  };

  const fetchData = useCallback(async () => {
    if(!isRefreshing) setLoading(true);
    const [tasksRes, schedulesRes] = await Promise.all([
      supabase.from('tugas').select('*').order('deadline', { ascending: true }),
      supabase.from('jadwal').select('*').order('waktu_masuk', { ascending: true })
    ]);
    setTasks((tasksRes.data as Task[]) || []);
    setSchedules((schedulesRes.data as Schedule[]) || []);
    setLoading(false);
    if(isRefreshing) setIsRefreshing(false);
  }, [isRefreshing]);

  // Initial data fetch, notification, and parallax setup
  useEffect(() => {
    fetchData();
    requestNotificationPermission();
    
    const channel = subscribeToNewTaskNotifications(supabase);

    const handleScroll = () => {
      const container = appContainerRef.current;
      const header = headerContainerRef.current;
      if (container && header) {
        const scrollTop = container.scrollTop;
        // Move header at half the scroll speed for a parallax effect
        header.style.transform = `translateY(${scrollTop * 0.5}px)`;
      }
    };
    
    const container = appContainerRef.current;
    container?.addEventListener('scroll', handleScroll);

    return () => {
      supabase.removeChannel(channel);
      container?.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Interval to update class status colors
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const newStatuses: Record<number, string> = {};
      const today = now.toLocaleDateString('id-ID', { weekday: 'long' });

      schedules.forEach(schedule => {
        if (schedule.hari !== today) return;

        const startTime = parseTime(schedule.waktu_masuk);
        const endTime = parseTime(schedule.waktu_keluar);
        const tenMinutesBefore = new Date(startTime.getTime() - 10 * 60000);

        if (now >= tenMinutesBefore && now < startTime) newStatuses[schedule.id] = 'upcoming';
        else if (now >= startTime && now <= endTime) newStatuses[schedule.id] = 'ongoing';
        else if (now > endTime && now.toDateString() === endTime.toDateString()) newStatuses[schedule.id] = 'finished';
      });
      setScheduleStatuses(newStatuses);
    }, 10000);

    return () => clearInterval(interval);
  }, [schedules]);

  // Pull to refresh logic
  useEffect(() => {
    let startY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (appContainerRef.current?.scrollTop === 0) startY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      if (appContainerRef.current?.scrollTop === 0 && e.changedTouches[0].clientY > startY + 100) {
        setIsRefreshing(true);
        fetchData();
      }
    };
    const container = appContainerRef.current;
    container?.addEventListener('touchstart', handleTouchStart);
    container?.addEventListener('touchend', handleTouchEnd);
    return () => {
      container?.removeEventListener('touchstart', handleTouchStart);
      container?.removeEventListener('touchend', handleTouchEnd);
    };
  }, [fetchData]);

  // Data calculations
  const pendingTasks = tasks.filter(t => t.status === 'belum');
  const completionPercentage = tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'selesai').length / tasks.length) * 100) : 0;
  
  // Main render function
  const renderContent = () => {
    if (loading) return <div className="loading">Memuat data...</div>;

    const filteredSchedules = schedules.filter(s => s.hari === scheduleDayFilter);
    const filteredTasks = tasks.filter(task => {
        if (taskFilter === 'recent') {
          const oneDayAgo = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
          return new Date(task.created_at) > oneDayAgo;
        }
        return true;
    });
    const nextThreePendingTasks = pendingTasks.slice(0, 3);
    
    // Helper components for dropdown details
    const renderTaskDetails = (task: Task) => (
        <div className="list-item-details">
            <div className="detail-field"><strong>Mata Kuliah:</strong> {task.matkul}</div>
            <div className="detail-field"><strong>Deadline:</strong> {new Date(task.deadline).toLocaleDateString('id-ID')}</div>
            <div className="detail-field"><strong>Status:</strong> {task.status}</div>
            <hr/>
            <div className="detail-field"><strong>Deskripsi:</strong> {task.deskripsi || '-'}</div>
        </div>
    );

    const renderScheduleDetails = (schedule: Schedule) => {
        const relatedTasks = tasks.filter(task => task.matkul === schedule.mata_kuliah);
        return (
            <div className="list-item-details">
                <div className="detail-field"><strong>Dosen:</strong> {schedule.dosen}</div>
                <div className="detail-field"><strong>Waktu:</strong> {schedule.hari}, {schedule.waktu_masuk} - {schedule.waktu_keluar}</div>
                <div className="detail-field"><strong>Ruang:</strong> {schedule.ruang}</div>
                <hr />
                <strong>Tugas Terkait:</strong>
                {relatedTasks.length > 0 ? relatedTasks.map(task => (
                <div key={task.id} className="list-item-mini">{task.tugas}</div>
                )) : <p style={{marginTop: '0.5rem', fontSize: '0.9rem'}}>Tidak ada tugas terkait.</p>}
            </div>
        );
    };

    switch (activeTab) {
      case 'beranda':
        return (
          <div key="beranda" className="page-content">
            <StatsGrid 
              pendingTasks={pendingTasks.length} 
              todayClasses={schedules.filter(s => s.hari === new Date().toLocaleDateString('id-ID', { weekday: 'long' })).length}
              totalCourses={[...new Set([...schedules.map(s => s.mata_kuliah), ...tasks.map(t => t.matkul || '')])].length}
              completion={completionPercentage} 
            />
            <div className="progress-container glass-card">
                <div className="progress-label">
                    <span>Progress Keseluruhan</span>
                    <span>{completionPercentage}%</span>
                </div>
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${completionPercentage}%` }}></div>
                </div>
            </div>
            <div className="glass-card">
              <h2>Jadwal Hari Ini</h2>
              <div className="day-filter">
                {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].map(day => (
                  <button key={day} className={`day-btn ${scheduleDayFilter === day ? 'active' : ''}`} onClick={() => setScheduleDayFilter(day)}>{day}</button>
                ))}
              </div>
              {filteredSchedules.length > 0 ? filteredSchedules.map(schedule => (
                  <div key={schedule.id} className="list-item-wrapper">
                    <div className={`list-item schedule-${scheduleStatuses[schedule.id] || 'default'} ${expandedItemId === `schedule-${schedule.id}` ? 'expanded' : ''}`} onClick={() => handleItemClick('schedule', schedule.id)}>
                        <div>
                            <div className="list-title">{schedule.mata_kuliah}</div>
                            <div className="list-meta">{schedule.waktu_masuk} - {schedule.waktu_keluar} • {schedule.ruang}</div>
                        </div>
                    </div>
                    {expandedItemId === `schedule-${schedule.id}` && renderScheduleDetails(schedule)}
                </div>
              )) : <p className="empty-state">Tidak ada jadwal untuk hari ini.</p>}
            </div>
            <div className="glass-card">
                <h2>Tugas Teratas</h2>
                {nextThreePendingTasks.map(task => {
                    const deadline = new Date(task.deadline);
                    const now = new Date(); now.setHours(0,0,0,0);
                    const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    let actionText = `${daysLeft} hari lagi`;
                    if (daysLeft < 0) actionText = `${Math.abs(daysLeft)} hari terlambat`;
                    else if (daysLeft === 0) actionText = 'Hari ini';
                    else if (daysLeft === 1) actionText = 'Besok';

                    return (
                        <div key={task.id} className="list-item-wrapper">
                            <div className={`list-item ${expandedItemId === `task-${task.id}` ? 'expanded' : ''}`} onClick={() => handleItemClick('task', task.id)}>
                                <div>
                                    <div className="list-title">{task.tugas}</div>
                                    <div className="list-meta">{task.matkul}</div>
                                </div>
                                <div className="list-action warning">{actionText}</div>
                            </div>
                            {expandedItemId === `task-${task.id}` && renderTaskDetails(task)}
                        </div>
                    )
                })}
                {nextThreePendingTasks.length === 0 && <p className="empty-state">🎉 Semua tugas selesai!</p>}
            </div>
          </div>
        );
      case 'jadwal':
        return (
          <div key="jadwal" className="page-content">
            <div className="glass-card">
              <h2>Semua Jadwal</h2>
              {schedules.map(schedule => (
                <div key={schedule.id} className="list-item-wrapper">
                    <div className={`list-item schedule-${scheduleStatuses[schedule.id] || 'default'} ${expandedItemId === `schedule-${schedule.id}` ? 'expanded' : ''}`} onClick={() => handleItemClick('schedule', schedule.id)}>
                        <div>
                            <div className="list-title">{schedule.mata_kuliah}</div>
                            <div className="list-meta">{schedule.hari}, {schedule.waktu_masuk}</div>
                        </div>
                    </div>
                    {expandedItemId === `schedule-${schedule.id}` && renderScheduleDetails(schedule)}
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
                <div key={task.id} className="list-item-wrapper">
                    <div className={`list-item ${expandedItemId === `task-${task.id}` ? 'expanded' : ''}`} onClick={() => handleItemClick('task', task.id)}>
                        <div>
                            <div className="list-title">{task.tugas}</div>
                            <div className="list-meta">Deadline: {new Date(task.deadline).toLocaleDateString('id-ID')}</div>
                        </div>
                        <div className={`list-action ${task.status === 'belum' ? 'warning' : ''}`}>{task.status}</div>
                    </div>
                    {expandedItemId === `task-${task.id}` && renderTaskDetails(task)}
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
    <div className="app-container" ref={appContainerRef}>
      {isRefreshing && <div className="pull-to-refresh-indicator show">Menyegarkan data...</div>}
      
      {/* Search harus di luar header-container agar tidak terkena parallax */}
      {/* <Search tasks={tasks} schedules={schedules} /> */}
      
      <div className="header-container" ref={headerContainerRef}>
        <Search tasks={tasks} schedules={schedules} />
        <Header />
      </div>
      
      <main>
        {renderContent()}
      </main>
      
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}