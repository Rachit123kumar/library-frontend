import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  LuCreditCard,
  LuGrid2X2,
  LuArrowLeft,
  LuMapPin,
  LuCheck,
  LuRefreshCw,
  LuClock,
  LuCheckCheck,
  LuSparkles,
  LuUser,
  LuCalendar,
  LuShieldCheck,
  LuPrinter,
  LuShare2,
  LuBug,
} from 'react-icons/lu';

// IMPORT THE REUSABLE SIDEBAR
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

interface SeatOption {
  id: number;
  seatNumber: number;
  roomName: string;
  totalDailyBookings: number;
}

interface RecommendedCombo {
  shiftId: number;
  shiftName: string;
  seatId: number;
  seatNumber: number;
  roomName: string;
}

interface AdmissionResponse {
  student: {
    id: number;
    name: string;
    fathersName: string;
    phone: string;
    email?: string;
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

export default function AdmissionPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Master Data States
  const [library, setLibrary] = useState<LibraryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [checkingAvailability, setCheckingAvailability] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Wizard Steps
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [completedAdmission, setCompletedAdmission] = useState<AdmissionResponse | null>(null);

  // Form Field States
  const [name, setName] = useState('');
  const [fathersName, setFathersName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  // Default dates
  const todayStr = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [durationMonths, setDurationMonths] = useState<number>(1);

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

  const [endDate, setEndDate] = useState(calculateEndDate(todayStr, 1));

  // Shift & Seat Allocation States
  const [selectedShiftIds, setSelectedShiftIds] = useState<number[]>([]);
  const [assignSeatLater, setAssignSeatLater] = useState<boolean>(false);

  // Availability Search Results
  const [hasContinuousSeat, setHasContinuousSeat] = useState<boolean>(false);
  const [continuousSeats, setContinuousSeats] = useState<SeatOption[]>([]);
  const [availabilityPerShift, setAvailabilityPerShift] = useState<Record<number, SeatOption[]>>({});
  const [chosenAllocations, setChosenAllocations] = useState<Record<number, number>>({});

  // Payment States
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<'cash' | 'upi'>('upi');
  const paymentRemarks ='';

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
      setLoading(true);
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

      if (!res.ok) throw new Error(data?.message || 'Failed to fetch library information.');

      setLibrary(data.library);
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibraryDetails();
  }, [id]);

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
    if (selectedShiftIds.length === 0) {
      showToast('Validation Error', 'Please select at least one shift.', 'error');
      return;
    }

