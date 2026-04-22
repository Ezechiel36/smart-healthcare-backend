import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../services/api';

interface DashboardData {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  appointmentStatusBreakdown: {
    pending: number;
    confirmed: number;
    canceled: number;
    completed: number;
    noShow: number;
  };
}

const SystemAnalytics: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await adminAPI.getDashboard();
      setData(res.data);
          } catch (err: any) {
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      completed: '#10b981',
      canceled: '#ef4444',
      noShow: '#8b5cf6',
    };
    return map[status] || '#6b7280';
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      completed: 'Completed',
      canceled: 'Canceled',
      noShow: 'No Show',
    };
    return map[status] || status;
  };

  const getStatusIcon = (status: string) => {
    const map: Record<string, string> = {
      pending: '⏳',
      confirmed: '✅',
      completed: '🏁',
      canceled: '❌',
      noShow: '🚫',
    };
    return map[status] || '•';
  };

  const totalStatusCount = data
    ? Object.values(data.appointmentStatusBreakdown).reduce((a, b) => a + b, 0)
    : 0;

  const statusEntries = data
    ? Object.entries(data.appointmentStatusBreakdown)
    : [];

  // Build donut segments
  const buildDonutSegments = () => {
    if (!data || totalStatusCount === 0) return null;
    const radius = 80;
    const cx = 100;
    const cy = 100;
    const circumference = 2 * Math.PI * radius;
    let cumulativePercent = 0;

    return statusEntries.map(([key, value]) => {
      const percent = value / totalStatusCount;
      const rotation = cumulativePercent * 360;
      cumulativePercent += percent;
      return (
        <circle
          key={key}
          cx={cx}
          cy={cy}
          r={radius}
          fill="transparent"
          stroke={getStatusColor(key)}
          strokeWidth="36"
          strokeDasharray={`${circumference * percent} ${circumference * (1 - percent)}`}
          strokeDashoffset={circumference * 0.25}
          transform={`rotate(${rotation - 90} ${cx} ${cy})`}
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
      );
    });
  };

  return (
    <div style={styles.wrapper}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📊 System Analytics</h1>
          <p style={styles.subtitle}>
            Real-time overview of your healthcare platform metrics
          </p>
        </div>
        <div style={styles.headerRight}>
        </div>
      </div>

      {error && (
        <div style={styles.errorBanner}>
          ⚠️ {error}
        </div>
      )}

      {loading && !data ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Loading analytics…</p>
        </div>
      ) : data ? (
        <>
          {/* Stat Cards */}
          <div style={styles.statsGrid}>
            <StatCard
              icon="👥"
              label="Total Patients"
              value={data.totalPatients}
              gradient="linear-gradient(135deg, #667eea, #764ba2)"
              trend="+12% this month"
            />
            <StatCard
              icon="🩺"
              label="Total Doctors"
              value={data.totalDoctors}
              gradient="linear-gradient(135deg, #11998e, #38ef7d)"
              trend="Active staff"
            />
            <StatCard
              icon="📅"
              label="Total Appointments"
              value={data.totalAppointments}
              gradient="linear-gradient(135deg, #f093fb, #f5576c)"
              trend="All time"
            />
            <StatCard
              icon="✅"
              label="Completed"
              value={data.appointmentStatusBreakdown.completed}
              gradient="linear-gradient(135deg, #4facfe, #00f2fe)"
              trend={
                data.totalAppointments > 0
                  ? `${Math.round((data.appointmentStatusBreakdown.completed / data.totalAppointments) * 100)}% success rate`
                  : 'No appointments yet'
              }
            />
          </div>

          {/* Charts Row */}
          <div style={styles.chartsRow}>
            {/* Donut Chart */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Appointment Distribution</h3>
              {totalStatusCount === 0 ? (
                <p style={styles.emptyText}>No appointment data yet.</p>
              ) : (
                <div style={styles.donutContainer}>
                  <svg viewBox="0 0 200 200" width="200" height="200">
                    {buildDonutSegments()}
                    <circle cx="100" cy="100" r="62" fill="#1e293b" />
                    <text
                      x="100"
                      y="95"
                      textAnchor="middle"
                      fill="#f8fafc"
                      fontSize="22"
                      fontWeight="bold"
                    >
                      {totalStatusCount}
                    </text>
                    <text
                      x="100"
                      y="115"
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="11"
                    >
                      Total
                    </text>
                  </svg>
                  <div style={styles.legend}>
                    {statusEntries.map(([key, value]) => (
                      <div key={key} style={styles.legendItem}>
                        <span
                          style={{
                            ...styles.legendDot,
                            backgroundColor: getStatusColor(key),
                          }}
                        />
                        <span style={styles.legendLabel}>
                          {getStatusIcon(key)} {getStatusLabel(key)}
                        </span>
                        <span style={styles.legendValue}>
                          {value}{' '}
                          <span style={styles.legendPercent}>
                            ({totalStatusCount > 0 ? Math.round((value / totalStatusCount) * 100) : 0}%)
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bar Chart */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Status Breakdown</h3>
              {totalStatusCount === 0 ? (
                <p style={styles.emptyText}>No appointment data yet.</p>
              ) : (
                <div style={styles.barChartContainer}>
                  {statusEntries.map(([key, value]) => {
                    const percent =
                      totalStatusCount > 0
                        ? Math.round((value / totalStatusCount) * 100)
                        : 0;
                    return (
                      <div key={key} style={styles.barRow}>
                        <span style={styles.barLabel}>
                          {getStatusIcon(key)} {getStatusLabel(key)}
                        </span>
                        <div style={styles.barTrack}>
                          <div
                            style={{
                              ...styles.barFill,
                              width: `${percent}%`,
                              backgroundColor: getStatusColor(key),
                            }}
                          />
                        </div>
                        <span style={styles.barValue}>
                          {value}
                          <span style={styles.barPercent}> ({percent}%)</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Summary Table */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📋 Summary Report</h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Metric</th>
                  <th style={styles.th}>Value</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr style={styles.tr}>
                  <td style={styles.td}>👥 Registered Patients</td>
                  <td style={styles.td}>
                    <strong>{data.totalPatients}</strong>
                  </td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, backgroundColor: '#667eea' }}>Active</span>
                  </td>
                </tr>
                <tr style={styles.tr}>
                  <td style={styles.td}>🩺 Registered Doctors</td>
                  <td style={styles.td}>
                    <strong>{data.totalDoctors}</strong>
                  </td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, backgroundColor: '#11998e' }}>Active</span>
                  </td>
                </tr>
                <tr style={styles.tr}>
                  <td style={styles.td}>📅 Total Appointments</td>
                  <td style={styles.td}>
                    <strong>{data.totalAppointments}</strong>
                  </td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, backgroundColor: '#f5576c' }}>All Time</span>
                  </td>
                </tr>
                {statusEntries.map(([key, value]) => (
                  <tr key={key} style={styles.tr}>
                    <td style={styles.td}>
                      {getStatusIcon(key)} {getStatusLabel(key)} Appointments
                    </td>
                    <td style={styles.td}>
                      <strong>{value}</strong>
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          backgroundColor: getStatusColor(key),
                        }}
                      >
                        {totalStatusCount > 0
                          ? `${Math.round((value / totalStatusCount) * 100)}%`
                          : '0%'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
};

// ─── Stat Card Sub-component ───────────────────────────────────────────────────
const StatCard: React.FC<{
  icon: string;
  label: string;
  value: number;
  gradient: string;
  trend: string;
}> = ({ icon, label, value, gradient, trend }) => (
  <div style={{ ...styles.statCard, background: gradient }}>
    <div style={styles.statIcon}>{icon}</div>
    <div style={styles.statValue}>{value.toLocaleString()}</div>
    <div style={styles.statLabel}>{label}</div>
    <div style={styles.statTrend}>{trend}</div>
  </div>
);

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    color: '#f8fafc',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    padding: '28px',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 800,
    margin: 0,
    background: 'linear-gradient(90deg, #818cf8, #38bdf8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    color: '#94a3b8',
    margin: '4px 0 0',
    fontSize: '0.95rem',
  },
  headerRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px',
  },
  lastUpdated: {
    fontSize: '0.8rem',
    color: '#64748b',
  },
  refreshBtn: {
    padding: '8px 20px',
    background: 'linear-gradient(135deg, #818cf8, #38bdf8)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9rem',
    transition: 'opacity 0.2s',
  },
  errorBanner: {
    background: 'rgba(239,68,68,0.15)',
    border: '1px solid rgba(239,68,68,0.4)',
    borderRadius: '10px',
    padding: '14px 18px',
    marginBottom: '24px',
    color: '#fca5a5',
    fontSize: '0.95rem',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '80px',
    gap: '18px',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '5px solid #334155',
    borderTopColor: '#818cf8',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: '1rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '28px',
  },
  statCard: {
    borderRadius: '16px',
    padding: '24px',
    color: '#fff',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    transition: 'transform 0.2s',
  },
  statIcon: {
    fontSize: '2rem',
    marginBottom: '12px',
  },
  statValue: {
    fontSize: '2.2rem',
    fontWeight: 800,
    lineHeight: 1,
  },
  statLabel: {
    fontSize: '0.9rem',
    opacity: 0.85,
    marginTop: '6px',
  },
  statTrend: {
    fontSize: '0.78rem',
    opacity: 0.7,
    marginTop: '6px',
  },
  chartsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '20px',
    marginBottom: '28px',
  },
  card: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '28px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#e2e8f0',
    marginBottom: '20px',
  },
  emptyText: {
    color: '#64748b',
    textAlign: 'center',
    paddingTop: '20px',
  },
  donutContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '28px',
    flexWrap: 'wrap',
  },
  legend: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    flex: 1,
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.88rem',
  },
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  legendLabel: {
    color: '#cbd5e1',
    flex: 1,
  },
  legendValue: {
    fontWeight: 700,
    color: '#f1f5f9',
  },
  legendPercent: {
    fontWeight: 400,
    color: '#64748b',
    fontSize: '0.8rem',
  },
  barChartContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  barRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '0.88rem',
  },
  barLabel: {
    color: '#cbd5e1',
    width: '110px',
    flexShrink: 0,
  },
  barTrack: {
    flex: 1,
    height: '10px',
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '99px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: '99px',
    transition: 'width 0.8s ease',
  },
  barValue: {
    color: '#f1f5f9',
    fontWeight: 700,
    width: '80px',
    textAlign: 'right',
    flexShrink: 0,
  },
  barPercent: {
    fontWeight: 400,
    color: '#64748b',
    fontSize: '0.78rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem',
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    color: '#94a3b8',
    fontWeight: 600,
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    textTransform: 'uppercase',
    fontSize: '0.78rem',
    letterSpacing: '0.05em',
  },
  tr: {
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  td: {
    padding: '14px 16px',
    color: '#e2e8f0',
    verticalAlign: 'middle',
  },
  badge: {
    display: 'inline-block',
    padding: '3px 12px',
    borderRadius: '99px',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#fff',
  },
};

// Keyframe injection
const styleTag = document.createElement('style');
styleTag.innerHTML = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
`;
document.head.appendChild(styleTag);

export default SystemAnalytics;
