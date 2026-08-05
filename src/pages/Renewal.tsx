import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  LuCreditCard,
  LuGrid2X2,
  LuArrowLeft,
  LuCheck,
  LuRefreshCw,
  LuSparkles,
  LuPrinter,
  LuShieldCheck,
  LuShare2,
  LuSearch,
  LuBookmarkCheck,
  LuHistory,
  LuClock,
  LuCalendar,
  LuCheckCheck,
  LuBug,
  LuZap,
  LuSnowflake,
  LuLayoutDashboard,
} from 'react-icons/lu';
import LibrarySidebar from '../components/LibrarySideBar';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000';

interface Shift {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  price: number;
}

interface LibraryData {
  id: number;
  name: string;
  address: string;
  holdDays: number;
  shifts: Shift[];
}

interface StudentSearchResult {
  id: number;
  name: string;
  fathersName: string;
  phone: string;
  email?: string;
  address: string;
  memberships: Array<{
    id: number;
    startDate: string;
    endDate: string;
    bookings: Array<{
      id: number;
      seatId: number;
      shiftId: number;
      seat?: {
        id: number;
        seatNumber: number;
        roomId: number;
        nearAc?: boolean;
        chargingPoint?: boolean;
        genderType?: string;
        room?: {
          name: string;
        } | null;
      } | null;
      shift?: {
        id: number;
        name: string;
        startTime: string;
        endTime: string;
      } | null;
    }>;
  }>;
}

interface SeatOption {
  id: number;
  seatNumber: number;
  roomName: string;
  nearAc?: boolean;
  chargingPoint?: boolean;
  genderType?: string;
  totalDailyBookings: number;
}

interface RenewalResponse {
  student: {
    id: number;
    name: string;
    fathersName: string;
    phone: string;
    address: string;
  };
  membership: {
    id: number;
    startDate: string;
    endDate: string;
  };
  bookings: Array<{
    id: number;
    seatId: number;
    shiftId: number;
    shiftPrice: number;
  }>;
  payment: {
    id: number;
    amount: number;
    paymentType: string;
    remarks?: string;
  };
}

function formatReadableDate(dateInput?: string | Date | null): string {
  if (!dateInput) return 'N/A';
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return 'Invalid Date';
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'N/A';
  }
}