    try {
      setCheckingAvailability(true);
      const res = await fetch(`${BASE_URL}/api/v1/admission/${id}/admissions/check-availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          startDate,
          endDate,
          shiftIds: selectedShiftIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to check seat availability');

      setHasContinuousSeat(data.hasContinuousSeat);
      setContinuousSeats(data.continuousSeats || []);
      setAvailabilityPerShift(data.availabilityPerShift || {});

      const initialMap: Record<number, number> = {};
      data.recommendedCombination?.forEach((item: RecommendedCombo) => {
        initialMap[item.shiftId] = item.seatId;
      });
      setChosenAllocations(initialMap);

      setCurrentStep(2);
    } catch (err: any) {
      showToast('Availability Check Failed', err.message, 'error');
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleSubmitAdmission = async () => {
    try {
      setSubmitting(true);

      let allocationsPayload: Array<{ shiftId: number; seatId: number }> = [];
      if (!assignSeatLater) {
        allocationsPayload = Object.entries(chosenAllocations).map(([shiftIdStr, seatId]) => ({
          shiftId: parseInt(shiftIdStr, 10),
          seatId,
        }));
      }

      const payload = {
        name,
        fathersName,
        gender,
        phone,
        email: email || undefined,
        address,
        startDate,
        endDate,
        allocations: allocationsPayload.length > 0 ? allocationsPayload : undefined,
        paymentAmount,
        paymentType,
        paymentRemarks: paymentRemarks || undefined,
      };

      const res = await fetch(`${BASE_URL}/api/v1/admission/${id}/admissions`, {
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

      if (!res.ok) throw new Error(data?.message || 'Failed to complete admission.');

      showToast('Admission Success!', data.message, 'success');
      setCompletedAdmission(data.data);
      setCurrentStep(4);
    } catch (err: any) {
      showToast('Admission Failed', err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const printOrSavePdf = () => {
    if (!completedAdmission || !library) return;

    const seatsFormatted =
      completedAdmission.bookings.length > 0
        ? completedAdmission.bookings
            .map((b) => {
              const s = library.shifts.find((sh) => sh.id === b.shiftId);
              return `<tr>
                <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; color: #1e293b;">
                  ${s?.name || `Shift #${b.shiftId}`} (${s?.startTime} - ${s?.endTime})
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
          <title>Admission_Receipt_M#${completedAdmission.membership.id}_${completedAdmission.student.name}</title>
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
              <div class="badge">MEMBERSHIP ID: #${completedAdmission.membership.id}</div>
            </div>

            <div class="grid">
              <div><span class="label">Student Name</span><span class="value">${completedAdmission.student.name}</span></div>
              <div><span class="label">Father's Name</span><span class="value">${completedAdmission.student.fathersName}</span></div>
              <div><span class="label">Phone</span><span class="value">${completedAdmission.student.phone}</span></div>
              <div><span class="label">Address</span><span class="value">${completedAdmission.student.address}</span></div>
            </div>

            <div class="grid" style="background: #f8fafc; padding: 12px; border-radius: 8px;">
              <div><span class="label">Membership Start</span><span class="value" style="color: #16a34a;">${new Date(completedAdmission.membership.startDate).toLocaleDateString()}</span></div>
              <div><span class="label">Membership End</span><span class="value" style="color: #16a34a;">${new Date(completedAdmission.membership.endDate).toLocaleDateString()}</span></div>
            </div>

            <span class="label" style="margin-bottom: 6px;">Assigned Seats & Shifts</span>
            <table><tbody>${seatsFormatted}</tbody></table>

            <div class="total-box">
              <div>
                <span class="label">Payment Mode: ${completedAdmission.payment.paymentType.toUpperCase()}</span>
                <span style="font-size: 11px; color: #64748b;">${completedAdmission.payment.remarks || 'Admission Fee Paid'}</span>
              </div>
              <div class="total-amount">₹${completedAdmission.payment.amount}</div>
            </div>

            <div class="footer">Thank you for choosing ${library.name}!</div>
          </div>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const shareWhatsAppReceipt = () => {
    if (!completedAdmission || !library) return;

    const formattedPhone = completedAdmission.student.phone.replace(/[^0-9]/g, '');
    const targetPhone = formattedPhone.length === 10 ? `91${formattedPhone}` : formattedPhone;

    const seatsFormatted =
      completedAdmission.bookings.length > 0
        ? completedAdmission.bookings
            .map((b) => {
              const s = library.shifts.find((sh) => sh.id === b.shiftId);
              return `• ${s?.name || 'Shift'}: Seat #${b.seatId}`;
            })
            .join('\n')
        : '• Seat: Floating Member (Assign Later)';

    const message = `🎓 *ADMISSION CONFIRMED — ${library.name.toUpperCase()}* 🎓

Hello *${completedAdmission.student.name}*, your admission has been successfully registered!

🆔 *Membership ID:* #${completedAdmission.membership.id}
📅 *Valid:* ${new Date(completedAdmission.membership.startDate).toLocaleDateString()} to ${new Date(completedAdmission.membership.endDate).toLocaleDateString()}
💳 *Amount Paid:* ₹${completedAdmission.payment.amount} (${completedAdmission.payment.paymentType.toUpperCase()})

🪑 *Assigned Seats:*
${seatsFormatted}

📍 *Location:* ${library.address}

Thank you for joining ${library.name}!`;

    window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 font-sans antialiased relative selection:bg-blue-600 selection:text-white flex font-mono">
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1f293d12_1px,transparent_1px),linear-gradient(to_bottom,#1f293d12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[380px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-[140px] pointer-events-none rounded-full" />

      <LibrarySidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        branchName={library?.name || 'Branch'}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-xl mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] text-blue-400 uppercase">
                Admissions Engine
              </span>
              <span className="text-slate-500 text-xs">•</span>
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <LuMapPin className="w-3.5 h-3.5 text-slate-500" />
                {library?.address || 'Loading...'}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              New Student Admission — {library?.name || `Library #${id}`}
            </h1>
          </div>

          <button
            onClick={() => navigate(`/library/${id}`)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase border border-slate-700 flex items-center gap-2"
          >
            <LuArrowLeft className="w-4 h-4 text-blue-400" />
            <span>Cancel</span>
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <LuRefreshCw className="w-8 h-8 animate-spin text-blue-400" />
            <span>Loading branch configuration & shift catalog...</span>
          </div>
        ) : (
          <div className="space-y-8">
            {currentStep < 4 && (
              <div className="grid grid-cols-3 gap-2 sm:gap-4 border-b border-slate-800 pb-6">
                <div
                  onClick={() => setCurrentStep(1)}
                  className={`cursor-pointer p-3 rounded-xl border flex items-center gap-3 ${
                    currentStep === 1
                      ? 'bg-blue-600/10 border-blue-500/40 text-blue-400'
                      : 'bg-slate-900/40 border-slate-800 text-slate-500'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      currentStep === 1 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    1
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-xs font-bold uppercase text-white">Student Info</div>
                    <div className="text-[10px] text-slate-400">Demographics & Plan</div>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-xl border flex items-center gap-3 ${
                    currentStep === 2
                      ? 'bg-blue-600/10 border-blue-500/40 text-blue-400'
                      : 'bg-slate-900/40 border-slate-800 text-slate-500'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      currentStep === 2 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    2
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-xs font-bold uppercase text-white">Seats & Shifts</div>
                    <div className="text-[10px] text-slate-400">Matrix Engine Search</div>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-xl border flex items-center gap-3 ${
                    currentStep === 3
                      ? 'bg-blue-600/10 border-blue-500/40 text-blue-400'
                      : 'bg-slate-900/40 border-slate-800 text-slate-500'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      currentStep === 3 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    3
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-xs font-bold uppercase text-white">Payment & Finalize</div>
                    <div className="text-[10px] text-slate-400">Receipt & Activation</div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: STUDENT PROFILE */}
            {currentStep === 1 && (
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <LuUser className="w-5 h-5 text-blue-400" /> Student Profile & Duration
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase text-slate-300 mb-1">
                      Full Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#080C14] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-slate-300 mb-1">
                      Father's Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Suresh Kumar"
                      value={fathersName}
                      onChange={(e) => setFathersName(e.target.value)}
                      className="w-full bg-[#080C14] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-slate-300 mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e: any) => setGender(e.target.value)}
                      className="w-full bg-[#080C14] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-slate-300 mb-1">
                      Phone Number <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="10 digit mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#080C14] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-slate-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="optional@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#080C14] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-slate-300 mb-1">
                      Physical Address <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Locality / Village / City"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-[#080C14] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <LuCalendar className="w-4 h-4 text-blue-400" /> Select Membership Plan
                  </h3>

                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleDurationChange(m)}
                        className={`py-3 px-4 rounded-xl font-bold text-xs uppercase border transition-all ${
                          durationMonths === m
                            ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/10'
                            : 'bg-[#080C14] border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {m} Month{m > 1 ? 's' : ''} Plan
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase text-slate-300 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => handleStartDateChange(e.target.value)}
                        className="w-full bg-[#080C14] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase text-slate-300 mb-1">End Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-[#080C14] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80">
                  <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <LuClock className="w-4 h-4 text-blue-400" /> Select Shift(s)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {library?.shifts.map((shift) => {
                      const isSelected = selectedShiftIds.includes(shift.id);
                      return (
                        <div
                          key={shift.id}
                          onClick={() => toggleShiftSelection(shift.id)}
                          className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                            isSelected
                              ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                              : 'bg-[#080C14] border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm">{shift.name}</span>
                            {isSelected && <LuCheck className="w-4 h-4 text-blue-400" />}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            {shift.startTime} – {shift.endTime}
                          </div>
                          <div className="text-xs font-bold text-emerald-400 mt-2">
                            ₹{shift.price * durationMonths} total
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!name || !fathersName || !phone || !address) {
                      showToast('Missing Fields', 'Please complete all required fields.', 'error');
                      return;
                    }
                    checkSeatAvailability();
                  }}
                  disabled={checkingAvailability}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold uppercase rounded-xl flex items-center justify-center gap-2"
                >
                  {checkingAvailability ? (
                    <LuRefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <LuSparkles className="w-4 h-4" />
                  )}
                  <span>Search Seat Availability</span>
                </button>
              </div>
            )}

            {/* STEP 2: SEATS MATRIX (REDESIGNED WITH RESPONSIVE BOXES & SCROLLBAR) */}
            {currentStep === 2 && (
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <LuGrid2X2 className="w-5 h-5 text-blue-400" /> Seat Availability Engine
                  </h2>

                  <label className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={assignSeatLater}
                      onChange={(e) => setAssignSeatLater(e.target.checked)}
                      className="rounded bg-[#080C14] border-slate-700 text-blue-600 focus:ring-0"
                    />
                    <span className="text-xs text-slate-300 font-bold uppercase">
                      Floating Member (Assign Seat Later)
                    </span>
                  </label>
                </div>

                {!assignSeatLater && (
                  <div className="space-y-6">
                    {hasContinuousSeat ? (
                      <div className="space-y-4">
                        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl flex items-start gap-3">
                          <LuCheckCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                          <div className="text-emerald-400 font-bold text-xs uppercase">
                            Continuous Single Seat Available! Select one for all shifts:
                          </div>
                        </div>

                        {/* SCROLLABLE BOX CONTAINER FOR CONTINUOUS SEATS */}
                        <div className="bg-[#080C14] border border-slate-800 p-5 rounded-2xl">
                          <div className="max-h-64 overflow-y-auto grid grid-cols-2 sm:grid-cols-4 gap-3 custom-scrollbar pr-2">
                            {continuousSeats.map((seat) => {
                              const isSelected = chosenAllocations[selectedShiftIds[0]] === seat.id;
                              return (
                                <button
                                  key={seat.id}
                                  type="button"
                                  onClick={() => {
                                    const targetSeatId = seat.id;
                                    const updatedMap: Record<number, number> = {};
                                    selectedShiftIds.forEach((sId) => (updatedMap[sId] = targetSeatId));
                                    setChosenAllocations(updatedMap);
                                  }}
                                  className={`p-4 rounded-2xl border text-center transition-all ${
                                    isSelected
                                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/40 scale-105'
                                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-600'
                                  }`}
                                >
                                  <div className="font-bold text-lg font-mono">#{seat.seatNumber}</div>
                                  <div className="text-[9px] uppercase tracking-wider mt-1 truncate opacity-70">
                                    {seat.roomName}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-start gap-3">
                          <LuBug className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                          <div className="text-amber-400 font-bold text-xs uppercase">
                            Split Seats Suggested (Select a seat for each shift)
                          </div>
                        </div>

                        {selectedShiftIds.map((shiftId) => {
                          const shiftObj = library?.shifts.find((s) => s.id === shiftId);
                          const availableSeats = availabilityPerShift[shiftId] || [];

                          return (
                            <div key={shiftId} className="bg-[#080C14] border border-slate-800 p-5 rounded-2xl space-y-3">
                              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                                {shiftObj?.name} ({shiftObj?.startTime} - {shiftObj?.endTime})
                              </span>

                              {/* SCROLLABLE BOX CONTAINER FOR SPLIT SEATS */}
                              <div className="max-h-48 overflow-y-auto grid grid-cols-3 sm:grid-cols-5 gap-3 custom-scrollbar pr-2">
                                {availableSeats.map((seat) => {
                                  const isSelected = chosenAllocations[shiftId] === seat.id;
                                  return (
                                    <button
                                      key={seat.id}
                                      type="button"
                                      onClick={() =>
                                        setChosenAllocations({
                                          ...chosenAllocations,
                                          [shiftId]: seat.id,
                                        })
                                      }
                                      className={`p-3 rounded-xl border text-center transition-all ${
                                        isSelected
                                          ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-600'
                                      }`}
                                    >
                                      <div className="font-bold text-base font-mono">#{seat.seatNumber}</div>
                                      <div className="text-[8px] uppercase tracking-tight mt-0.5 truncate opacity-70">
                                        {seat.roomName}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-4 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="w-1/2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase rounded-xl transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="w-1/2 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase rounded-xl transition-all shadow-lg shadow-blue-600/30"
                  >
                    Proceed to Payment
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PAYMENT */}
            {currentStep === 3 && (
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <LuCreditCard className="w-5 h-5 text-blue-400" /> Payment & Activation
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase text-slate-300 mb-1">Amount (INR)</label>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(Number(e.target.value))}
                      className="w-full bg-[#080C14] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-slate-300 mb-1">Mode</label>
                    <select
                      value={paymentType}
                      onChange={(e: any) => setPaymentType(e.target.value)}
                      className="w-full bg-[#080C14] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="upi">UPI / Online</option>
                      <option value="cash">Cash</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="w-1/2 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase rounded-xl transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitAdmission}
                    disabled={submitting}
                    className="w-1/2 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/30"
                  >
                    {submitting ? <LuRefreshCw className="w-4 h-4 animate-spin" /> : <LuCheck className="w-4 h-4" />}
                    <span>Complete Admission (₹{paymentAmount})</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: RECEIPT */}
            {currentStep === 4 && completedAdmission && (
              <div className="bg-slate-900/60 border border-slate-800/90 rounded-3xl p-6 sm:p-10 backdrop-blur-xl space-y-8 max-w-3xl mx-auto">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-800 pb-6 w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <LuShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Admission Confirmed!</h2>
                    </div>
                  </div>

               <div className="grid grid-cols-2 md:flex md:flex-row gap-3 w-full md:w-auto">
  <button
    type="button"
    onClick={printOrSavePdf}
    className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-all"
  >
    <LuPrinter className="w-4 h-4 text-blue-400 shrink-0" />
    <span className="truncate">Print / PDF</span>
  </button>
  
  <button
    type="button"
    onClick={shareWhatsAppReceipt}
    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/30"
  >
    <LuShare2 className="w-4 h-4 shrink-0" />
    <span className="truncate">Share WhatsApp</span>
  </button>
</div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/library/${id}`)}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30 tracking-widest"
                >
                  <LuArrowLeft className="w-4 h-4" />
                  <span>Go to Branch Dashboard</span>
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}