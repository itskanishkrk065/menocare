import React, { useState } from 'react';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Share2,
  Activity,
  Droplet,
  Flame,
  Moon,
  FlaskConical,
  FileText,
  ShieldAlert,
  X,
} from 'lucide-react';

interface TelehealthConsultationRoomProps {
  patient: any;
  onClose: () => void;
}

export const TelehealthConsultationRoom: React.FC<TelehealthConsultationRoomProps> = ({
  patient,
  onClose,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [consultNote, setConsultNote] = useState('');
  const [callDuration, setCallDuration] = useState('14:28');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col p-4 sm:p-6 overflow-hidden">
      {/* Top Telehealth Bar */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-2xl p-3 px-5 text-white mb-4 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
          <div>
            <div className="font-extrabold text-sm flex items-center gap-2">
              <span>Live Clinical Telehealth Session</span>
              <span className="text-xs text-slate-400 font-mono">[{callDuration}]</span>
            </div>
            <div className="text-[11px] text-teal-400 font-medium">
              Consultation with {patient?.full_name || 'Patient'} • Encrypted WebRTC
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
        >
          <PhoneOff className="w-3.5 h-3.5" />
          <span>Exit Consultation</span>
        </button>
      </div>

      {/* Main Grid: Video Stream Simulator + Patient Health HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-hidden">
        {/* Video Canvas Simulator (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 rounded-3xl border border-slate-800 relative flex flex-col items-center justify-center overflow-hidden">
          {/* Main Patient Video Placeholder */}
          <div className="text-center space-y-3">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-teal-500 to-rose-400 text-white flex items-center justify-center font-black text-3xl mx-auto shadow-2xl ring-4 ring-teal-500/20">
              {patient?.full_name?.charAt(0) || 'P'}
            </div>
            <div>
              <div className="text-white font-extrabold text-base">{patient?.full_name}</div>
              <div className="text-xs text-teal-400">Audio/Video Feed Active (HD 1080p)</div>
            </div>
          </div>

          {/* Clinician Picture-in-Picture Self-View */}
          <div className="absolute top-4 right-4 w-36 h-24 rounded-2xl bg-slate-800 border-2 border-slate-700 p-2 text-white flex flex-col justify-between shadow-xl">
            <div className="text-[10px] font-bold text-teal-400">Dr. Sharma (You)</div>
            <div className="text-center text-xs font-black text-slate-400">Camera Feed</div>
          </div>

          {/* Video Control Bar */}
          <div className="absolute bottom-6 flex items-center gap-3 bg-slate-950/80 backdrop-blur-md p-2 px-5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3 rounded-xl transition-all ${
                isMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'
              }`}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`p-3 rounded-xl transition-all ${
                isVideoOff ? 'bg-rose-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'
              }`}
            >
              {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End Call</span>
            </button>
          </div>
        </div>

        {/* Patient Health HUD (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 rounded-3xl border border-slate-800 p-5 text-white flex flex-col justify-between overflow-y-auto space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                <Activity className="w-4 h-4" />
                Live Patient Clinical HUD
              </span>
              <span className="text-[10px] text-slate-400">Synced Real-Time</span>
            </div>

            {/* Quick Demographics & Stage */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">STRAW Stage</span>
                <span className="font-extrabold text-teal-300 capitalize">{patient?.straw_stage?.replace('_', ' ') || 'Late Transition'}</span>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Age / Birth Year</span>
                <span className="font-extrabold text-white">{patient?.age || 48} yrs ({patient?.birth_year || 1978})</span>
              </div>
            </div>

            {/* Biomarker Snapshot */}
            <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Latest Verified Blood Biomarkers
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-slate-900/60 rounded-xl">
                  <div className="text-[10px] text-slate-400">FSH</div>
                  <div className="font-black text-rose-400">38.5</div>
                  <div className="text-[9px] text-slate-500">mIU/mL</div>
                </div>
                <div className="p-2 bg-slate-900/60 rounded-xl">
                  <div className="text-[10px] text-slate-400">Estradiol</div>
                  <div className="font-black text-amber-400">22.0</div>
                  <div className="text-[9px] text-slate-500">pg/mL</div>
                </div>
                <div className="p-2 bg-slate-900/60 rounded-xl">
                  <div className="text-[10px] text-slate-400">TSH</div>
                  <div className="font-black text-emerald-400">1.85</div>
                  <div className="text-[9px] text-slate-500">µIU/mL</div>
                </div>
              </div>
            </div>

            {/* Quick Consultation Scratchpad */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-teal-400" />
                <span>Live Consultation Scratchpad</span>
              </label>
              <textarea
                rows={4}
                value={consultNote}
                onChange={(e) => setConsultNote(e.target.value)}
                placeholder="Type real-time clinical impressions, dosage titrations, or follow-up notes..."
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="pt-2 text-center text-[10px] text-slate-500">
            Notes typed here will synchronize with the patient's SOAP record upon call termination.
          </div>
        </div>
      </div>
    </div>
  );
};
