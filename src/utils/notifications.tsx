// src/utils/notifications.ts
import { SupabaseClient } from '@supabase/supabase-js';
import { Task } from '@/types/database';

export function requestNotificationPermission() {
  if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        registerServiceWorker();
      }
    });
  }
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => console.log('Service Worker registered with scope:', registration.scope))
      .catch(error => console.error('Service Worker registration failed:', error));
  }
}

function showNotification(title: string, options: NotificationOptions) {
   if ('Notification' in window && Notification.permission === 'granted') {
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification(title, options);
    });
  }
}

// Subscribe to new task insertions using Supabase Realtime
export function subscribeToNewTaskNotifications(supabase: SupabaseClient) {
  const channel = supabase
    .channel('tugas-db-changes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'tugas' },
      (payload) => {
        const newTask = payload.new as Task;
        showNotification('Tugas Baru Ditambahkan!', {
          body: `${newTask.tugas} - ${newTask.matkul}`,
          icon: '/icon-192.png', // Pastikan ikon ada di folder public
        });
      }
    )
    .subscribe();

  return channel;
}