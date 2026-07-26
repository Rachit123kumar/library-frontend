import React, { useState, useEffect } from 'react';

interface FoundStudent {
  id: number;
  name: string;
  fathersName: string;
  phone: string;
}

interface Seat {
  id: number;
  seatNumber: number;
  room?: { name: string };
}

interface SplitShiftOption {
  shiftId: number;
  freeSeats: Seat[];
}

interface RenewalStatusResponse {
  success: boolean;
  previousSeatId: number | null;
  previousSeatNumber: number | null;
  suggestedStartDate: string;
  todayDate: string;
}

interface AvailabilityResponse {
  success: boolean;
  isSplitCombo: boolean;
  availableSeats?: Seat[];
  splitOptions?: SplitShiftOption[];
}

export default function RenewalPage() {
  // Search state variables
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoundStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<FoundStudent | null>(null);

  // Form parameters
  const [startDate, setStartDate] = useState('');
  const [durationMonths, setDurationMonths] = useState('1');
  const [endDate, setEndDate] = useState('');
  const [selectedShifts, setSelectedShifts] = useState<number[]>([]);
  const [paymentInfo, setPaymentInfo] = useState({ amount: '', paymentType: 'cash', remarks: '' });

  // Strategy and seat check states
  const [dateStrategy, setDateStrategy] = useState<'continuous' | 'today' | 'custom'>('continuous');
  const [checkingStudentHistory, setCheckingStudentHistory] = useState(false);
  const [checkingSeatAvailability, setCheckingSeatAvailability] = useState(false);
  
  const [renewalStatus, setRenewalStatus] = useState<RenewalStatusResponse | null>(null);
  const [availabilityData, setAvailabilityData] = useState<AvailabilityResponse | null>(null);
  
  const [isPreviousSeatFree, setIsPreviousSeatFree] = useState<boolean | null>(null);
  const [wantDifferentSeat, setWantDifferentSeat] = useState(false);
  const [selectedSingleSeatId, setSelectedSingleSeatId] = useState('');
  const [splitSeatSelections, setSplitSeatSelections] = useState<Record<number, number>>({});
  const [isDateOverlappingActivePlan, setIsDateOverlappingActivePlan] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Debounced Student Search Lookup
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim().length >= 2) fetchStudents();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const fetchStudents = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/v1/students/search?name=${searchQuery}`);
      const result = await res.json();
      if (result.success) setSearchResults(result.students);
    } catch (err) {
      console.error(err);
    }
  };

  // 2. Fetch historical seat data immediately when student is selected
  useEffect(() => {
    if (selectedStudent) {
      fetchStudentRenewalHistory();
    } else {
      setRenewalStatus(null);
      setAvailabilityData(null);
      setIsPreviousSeatFree(null);
    }
  }, [selectedStudent]);

  const fetchStudentRenewalHistory = async () => {
    setCheckingStudentHistory(true);
    try {
      const res = await fetch(`http://localhost:3000/api/v1/renewals/check?studentId=${selectedStudent?.id}`);
      const result = await res.json();
      if (result.success) {
        setRenewalStatus(result);
        setStartDate(result.suggestedStartDate);
        setDateStrategy('continuous');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingStudentHistory(false);
    }
  };

  // 3. Expiration Date Calculation 
  useEffect(() => {
    if (!startDate) {
      setEndDate('');
      return;
    }
    const start = new Date(startDate);
    start.setMonth(start.getMonth() + parseInt(durationMonths, 10));
    setEndDate(start.toISOString().split('T')[0]);
  }, [startDate, durationMonths]);

  // 4. Handle Date Strategy Changes
  useEffect(() => {
    if (!renewalStatus) return;
    if (dateStrategy === 'continuous') setStartDate(renewalStatus.suggestedStartDate);
    else if (dateStrategy === 'today') setStartDate(renewalStatus.todayDate);
    else setStartDate('');
  }, [dateStrategy]);

  // 5. Active Plan Overlap Validation Protection Rule
  useEffect(() => {
    if (!renewalStatus || !startDate) {
      setIsDateOverlappingActivePlan(false);
      return;
    }

    const selectedStartMs = new Date(`${startDate}T00:00:00`).getTime();
    
    // The suggested start date represents 'last expiry + 1 day'.
    // Subtracting one day yields the exact boundary of their existing active plan.
    const activeEnd = new Date(renewalStatus.suggestedStartDate);
    activeEnd.setDate(activeEnd.getDate() - 1);
    const activeEndMs = activeEnd.getTime();

    // Block submission if the chosen date overlaps the current timeline window
    if (selectedStartMs <= activeEndMs) {
      setIsDateOverlappingActivePlan(true);
    } else {
      setIsDateOverlappingActivePlan(false);
    }
  }, [startDate, renewalStatus]);

  // 6. Query Live Availability when parameters are settled
  useEffect(() => {
    if (selectedStudent && startDate && endDate && selectedShifts.length > 0 && !isDateOverlappingActivePlan) {
      checkLiveAvailability();
    } else {
      setAvailabilityData(null);
      setIsPreviousSeatFree(null);
    }
  }, [startDate, endDate, selectedShifts, wantDifferentSeat, isDateOverlappingActivePlan]);

  const checkLiveAvailability = async () => {
    setCheckingSeatAvailability(true);
    try {
      const query = new URLSearchParams({
        startDate,
        endDate,
        shifts: selectedShifts.join(','),
        studentId: selectedStudent?.id.toString() || ''
      }).toString();

      const res = await fetch(`http://localhost:3000/api/v1/available?${query}`);
      const result = await res.json();
      
      if (result.success) {
        setAvailabilityData(result);
        
        if (renewalStatus?.previousSeatId) {
          const foundFree = result.availableSeats?.some((s: Seat) => s.id === renewalStatus.previousSeatId);
          setIsPreviousSeatFree(!!foundFree);
        } else {
          setIsPreviousSeatFree(false);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingSeatAvailability(false);
    }
  };

  const handleShiftToggle = (num: number) => {
    setSelectedShifts(prev => prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]);
  };

  const handleSplitSelectionChange = (shiftId: number, seatIdStr: string) => {
    setSplitSeatSelections(prev => ({ ...prev, [shiftId]: parseInt(seatIdStr, 10) }));
  };

  const isFormValid = () => {
    if (selectedShifts.length === 0 || !startDate || !endDate) return false;
    if (isDateOverlappingActivePlan) return false;

    if (!wantDifferentSeat && isPreviousSeatFree === true) return true;

    if (availabilityData?.isSplitCombo) {
      return selectedShifts.every(shiftId => !!splitSeatSelections[shiftId]);
    }
    return !!selectedSingleSeatId;
  };

  const handleRenewalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !isFormValid()) return;

    setSubmitting(true);
    try {
      let finalSeatPayload = {};
      
      if (!wantDifferentSeat && isPreviousSeatFree === true && renewalStatus) {
        finalSeatPayload = {
          isSplit: false,
          seatId: renewalStatus.previousSeatId,
          shiftIds: selectedShifts
        };
      } else if (availabilityData?.isSplitCombo) {
        finalSeatPayload = {
          isSplit: true,
          splitBookings: Object.entries(splitSeatSelections).map(([shiftId, seatId]) => ({
            shiftId: parseInt(shiftId, 10),
            seatId: seatId
          }))
        };
      } else {
        finalSeatPayload = {
          isSplit: false,
          seatId: parseInt(selectedSingleSeatId, 10),
          shiftIds: selectedShifts
        };
      }

      const response = await fetch('http://localhost:3000/api/v1/renewals/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          startDate,
          endDate,
          ...finalSeatPayload,
          ...paymentInfo
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        alert("Success! Membership renewed.");
        setSelectedStudent(null); setSearchQuery(''); setStartDate(''); setSelectedShifts([]);
        setRenewalStatus(null); setAvailabilityData(null); setSelectedSingleSeatId('');
        setSplitSeatSelections({}); setWantDifferentSeat(false);
        setPaymentInfo({ amount: '', paymentType: 'cash', remarks: '' });
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getActivePlanEndDateString = () => {
    if (!renewalStatus) return '';
    const activeEnd = new Date(renewalStatus.suggestedStartDate);
    activeEnd.setDate(activeEnd.getDate() - 1);
    return activeEnd.toISOString().split('T')[0];
  };

  return (
    <div style={styles.cardContainer}>
      <h2 style={styles.formHeading}>Library Membership Renewal Portal</h2>
      
      {/* 1. Student Search Lookup */}
      <div style={{ marginBottom: '25px' }}>
        <label style={styles.fieldLabel}>Search Returning Student by Name:</label>
        <input 
          type="text" 
          placeholder="Type name to filter active or past entries..." 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
          style={styles.inputField}
        />
        
        {searchResults.length > 0 && !selectedStudent && (
          <div style={styles.dropdownListContainer}>
            {searchResults.map(student => (
              <div key={student.id} onClick={() => { setSelectedStudent(student); setSearchResults([]); }} style={styles.dropdownRowItem}>
                <span>👤 <strong>{student.name}</strong> (Father: {student.fathersName})</span>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>📞 {student.phone}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Renewal Entry Workspace */}
      {selectedStudent && (
        <form onSubmit={handleRenewalSubmit} style={styles.formStructure}>
          <div style={styles.activeStudentDisplayBanner}>
            Selected Profile: <strong>{selectedStudent.name}</strong> (Father: {selectedStudent.fathersName})
            <button type="button" onClick={() => setSelectedStudent(null)} style={styles.clearProfileButton}>Switch Selection</button>
          </div>

          {checkingStudentHistory ? (
            <p style={styles.infoAlert}>Loading student subscription logs...</p>
          ) : (
            <>
              {/* Date Strategy Selectors */}
              <div>
                <label style={styles.fieldLabel}>Select Start Date Strategy:</label>
                <div style={styles.buttonFlex}>
                  <button type="button" onClick={() => setDateStrategy('continuous')} style={{...styles.toggleButton, backgroundColor: dateStrategy === 'continuous' ? '#4F46E5' : '#FFF', color: dateStrategy === 'continuous' ? '#FFF' : '#374151'}}>⏮️ Continuous (Backdated Gap)</button>
                  <button type="button" onClick={() => setDateStrategy('today')} style={{...styles.toggleButton, backgroundColor: dateStrategy === 'today' ? '#10B981' : '#FFF', color: dateStrategy === 'today' ? '#FFF' : '#374151'}}>▶️ Start From Today</button>
                  <button type="button" onClick={() => setDateStrategy('custom')} style={{...styles.toggleButton, backgroundColor: dateStrategy === 'custom' ? '#F59E0B' : '#FFF', color: dateStrategy === 'custom' ? '#FFF' : '#374151'}}>⚙️ Custom Date</button>
                </div>
              </div>

              <div style={styles.formGrid}>
                <div>
                  <label style={styles.fieldLabel}>Start Date</label>
                  <input required type="date" min={dateStrategy === 'custom' ? todayStr : undefined} disabled={dateStrategy !== 'custom'} value={startDate} onChange={(e) => setStartDate(e.target.value)} style={styles.inputField} />
                </div>
                <div>
                  <label style={styles.fieldLabel}>Membership Duration Plan</label>
                  <select value={durationMonths} onChange={(e) => setDurationMonths(e.target.value)} style={styles.inputField}>
                    <option value="1">1 Month Plan</option>
                    <option value="2">2 Months Plan</option>
                    <option value="3">3 Months Plan</option>
                  </select>
                </div>
                {endDate && !isDateOverlappingActivePlan && <div style={styles.expiryDisplayBanner}>🔒 Renewal Deadline: <strong>{endDate}</strong></div>}
              </div>

              {/* Overlap Bug Protection Error Banner */}
              {isDateOverlappingActivePlan && (
                <div style={styles.errorAlertBanner}>
                  🚫 <strong>Invalid Renewal Timeline:</strong> {selectedStudent.name} already has an active membership that runs until {getActivePlanEndDateString()}. 
                  Please change the strategy selection to <strong>Continuous (Backdated Gap)</strong> to extend their current timeline safely without double-billing.
                </div>
              )}

              <div>
                <label style={styles.fieldLabel}>Select Plan Shifts:</label>
                <div style={styles.buttonFlex}>
                  {[1, 2, 3].map(num => (
                    <button type="button" key={num} onClick={() => handleShiftToggle(num)} style={{...styles.toggleButton, backgroundColor: selectedShifts.includes(num) ? '#4F46E5' : '#FFF', color: selectedShifts.includes(num) ? '#FFF' : '#374151'}}>Shift {num}</button>
                  ))}
                </div>
              </div>

              {/* Dynamic Availability Display */}
              {checkingSeatAvailability && <p style={styles.infoAlert}>Scanning room layouts...</p>}

              {availabilityData && !checkingSeatAvailability && (
                <div style={{ marginTop: '5px' }}>
                  
                  {renewalStatus?.previousSeatNumber && (
                    <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input 
                        type="checkbox" 
                        id="seatToggle" 
                        checked={wantDifferentSeat} 
                        onChange={(e) => setWantDifferentSeat(e.target.checked)} 
                      />
                      <label htmlFor="seatToggle" style={{ fontSize: '13px', fontWeight: 'bold', color: '#374151', cursor: 'pointer' }}>
                        Assign a different seat instead of their past seat history
                      </label>
                    </div>
                  )}

                  {/* SCENARIO A: Keeping Old Seat */}
                  {!wantDifferentSeat && renewalStatus?.previousSeatNumber && (
                    <div>
                      {isPreviousSeatFree ? (
                        <div style={styles.successBanner}>🎉 Original <strong>Seat #{renewalStatus.previousSeatNumber}</strong> is available for these dates! The system will secure it upon checkout.</div>
                      ) : (
                        <div style={styles.warningBanner}>
                          ❌ Historical Seat #{renewalStatus.previousSeatNumber} is taken by another record. You must allocate an alternate workspace.
                        </div>
                      )}
                    </div>
                  )}

                  {/* SCENARIO B: Alternative Single Seat or Split Plan Option Fallbacks */}
                  {(wantDifferentSeat || !isPreviousSeatFree) && (
                    <div>
                      {!availabilityData.isSplitCombo ? (
                        <div style={styles.warningBanner}>
                          Assign an alternate single seat open for all shifts:
                          <select required value={selectedSingleSeatId} onChange={(e) => setSelectedSingleSeatId(e.target.value)} style={styles.dropdownPicker}>
                            <option value="">-- Choose Alternate Single Seat --</option>
                            {availabilityData.availableSeats?.map(seat => (
                              <option key={seat.id} value={seat.id}>Seat {seat.seatNumber} ({seat.room?.name || 'Main Floor'})</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div style={styles.splitAlertBox}>
                          <div style={styles.splitWarningHeader}>⚠️ Split Seat Setup Required</div>
                          <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#78350F' }}>No single seat fits all shifts. Assign a seat per shift below:</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {availabilityData.splitOptions?.map(option => (
                              <div key={option.shiftId} style={styles.splitSelectorRow}>
                                <span style={styles.splitShiftLabel}>Shift {option.shiftId}:</span>
                                <select required value={splitSeatSelections[option.shiftId] || ''} onChange={(e) => handleSplitSelectionChange(option.shiftId, e.target.value)} style={styles.dropdownPicker}>
                                  <option value="">-- Assign Seat --</option>
                                  {option.freeSeats.map(seat => (
                                    <option key={seat.id} value={seat.id}>Seat #{seat.seatNumber} ({seat.room?.name})</option>
                                  ))}
                                </select>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Billing Info Logs */}
              <h3 style={styles.sectionHeader}>Billing & Ledgers</h3>
              <div style={styles.formGrid}>
                <input required type="number" placeholder="Fees (INR) *" value={paymentInfo.amount} onChange={(e) => setPaymentInfo({...paymentInfo, amount: e.target.value})} style={styles.inputField} />
                <select value={paymentInfo.paymentType} onChange={(e) => setPaymentInfo({...paymentInfo, paymentType: e.target.value})} style={styles.inputField}>
                  <option value="cash">Cash Ledger</option>
                  <option value="upi">UPI Portal</option>
                </select>
                <input type="text" placeholder="Remarks..." value={paymentInfo.remarks} onChange={(e) => setPaymentInfo({...paymentInfo, remarks: e.target.value})} style={{...styles.inputField, gridColumn: 'span 2'}} />
              </div>

              <button type="submit" disabled={submitting || !isFormValid()} style={{...styles.submitActionBlock, opacity: (!isFormValid() || submitting) ? 0.6 : 1}}>
                {submitting ? "Processing Transaction..." : "Execute Complete Renewal"}
              </button>
            </>
          )}
        </form>
      )}
    </div>
  );
}

const styles = {
  cardContainer: { maxWidth: '700px', padding: '25px', background: '#FFF', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', fontFamily: 'system-ui, sans-serif', margin: '20px auto' },
  formHeading: { margin: '0 0 20px 0', fontSize: '20px', color: '#111827', borderBottom: '2px solid #F3F4F6', paddingBottom: '10px', fontWeight: 'bold' as const },
  formStructure: { display: 'flex', flexDirection: 'column' as const, gap: '18px' },
  sectionHeader: { fontSize: '13px', color: '#4F46E5', textTransform: 'uppercase' as const, letterSpacing: '0.04em', margin: '10px 0 0 0', fontWeight: 'bold' as const },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  inputField: { padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' as const },
  fieldLabel: { fontSize: '13px', fontWeight: 'bold' as const, color: '#4B5563', display: 'block', marginBottom: '6px' },
  dropdownListContainer: { border: '1px solid #E5E7EB', borderRadius: '6px', background: '#FFF', marginTop: '4px', overflow: 'hidden' },
  dropdownRowItem: { padding: '12px 14px', borderBottom: '1px solid #F3F4F6', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontSize: '14px' },
  activeStudentDisplayBanner: { padding: '12px', background: '#EEF2F6', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  clearProfileButton: { background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' as const },
  expiryDisplayBanner: { gridColumn: 'span 2', padding: '10px 14px', backgroundColor: '#EFF6FF', border: '1px dashed #BFDBFE', borderRadius: '6px', fontSize: '13px', color: '#1E40AF' },
  errorAlertBanner: { padding: '14px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '8px', fontSize: '13px', lineHeight: '1.5', marginTop: '10px' },
  buttonFlex: { display: 'flex', gap: '8px', flexWrap: 'wrap' as const },
  toggleButton: { padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' as const },
  infoAlert: { fontSize: '13px', color: '#2563EB', fontStyle: 'italic', margin: 0 },
  successBanner: { padding: '14px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', borderRadius: '8px', fontSize: '13px' },
  warningBanner: { padding: '14px', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E', borderRadius: '8px', fontSize: '13px', display: 'flex', flexDirection: 'column' as const, gap: '8px' },
  dropdownPicker: { padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '14px', background: '#FFF', outline: 'none', width: '100%', marginTop: '5px' },
  splitAlertBox: { padding: '16px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px' },
  splitWarningHeader: { fontSize: '14px', fontWeight: 'bold' as const, color: '#B45309', marginBottom: '4px' },
  splitSelectorRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  splitShiftLabel: { fontSize: '13px', fontWeight: 'bold' as const, color: '#4B5563', width: '70px' },
  submitActionBlock: { marginTop: '10px', padding: '14px', background: '#4F46E5', color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold' as const }
};