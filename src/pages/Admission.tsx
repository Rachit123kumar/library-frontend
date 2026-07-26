import React, { useState, useEffect } from 'react';

interface Room {
  id: number;
  name: string;
}

interface Seat {
  id: number;
  seatNumber: number;
  nearAc: boolean;
  chargingPoint: boolean;
  room?: Room;
}

interface SplitShiftOption {
  shiftId: number;
  freeSeats: Seat[];
}

interface APIResponse {
  success: boolean;
  isSplitCombo: boolean;
  count?: number;
  availableSeats?: Seat[];
  splitOptions?: SplitShiftOption[];
  message?: string;
}

// 1. FIXED: Correct Vite environment variable syntax
// const BASE_URL = "https://api.libdesk.online";
// const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8787';
const BASE_URL = import.meta.env.VITE_API_URL

export default function AdmissionForm() {
  // 1. Core State Handlers
  const [studentInfo, setStudentInfo] = useState({
    name: '', fathersName: '', gender: 'male', phone: '', email: '', address: ''
  });
  
  const [startDate, setStartDate] = useState('');
  const [durationMonths, setDurationMonths] = useState<string>('1'); 
  const [endDate, setEndDate] = useState(''); 
  
  const [selectedShifts, setSelectedShifts] = useState<number[]>([]);
  const [paymentInfo, setPaymentInfo] = useState({ amount: '', paymentType: 'cash', remarks: '' });

  // 2. Control Data & Allocation Mapping States
  const [apiResponse, setApiResponse] = useState<APIResponse | null>(null);
  const [selectedSeatId, setSelectedSeatId] = useState<string>(''); // Used for continuous match
  const [splitSeatSelections, setSplitSeatSelections] = useState<Record<number, number>>({}); // { shiftId: seatId }
  
  const [checkingSeats, setCheckingSeats] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // System Date Constraints (Prevent past selections)
  const todayStr = new Date().toISOString().split('T')[0];

  // 3. EFFECT A: Auto-calculate End Date whenever Start Date or Duration Changes
  useEffect(() => {
    if (!startDate) {
      setEndDate('');
      return;
    }

    const start = new Date(startDate);
    const monthsToAdd = parseInt(durationMonths, 10);
    start.setMonth(start.getMonth() + monthsToAdd);
    
    const calculatedEndDate = start.toISOString().split('T')[0];
    setEndDate(calculatedEndDate);
  }, [startDate, durationMonths]);

  // 4. EFFECT B: Re-run live seat map queries when parameters change
  useEffect(() => {
    if (startDate && endDate && selectedShifts.length > 0) {
      fetchAvailableSeats();
    } else {
      setApiResponse(null);
      setSelectedSeatId('');
      setSplitSeatSelections({});
    }
  }, [startDate, endDate, selectedShifts]);

  // FIXED: Handles dynamic BASE_URL and checks response status
  const fetchAvailableSeats = async () => {
    setCheckingSeats(true);
    try {
      const query = new URLSearchParams({
        startDate,
        endDate,
        shifts: selectedShifts.join(',')
      }).toString();

      const res = await fetch(`${BASE_URL}/api/v1/available?${query}`);
      
      if (!res.ok) {
        throw new Error(`Server status ${res.status}: Route not found or internal server error`);
      }

      const result: APIResponse = await res.json();
      
      setApiResponse(result);
      setSelectedSeatId('');
      setSplitSeatSelections({});
    } catch (err) {
      console.error("Error fetching live slot configurations:", err);
      setApiResponse(null);
    } finally {
      setCheckingSeats(false);
    }
  };

  const handleShiftToggle = (shiftId: number) => {
    setSelectedShifts(prev => 
      prev.includes(shiftId) ? prev.filter(id => id !== shiftId) : [...prev, shiftId]
    );
  };

  const handleSplitSeatChange = (shiftId: number, seatIdStr: string) => {
    setSplitSeatSelections(prev => ({
      ...prev,
      [shiftId]: parseInt(seatIdStr, 10)
    }));
  };

  const handleStudentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setStudentInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setPaymentInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Helper validation status logic
  const isSelectionComplete = () => {
    if (!apiResponse) return false;
    if (apiResponse.isSplitCombo) {
      // Must have selected a valid seat for EVERY requested shift
      return selectedShifts.every(shiftId => !!splitSeatSelections[shiftId]);
    }
    return !!selectedSeatId;
  };

  // FIXED: Updated POST request URL to use BASE_URL
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSelectionComplete()) {
      alert("Please assign all required seat configuration mapping options.");
      return;
    }

    setSubmitting(true);
    try {
      let finalSeatData = {};
      if (apiResponse?.isSplitCombo) {
        finalSeatData = {
          isSplit: true,
          splitBookings: Object.entries(splitSeatSelections).map(([shiftId, seatId]) => ({
            shiftId: parseInt(shiftId, 10),
            seatId: seatId
          }))
        };
      } else {
        finalSeatData = {
          isSplit: false,
          seatId: parseInt(selectedSeatId, 10),
          shiftIds: selectedShifts
        };
      }

      const payload = {
        ...studentInfo,
        startDate,
        endDate,
        ...finalSeatData,
        ...paymentInfo
      };

      const response = await fetch(`${BASE_URL}/api/v1/admissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (response.ok && result.success) {
        alert("Success! Student profile saved and configuration grids allocated.");
        // Clean resets
        setStudentInfo({ name: '', fathersName: '', gender: 'male', phone: '', email: '', address: '' });
        setStartDate(''); setDurationMonths('1'); setSelectedShifts([]); setSelectedSeatId('');
        setSplitSeatSelections({}); setApiResponse(null);
        setPaymentInfo({ amount: '', paymentType: 'cash', remarks: '' });
      } else {
        alert(`Enrollment processing fault: ${result.message}`);
      }
    } catch (err) {
      console.error(err);
      alert("A system connection execution error halted data persistence processing.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.cardContainer}>
      <h2 style={styles.formHeading}>Student Admission Control</h2>
      <form onSubmit={handleFormSubmit} style={styles.formStructure}>
        
        {/* Section 1: Personal Profile */}
        <h3 style={styles.sectionHeader}>1. Personal Profiles</h3>
        <div style={styles.formGrid}>
          <input required type="text" name="name" placeholder="Student Name *" value={studentInfo.name} onChange={handleStudentChange} style={styles.inputField} />
          <input required type="text" name="fathersName" placeholder="Father's Name *" value={studentInfo.fathersName} onChange={handleStudentChange} style={styles.inputField} />
          <select name="gender" value={studentInfo.gender} onChange={handleStudentChange} style={styles.inputField}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <input required type="tel" name="phone" placeholder="Phone String *" value={studentInfo.phone} onChange={handleStudentChange} style={styles.inputField} />
          <input type="email" name="email" placeholder="Email Address" value={studentInfo.email} onChange={handleStudentChange} style={styles.inputField} />
          <textarea required name="address" placeholder="Permanent Residence Address Details *" value={studentInfo.address} onChange={handleStudentChange} style={{...styles.inputField, gridColumn: 'span 2', minHeight: '50px'}} />
        </div>

        {/* Section 2: Fixed Duration & Plan Adjustments */}
        <h3 style={styles.sectionHeader}>2. Plan & Shifts Configuration</h3>
        <div style={styles.formGrid}>
          <div>
            <label style={styles.fieldLabel}>Start Date *</label>
            <input required type="date" min={todayStr} value={startDate} onChange={(e) => setStartDate(e.target.value)} style={styles.inputField} />
          </div>
          <div>
            <label style={styles.fieldLabel}>Membership Term duration</label>
            <select value={durationMonths} onChange={(e) => setDurationMonths(e.target.value)} style={styles.inputField}>
              <option value="1">1 Month Plan</option>
              <option value="2">2 Months Plan</option>
              <option value="3">3 Months Plan</option>
            </select>
          </div>
          
          {/* Automatic Expiration Visual Readout Banner */}
          {endDate && (
            <div style={styles.expiryDisplayBanner}>
              🔒 System Generated Expiration Deadline: <strong>{endDate}</strong>
            </div>
          )}

          <div style={{ gridColumn: 'span 2', marginTop: '6px' }}>
            <label style={styles.fieldLabel}>Select Target Seat Shifts:</label>
            <div style={styles.buttonFlex}>
              {[1, 2, 3].map((num) => (
                <button type="button" key={num} onClick={() => handleShiftToggle(num)} style={{
                  ...styles.toggleButton,
                  backgroundColor: selectedShifts.includes(num) ? '#4F46E5' : '#FFF',
                  color: selectedShifts.includes(num) ? '#FFF' : '#374151'
                }}>
                  Shift {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Conditional Seat Grid Picker Map */}
        <h3 style={styles.sectionHeader}>3. Grid Layout Space Picker</h3>
        {checkingSeats && <p style={styles.infoAlert}>Scanning overlapping database indexes...</p>}
        
        {!checkingSeats && apiResponse && (
          <div>
            {/* CASE A: Standard Continuous Seats available */}
            {!apiResponse.isSplitCombo && apiResponse.availableSeats && apiResponse.availableSeats.length > 0 && (
              <div style={styles.seatContainerGrid}>
                {apiResponse.availableSeats.map(seat => (
                  <div 
                    key={seat.id} 
                    onClick={() => setSelectedSeatId(seat.id.toString())}
                    style={{
                      ...styles.interactiveSeatNode,
                      backgroundColor: selectedSeatId === seat.id.toString() ? '#10B981' : '#E5E7EB',
                      color: selectedSeatId === seat.id.toString() ? '#FFF' : '#1F2937',
                      borderColor: selectedSeatId === seat.id.toString() ? '#059669' : '#D1D5DB'
                    }}
                  >
                    <div style={{fontWeight: 'bold'}}>Seat {seat.seatNumber}</div>
                    <div style={{fontSize: '9px', opacity: 0.8}}>{seat.room?.name || 'Hall A'}</div>
                  </div>
                ))}
              </div>
            )}

            {/* CASE B: Fallback Alert Banner - Split Shift Combinations Plan Interface UI */}
            {apiResponse.isSplitCombo && apiResponse.splitOptions && (
              <div style={styles.splitAlertBox}>
                <div style={styles.splitWarningHeader}>
                  ⚠️ Split Seat Assignment Plan Required
                </div>
                <p style={styles.splitWarningSubText}>
                  No single desk is open for all selected shifts. Assign an available seat for each individual shift to complete admission processing:
                </p>
                <div style={styles.splitSelectColumn}>
                  {apiResponse.splitOptions.map((option) => (
                    <div key={option.shiftId} style={styles.splitSelectorRow}>
                      <span style={styles.splitShiftBadge}>Shift {option.shiftId} Seat:</span>
                      <select 
                        required
                        value={splitSeatSelections[option.shiftId] || ''}
                        onChange={(e) => handleSplitSeatChange(option.shiftId, e.target.value)}
                        style={styles.dropdownSelectField}
                      >
                        <option value="">-- Assign Seat --</option>
                        {option.freeSeats.map(seat => (
                          <option key={seat.id} value={seat.id}>
                            Seat #{seat.seatNumber} ({seat.room?.name || 'Main Area'})
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CASE C: Library is completely full across requested boundaries */}
            {((!apiResponse.isSplitCombo && apiResponse.availableSeats?.length === 0) || 
              (apiResponse.isSplitCombo && apiResponse.splitOptions?.length === 0)) && (
              <p style={styles.errorMessage}>No capacity layouts or alternate space options match this configuration query.</p>
            )}
          </div>
        )}

        {!checkingSeats && !apiResponse && (
          <p style={styles.warningMessage}>Input layout settings above to render real-time free seat matrix positions.</p>
        )}

        {/* Section 4: Ledgers Payment Summary */}
        <h3 style={styles.sectionHeader}>4. Payment Ledger Details</h3>
        <div style={styles.formGrid}>
          <input required type="number" name="amount" placeholder="Collected Fees (INR) *" value={paymentInfo.amount} onChange={handlePaymentChange} style={styles.inputField} />
          <select name="paymentType" value={paymentInfo.paymentType} onChange={handlePaymentChange} style={styles.inputField}>
            <option value="cash">Cash Ledger</option>
            <option value="upi">UPI Portal</option>
          </select>
          <input type="text" name="remarks" placeholder="Optional internal payment footnotes..." value={paymentInfo.remarks} onChange={handlePaymentChange} style={{...styles.inputField, gridColumn: 'span 2'}} />
        </div>

        <button type="submit" disabled={submitting || !isSelectionComplete()} style={{
          ...styles.submitActionBlock,
          opacity: (submitting || !isSelectionComplete()) ? 0.6 : 1
        }}>
          {submitting ? "Writing data transactions..." : "Execute Complete Admission & Booking"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  cardContainer: { maxWidth: '780px', margin: '20px auto', padding: '25px', background: '#FFF', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', fontFamily: 'system-ui, sans-serif' },
  formHeading: { margin: '0 0 20px 0', fontSize: '22px', color: '#111827', borderBottom: '2px solid #F3F4F6', paddingBottom: '10px' },
  formStructure: { display: 'flex', flexDirection: 'column' as const, gap: '20px' },
  sectionHeader: { fontSize: '14px', color: '#4F46E5', textTransform: 'uppercase' as const, letterSpacing: '0.04em', margin: '10px 0 0 0', borderLeft: '3px solid #4F46E5', paddingLeft: '8px', fontWeight: 'bold' as const },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  inputField: { padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' as const },
  fieldLabel: { fontSize: '13px', fontWeight: 'bold' as const, color: '#4B5563', display: 'block', marginBottom: '4px' },
  expiryDisplayBanner: { gridColumn: 'span 2', padding: '10px 14px', backgroundColor: '#EFF6FF', border: '1px dashed #BFDBFE', borderRadius: '6px', fontSize: '13px', color: '#1E40AF' },
  buttonFlex: { display: 'flex', gap: '10px' },
  toggleButton: { padding: '9px 18px', border: '1px solid #D1D5DB', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' as const, fontSize: '13px' },
  seatContainerGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px', border: '1px solid #E5E7EB', padding: '15px', borderRadius: '8px', background: '#F9FAFB', maxHeight: '160px', overflowY: 'auto' as const },
  interactiveSeatNode: { padding: '8px 4px', textAlign: 'center' as const, borderRadius: '6px', cursor: 'pointer', border: '1px solid', fontSize: '13px' },
  infoAlert: { fontSize: '13px', color: '#2563EB', fontStyle: 'italic', margin: 0 },
  warningMessage: { fontSize: '13px', color: '#6B7280', padding: '12px', background: '#F3F4F6', borderRadius: '6px', fontStyle: 'italic', margin: 0 },
  errorMessage: { fontSize: '13px', color: '#DC2626', padding: '12px', background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '6px', margin: 0 },
  submitActionBlock: { marginTop: '10px', padding: '14px', background: '#4F46E5', color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold' as const },
  splitAlertBox: { padding: '16px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px' },
  splitWarningHeader: { fontSize: '14px', fontWeight: 'bold' as const, color: '#B45309', marginBottom: '4px' },
  splitWarningSubText: { fontSize: '13px', color: '#78350F', margin: '0 0 14px 0', lineHeight: '1.4' },
  splitSelectColumn: { display: 'flex', flexDirection: 'column' as const, gap: '10px' },
  splitSelectorRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  splitShiftBadge: { fontSize: '13px', fontWeight: 'bold' as const, color: '#4B5563', width: '100px' },
  dropdownSelectField: { padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '14px', background: '#FFF', outline: 'none', width: '220px' }
};