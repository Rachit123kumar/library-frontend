import React, { useState, useEffect } from 'react';

interface ExpirationRecord {
  id: number;
  studentName: string;
  phone: string;
  fathersName: string;
  seatInfo: string;
  shifts: number[];
  endDate: string;
  statusLabel: string;
  isExpired: boolean;
}

export default function ExpirationsPage() {
  const [range, setRange] = useState<'3days' | '7days'>('3days');
  const [records, setRecords] = useState<ExpirationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadExpirations();
  }, [range]);

  const loadExpirations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/v1/expirations?range=${range}`);
      const result = await response.json();
      if (result.success) {
        setRecords(result.expirations);
      }
    } catch (err) {
      console.error("Error loading expirations UI:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.mainTitle}>Membership Expiration Manager</h1>
          <p style={styles.subtitle}>Track upcoming renewals and review accounts that expired earlier this month.</p>
        </div>

        <div style={styles.tabWrapper}>
          <button 
            onClick={() => setRange('3days')}
            style={{
              ...styles.tabButton,
              backgroundColor: range === '3days' ? '#EF4444' : '#FFF',
              color: range === '3days' ? '#FFF' : '#374151',
              borderColor: range === '3days' ? '#EF4444' : '#D1D5DB'
            }}
          >
            🚨 3 Days Alert View
          </button>
          <button 
            onClick={() => setRange('7days')}
            style={{
              ...styles.tabButton,
              backgroundColor: range === '7days' ? '#4F46E5' : '#FFF',
              color: range === '7days' ? '#FFF' : '#374151',
              borderColor: range === '7days' ? '#4F46E5' : '#D1D5DB'
            }}
          >
            📅 7 Days Weekly Projection
          </button>
        </div>
      </div>

      {loading ? (
        <div style={styles.loaderLine}>Syncing account maps...</div>
      ) : records.length > 0 ? (
        <div style={styles.expirationListGrid}>
          {records.map((student) => (
            <div 
              key={student.id} 
              style={{
                ...styles.profileExpiryCard,
                borderLeft: student.isExpired ? '4px solid #DC2626' : '4px solid #EAB308'
              }}
            >
              <div style={styles.cardHeaderFlex}>
                <h3 style={styles.profileName}>{student.studentName}</h3>
                <span style={{
                  ...styles.countdownBadge,
                  backgroundColor: student.isExpired ? '#FEF2F2' : '#FEF3C7',
                  color: student.isExpired ? '#991B1B' : '#854D0E',
                  border: student.isExpired ? '1px solid #FEE2E2' : '1px solid #FEF08A'
                }}>
                  {student.statusLabel}
                </span>
              </div>
              
              <div style={styles.detailLine}>👨‍👦 <strong>Father's Name:</strong> {student.fathersName}</div>
              <div style={styles.detailLine}>💺 <strong>Assigned Location:</strong> {student.seatInfo}</div>
              <div style={styles.detailLine}>
                ⏱️ <strong>Active Shifts:</strong> {student.shifts.map(s => `Shift ${s}`).join(', ')}
              </div>
              
              <hr style={styles.cardSeparator} />
              
              <div style={styles.footerFlex}>
                <div style={styles.dateMeta}>
                  {student.isExpired ? 'Expired on:' : 'Expires on:'} <strong>{student.endDate}</strong>
                </div>
                <a href={`tel:${student.phone}`} style={{
                  ...styles.callActionButton,
                  backgroundColor: student.isExpired ? '#DC2626' : '#EEF2F6',
                  color: student.isExpired ? '#FFF' : '#4F46E5'
                }}>
                  📞 Call Dashboard
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.emptyRecordsAlert}>
          No matching active or recently expired student profiles found for this selection frame.
        </div>
      )}
    </div>
  );
}

const styles = {
  pageContainer: { padding: '30px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#F9FAFB', minHeight: '100vh', maxWidth: '1200px', margin: '0 auto', boxSizing: 'border-box' as const },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap' as const, gap: '15px' },
  mainTitle: { fontSize: '24px', color: '#111827', fontWeight: 'bold' as const, margin: '0 0 4px 0' },
  subtitle: { fontSize: '13px', color: '#6B7280', margin: 0 },
  tabWrapper: { display: 'flex', gap: '10px' },
  tabButton: { padding: '10px 18px', border: '1px solid', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' as const, transition: 'all 0.15s ease' },
  loaderLine: { textAlign: 'center' as const, padding: '40px', color: '#4F46E5', fontStyle: 'italic' },
  expirationListGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' },
  profileExpiryCard: { background: '#FFF', border: '1px solid #E5E7EB', padding: '18px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' as const, gap: '6px' },
  cardHeaderFlex: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' },
  profileName: { fontSize: '16px', color: '#1F2937', fontWeight: 'bold' as const, margin: 0 },
  countdownBadge: { fontSize: '11px', fontWeight: 'bold' as const, padding: '3px 8px', borderRadius: '6px' },
  detailLine: { fontSize: '13px', color: '#4B5563' },
  cardSeparator: { border: 'none', borderTop: '1px solid #F3F4F6', margin: '12px 0 8px 0' },
  footerFlex: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' },
  dateMeta: { fontSize: '12px', color: '#6B7280' },
  callActionButton: { fontSize: '12px', fontWeight: 'bold' as const, textDecoration: 'none', padding: '6px 14px', borderRadius: '6px' },
  emptyRecordsAlert: { textAlign: 'center' as const, padding: '50px', background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '12px', color: '#6B7280', fontSize: '14px', fontStyle: 'italic' }
};