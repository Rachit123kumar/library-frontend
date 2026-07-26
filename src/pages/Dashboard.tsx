import React, { useState, useEffect } from 'react';

interface Student {
  name: string;
  phone: string;
  fathersName: string;
}

interface ShiftBookingDetail {
  shiftId: number;
  startDate: string;
  endDate: string;
  student: Student;
}

interface SeatDashboardData {
  id: number;
  seatNumber: number;
  nearAc: boolean;
  chargingPoint: boolean;
  isBlocked: boolean;
  activeShiftsCount: number; // 0, 1, 2, or 3
  allBookings: ShiftBookingDetail[];
}

interface RoomGroup {
  id: number;
  name: string;
  description: string | null;
  seats: SeatDashboardData[];
}
const BASE_URL = "https://api.libdesk.online";
// // const BASE_URL = "http://139.84.140.46:3000";
// const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8787';
export default function LibraryDashboard() {
  const [rooms, setRooms] = useState<RoomGroup[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<SeatDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadLiveMatrixData();
  }, []);

  const loadLiveMatrixData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/v1/dashboard`);
      const result = await response.json();
      if (result.success) {
        setRooms(result.rooms);
      }
    } catch (err) {
      console.error("Dashboard parser execution drop error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper color map for calculation fractions
  const getSeatColorTokens = (seat: SeatDashboardData) => {
    if (seat.isBlocked) return { bg: '#FEF3C7', border: '#F59E0B', text: '#B45309' }; // Yellow
    switch (seat.activeShiftsCount) {
      case 3: return { bg: '#FCA5A5', border: '#EF4444', text: '#991B1B' }; // Red (3/3 Full)
      case 2: return { bg: '#FED7AA', border: '#F97316', text: '#9A3412' }; // Orange (2/3 Full)
      case 1: return { bg: '#FEF08A', border: '#EAB308', text: '#854D0E' }; // Light Yellow (1/3 Full)
      default: return { bg: '#E5E7EB', border: '#D1D5DB', text: '#374151' }; // Grey (Empty)
    }
  };

  if (loading) return <div style={styles.loadingWrapper}>Parsing library metric indexes...</div>;

  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.headerArea}>
        <h1 style={styles.mainHeading}>Library Space Dashboard Matrix</h1>
        <p style={styles.subHeading}>Visual breakdown grouped by physical rooms and fractional shift capacity metrics.</p>
      </div>

      {/* Main Grid split block */}
      <div style={styles.workspaceGrid}>
        
        {/* Left Side: Room by Room Dynamic Grids Canvas */}
        <div style={styles.roomsContainer}>
          {rooms.map((room) => (
            <div key={room.id} style={styles.roomSectionCard}>
              <div style={styles.roomHeader}>
                <h2 style={styles.roomTitle}>{room.name}</h2>
                <span style={styles.roomSubtitle}>{room.description || 'Main Floor Space'}</span>
              </div>

              <div style={styles.seatLayoutMatrixGrid}>
                {room.seats.map((seat) => {
                  const colors = getSeatColorTokens(seat);
                  const isSelected = selectedSeat?.id === seat.id;

                  return (
                    <div 
                      key={seat.id}
                      onClick={() => setSelectedSeat(seat)}
                      style={{
                        ...styles.seatSquareBlock,
                        backgroundColor: colors.bg,
                        borderColor: isSelected ? '#4F46E5' : colors.border,
                        transform: isSelected ? 'scale(1.05)' : 'none',
                        boxShadow: isSelected ? '0 0 10px rgba(79, 70, 229, 0.4)' : 'none'
                      }}
                    >
                      <span style={styles.seatNumLabel}>S-{seat.seatNumber}</span>
                      {!seat.isBlocked && (
                        <span style={{...styles.fractionBadge, color: colors.text}}>
                          {seat.activeShiftsCount}/3
                        </span>
                      )}
                      {seat.isBlocked && <span style={styles.blockLabel}>OFF</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Seat Parameter Inspection Sidebar Drawer Mappings */}
        <div style={styles.sidebarInspectionDrawer}>
          {selectedSeat ? (
            <div>
              <h3 style={styles.sidebarHeading}>Seat Inspection Mappings</h3>
              <div style={styles.metaRow}><span>Seat Label:</span> <strong>Seat #{selectedSeat.seatNumber}</strong></div>
              <div style={styles.metaRow}><span>Features:</span> {selectedSeat.nearAc ? '❄️ AC' : 'Standard'} | {selectedSeat.chargingPoint ? '🔌 Power' : 'No Plug'}</div>
              <div style={styles.metaRow}><span>Occupancy Rate:</span> <strong>{selectedSeat.activeShiftsCount} of 3 Shifts Full</strong></div>
              
              <h4 style={styles.shiftBreakdownHeader}>Shift Schedule Timelines</h4>
              {selectedSeat.allBookings.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedSeat.allBookings.map((booking, idx) => (
                    <div key={idx} style={styles.shiftBookingCard}>
                      <div style={styles.shiftCardHeader}>
                        <span style={styles.shiftBadge}>Shift {booking.shiftId}</span>
                        <span style={styles.expiryLabel}>Expires: {booking.endDate}</span>
                      </div>
                      <div style={styles.studentInfoRow}>
                        <strong>Student:</strong> {booking.student.name}
                      </div>
                      <div style={styles.studentInfoRow}>
                        <strong>Father:</strong> {booking.student.fathersName}
                      </div>
                      <div style={styles.studentInfoRow}>
                        <strong>Contact:</strong> {booking.student.phone}
                      </div>
                      <div style={styles.dateMetaLine}>
                        Active Term: {booking.startDate} to {booking.endDate}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={styles.emptyAlert}>
                  {selectedSeat.isBlocked ? 'This seat is offline for maintenance blocks.' : 'No active student registrations assigned to this position today.'}
                </p>
              )}
            </div>
          ) : (
            <div style={styles.sidebarPlaceholderText}>
              Click on any seat card node in the room floor layout grids to inspect profile records, timestamps, and multi-shift allocations.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

const styles = {
  dashboardContainer: { padding: '25px', fontFamily: 'system-ui, sans-serif', backgroundColor: '#F3F4F6', minHeight: '100vh' },
  headerArea: { marginBottom: '25px' },
  mainHeading: { fontSize: '24px', color: '#111827', margin: '0 0 4px 0', fontWeight: 'bold' as const },
  subHeading: { fontSize: '13px', color: '#6B7280', margin: 0 },
  loadingWrapper: { padding: '50px', textAlign: 'center' as const, fontStyle: 'italic', color: '#4F46E5', fontSize: '15px' },
  workspaceGrid: { display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' as const },
  roomsContainer: { display: 'flex', flexDirection: 'column' as const, gap: '24px' },
  roomSectionCard: { background: '#FFF', padding: '20px', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' },
  roomHeader: { borderBottom: '1px solid #F3F4F6', paddingBottom: '12px', marginBottom: '16px' },
  roomTitle: { fontSize: '18px', color: '#1F2937', margin: '0 0 2px 0', fontWeight: 'bold' as const },
  roomSubtitle: { fontSize: '12px', color: '#9CA3AF' },
  seatLayoutMatrixGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '8px' },
  seatSquareBlock: { height: '65px', borderRadius: '8px', border: '2px solid', cursor: 'pointer', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', transition: 'all 0.1s ease', position: 'relative' as const, userSelect: 'none' as const },
  seatNumLabel: { fontSize: '13px', fontWeight: 'bold' as const, color: '#111827' },
  fractionBadge: { fontSize: '11px', marginTop: '4px', fontWeight: 'bold' as const, padding: '1px 4px', background: 'rgba(255,255,255,0.6)', borderRadius: '4px' },
  blockLabel: { fontSize: '10px', color: '#B45309', fontWeight: 'bold' as const, marginTop: '4px' },
  sidebarInspectionDrawer: { background: '#FFF', padding: '20px', borderRadius: '12px', border: '1px solid #E5E7EB', minHeight: '450px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' },
  sidebarHeading: { fontSize: '16px', color: '#111827', margin: '0 0 15px 0', borderBottom: '1px solid #E5E7EB', paddingBottom: '10px', fontWeight: 'bold' as const },
  metaRow: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#4B5563', margin: '8px 0' },
  shiftBreakdownHeader: { fontSize: '13px', color: '#4F46E5', textTransform: 'uppercase' as const, fontWeight: 'bold' as const, margin: '20px 0 10px 0', letterSpacing: '0.04em' },
  shiftBookingCard: { background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column' as const, gap: '4px' },
  shiftCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
  shiftBadge: { padding: '2px 6px', background: '#EEF2F6', color: '#374151', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' as const },
  expiryLabel: { fontSize: '11px', color: '#EF4444', fontWeight: 'bold' as const },
  studentInfoRow: { fontSize: '13px', color: '#1F2937' },
  dateMetaLine: { fontSize: '11px', color: '#9CA3AF', marginTop: '4px', borderTop: '1px dashed #E5E7EB', paddingTop: '4px' },
  emptyAlert: { fontSize: '12px', color: '#6B7280', fontStyle: 'italic', padding: '20px', background: '#F9FAFB', borderRadius: '6px', textAlign: 'center' as const, marginTop: '10px' },
  sidebarPlaceholderText: { fontSize: '13px', color: '#9CA3AF', fontStyle: 'italic', textAlign: 'center' as const, marginTop: '150px', lineHeight: '1.6' }
};