import React, { useState } from 'react';
import {
  Activity,
  Stethoscope,
  User,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  HeartPulse,
  Building,
  CheckCircle2,
  Sparkles,
  Eye,
  EyeOff,
  Calendar,
  Layers,
  Heart,
  ChevronRight,
  Phone,
  FileBadge
} from 'lucide-react';
import { api, setAuthToken } from '../api/client';

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
  onBackToHome?: () => void;
  initialMode?: 'login' | 'register';
  initialRole?: 'patient' | 'doctor';
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onBackToHome,
  initialMode = 'login',
  initialRole = 'patient',
}) => {
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [role, setRole] = useState<'patient' | 'doctor'>(initialRole);

  // Step indicator for patient onboarding wizard (1 to 4)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Common credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');

  // Patient clinical onboarding details
  const [birthYear, setBirthYear] = useState<number>(1980);
  const [strawStage, setStrawStage] = useState<string>('early_transition');
  const [amenorrheaDays, setAmenorrheaDays] = useState<number>(15);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [doctorPracticeCode, setDoctorPracticeCode] = useState<string>('DR-SHARMA-91A');

  // Doctor extra fields
  const [clinicName, setClinicName] = useState('');
  const [clinicPhone, setClinicPhone] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleCondition = (cond: string) => {
    setSelectedConditions((prev) =>
      prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]
    );
  };

  const handleQuickDemoLogin = async (demoEmail: string, demoRole: 'patient' | 'doctor') => {
    setIsLoading(true);
    setError(null);
    setRole(demoRole);
    setEmail(demoEmail);
    setPassword('Password123#');

    try {
      const res = await api.login({ email: demoEmail, password: 'Password123#' });
      setAuthToken(res.access_token);
      localStorage.setItem('menocare_user', JSON.stringify(res));
      onLoginSuccess(res);
    } catch (err: any) {
      setError(err.message || 'Demo authentication failed.');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isRegister) {
        const payload: any = {
          email,
          password,
          full_name: fullName,
          role,
        };
        if (role === 'patient') {
          payload.birth_year = Number(birthYear) || 1980;
          payload.straw_stage = strawStage;
          payload.amenorrhea_days = Number(amenorrheaDays) || 0;
          payload.prior_conditions = selectedConditions;
          if (doctorPracticeCode.trim()) {
            payload.doctor_practice_code = doctorPracticeCode.trim().toUpperCase();
          }
        } else {
          payload.clinic_name = clinicName || undefined;
          payload.clinic_phone = clinicPhone || undefined;
          payload.license_number = licenseNumber || undefined;
        }

        const res = await api.register(payload);
        setAuthToken(res.access_token);
        localStorage.setItem('menocare_user', JSON.stringify(res));
        onLoginSuccess(res);
      } else {
        const res = await api.login({ email, password });
        setAuthToken(res.access_token);
        localStorage.setItem('menocare_user', JSON.stringify(res));
        onLoginSuccess(res);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory text-charcoal font-sans antialiased relative overflow-x-hidden selection:bg-sage/20 selection:text-charcoal flex flex-col justify-between">
      {/* Ambient Organic Background Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-sage-soft/60 to-teal-soft/40 blur-3xl opacity-70"></div>
        <div className="absolute top-1/2 -left-48 w-[540px] h-[540px] rounded-full bg-gradient-to-tr from-peach-soft/70 to-oat/50 blur-3xl opacity-60"></div>
        <div className="absolute -bottom-40 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-lavender/20 to-teal-soft/40 blur-3xl opacity-50"></div>
      </div>

      {/* Header / Brand Nav */}
      <header className="relative z-10 w-full px-6 py-4 lg:px-12 flex items-center justify-between border-b border-[#E2DBD0]/70 bg-ivory/80 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sage to-teal flex items-center justify-center text-cream shadow-warm-sm">
            <HeartPulse className="w-5 h-5 text-cream" />
          </div>
          <div>
            <span className="font-serif text-2xl font-semibold tracking-tight text-charcoal flex items-center gap-2">
              MenoCare
              <span className="text-xs font-sans font-medium px-2.5 py-0.5 rounded-full bg-sage-soft text-sage-dark border border-sage/20">
                Women's Health
              </span>
            </span>
            <p className="text-xs text-charcoal-muted font-medium">Your Menopause & Hormonal Care Companion</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs text-charcoal-muted">
          {onBackToHome && (
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E2DBD0] text-xs font-semibold text-charcoal hover:bg-oat-light transition-all shadow-warm-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Overview</span>
            </button>
          )}
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream border border-[#E2DBD0] text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-sage-dark" />
            Private & Doctor-Reviewed
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Clear & Warm Reassurance */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sage-soft border border-sage/30 rounded-full text-sage-dark text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-sage-dark" />
              <span>Evidence-Based Care</span>
            </div>

            <div className="space-y-3">
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-normal text-charcoal leading-[1.18] tracking-tight">
                Clear, compassionate care for your <span className="italic font-normal text-sage-dark">menopause journey</span>.
              </h1>
              <p className="text-sm text-charcoal-muted leading-relaxed max-w-md text-pretty">
                Track your daily symptoms in seconds, see clear trends about your body's changes, and share reliable updates directly with your doctor.
              </p>
            </div>

            {/* Feature highlights: Unnested, breathable list */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-sage-soft text-sage-dark flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-charcoal">Menopause Stage Tracking</h2>
                  <p className="text-xs text-charcoal-muted leading-relaxed text-pretty">Understand whether you are in perimenopause, late transition, or postmenopause based on your cycle changes.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-teal-soft text-teal-dark flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-charcoal">Connected With Your Doctor</h2>
                  <p className="text-xs text-charcoal-muted leading-relaxed text-pretty">Share your symptom history, explore personalized hormone therapy options, and message your care team.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-peach-soft text-peach flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4 text-[#C48068]" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-charcoal">Private & Secure</h2>
                  <p className="text-xs text-charcoal-muted leading-relaxed text-pretty">Your personal health notes and symptoms stay strictly private between you and your attending clinician.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Portal Card */}
          <div className="lg:col-span-7">
            <div className="bg-cream/95 backdrop-blur-md rounded-[26px] border border-[#E2DBD0] shadow-warm-lg p-6 sm:p-8 space-y-6">
              
              {/* Role Toggle Selector */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-oat-light rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setRole('patient');
                    setError(null);
                  }}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center space-x-2 ${
                    role === 'patient'
                      ? 'bg-white text-charcoal shadow-xs'
                      : 'text-charcoal-muted hover:text-charcoal'
                  }`}
                >
                  <User className="w-4 h-4 text-sage-dark" />
                  <span>Patient</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRole('doctor');
                    setError(null);
                  }}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center space-x-2 ${
                    role === 'doctor'
                      ? 'bg-white text-charcoal shadow-xs'
                      : 'text-charcoal-muted hover:text-charcoal'
                  }`}
                >
                  <Stethoscope className="w-4 h-4 text-teal" />
                  <span>Doctor / Clinician</span>
                </button>
              </div>

              {/* Instant 1-Click Demo Profiles (Clean unnested section) */}
              {!isRegister && (
                <div className="pt-2 border-t border-[#E2DBD0]/70 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-charcoal flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-sage-dark" />
                      Quick Demo Profiles
                    </span>
                    <span className="text-xs text-charcoal-muted">Click to sign in instantly</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {role === 'patient' ? (
                      <>
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleQuickDemoLogin('patient1@menocare.com', 'patient')}
                          className="p-3 bg-cream hover:bg-sage-soft text-charcoal rounded-xl font-medium border border-[#E2DBD0] transition-colors text-left flex items-center justify-between hover:border-sage-dark"
                        >
                          <div>
                            <p className="font-semibold text-xs text-charcoal">Sarah Jenkins (Age 48)</p>
                            <p className="text-xs text-charcoal-muted">Early Perimenopause • Moderate Symptoms</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-sage-dark" />
                        </button>
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleQuickDemoLogin('patient2@menocare.com', 'patient')}
                          className="p-3 bg-cream hover:bg-sage-soft text-charcoal rounded-xl font-medium border border-[#E2DBD0] transition-colors text-left flex items-center justify-between hover:border-sage-dark"
                        >
                          <div>
                            <p className="font-semibold text-xs text-charcoal">Maria Rodriguez (Age 52)</p>
                            <p className="text-xs text-charcoal-muted">Late Transition • Hot Flashes & Sleep</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-sage-dark" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleQuickDemoLogin('dr.sharma@apollo.com', 'doctor')}
                          className="p-3 bg-cream hover:bg-teal-soft text-charcoal rounded-xl font-medium border border-[#E2DBD0] transition-colors text-left flex items-center justify-between hover:border-teal"
                        >
                          <div>
                            <p className="font-semibold text-xs text-charcoal">Dr. Ananya Sharma, MD</p>
                            <p className="text-xs text-charcoal-muted">Apollo Health • Code: DR-SHARMA-91A</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-teal" />
                        </button>
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleQuickDemoLogin('doctor@menocare.com', 'doctor')}
                          className="p-3 bg-cream hover:bg-teal-soft text-charcoal rounded-xl font-medium border border-[#E2DBD0] transition-colors text-left flex items-center justify-between hover:border-teal"
                        >
                          <div>
                            <p className="font-semibold text-xs text-charcoal">Dr. Elena Vance, MD</p>
                            <p className="text-xs text-charcoal-muted">Women's Health • 7 Patients</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-teal" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Mode Toggle (Sign In vs Register) */}
              <div className="flex items-center justify-between border-b border-[#E2DBD0]/70 pb-3">
                <h2 className="font-serif text-xl font-semibold text-charcoal">
                  {isRegister ? `Create ${role === 'doctor' ? 'Clinician' : 'Patient'} Account` : 'Sign In with Credentials'}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError(null);
                    setCurrentStep(1);
                  }}
                  className="text-xs font-semibold text-sage-dark hover:text-charcoal transition-colors underline decoration-sage/50"
                >
                  {isRegister ? 'Already registered? Sign In' : 'New to MenoCare? Create Account'}
                </button>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-3.5 bg-error-container border border-error/30 rounded-xl text-error text-xs font-medium flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Registration Steps Indicator for Patient */}
                {isRegister && role === 'patient' && (
                  <div className="flex items-center justify-between px-1 py-1 mb-2">
                    {[
                      { step: 1, label: 'Access' },
                      { step: 2, label: 'Age' },
                      { step: 3, label: 'STRAW+10' },
                      { step: 4, label: 'History' },
                    ].map((s) => (
                      <button
                        type="button"
                        key={s.step}
                        onClick={() => setCurrentStep(s.step)}
                        className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                          currentStep === s.step
                            ? 'text-sage-dark font-semibold'
                            : currentStep > s.step
                            ? 'text-charcoal'
                            : 'text-charcoal-light'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            currentStep === s.step
                              ? 'bg-sage-dark text-cream shadow-warm-sm'
                              : currentStep > s.step
                              ? 'bg-sage text-cream'
                              : 'bg-oat text-charcoal-muted'
                          }`}
                        >
                          {s.step}
                        </span>
                        <span className="hidden sm:inline">{s.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Step 1: Base Credentials */}
                {(!isRegister || currentStep === 1) && (
                  <div className="space-y-3.5">
                    {isRegister && (
                      <div>
                        <label className="block text-xs font-semibold text-charcoal-muted mb-1">
                          Full Legal Name
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder={role === 'doctor' ? 'Dr. Jane Smith, MD' : 'Jane Doe'}
                          className="w-full px-3.5 py-2.5 bg-white border border-[#E2DBD0] rounded-xl text-charcoal text-xs placeholder:text-charcoal-light focus:outline-none focus:border-sage-dark focus:ring-2 focus:ring-sage/20 transition-all shadow-warm-sm"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-charcoal-muted mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-charcoal-light absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#E2DBD0] rounded-xl text-charcoal text-xs placeholder:text-charcoal-light focus:outline-none focus:border-sage-dark focus:ring-2 focus:ring-sage/20 transition-all shadow-warm-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-charcoal-muted mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-charcoal-light absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#E2DBD0] rounded-xl text-charcoal text-xs placeholder:text-charcoal-light focus:outline-none focus:border-sage-dark focus:ring-2 focus:ring-sage/20 transition-all shadow-warm-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-light hover:text-charcoal"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {isRegister && role === 'doctor' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="block text-xs font-semibold text-charcoal-muted mb-1">Clinic Name</label>
                          <input
                            type="text"
                            value={clinicName}
                            onChange={(e) => setClinicName(e.target.value)}
                            placeholder="Metropolitan Women's Health"
                            className="w-full px-3.5 py-2 bg-white border border-[#E2DBD0] rounded-xl text-xs text-charcoal shadow-warm-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-charcoal-muted mb-1">License / NPI Number</label>
                          <input
                            type="text"
                            value={licenseNumber}
                            onChange={(e) => setLicenseNumber(e.target.value)}
                            placeholder="MD-849201"
                            className="w-full px-3.5 py-2 bg-white border border-[#E2DBD0] rounded-xl text-xs text-charcoal shadow-warm-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Patient Onboarding Step 2: Demographics & Practice Code */}
                {isRegister && role === 'patient' && currentStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal-muted mb-1">
                        Birth Year (Approximate age: {new Date().getFullYear() - birthYear} yrs)
                      </label>
                      <input
                        type="number"
                        min="1940"
                        max="2005"
                        value={birthYear}
                        onChange={(e) => setBirthYear(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#E2DBD0] rounded-xl text-charcoal text-xs shadow-warm-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-charcoal-muted mb-1">
                        Attending Doctor Practice Code (Optional)
                      </label>
                      <input
                        type="text"
                        value={doctorPracticeCode}
                        onChange={(e) => setDoctorPracticeCode(e.target.value.toUpperCase())}
                        placeholder="e.g. DR-SHARMA-91A"
                        className="w-full px-3.5 py-2.5 bg-white border border-[#E2DBD0] rounded-xl text-charcoal text-xs font-mono tracking-wider shadow-warm-sm"
                      />
                      <p className="text-[11px] text-charcoal-light mt-1">
                        If provided, links your health profile directly to your physician's clinical command portal.
                      </p>
                    </div>
                  </div>
                )}

                {/* Patient Onboarding Step 3: STRAW+10 Menopause Stage */}
                {isRegister && role === 'patient' && currentStep === 3 && (
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-charcoal-muted mb-1">
                      Current Menstrual Pattern (STRAW+10 Framework)
                    </label>
                    <div className="space-y-2">
                      {[
                        {
                          id: 'reproductive',
                          title: 'Late Reproductive (-3a/-3b)',
                          desc: 'Regular cycles, subtle flow changes or early mild symptoms.',
                        },
                        {
                          id: 'early_transition',
                          title: 'Early Menopausal Transition (-2)',
                          desc: 'Persistent cycle difference of ≥7 days between consecutive cycles.',
                        },
                        {
                          id: 'late_transition',
                          title: 'Late Menopausal Transition (-1)',
                          desc: 'Amenorrhea interval of ≥60 days; high vasomotor frequency.',
                        },
                        {
                          id: 'postmenopause',
                          title: 'Postmenopause (+1/+2)',
                          desc: '≥12 continuous months without menses.',
                        },
                      ].map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setStrawStage(item.id)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            strawStage === item.id
                              ? 'bg-sage-soft border-sage-dark text-charcoal font-semibold shadow-warm-sm'
                              : 'bg-white border-[#E2DBD0] text-charcoal-muted hover:border-sage'
                          }`}
                        >
                          <p className="font-semibold text-charcoal">{item.title}</p>
                          <p className="text-[11px] text-charcoal-muted mt-0.5">{item.desc}</p>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2">
                      <label className="block text-xs font-semibold text-charcoal-muted mb-1">
                        Days Since Last Menstrual Period: <span className="text-sage-dark font-bold">{amenorrheaDays} days</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="400"
                        value={amenorrheaDays}
                        onChange={(e) => setAmenorrheaDays(Number(e.target.value))}
                        className="w-full accent-sage-dark cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* Patient Onboarding Step 4: Medical History */}
                {isRegister && role === 'patient' && currentStep === 4 && (
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-charcoal-muted mb-1">
                      Relevant Medical History (For HRT Safety Checks)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {[
                        'History of DVT / Blood Clots',
                        'Breast or Endometrial Cancer',
                        'Hypertension / Heart Disease',
                        'Hysterectomy (Surgical Menopause)',
                        'Oophorectomy (Ovaries Removed)',
                        'Migraine with Aura',
                        'Active Tobacco Smoking',
                        'Severe Osteopenia / Osteoporosis',
                      ].map((condition) => {
                        const isSelected = selectedConditions.includes(condition);
                        return (
                          <div
                            key={condition}
                            onClick={() => toggleCondition(condition)}
                            className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                              isSelected
                                ? 'bg-sage-soft border-sage-dark text-charcoal font-semibold shadow-warm-sm'
                                : 'bg-white border-[#E2DBD0] text-charcoal-muted hover:border-sage'
                            }`}
                          >
                            <span className="text-[11px]">{condition}</span>
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected ? 'bg-sage-dark border-sage-dark text-cream' : 'border-[#E2DBD0]'
                              }`}
                            >
                              {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Form Buttons */}
                <div className="pt-4 flex items-center justify-between gap-3">
                  {isRegister && role === 'patient' && currentStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="px-4 py-2.5 rounded-xl border border-[#E2DBD0] bg-cream text-charcoal-muted hover:text-charcoal text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back
                    </button>
                  )}

                  {isRegister && role === 'patient' && currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(currentStep + 1)}
                      className="ml-auto px-5 py-2.5 rounded-xl bg-sage-dark hover:bg-sage text-cream text-xs font-semibold shadow-warm-md flex items-center gap-1.5 transition-all"
                    >
                      Continue
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-5 rounded-xl bg-sage-dark hover:bg-[#3E5437] text-white text-sm font-medium shadow-warm-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-cream border-t-transparent rounded-full animate-spin" />
                          <span>Processing Secure Authentication...</span>
                        </>
                      ) : (
                        <>
                          <span>{isRegister ? 'Complete Onboarding & Enter Portal' : 'Sign In to Clinical Workspace'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full px-6 py-4 border-t border-[#E2DBD0]/60 text-center text-xs text-charcoal-light bg-ivory/60">
        <p>© 2026 MenoCare Clinical Health. Validated Menopause Rating Scale (MRS) & STRAW+10 Deterministic Architecture.</p>
      </footer>
    </div>
  );
};
