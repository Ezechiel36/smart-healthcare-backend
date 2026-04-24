import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../services/api';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';
import './AdminDashboard.css';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
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

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <AdminNavbar onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="dashboard-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading analytics…</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <AdminNavbar onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="dashboard-container">
        <div className="dashboard-content">
          <div className="dashboard-header">
            <h1 className="dashboard-title">📊 System Analytics</h1>
            <p className="dashboard-subtitle">
              Real-time overview of your healthcare platform metrics
            </p>
          </div>

          {error && (
            <div className="error-alert">
              ⚠️ {error}
            </div>
          )}

          {data ? (
            <div className="dashboard-grid">
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

              <div style={styles.chartsRow}>
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
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

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

const styles: Record<string, React.CSSProperties> = {
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
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: '16px',
    padding: '28px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#1a202c',
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
    color: '#4a5568',
    flex: 1,
  },
  legendValue: {
    fontWeight: 700,
    color: '#1a202c',
  },
  legendPercent: {
    fontWeight: 400,
    color: '#718096',
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
    color: '#4a5568',
    width: '110px',
    flexShrink: 0,
  },
  barTrack: {
    flex: 1,
    height: '10px',
    background: 'rgba(0,0,0,0.08)',
    borderRadius: '99px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: '99px',
    transition: 'width 0.8s ease',
  },
  barValue: {
    color: '#1a202c',
    fontWeight: 700,
    width: '80px',
    textAlign: 'right',
    flexShrink: 0,
  },
  barPercent: {
    fontWeight: 400,
    color: '#718096',
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
    color: '#718096',
    fontWeight: 600,
    borderBottom: '1px solid rgba(0,0,0,0.08)',
    textTransform: 'uppercase',
    fontSize: '0.78rem',
    letterSpacing: '0.05em',
  },
  tr: {
    borderBottom: '1px solid rgba(0,0,0,0.05)',
  },
  td: {
    padding: '14px 16px',
    color: '#2d3748',
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

export default SystemAnalytics;
