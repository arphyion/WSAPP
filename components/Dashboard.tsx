
import React, { useState } from 'react';
import { BusinessConfig, Service, DayAvailability } from '../types';
import { DAYS_OF_WEEK } from '../constants';
import { GoogleGenAI, Type } from "@google/genai";

interface DashboardProps {
  config: BusinessConfig;
  onConfigChange: (newConfig: BusinessConfig) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ config, onConfigChange }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'services' | 'hours'>('info');
  const [isGenerating, setIsGenerating] = useState(false);

  const updateField = <K extends keyof BusinessConfig>(key: K, value: BusinessConfig[K]) => {
    onConfigChange({ ...config, [key]: value });
  };

  const addService = () => {
    const newService: Service = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Service',
      duration: 30,
      price: '0.00',
      description: ''
    };
    updateField('services', [...config.services, newService]);
  };

  const updateService = (id: string, updates: Partial<Service>) => {
    const newServices = config.services.map(s => s.id === id ? { ...s, ...updates } : s);
    updateField('services', newServices);
  };

  const deleteService = (id: string) => {
    updateField('services', config.services.filter(s => s.id !== id));
  };

  const updateAvailability = (day: string, updates: Partial<DayAvailability>) => {
    const newAvailability = config.availability.map(a => a.day === day ? { ...a, ...updates } : a);
    updateField('availability', newAvailability);
  };

  const handleMagicDescription = async (serviceIndex: number) => {
    setIsGenerating(true);
    const service = config.services[serviceIndex];
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Write a short, professional, and catchy 1-sentence description for a ${service.name} service at a business called ${config.name}.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING }
            },
            required: ['description']
          }
        }
      });
      
      const result = JSON.parse(response.text);
      updateService(service.id, { description: result.description });
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Business Dashboard</h1>
          <p className="text-slate-500 mt-2">Manage your public booking page</p>
        </div>
      </div>

      <div className="flex bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 py-4 font-semibold transition-colors ${activeTab === 'info' ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-600'}`}
        >
          General Info
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`flex-1 py-4 font-semibold transition-colors ${activeTab === 'services' ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-600'}`}
        >
          Services
        </button>
        <button
          onClick={() => setActiveTab('hours')}
          className={`flex-1 py-4 font-semibold transition-colors ${activeTab === 'hours' ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-600'}`}
        >
          Opening Hours
        </button>
      </div>

      <div className="space-y-8 animate-in fade-in duration-500">
        {activeTab === 'info' && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xl font-bold border-b pb-4 mb-6">Business Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Business Name</label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">WhatsApp Number</label>
                <input
                  type="text"
                  value={config.whatsappNumber}
                  onChange={(e) => updateField('whatsappNumber', e.target.value)}
                  placeholder="e.g. 15550001122"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-slate-700">Tagline</label>
                <input
                  type="text"
                  value={config.tagline}
                  onChange={(e) => updateField('tagline', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Brand Color</label>
                <div className="flex gap-4 items-center">
                  <input
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => updateField('primaryColor', e.target.value)}
                    className="w-16 h-12 rounded-lg border-0 p-0 cursor-pointer"
                  />
                  <span className="text-slate-500 font-mono text-sm">{config.primaryColor}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Logo URL</label>
                <input
                  type="text"
                  value={config.logoUrl}
                  onChange={(e) => updateField('logoUrl', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Manage Services</h2>
              <button
                onClick={addService}
                className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                Add Service
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {config.services.map((service, idx) => (
                <div key={service.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Service Name</label>
                        <input
                          type="text"
                          value={service.name}
                          onChange={(e) => updateService(service.id, { name: e.target.value })}
                          className="w-full text-lg font-semibold bg-transparent border-b border-transparent hover:border-slate-200 focus:border-slate-900 focus:outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Price ($)</label>
                        <input
                          type="text"
                          value={service.price}
                          onChange={(e) => updateService(service.id, { price: e.target.value })}
                          className="w-full bg-transparent border-b border-transparent hover:border-slate-200 focus:border-slate-900 focus:outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Duration (min)</label>
                        <input
                          type="number"
                          value={service.duration}
                          onChange={(e) => updateService(service.id, { duration: parseInt(e.target.value) || 0 })}
                          className="w-full bg-transparent border-b border-transparent hover:border-slate-200 focus:border-slate-900 focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => deleteService(service.id)}
                      className="text-slate-300 hover:text-red-500 p-2 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                    </button>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</label>
                      <button 
                        onClick={() => handleMagicDescription(idx)}
                        disabled={isGenerating}
                        className="text-[10px] flex items-center gap-1 text-indigo-500 hover:text-indigo-600 font-bold uppercase tracking-widest"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                        {isGenerating ? 'Generating...' : 'Magic Description'}
                      </button>
                    </div>
                    <textarea
                      value={service.description}
                      onChange={(e) => updateService(service.id, { description: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-300 transition-all text-sm"
                      placeholder="Enter a brief description of the service..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'hours' && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold mb-6">Availability Settings</h2>
            <div className="space-y-4">
              {config.availability.map((day) => (
                <div key={day.day} className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl border border-slate-100 gap-4">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={day.isOpen}
                        onChange={(e) => updateAvailability(day.day, { isOpen: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                    </div>
                    <span className={`font-semibold min-w-[100px] ${day.isOpen ? 'text-slate-900' : 'text-slate-400'}`}>
                      {day.day}
                    </span>
                  </div>
                  
                  {day.isOpen ? (
                    <div className="flex items-center gap-3">
                      <input
                        type="time"
                        value={day.startTime}
                        onChange={(e) => updateAvailability(day.day, { startTime: e.target.value })}
                        className="px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                      <span className="text-slate-400">to</span>
                      <input
                        type="time"
                        value={day.endTime}
                        onChange={(e) => updateAvailability(day.day, { endTime: e.target.value })}
                        className="px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                  ) : (
                    <span className="text-slate-400 italic text-sm">Closed</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