export default function RenewalPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [library, setLibrary] = useState<LibraryData | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<StudentSearchResult[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentSearchResult | null>(null);

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [renewalType, setRenewalType] = useState<'continuous' | 'custom'>('continuous');

  const todayStr = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [durationMonths, setDurationMonths] = useState<number>(1);
  const [endDate, setEndDate] = useState('');

  const [previousSeatsMap, setPreviousSeatsMap] = useState<
    Record<number, { seatId: number; seatNumber: number; roomName: string }>
  >({});

  const [selectedShiftIds, setSelectedShiftIds] = useState<number[]>([]);
  const [assignSeatLater, setAssignSeatLater] = useState<boolean>(false);
  const [checkingAvailability, setCheckingAvailability] = useState<boolean>(false);
  const [hasContinuousSeat, setHasContinuousSeat] = useState<boolean>(false);
  const [continuousSeats, setContinuousSeats] = useState<SeatOption[]>([]);
  const [availabilityPerShift, setAvailabilityPerShift] = useState<Record<number, SeatOption[]>>({});
  const [chosenAllocations, setChosenAllocations] = useState<Record<number, number>>({});

  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<'cash' | 'upi'>('upi');
  const [paymentRemarks, setPaymentRemarks] = useState('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [completedRenewal, setCompletedRenewal] = useState<RenewalResponse | null>(null);

  const showToast = (title: string, message: string, type: 'success' | 'error' = 'error') => {
    toast.dismiss();
    const content = (
      <div>
        <div className="font-bold text-xs font-mono uppercase tracking-wider text-white">{title}</div>
        <div className="text-xs text-slate-300 mt-0.5">{message}</div>
      </div>
    );
    if (type === 'success') toast.success(content, { autoClose: 3500 });
    else toast.error(content, { autoClose: 3500 });
  };

  const fetchLibraryDetails = async () => {
    if (!id) return;
    try {
      const res = await fetch(`${BASE_URL}/api/v1/admission/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();

      if (res.status === 403) {
        showToast('Access Denied', 'You are not authorized for this branch.', 'error');
        navigate('/me');
        return;
      }
      if (res.status === 401) {
        showToast('Session Expired', 'Please sign in again.', 'error');
        navigate('/signin');
        return;
      }
      if (!res.ok) throw new Error(data?.message || 'Failed to load branch details');
      setLibrary(data.library);
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  useEffect(() => {
    fetchLibraryDetails();
  }, [id]);

  const calculateEndDate = (start: string, months: number): string => {
    const [y, m, d] = start.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setMonth(dateObj.getMonth() + months);
    dateObj.setDate(dateObj.getDate() - 1);
    
    const finalYear = dateObj.getFullYear();
    const finalMonth = String(dateObj.getMonth() + 1).padStart(2, '0');
    const finalDay = String(dateObj.getDate()).padStart(2, '0');
    
    return `${finalYear}-${finalMonth}-${finalDay}`;
  };

  const handleSearchStudents = async () => {
    if (!searchQuery.trim()) return;
    try {
      setSearching(true);
      const res = await fetch(
        `${BASE_URL}/api/v1/renewals/${id}/renewals/search?query=${encodeURIComponent(searchQuery)}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );
      const data = await res.json();

      if (res.status === 403) {
        showToast('Access Denied', 'Redirecting...', 'error');
        navigate('/me');
        return;
      }
      if (!res.ok) throw new Error(data?.message || 'Failed to search students');
      setSearchResults(data.students || []);
    } catch (err: any) {
      showToast('Search Error', err.message, 'error');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectStudent = (student: StudentSearchResult) => {
    setSelectedStudent(student);
    const lastMembership = student.memberships?.[0];

    const prevMap: Record<number, { seatId: number; seatNumber: number; roomName: string }> = {};

    if (lastMembership) {
      lastMembership.bookings?.forEach((b) => {
        if (b.seat && b.seat.seatNumber !== undefined) {
          prevMap[b.shiftId] = {
            seatId: b.seatId,
            seatNumber: b.seat.seatNumber,
            roomName: b.seat.room?.name || 'Main Room',
          };
        }
      });

      const prevEnd = new Date(lastMembership.endDate);
      prevEnd.setDate(prevEnd.getDate() + 1);
      const nextStartStr = prevEnd.toISOString().split('T')[0];

      setStartDate(nextStartStr);
      setEndDate(calculateEndDate(nextStartStr, 1));

      const prevShiftIds = lastMembership.bookings?.map((b) => b.shiftId) || [];
      setSelectedShiftIds(prevShiftIds);
      recalculateTotalPrice(prevShiftIds, 1);
    } else {
      setStartDate(todayStr);
      setEndDate(calculateEndDate(todayStr, 1));
    }

    setPreviousSeatsMap(prevMap);
    setCurrentStep(2);
  };

  const handleDurationChange = (months: number) => {
    setDurationMonths(months);
    const newEnd = calculateEndDate(startDate, months);
    setEndDate(newEnd);
    recalculateTotalPrice(selectedShiftIds, months);
  };

  const handleStartDateChange = (newStart: string) => {
    setStartDate(newStart);
    const newEnd = calculateEndDate(newStart, durationMonths);
    setEndDate(newEnd);
  };

  const toggleShiftSelection = (shiftId: number) => {
    let updated: number[];
    if (selectedShiftIds.includes(shiftId)) {
      updated = selectedShiftIds.filter((s) => s !== shiftId);
    } else {
      updated = [...selectedShiftIds, shiftId];
    }
    setSelectedShiftIds(updated);
    recalculateTotalPrice(updated, durationMonths);
  };

  const recalculateTotalPrice = (shiftIds: number[], months: number) => {
    if (!library) return;
    const monthlyTotal = library.shifts
      .filter((s) => shiftIds.includes(s.id))
      .reduce((sum, s) => sum + s.price, 0);
    setPaymentAmount(monthlyTotal * months);
  };

  const checkSeatAvailability = async () => {
    if (!selectedStudent) {
      showToast('Error', 'No student selected for renewal.', 'error');
      return;
    }

    if (selectedShiftIds.length === 0) {
      showToast('Validation Error', 'Please select at least one shift.', 'error');
      return;
    }

    try {
      setCheckingAvailability(true);
      const res = await fetch(
        `${BASE_URL}/api/v1/admission/${id}/admissions/check-availability`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            startDate,
            endDate,
            shiftIds: selectedShiftIds,
            excludeStudentId: selectedStudent.id
          }),
        }
      );

      const data = await res.json();
      if (res.status === 403) {
        showToast('Access Denied', 'Redirecting...', 'error');
        navigate('/me');
        return;
      }
      if (!res.ok) throw new Error(data?.message || 'Failed to check seat availability');

      setHasContinuousSeat(data.hasContinuousSeat);
      setContinuousSeats(data.continuousSeats || []);
      setAvailabilityPerShift(data.availabilityPerShift || {});

      const initialMap: Record<number, number> = {};

      if (data.hasContinuousSeat && data.continuousSeats?.length > 0) {
        const firstShiftId = selectedShiftIds[0];
        const prevSeat = previousSeatsMap[firstShiftId];
        const isPrevContinuous =
          prevSeat && data.continuousSeats.some((s: SeatOption) => s.id === prevSeat.seatId);

        const targetSeatId = isPrevContinuous ? prevSeat.seatId : data.continuousSeats[0].id;

        selectedShiftIds.forEach((sId) => {
          initialMap[sId] = targetSeatId;
        });
      } else {
        selectedShiftIds.forEach((sId) => {
          const prevSeat = previousSeatsMap[sId];
          const availList = data.availabilityPerShift?.[sId] || [];

          if (prevSeat && availList.some((s: SeatOption) => s.id === prevSeat.seatId)) {
            initialMap[sId] = prevSeat.seatId;
          } else {
            const recommended = data.recommendedCombination?.find((r: any) => r.shiftId === sId);
            if (recommended) initialMap[sId] = recommended.seatId;
          }
        });
      }

      setChosenAllocations(initialMap);
      setCurrentStep(3);
    } catch (err: any) {
      showToast('Availability Check Failed', err.message, 'error');
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleSubmitRenewal = async () => {
    if (!selectedStudent) return;
    try {
      setSubmitting(true);

      let allocationsPayload: Array<{ shiftId: number; seatId: number }> = [];
      if (!assignSeatLater) {
        allocationsPayload = Object.entries(chosenAllocations).map(([sId, seatId]) => ({
          shiftId: parseInt(sId, 10),
          seatId,
        }));
      }

      const payload = {
        studentId: selectedStudent.id,
        startDate,
        endDate,
        allocations: allocationsPayload.length > 0 ? allocationsPayload : undefined,
        paymentAmount,
        paymentType,
        paymentRemarks: paymentRemarks || undefined,
      };

      const res = await fetch(`${BASE_URL}/api/v1/renewals/${id}/renewals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.status === 403) {
        showToast('Access Denied', 'Redirecting...', 'error');
        navigate('/me');
        return;
      }
      if (!res.ok) throw new Error(data?.message || 'Failed to process renewal.');

      showToast('Renewal Success!', data.message, 'success');
      setCompletedRenewal(data.data);
      setCurrentStep(5);
    } catch (err: any) {
      showToast('Renewal Failed', err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const printOrSavePdf = () => {
    if (!completedRenewal || !library) return;

    const seatsFormatted =
      completedRenewal.bookings?.length > 0
        ? completedRenewal.bookings
            .map((b) => {
              const s = library.shifts.find((sh) => sh.id === b.shiftId);
              return `<tr>
                <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; color: #1e293b;">
                  ${s?.name || `Shift #${b.shiftId}`} (${s?.startTime || ''} - ${s?.endTime || ''})
                </td>
                <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; color: #2563eb; text-align: right;">
                  Seat #${b.seatId}
                </td>
              </tr>`;
            })
            .join('')
        : `<tr><td colspan="2" style="padding: 10px; border: 1px solid #e2e8f0; color: #d97706; text-align: center; font-weight: bold;">Floating Member — Pending Seat Assignment</td></tr>`;

    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Renewal_Receipt_M#${completedRenewal.membership.id}_${completedRenewal.student.name}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 30px; color: #0f172a; background: #fff; }
            .receipt-box { border: 2px solid #2563eb; border-radius: 12px; padding: 24px; max-width: 650px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 16px; margin-bottom: 20px; }
            .title { font-size: 20px; font-weight: 800; color: #2563eb; margin: 0; }
            .subtitle { font-size: 12px; color: #64748b; margin-top: 2px; }
            .badge { background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; font-weight: bold; font-family: monospace; padding: 6px 12px; border-radius: 8px; font-size: 13px; text-align: right; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; font-size: 13px; }
            .label { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: bold; display: block; margin-bottom: 2px; }
            .value { font-weight: bold; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
            .total-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; align-items: center; }
            .total-amount { font-size: 18px; font-weight: 800; color: #16a34a; }
            .footer { text-align: center; margin-top: 24px; font-size: 11px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="receipt-box">
            <div class="header">
              <div>
                <h1 class="title">${library.name.toUpperCase()}</h1>
                <div class="subtitle">${library.address}</div>
              </div>
              <div class="badge">RENEWAL ID: #${completedRenewal.membership.id}</div>
            </div>

            <div class="grid">
              <div><span class="label">Student Name</span><span class="value">${completedRenewal.student.name}</span></div>
              <div><span class="label">Father's Name</span><span class="value">${completedRenewal.student.fathersName}</span></div>
              <div><span class="label">Phone</span><span class="value">${completedRenewal.student.phone}</span></div>
              <div><span class="label">Address</span><span class="value">${completedRenewal.student.address}</span></div>
            </div>

            <div class="grid" style="background: #f8fafc; padding: 12px; border-radius: 8px;">
              <div><span class="label">Renewed Start</span><span class="value" style="color: #16a34a;">${formatReadableDate(completedRenewal.membership.startDate)}</span></div>
              <div><span class="label">Renewed End</span><span class="value" style="color: #16a34a;">${formatReadableDate(completedRenewal.membership.endDate)}</span></div>
            </div>

            <span class="label" style="margin-bottom: 6px;">Assigned Seats & Shifts</span>
            <table><tbody>${seatsFormatted}</tbody></table>

            <div class="total-box">
              <div>
                <span class="label">Payment Mode: ${completedRenewal.payment.paymentType.toUpperCase()}</span>
                <span style="font-size: 11px; color: #64748b;">${completedRenewal.payment.remarks || 'Membership Renewal'}</span>
              </div>
              <div class="total-amount">₹${completedRenewal.payment.amount}</div>
            </div>

            <div class="footer">Thank you for renewing at ${library.name}!</div>
          </div>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const shareWhatsAppReceipt = () => {
    if (!completedRenewal || !library) return;

    const formattedPhone = completedRenewal.student.phone.replace(/[^0-9]/g, '');
    const targetPhone = formattedPhone.length === 10 ? `91${formattedPhone}` : formattedPhone;

    const seatsFormatted =
      completedRenewal.bookings?.length > 0
        ? completedRenewal.bookings
            .map((b) => {
              const s = library.shifts.find((sh) => sh.id === b.shiftId);
              return `• ${s?.name || 'Shift'}: Seat #${b.seatId}`;
            })
            .join('\n')
        : '• Seat: Floating Member (Assign Later)';

    const message = `🔄 *MEMBERSHIP RENEWED — ${library.name.toUpperCase()}* 🔄\n\nHello *${completedRenewal.student.name}*, your membership has been successfully extended!\n\n🆔 *Renewal ID:* #${completedRenewal.membership.id}\n📅 *Valid Period:* ${formatReadableDate(completedRenewal.membership.startDate)} to ${formatReadableDate(completedRenewal.membership.endDate)}\n💳 *Amount Paid:* ₹${completedRenewal.payment.amount} (${completedRenewal.payment.paymentType.toUpperCase()})\n\n🪑 *Assigned Seats:*\n${seatsFormatted}\n\nThank you for continuing your study with ${library.name}!`;

    window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const lastM = selectedStudent?.memberships?.[0];

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 font-sans antialiased relative selection:bg-blue-600 selection:text-white flex font-mono">
      {/* BACKGROUND GRAPHICS */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1f293d12_1px,transparent_1px),linear-gradient(to_bottom,#1f293d12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[380px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-[140px] pointer-events-none rounded-full" />

      {/* REUSABLE SIDEBAR */}
      <LibrarySidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        branchName={library?.name || 'Branch'}
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        
        {/* HEADER BAR */}
        <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-4 sm:p-6 backdrop-blur-xl mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] text-blue-400 uppercase">
              Membership Extensions
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">Student Renewal Portal</h1>
          </div>
          <button
            onClick={() => navigate(`/library/${id}`)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase border border-slate-700 flex justify-center items-center gap-2"
          >
            <LuArrowLeft className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Dashboard</span>
          </button>
        </div>

        {/* STEP 1: SEARCH STUDENT */}
        {currentStep === 1 && (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-4 sm:p-8 space-y-5">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <LuSearch className="w-5 h-5 text-blue-400 shrink-0" /> Search Student to Renew
            </h2>

            <div className="flex flex-col xs:flex-row gap-3">
              <input
                type="text"
                placeholder="Name, Phone, or Mem ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchStudents()}
                className="w-full xs:flex-1 bg-[#080C14] border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSearchStudents}
                disabled={searching}
                className="w-full xs:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase rounded-xl flex items-center justify-center gap-2"
              >
                {searching ? <LuRefreshCw className="w-4 h-4 animate-spin shrink-0" /> : <LuSearch className="w-4 h-4 shrink-0" />}
                <span>Search</span>
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <span className="text-xs text-slate-400 uppercase font-bold">
                  Matches Found ({searchResults.length}):
                </span>
                <div className="space-y-3">
                  {searchResults.map((std) => {
                    const lastMem = std.memberships?.[0];
                    const lastSeatBooking = lastMem?.bookings?.find((b) => b.seat?.seatNumber !== undefined);

                    const shiftNames = lastMem?.bookings
                      ?.map((b) => b.shift?.name || library?.shifts.find((s) => s.id === b.shiftId)?.name)
                      .filter(Boolean)
                      .join(', ');

                    const totalShiftsCount = lastMem?.bookings?.length || 0;

                    return (
                      <div
                        key={std.id}
                        onClick={() => handleSelectStudent(std)}
                        className="cursor-pointer bg-[#080C14] border border-slate-800 hover:border-blue-500/50 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                      >
                        <div className="space-y-2 w-full">
                          <div className="font-bold text-sm text-white flex flex-wrap items-center gap-2">
                            <span>{std.name}</span>
                            {lastMem && (
                              <span className="px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30 text-[10px] uppercase tracking-wider font-bold">
                                Mem #{lastMem.id}
                              </span>
                            )}
                          </div>
                          
                          <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span>Father: <span className="text-slate-300">{std.fathersName}</span></span>
                            <span className="hidden sm:inline text-slate-600">|</span>
                            <span>Phone: <span className="text-slate-300">{std.phone}</span></span>
                          </div>

                          {lastMem ? (
                            <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px]">
                              <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 text-blue-400">
                                <LuCalendar className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">
                                  {formatReadableDate(lastMem.startDate)} – {formatReadableDate(lastMem.endDate)}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 text-emerald-400 font-bold">
                                <LuClock className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">
                                  {totalShiftsCount} Shift{totalShiftsCount !== 1 ? 's' : ''} ({shiftNames || 'Standard Shift'})
                                </span>
                              </div>

                              {lastSeatBooking?.seat?.seatNumber !== undefined && (
                                <div className="bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 text-amber-400 font-bold">
                                  Seat #{lastSeatBooking.seat.seatNumber} ({lastSeatBooking.seat.room?.name || 'Main'})
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-500 italic pt-1">
                              No previous membership history on record.
                            </div>
                          )}
                        </div>
                        <button className="w-full sm:w-auto px-5 py-2.5 sm:py-2 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold text-xs rounded-xl uppercase shrink-0 transition-all">
                          Select
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: DATES & PLAN */}
        {currentStep === 2 && selectedStudent && (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-4 sm:p-8 space-y-6">
            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">{selectedStudent.name}</h2>
                <p className="text-[11px] sm:text-xs text-slate-400">Father's Name: {selectedStudent.fathersName}</p>
              </div>
              <button onClick={() => setCurrentStep(1)} className="text-[11px] sm:text-xs text-blue-400 uppercase font-bold underline shrink-0">
                Change Student
              </button>
            </div>

            {lastM && (
              <div className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-2xl space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs font-bold text-blue-400 uppercase">
                  <LuHistory className="w-4 h-4 shrink-0 text-blue-400" /> Previous History (Mem #{lastM.id}):
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs pt-1">
                  <div className="bg-[#080C14] p-2.5 sm:p-3 rounded-xl border border-slate-800/80">
                    <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase block truncate">Prev Start Date</span>
                    <span className="text-white font-bold font-mono">{formatReadableDate(lastM.startDate)}</span>
                  </div>
                  <div className="bg-[#080C14] p-2.5 sm:p-3 rounded-xl border border-slate-800/80">
                    <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase block truncate">Prev End Date</span>
                    <span className="text-rose-400 font-bold font-mono">{formatReadableDate(lastM.endDate)}</span>
                  </div>
                </div>
              </div>
            )}

            {Object.keys(previousSeatsMap).length > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/30 p-3 sm:p-4 rounded-2xl flex items-start sm:items-center gap-3 text-xs">
                <LuBookmarkCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5 sm:mt-0" />
                <div>
                  <span className="font-bold text-blue-400 uppercase block mb-0.5">Previous Seat Remembered:</span>
                  <span className="text-slate-300 leading-relaxed">
                    Student previously occupied{' '}
                    {Object.entries(previousSeatsMap)
                      .map(([, sMeta]) => `Seat #${sMeta.seatNumber} (${sMeta.roomName})`)
                      .join(', ')}
                    . The engine will pre-select these seats if available!
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-[11px] sm:text-xs uppercase font-bold text-slate-300">Renewal Schedule Strategy:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setRenewalType('continuous');
                    if (lastM) {
                      const prevEnd = new Date(lastM.endDate);
                      prevEnd.setDate(prevEnd.getDate() + 1);
                      const nextStartStr = prevEnd.toISOString().split('T')[0];
                      setStartDate(nextStartStr);
                      setEndDate(calculateEndDate(nextStartStr, durationMonths));
                    }
                  }}
                  className={`p-3 sm:p-4 rounded-2xl border text-left transition-all ${
                    renewalType === 'continuous'
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                      : 'bg-[#080C14] border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-bold text-[11px] sm:text-xs uppercase text-blue-400">Continuous Renewal</div>
                  <div className="text-[10px] sm:text-[11px] text-slate-300 mt-1 leading-snug">
                    Auto-starts exactly 1 day after previous membership ended ({lastM ? formatReadableDate(new Date(new Date(lastM.endDate).setDate(new Date(lastM.endDate).getDate() + 1))) : 'Today'}).
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRenewalType('custom')}
                  className={`p-3 sm:p-4 rounded-2xl border text-left transition-all ${
                    renewalType === 'custom'
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                      : 'bg-[#080C14] border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-bold text-[11px] sm:text-xs uppercase text-blue-400">Custom Date Renewal</div>
                  <div className="text-[10px] sm:text-[11px] text-slate-300 mt-1 leading-snug">
                    For students who took a break. Select today, future, or custom dates.
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800">
              <label className="block text-[11px] sm:text-xs uppercase font-bold text-slate-300">Select Renewal Duration:</label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[1, 2, 3].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleDurationChange(m)}
                    className={`py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl font-bold text-[10px] sm:text-xs uppercase border transition-all ${
                      durationMonths === m
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/10'
                        : 'bg-[#080C14] border-slate-800 text-slate-400'
                    }`}
                  >
                    {m} Month{m > 1 ? 's' : ''}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3">
                <div>
                  <label className="block text-[10px] sm:text-xs uppercase text-slate-400 mb-1">
                    Renewal Start Date ({formatReadableDate(startDate)})
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    disabled={renewalType === 'continuous'}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className="w-full bg-[#080C14] border border-slate-800 rounded-xl px-3 sm:px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs uppercase text-slate-400 mb-1">
                    Renewal End Date ({formatReadableDate(endDate)})
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-[#080C14] border border-slate-800 rounded-xl px-3 sm:px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800">
              <label className="block text-[11px] sm:text-xs uppercase font-bold text-slate-300">Selected Shift(s):</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {library?.shifts.map((shift) => {
                  const isSelected = selectedShiftIds.includes(shift.id);
                  return (
                    <div
                      key={shift.id}
                      onClick={() => toggleShiftSelection(shift.id)}
                      className={`cursor-pointer p-3.5 sm:p-4 rounded-2xl border transition-all ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                          : 'bg-[#080C14] border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs sm:text-sm truncate pr-2">{shift.name}</span>
                        {isSelected && <LuCheck className="w-4 h-4 text-blue-400 shrink-0" />}
                      </div>
                      <div className="text-[10px] sm:text-xs text-slate-400 mt-1">{shift.startTime} – {shift.endTime}</div>
                      <div className="text-[11px] sm:text-xs font-bold text-emerald-400 mt-2">
                        ₹{shift.price * durationMonths} total
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={checkSeatAvailability}
              disabled={checkingAvailability}
              className="w-full py-3.5 sm:py-4 mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-[11px] sm:text-xs uppercase rounded-xl shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              {checkingAvailability ? <LuRefreshCw className="w-4 h-4 animate-spin shrink-0" /> : <LuSparkles className="w-4 h-4 shrink-0" />}
              <span>Verify Seats & Pre-Select Previous Seat</span>
            </button>
          </div>
        )}

        {/* STEP 3: SEAT ALLOCATION ENGINE */}
        {currentStep === 3 && (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-4 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <LuGrid2X2 className="w-5 h-5 text-blue-400 shrink-0" /> Renewal Seat Matrix
                </h2>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-1">
                  Window: {formatReadableDate(startDate)} to {formatReadableDate(endDate)} ({selectedShiftIds.length} Shift{selectedShiftIds.length > 1 ? 's' : ''})
                </p>
              </div>

              <label className="flex items-center gap-2 bg-slate-800/80 px-3 py-2 sm:py-1.5 rounded-xl border border-slate-700 cursor-pointer w-full sm:w-auto justify-center">
                <input
                  type="checkbox"
                  checked={assignSeatLater}
                  onChange={(e) => setAssignSeatLater(e.target.checked)}
                  className="rounded bg-[#080C14] border-slate-700 text-blue-600 focus:ring-0"
                />
                <span className="text-[10px] sm:text-xs text-slate-300 font-bold uppercase truncate">
                  Floating Member (Assign Later)
                </span>
              </label>
            </div>

            {!assignSeatLater && (
              <div className="space-y-6">
                {hasContinuousSeat ? (
                  <div className="space-y-4">
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 sm:p-4 rounded-2xl flex items-start gap-3">
                      <LuCheckCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-emerald-400 font-bold text-[11px] sm:text-xs uppercase">
                          Continuous Single Seat Available!
                        </div>
                        <div className="text-[10px] sm:text-xs text-slate-300 mt-0.5">
                          Select one continuous seat below for all {selectedShiftIds.length} requested shift(s):
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#080C14] border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-3">
                      <label className="block text-[10px] sm:text-xs uppercase font-bold text-blue-400">
                        Choose Available Continuous Seat:
                      </label>

                      <div className="max-h-[350px] overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
                        {continuousSeats.map((seat) => {
                          const firstShiftId = selectedShiftIds[0];
                          const prevSeat = previousSeatsMap[firstShiftId];
                          const isPrevious = prevSeat && prevSeat.seatId === seat.id;
                          const isSelected = chosenAllocations[selectedShiftIds[0]] === seat.id;

                          return (
                            <div
                              key={seat.id}
                              onClick={() => {
                                const updatedMap: Record<number, number> = {};
                                selectedShiftIds.forEach((sId) => {
                                  updatedMap[sId] = seat.id;
                                });
                                setChosenAllocations(updatedMap);
                              }}
                              className={`cursor-pointer p-3 sm:p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                                isSelected
                                  ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2 sm:gap-3 w-full pr-2">
                                <div
                                  className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-mono font-bold text-xs sm:text-sm ${
                                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
                                  }`}
                                >
                                  #{seat.seatNumber}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="font-bold text-[11px] sm:text-xs text-white flex flex-wrap items-center gap-1.5">
                                    <span className="truncate">{seat.roomName}</span>
                                    {isPrevious && (
                                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[9px] uppercase font-bold whitespace-nowrap">
                                        ⭐ Previous Seat
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex flex-wrap items-center gap-1.5 text-[9px] sm:text-[10px] mt-1 text-slate-400">
                                    <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
                                      {seat.genderType === 'male' && '👨 Boys Only'}
                                      {seat.genderType === 'female' && '👩 Girls Only'}
                                      {(!seat.genderType || seat.genderType === 'all') && '👫 Unisex'}
                                    </span>

                                    {seat.nearAc && (
                                      <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold flex items-center gap-0.5">
                                        <LuSnowflake className="w-2.5 h-2.5" /> AC
                                      </span>
                                    )}

                                    {seat.chargingPoint && (
                                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold flex items-center gap-0.5">
                                        <LuZap className="w-2.5 h-2.5" /> Plug
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="shrink-0">
                                {isSelected ? (
                                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                    <LuCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-slate-700" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-amber-500/10 border border-amber-500/30 p-3 sm:p-4 rounded-2xl flex items-start gap-3">
                      <LuBug className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-amber-400 font-bold text-[11px] sm:text-xs uppercase">
                          Minimal Seat Swap Suggested
                        </div>
                        <div className="text-[10px] sm:text-xs text-slate-300 mt-0.5">
                          No single continuous seat is available across all shifts. Select seats for each shift below:
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 sm:space-y-6">
                      {selectedShiftIds.map((sId) => {
                        const shiftObj = library?.shifts.find((s) => s.id === sId);
                        const avail = availabilityPerShift[sId] || [];
                        const prevSeat = previousSeatsMap[sId];
                        const isPrevFree = prevSeat && avail.some((s) => s.id === prevSeat.seatId);

                        return (
                          <div key={sId} className="bg-[#080C14] border border-slate-800 p-3 sm:p-5 rounded-2xl space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                              <span className="text-[11px] sm:text-xs font-bold text-blue-400 uppercase tracking-wider">
                                {shiftObj?.name} ({shiftObj?.startTime} – {shiftObj?.endTime})
                              </span>
                              {prevSeat && (
                                <span
                                  className={`text-[9px] sm:text-[11px] font-bold ${
                                    isPrevFree ? 'text-emerald-400' : 'text-amber-400'
                                  }`}
                                >
                                  {isPrevFree
                                    ? `✨ Seat #${prevSeat.seatNumber} (${prevSeat.roomName}) Available!`
                                    : `⚠️ Seat #${prevSeat.seatNumber} Occupied for this window`}
                                </span>
                              )}
                            </div>

                            <div className="max-h-60 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                              {avail.map((seat) => {
                                const isPrevious = prevSeat && prevSeat.seatId === seat.id;
                                const isSelected = chosenAllocations[sId] === seat.id;

                                return (
                                  <div
                                    key={seat.id}
                                    onClick={() =>
                                      setChosenAllocations({
                                        ...chosenAllocations,
                                        [sId]: seat.id,
                                      })
                                    }
                                    className={`cursor-pointer p-2.5 sm:p-3 rounded-xl border transition-all flex items-center justify-between ${
                                      isSelected
                                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 sm:gap-3 w-full pr-2">
                                      <div
                                        className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center font-mono font-bold text-xs sm:text-sm ${
                                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
                                        }`}
                                      >
                                        #{seat.seatNumber}
                                      </div>

                                      <div className="min-w-0 flex-1">
                                        <div className="font-bold text-[10px] sm:text-xs text-white flex flex-wrap items-center gap-1.5">
                                          <span className="truncate">{seat.roomName}</span>
                                          {isPrevious && (
                                            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[8px] sm:text-[9px] uppercase font-bold whitespace-nowrap">
                                              ⭐ Prev Seat
                                            </span>
                                          )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-1 text-[8px] sm:text-[10px] mt-0.5 text-slate-400">
                                          <span className="px-1 py-0.5 rounded bg-slate-800 text-slate-300">
                                            {seat.genderType === 'male' && '👨 Boy'}
                                            {seat.genderType === 'female' && '👩 Girl'}
                                            {(!seat.genderType || seat.genderType === 'all') && '👫 Unisex'}
                                          </span>

                                          {seat.nearAc && (
                                            <span className="text-cyan-400 font-bold flex items-center gap-0.5 px-1 bg-cyan-900/20 rounded">
                                              <LuSnowflake className="w-2.5 h-2.5" /> AC
                                            </span>
                                          )}

                                          {seat.chargingPoint && (
                                            <span className="text-emerald-400 font-bold flex items-center gap-0.5 px-1 bg-emerald-900/20 rounded">
                                              <LuZap className="w-2.5 h-2.5" /> Plug
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="shrink-0">
                                      {isSelected && <LuCheck className="w-4 h-4 text-blue-400" />}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-slate-800">
              <button
                onClick={() => setCurrentStep(2)}
                className="w-full sm:w-1/2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] sm:text-xs uppercase rounded-xl transition-all"
              >
                Back to Plan
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                className="w-full sm:w-1/2 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] sm:text-xs uppercase rounded-xl shadow-lg shadow-blue-600/30 transition-all"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PAYMENT */}
        {currentStep === 4 && (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-4 sm:p-8 space-y-6">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <LuCreditCard className="w-5 h-5 text-blue-400 shrink-0" /> Renewal Payment
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] sm:text-xs uppercase text-slate-300 mb-1">Payment Amount (INR)</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full bg-[#080C14] border border-slate-800 rounded-xl px-4 py-3 sm:py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs uppercase text-slate-300 mb-1">Payment Mode</label>
                <select
                  value={paymentType}
                  onChange={(e: any) => setPaymentType(e.target.value)}
                  className="w-full bg-[#080C14] border border-slate-800 rounded-xl px-4 py-3 sm:py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="upi">UPI / Online</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs uppercase text-slate-300 mb-1">Payment Remarks</label>
              <input
                type="text"
                placeholder="e.g. Renewal GPay #204"
                value={paymentRemarks}
                onChange={(e) => setPaymentRemarks(e.target.value)}
                className="w-full bg-[#080C14] border border-slate-800 rounded-xl px-4 py-3 sm:py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-slate-800">
              <button
                onClick={() => setCurrentStep(3)}
                className="w-full sm:w-1/2 py-3.5 bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold text-[11px] sm:text-xs uppercase rounded-xl transition-all"
              >
                Back
              </button>
              <button
                onClick={handleSubmitRenewal}
                disabled={submitting}
                className="w-full sm:w-1/2 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] sm:text-xs uppercase rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/30"
              >
                {submitting ? <LuRefreshCw className="w-4 h-4 animate-spin shrink-0" /> : <LuCheck className="w-4 h-4 shrink-0" />}
                <span>Confirm Renewal (₹{paymentAmount})</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: RECEIPT */}
        {currentStep === 5 && completedRenewal && (
          <div className="bg-slate-900/60 border border-slate-800/90 rounded-3xl p-5 sm:p-10 backdrop-blur-xl space-y-6 sm:space-y-8 max-w-3xl mx-auto">
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-800 pb-5 sm:pb-6 w-full">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <LuShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">Renewal Confirmed!</h2>
                  <p className="text-[10px] sm:text-xs text-emerald-400 font-mono">Membership Extended</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:flex md:flex-row gap-3 w-full md:w-auto">
                <button
                  onClick={printOrSavePdf}
                  className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] sm:text-xs font-bold border border-slate-700 transition-all"
                >
                  <LuPrinter className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="truncate">Print / PDF</span>
                </button>
                <button
                  onClick={shareWhatsAppReceipt}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] sm:text-xs font-bold transition-all shadow-lg shadow-emerald-600/30"
                >
                  <LuShare2 className="w-4 h-4 shrink-0" />
                  <span className="truncate">Share WhatsApp</span>
                </button>
              </div>
            </div>

            {/* RECEIPT CARD */}
            <div className="bg-[#080C14] border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-5 sm:space-y-6">
              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[11px] sm:text-xs text-slate-400 uppercase font-bold block">{library?.name}</span>
                  <span className="text-[9px] sm:text-[10px] text-slate-500 leading-tight block max-w-[200px]">{library?.address}</span>
                </div>
                <div className="xs:text-right">
                  <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase block font-bold">Renewal ID</span>
                  <span className="text-sm sm:text-base font-extrabold text-blue-400 font-mono bg-blue-500/10 border border-blue-500/30 px-2 sm:px-3 py-1 rounded-lg sm:rounded-xl inline-block mt-0.5">
                    #{completedRenewal.membership.id}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-[11px] sm:text-xs pb-4 border-b border-slate-800">
                <div><span className="text-slate-500 uppercase block text-[9px] sm:text-[10px] mb-0.5">Student Name</span><span className="text-white font-bold text-xs sm:text-sm">{completedRenewal.student.name}</span></div>
                <div><span className="text-slate-500 uppercase block text-[9px] sm:text-[10px] mb-0.5">Father's Name</span><span className="text-white font-bold text-xs sm:text-sm">{completedRenewal.student.fathersName}</span></div>
                <div><span className="text-slate-500 uppercase block text-[9px] sm:text-[10px] mb-0.5">Contact Phone</span><span className="text-slate-300 font-mono">{completedRenewal.student.phone}</span></div>
                <div><span className="text-slate-500 uppercase block text-[9px] sm:text-[10px] mb-0.5">Address</span><span className="text-slate-300">{completedRenewal.student.address}</span></div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 text-[11px] sm:text-xs pb-4 border-b border-slate-800">
                <div><span className="text-slate-500 uppercase block text-[9px] sm:text-[10px] mb-0.5">Renewal Start</span><span className="text-emerald-400 font-bold text-xs sm:text-sm font-mono">{formatReadableDate(completedRenewal.membership.startDate)}</span></div>
                <div><span className="text-slate-500 uppercase block text-[9px] sm:text-[10px] mb-0.5">Renewal End</span><span className="text-emerald-400 font-bold text-xs sm:text-sm font-mono">{formatReadableDate(completedRenewal.membership.endDate)}</span></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-[11px] sm:text-xs">
                <div><span className="text-slate-500 uppercase block text-[9px] sm:text-[10px] mb-0.5">Amount Paid</span><span className="text-emerald-400 font-extrabold text-sm sm:text-base">₹{completedRenewal.payment.amount}</span></div>
                <div><span className="text-slate-500 uppercase block text-[9px] sm:text-[10px] mb-0.5">Payment Mode</span><span className="text-slate-300 uppercase font-bold">{completedRenewal.payment.paymentType}</span></div>
                <div><span className="text-slate-500 uppercase block text-[9px] sm:text-[10px] mb-0.5">Remarks</span><span className="text-slate-400 font-mono">{completedRenewal.payment.remarks || 'N/A'}</span></div>
              </div>
            </div>

            <button
              onClick={() => navigate(`/library/${id}`)}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-[11px] sm:text-xs uppercase rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30 tracking-widest"
            >
              <LuLayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Return to Branch Dashboard</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}