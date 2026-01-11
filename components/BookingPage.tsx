
import React, { useState, useMemo } from 'react';
import { BusinessConfig, Service } from '../types';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';

interface BookingPageProps {
  config: BusinessConfig;
}

const BookingPage: React.FC<BookingPageProps> = ({ config }) => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbw_EfQGwFbVVYwVyrIDvt7_xJtrxiytR0fudP_oavX-DutUbzSKL9HcJbozTIKVnp0shw/exec';

  const dates = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => addDays(new Date(), i));
  }, []);

  const timeSlots = useMemo(() => {
    const dayName = format(selectedDate, 'EEEE');
    const dayConfig = config.availability.find(a => a.day === dayName);
    
    if (!dayConfig || !dayConfig.isOpen) return [];

    const slots: string[] = [];
    let current = dayConfig.startTime;
    const end = dayConfig.endTime;

    while (current < end) {
      slots.push(current);
      const [h, m] = current.split(':').map(Number);
      const nextMinutes = m + 30;
      const nextH = h + Math.floor(nextMinutes / 60);
      const nextM = nextMinutes % 60;
      current = `${nextH.toString().padStart(2, '0')}:${nextM.toString().padStart(2, '0')}`;
    }
    return slots;
  }, [selectedDate, config.availability]);

  const handleBook = async () => {
    if (!selectedService || !selectedTime || !customerName.trim()) return;

    setIsRedirecting(true);

    const bookingMessage = `Hello ${config.name}! I'd like to book an appointment.
    
📝 *Service*: ${selectedService.name}
📅 *Date*: ${format(selectedDate, 'EEEE, MMM do')}
⏰ *Time*: ${selectedTime}
👤 *Name*: ${customerName}
${notes ? `\n💡 *Note*: ${notes}` : ''}

Please confirm if this works for you!`;

    // 1. Log to Google Sheets via Webhook
    const payload = {
      businessName: config.name,
      customerName: customerName,
      service: selectedService.name,
      price: selectedService.price,
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: selectedTime,
      notes: notes,
      timestamp: new Date().toISOString()
    };

    try {
      // Use no-cors for Google Apps Script redirects
      fetch(WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error('Sheet logging failed:', error);
    }

    // 2. Format WhatsApp link
    let cleanNumber = config.whatsappNumber.replace(/\D/g, '');
    if (cleanNumber.startsWith('0')) {
      cleanNumber = '60' + cleanNumber.substring(1);
    }

    const encodedMessage = encodeURIComponent(bookingMessage);
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
    
    // 3. Trigger WhatsApp deep link
    const link = document.createElement('a');
    link.href = whatsappUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Reset loading state
    setTimeout(() => setIsRedirecting(false), 2000);
  };

  const isComplete = selectedService && selectedTime && customerName.trim();

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl relative pb-24">
      {/* Header */}
      <div 
        className="p-8 text-white text-center rounded-b-[2rem]"
        style={{ backgroundColor: config.primaryColor }}
      >
        <div className="mb-4 inline-block p-1 bg-white rounded-full shadow-lg">
          <img 
            src={config.logoUrl || 'https://picsum.photos/seed/biz/200/200'} 
            alt={config.name} 
            className="w-20 h-20 rounded-full object-cover"
          />
        </div>
        <h1 className="text-2xl font-bold">{config.name}</h1>
        <p className="text-white/80 text-sm mt-1">{config.tagline}</p>
      </div>

      <div className="px-6 py-8 space-y-8">
        {/* Step 1: Service Selection */}
        <section>
          <h2 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center">1</span>
            Select Service
          </h2>
          <div className="space-y-3">
            {config.services.map(service => (
              <button
                key={service.id}
                onClick={() => setSelectedService(service)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  selectedService?.id === service.id 
                    ? `border-indigo-500 bg-indigo-50 shadow-sm` 
                    : 'border-slate-100 hover:border-slate-200'
                }`}
                style={selectedService?.id === service.id ? { borderColor: config.primaryColor, backgroundColor: `${config.primaryColor}10` } : {}}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-slate-800">{service.name}</h3>
                    <p className="text-xs text-slate-500">{service.duration} mins</p>
                  </div>
                  <span className="font-bold text-slate-900">${service.price}</span>
                </div>
                {service.description && (
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed line-clamp-2">{service.description}</p>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Step 2: Date Selection */}
        <section>
          <h2 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center">2</span>
            Choose Date
          </h2>
          <div className="flex overflow-x-auto gap-3 pb-2 -mx-2 px-2 no-scrollbar">
            {dates.map((date, idx) => {
              const active = isSameDay(date, selectedDate);
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedDate(date);
                    setSelectedTime(null);
                  }}
                  className={`flex-shrink-0 w-16 h-20 flex flex-col items-center justify-center rounded-2xl border-2 transition-all ${
                    active ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'border-slate-100 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${active ? 'opacity-80' : 'opacity-40'}`}>
                    {format(date, 'eee')}
                  </span>
                  <span className="text-xl font-bold">{format(date, 'd')}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 3: Time Selection */}
        <section>
          <h2 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center">3</span>
            Available Slots
          </h2>
          {timeSlots.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {timeSlots.map(time => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`py-3 px-2 rounded-xl border-2 text-sm font-medium transition-all ${
                    selectedTime === time 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                      : 'border-slate-100 text-slate-600 hover:border-slate-200 bg-slate-50/50'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400">Closed for bookings on this day.</p>
            </div>
          )}
        </section>

        {/* Step 4: Details */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center">4</span>
            Your Details
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Full Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-slate-900 outline-none transition-all bg-slate-50/30 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Requests (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests or details?"
                rows={2}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-slate-900 outline-none transition-all bg-slate-50/30 focus:bg-white"
              />
            </div>
          </div>
        </section>
      </div>

      {/* Floating Action Button */}
      <div className="sticky bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent">
        <button
          onClick={handleBook}
          disabled={!isComplete || isRedirecting}
          className={`w-full py-4 rounded-2xl shadow-xl flex items-center justify-center gap-3 font-bold text-white transition-all transform active:scale-95 ${
            isComplete && !isRedirecting 
              ? 'bg-[#25D366] hover:bg-[#128C7E]' 
              : 'bg-slate-300 cursor-not-allowed shadow-none'
          }`}
        >
          {isRedirecting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              Confirm via WhatsApp
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default BookingPage;
