import React, { useState, useEffect } from 'react';

interface Room {
  id: number;
  name: string;
  description: string;
  _count?: { seats: number };
}

interface Seat {
  id: number;
  seatNumber: number;
  nearAc: boolean;
  chargingPoint: boolean;
  isBlocked: boolean;
  room?: { name: string };
}

export default function SettingsPage() {
  // Global Profile Details State
  const [libraryName, setLibraryName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [holdDays, setHoldDays] = useState('3');
  const [createdAtDate, setCreatedAtDate] = useState('');

  // Rooms Architecture Infrastructure Management States
  const [roomsList, setRoomsList] = useState<Room[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDesc, setNewRoomDesc] = useState('');
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
  const [editRoomName, setEditRoomName] = useState('');
  const [editRoomDesc, setEditRoomDesc] = useState('');

  // Dynamic Sequential Seat Generator Parameters
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [startSeatNum, setStartSeatNum] = useState('1');
  const [endSeatNum, setEndSeatNum] = useState('150');

  // Interactive Live Filtering Desk Grid States
  const [filterRoomId, setFilterRoomId] = useState('');
  const [allSeats, setAllSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(false);

  // Load baseline infrastructure records on mount
  useEffect(() => {
    loadSettingsData();
  }, []);

  // Sync seat grid views dynamically whenever room filters change
  useEffect(() => {
    loadSeatsList();
  }, [filterRoomId]);

  // 💡 FIXED ROUTE: Hits /api/v1/global to fetch base setup profile parameters
  const loadSettingsData = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/v1/global');
      const data = await res.json();
      if (data.success) {
        if (data.settings) {
          setLibraryName(data.settings.libraryName || '');
          setAddress(data.settings.address || '');
          setEmail(data.settings.email || '');
          setHoldDays(data.settings.holdDays?.toString() || '3');
          if (data.settings.createdAt) {
            setCreatedAtDate(new Date(data.settings.createdAt).toLocaleDateString('en-IN', {
              year: 'numeric', month: 'long', day: 'numeric'
            }));
          }
        }
        setRoomsList(data.rooms || []);
        if (data.rooms?.length > 0 && !selectedRoomId) {
          setSelectedRoomId(data.rooms[0].id.toString());
        }
      }
    } catch (err) {
      console.error("Failed loading library settings configuration payload:", err);
    }
  };

  // 💡 FIXED ROUTE: Hits /api/v1/seats-list
  const loadSeatsList = async () => {
    try {
      const url = filterRoomId 
        ? `http://localhost:3000/api/v1/seats-list?roomId=${filterRoomId}`
        : 'http://localhost:3000/api/v1/seats-list';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setAllSeats(data.seats || []);
    } catch (err) {
      console.error("Error retrieving desk arrays:", err);
    }
  };

  // 💡 FIXED ROUTE: Hits /api/v1/global via POST to update profile details
  const handleGlobalConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/v1/global', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ libraryName, address, holdDays })
      });
      const data = await res.json();
      alert(data.message || "Profile directories successfully customized.");
      loadSettingsData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 💡 FIXED ROUTE: Hits /api/v1/rooms via POST to append space
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    try {
      const res = await fetch('http://localhost:3000/api/v1/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newRoomName, description: newRoomDesc })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setNewRoomName(''); setNewRoomDesc('');
        loadSettingsData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 💡 FIXED ROUTE: Hits /api/v1/rooms/:id via PUT
  const handleUpdateRoomExecute = async (roomId: number) => {
    try {
      const res = await fetch(`http://localhost:3000/api/v1/rooms/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editRoomName, description: editRoomDesc })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setEditingRoomId(null);
        loadSettingsData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 💡 FIXED ROUTE: Hits /api/v1/seats/batch via POST
  const handleBatchSeatCreation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId) return alert("Please specify an active room to populate.");
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/v1/seats/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoomId,
          startNumber: startSeatNum,
          endNumber: endSeatNum
        })
      });
      const data = await res.json();
      alert(data.message || "Batch matrix population successfully processed.");
      loadSeatsList();
      loadSettingsData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 💡 FIXED ROUTE: Hits /api/v1/seats/:id via PATCH
  const toggleSeatFeature = async (seat: Seat, updatedFields: Partial<Seat>) => {
    try {
      const res = await fetch(`http://localhost:3000/api/v1/seats/${seat.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      const data = await res.json();
      if (data.success) {
        setAllSeats(prev => prev.map(s => s.id === seat.id ? { ...s, ...updatedFields } : s));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={styles.outerContainer}>
      <div style={styles.headerLayoutFlex}>
        <div>
          <h1 style={styles.mainTitleHeader}>Master Infrastructure Setup Panel</h1>
          <p style={styles.subHeaderDescription}>Review operational parameters, append active room blocks, and control desk properties configuration.</p>
        </div>
        {createdAtDate && (
          <div style={styles.systemMetaBanner}>
            <span>🗓️ Server Setup Profile Init:</span>
            <strong>{createdAtDate}</strong>
          </div>
        )}
      </div>

      <div style={styles.splitMainDashboardLayoutGrid}>
        
        {/* LEFT COLUMN: GLOBAL IDENTITY & MANAGEMENT CONTROL MODULES */}
        <div style={styles.layoutFlexVerticalStack}>
          
          {/* CARD MODULE 1: PROFILE PARAMETERS FORM */}
          <div style={styles.cardContainer}>
            <h3 style={styles.sectionHeading}>1. Library Core Identity & Policy Rules</h3>
            <form onSubmit={handleGlobalConfigSubmit} style={styles.formStructure}>
              <div style={styles.formVerticalStackSpacing}>
                <div>
                  <label style={styles.fieldLabel}>Library Display Title:</label>
                  <input required type="text" value={libraryName} onChange={(e) => setLibraryName(e.target.value)} style={styles.inputField} />
                </div>
                <div>
                  <label style={styles.fieldLabel}>Administrative Email Reference (Immutable Profile):</label>
                  <input disabled type="email" value={email} style={{...styles.inputField, backgroundColor: '#F3F4F6', color: '#6B7280', cursor: 'not-allowed'}} />
                </div>
                <div>
                  <label style={styles.fieldLabel}>Physical Layout Location Address:</label>
                  <input required type="text" value={address} onChange={(e) => setAddress(e.target.value)} style={styles.inputField} />
                </div>
                <div>
                  <label style={styles.fieldLabel}>Late Seat Retention Grace Window (Days):</label>
                  <input required type="number" min="0" value={holdDays} onChange={(e) => setHoldDays(e.target.value)} style={styles.inputField} />
                </div>
              </div>
              <button type="submit" disabled={loading} style={styles.saveActionButton}>Synchronize Identity Properties</button>
            </form>
          </div>

          {/* CARD MODULE 2: ROOM ARCHITECTURE LISTS & SETUP */}
          <div style={styles.cardContainer}>
            <h3 style={styles.sectionHeading}>2. Rooms Structural Map & Capacities</h3>
            
            <div style={styles.roomRowVerticalContainer}>
              {roomsList.length === 0 ? (
                <div style={styles.emptyInlineAlertNotice}>No active room sectors initialized in the database structure layout.</div>
              ) : (
                roomsList.map(room => (
                  <div key={room.id} style={styles.roomCardWrapperLayout}>
                    {editingRoomId === room.id ? (
                      <div style={styles.roomEditFormFlowContainer}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                          <input type="text" value={editRoomName} onChange={(e) => setEditRoomName(e.target.value)} style={{...styles.inputField, marginBottom: '6px'}} placeholder="Room Name" />
                          <input type="text" value={editRoomDesc} onChange={(e) => setEditRoomDesc(e.target.value)} style={styles.inputField} placeholder="Description Features" />
                        </div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <button type="button" onClick={() => handleUpdateRoomExecute(room.id)} style={{...styles.saveActionButton, marginTop: 0, padding: '8px 14px'}}>Save</button>
                          <button type="button" onClick={() => setEditingRoomId(null)} style={styles.cancelButton}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={styles.roomTitleWeightText}>📍 {room.name}</span>
                            <span style={styles.capacityTextTallyBadge}>{room._count?.seats || 0} Desks Assigned</span>
                          </div>
                          <p style={styles.roomDescTextParagraph}>{room.description || 'No special configuration characteristics detailed.'}</p>
                        </div>
                        <button type="button" onClick={() => {
                          setEditingRoomId(room.id);
                          setEditRoomName(room.name);
                          setEditRoomDesc(room.description || '');
                        }} style={styles.inlineEditLinkButton}>Edit Info</button>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleCreateRoom} style={styles.appendRoomFormWrapperContainer}>
              <label style={{...styles.fieldLabel, color: '#4F46E5', fontWeight: 700}}>+ Append New Room Block</label>
              <div style={{...styles.formVerticalStackSpacing, marginTop: '8px', gap: '8px'}}>
                <input type="text" required placeholder="Room Partition Name (e.g., Silent Wing A)" value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)} style={styles.inputField} />
                <input type="text" placeholder="Features / Notes (e.g., General Row, Air Purifier)" value={newRoomDesc} onChange={(e) => setNewRoomDesc(e.target.value)} style={styles.inputField} />
              </div>
              <button type="submit" style={{...styles.saveActionButton, backgroundColor: '#10B981', marginTop: '10px'}}>Add Room Space</button>
            </form>
          </div>

          {/* CARD MODULE 3: BATCH SEAT GENERATION TOOL */}
          {roomsList.length > 0 && (
            <div style={styles.cardContainer}>
              <h3 style={styles.sectionHeading}>3. Range-Bounded Batch Seat Generator</h3>
              <p style={styles.utilDescriptionTextBanner}>Populate space grids instantly using custom numerical limits (e.g., 1 to 150, or 151 to 200).</p>
              <form onSubmit={handleBatchSeatCreation} style={styles.formStructure}>
                <div style={styles.formVerticalStackSpacing}>
                  <div>
                    <label style={styles.fieldLabel}>Target Room Allocation Zone:</label>
                    <select value={selectedRoomId} onChange={(e) => setSelectedRoomId(e.target.value)} style={styles.dropdownPickerFieldBox}>
                      {roomsList.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={styles.fieldLabel}>Start Seat Number:</label>
                      <input required type="number" min="1" value={startSeatNum} onChange={(e) => setStartSeatNum(e.target.value)} style={styles.inputField} />
                    </div>
                    <div>
                      <label style={styles.fieldLabel}>End Seat Limit:</label>
                      <input required type="number" min="1" value={endSeatNum} onChange={(e) => setEndSeatNum(e.target.value)} style={styles.inputField} />
                    </div>
                  </div>
                </div>
                <button type="submit" disabled={loading} style={{...styles.saveActionButton, backgroundColor: '#6366F1', width: '100%', justifyContent: 'center'}}>🚀 Execute Grid Generation Sequence</button>
              </form>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: MAIN EDITABLE SEAT FEATURE CONTROL MATRIX PANELS */}
        <div style={styles.layoutFlexVerticalStack}>
          <div style={{...styles.cardContainer, flex: 1}}>
            <div style={styles.matrixFilterSectionHeaderFlex}>
              <div>
                <h3 style={{...styles.sectionHeading, margin: 0}}>4. Individual Desk Control Matrix Grid Map</h3>
                <p style={styles.utilDescriptionTextBanner}>Click the toggle indicators below to instantly switch desk features or block slots from routine bookings.</p>
              </div>
              <select value={filterRoomId} onChange={(e) => setFilterRoomId(e.target.value)} style={{...styles.dropdownPickerFieldBox, width: '220px'}}>
                <option value="">-- View All Library Rooms --</option>
                {roomsList.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>

            {allSeats.length === 0 ? (
              <div style={styles.emptyMatrixFallbackNoticeArea}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>🪑</div>
                <strong>No Active Desks Discovered</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#9CA3AF' }}>Generate structural index parameters inside a room to see layout nodes here.</p>
              </div>
            ) : (
              <div style={styles.matrixGridContainerDisplay}>
                {allSeats.map(seat => (
                  <div key={seat.id} style={{
                    ...styles.seatInteractiveDashboardNodeCard,
                    backgroundColor: seat.isBlocked ? '#FEF2F2' : '#FFF',
                    borderColor: seat.isBlocked ? '#FCA5A5' : '#E5E7EB'
                  }}>
                    <div style={styles.seatCardHeadlineRowFlex}>
                      <span style={{
                        ...styles.seatCardMainHeadingLabelText,
                        color: seat.isBlocked ? '#991B1B' : '#111827'
                      }}>
                        Desk #{seat.seatNumber}
                      </span>
                      <span style={styles.seatCardLocationSubtextTagLabel}>{seat.room?.name || 'Main Hall'}</span>
                    </div>

                    <div style={styles.seatMatrixControlsActionFlexRow}>
                      <button
                        type="button"
                        onClick={() => toggleSeatFeature(seat, { nearAc: !seat.nearAc })}
                        style={{
                          ...styles.nodeControlInteractionBadgeButton,
                          backgroundColor: seat.nearAc ? '#EFF6FF' : '#F9FAFB',
                          color: seat.nearAc ? '#1D4ED8' : '#4B5563',
                          borderColor: seat.nearAc ? '#BFDBFE' : '#D1D5DB'
                        }}
                      >
                        {seat.nearAc ? "❄️ Near AC" : "🌬️ General"}
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleSeatFeature(seat, { isBlocked: !seat.isBlocked })}
                        style={{
                          ...styles.nodeControlInteractionBadgeButton,
                          backgroundColor: seat.isBlocked ? '#DC2626' : '#F9FAFB',
                          color: seat.isBlocked ? '#FFF' : '#4B5563',
                          borderColor: seat.isBlocked ? '#DC2626' : '#D1D5DB'
                        }}
                      >
                        {seat.isBlocked ? "🔒 Blocked" : "🔓 Active"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  outerContainer: { maxWidth: '1280px', margin: '25px auto', padding: '0 24px', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1F2937' },
  headerLayoutFlex: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' as const, gap: '16px', marginBottom: '24px', borderBottom: '1px solid #E5E7EB', paddingBottom: '16px' },
  mainTitleHeader: { fontSize: '26px', fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.02em' },
  subHeaderDescription: { margin: '4px 0 0 0', fontSize: '14px', color: '#6B7280' },
  systemMetaBanner: { display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', padding: '8px 14px', borderRadius: '8px', fontSize: '13px' },
  splitMainDashboardLayoutGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px', alignItems: 'flex-start' },
  layoutFlexVerticalStack: { display: 'flex', flexDirection: 'column' as const, gap: '24px' },
  cardContainer: { background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  sectionHeading: { fontSize: '14px', color: '#4F46E5', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em', margin: '0 0 16px 0', borderBottom: '2px solid #F3F4F6', paddingBottom: '8px' },
  formStructure: { display: 'flex', flexDirection: 'column' as const, gap: '16px' },
  formVerticalStackSpacing: { display: 'flex', flexDirection: 'column' as const, gap: '12px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  inputField: { padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '14px', color: '#111827', outline: 'none', width: '100%', boxSizing: 'border-box' as const, transition: 'border-color 0.15s ease' },
  dropdownPickerFieldBox: { padding: '10px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '14px', background: '#FFF', color: '#111827', outline: 'none', width: '100%', boxSizing: 'border-box' as const },
  fieldLabel: { fontSize: '13px', fontWeight: 600, color: '#4B5563', display: 'block', marginBottom: '5px' },
  saveActionButton: { display: 'inline-flex', alignItems: 'center', marginTop: '8px', padding: '10px 18px', background: '#4F46E5', color: '#FFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, transition: 'background-color 0.15s ease', alignSelf: 'flex-start' },
  cancelButton: { padding: '10px 16px', backgroundColor: '#FFF', color: '#374151', border: '1px solid #D1D5DB', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 },
  roomRowVerticalContainer: { display: 'flex', flexDirection: 'column' as const, gap: '10px', marginBottom: '18px' },
  roomCardWrapperLayout: { padding: '14px 16px', border: '1px solid #E5E7EB', borderRadius: '8px', backgroundColor: '#F9FAFB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' },
  roomEditFormFlowContainer: { display: 'flex', width: '100%', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' },
  roomTitleWeightText: { fontSize: '15px', fontWeight: 700, color: '#111827' },
  capacityTextTallyBadge: { fontSize: '11px', fontWeight: 600, color: '#374151', backgroundColor: '#E5E7EB', padding: '2px 8px', borderRadius: '12px' },
  roomDescTextParagraph: { margin: '4px 0 0 0', fontSize: '13px', color: '#6B7280', lineHeight: '1.4' },
  inlineEditLinkButton: { fontSize: '13px', color: '#4F46E5', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: '4px 8px', borderRadius: '4px', transition: 'background-color 0.15s ease' },
  emptyInlineAlertNotice: { padding: '16px', border: '1px dashed #D1D5DB', borderRadius: '8px', color: '#6B7280', textAlign: 'center' as const, fontSize: '13px' },
  appendRoomFormWrapperContainer: { borderTop: '1px dashed #E5E7EB', paddingTop: '16px', marginTop: '8px' },
  utilDescriptionTextBanner: { margin: '0 0 14px 0', fontSize: '13px', color: '#6B7280', lineHeight: '1.4' },
  matrixFilterSectionHeaderFlex: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' as const, gap: '14px', marginBottom: '20px', borderBottom: '1px solid #F3F4F6', paddingBottom: '14px' },
  emptyMatrixFallbackNoticeArea: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' as const, border: '2px dashed #E5E7EB', borderRadius: '8px', color: '#4B5563' },
  matrixGridContainerDisplay: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', maxHeight: '720px', overflowY: 'auto' as const, paddingRight: '4px' },
  seatInteractiveDashboardNodeCard: { padding: '12px', borderRadius: '8px', border: '1px solid', display: 'flex', flexDirection: 'column' as const, gap: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)', transition: 'transform 0.15s ease, box-shadow 0.15s ease' },
  seatCardHeadlineRowFlex: { display: 'flex', flexDirection: 'column' as const, gap: '2px' },
  seatCardMainHeadingLabelText: { fontSize: '14px', fontWeight: 700 },
  seatCardLocationSubtextTagLabel: { fontSize: '11px', color: '#9CA3AF' },
  seatMatrixControlsActionFlexRow: { display: 'flex', gap: '6px', marginTop: 'auto' },
  nodeControlInteractionBadgeButton: { flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px 2px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: '1px solid', transition: 'all 0.15s ease' }
};