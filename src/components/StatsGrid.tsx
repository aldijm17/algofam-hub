// /src/components/StatsGrid.tsx
interface StatsGridProps {
  pendingTasks: number;
  todayClasses: number;
  totalCourses: number;
  completion: number;
}

export default function StatsGrid({ pendingTasks, todayClasses, totalCourses, completion }: StatsGridProps) {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-number" style={{ color: 'var(--accent-orange)' }}>{pendingTasks}</div>
        <div className="stat-label">Tugas Tertunda</div>
      </div>
      <div className="stat-card">
        <div className="stat-number" style={{ color: 'var(--accent-cyan)' }}>{todayClasses}</div>
        <div className="stat-label">Kelas Hari Ini</div>
      </div>
      <div className="stat-card">
        <div className="stat-number" style={{ color: 'var(--accent-purple)' }}>{totalCourses}</div>
        <div className="stat-label">Mata Kuliah</div>
      </div>
      <div className="stat-card">
        <div className="stat-number">{completion}%</div>
        <div className="stat-label">Penyelesaian</div>
      </div>
    </div>
  );
}