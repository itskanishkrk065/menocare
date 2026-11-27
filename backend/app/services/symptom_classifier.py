"""Intelligent Symptom Classification Engine with NLP, Negation Detection, and Provenance.

Extracts candidate symptoms from free-text and voice transcripts, maps them
strictly to MenoCare's 30-category taxonomy, handles negation and uncertainty,
and provides a deterministic fallback when external AI is unavailable.
"""

import re
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.models import SymptomExtraction, PatientProfile

# ---------------------------------------------------------------------------
# 1. APPROVED TAXONOMY (30 CATEGORIES)
# ---------------------------------------------------------------------------

APPROVED_TAXONOMY: Dict[str, Dict[str, Any]] = {
    # Vasomotor
    "SYM_HOT_FLASHES": {
        "name": "Hot Flashes",
        "domain": "vasomotor",
        "keywords": ["hot flash", "hot flashes", "hot flush", "hot flushes", "flashing", "sudden heat", "wave of heat", "burning up"],
        "description": "Sudden intense feeling of heat typically over face, neck, and chest.",
    },
    "SYM_NIGHT_SWEATS": {
        "name": "Night Sweats",
        "domain": "vasomotor",
        "keywords": ["night sweat", "night sweats", "sweating at night", "waking up drenched", "soaked sheets", "nocturnal sweating", "drenched pyjamas"],
        "description": "Repeated episodes of extreme perspiration during sleep.",
    },
    "SYM_COLD_CHILLS": {
        "name": "Cold Chills",
        "domain": "vasomotor",
        "keywords": ["chills", "shivering", "cold spells", "freezing cold", "cold flash", "teeth chattering"],
        "description": "Sudden shivering or shivering sensation following or independent of hot flashes.",
    },
    "SYM_FLUSHING": {
        "name": "Facial Flushing",
        "domain": "vasomotor",
        "keywords": ["flushing", "red face", "skin blotches", "blushing suddenly", "redness in neck"],
        "description": "Visible reddening and warmth of facial and neck skin.",
    },
    # Sleep
    "SYM_SLEEP_ONSET": {
        "name": "Difficulty Falling Asleep",
        "domain": "sleep",
        "keywords": ["trouble falling asleep", "can't fall asleep", "tossing and turning", "sleep onset", "takes hours to sleep", "lying awake for hours"],
        "description": "Prolonged sleep-onset latency exceeding 30 minutes.",
    },
    "SYM_SLEEP_MAINTENANCE": {
        "name": "Frequent Nighttime Awakenings",
        "domain": "sleep",
        "keywords": ["waking up frequently", "waking up multiple times", "broken sleep", "fragmented sleep", "woke up 3 times", "waking every hour"],
        "description": "Disrupted sleep continuity with multiple nocturnal awakenings.",
    },
    "SYM_EARLY_AWAKENING": {
        "name": "Early Morning Awakening",
        "domain": "sleep",
        "keywords": ["waking up early", "waking at 4am", "waking at 3am", "early awakening", "can't go back to sleep after waking"],
        "description": "Waking significantly earlier than planned without ability to resume sleep.",
    },
    "SYM_UNREFRESHING_SLEEP": {
        "name": "Unrefreshing Sleep",
        "domain": "sleep",
        "keywords": ["unrefreshing sleep", "waking up exhausted", "sleep didn't help", "feeling unrested", "tired despite sleeping"],
        "description": "Subjective feeling of exhaustion upon waking despite adequate duration.",
    },
    # Psychological & Cognitive
    "SYM_BRAIN_FOG": {
        "name": "Brain Fog & Concentration",
        "domain": "cognitive",
        "keywords": ["brain fog", "foggy head", "can't concentrate", "trouble focusing", "spaced out", "mental haze", "cloudy thoughts"],
        "description": "Perceived cognitive slowing, impaired focus, or mental fatigue.",
    },
    "SYM_MEMORY_LAPSES": {
        "name": "Memory Lapses",
        "domain": "cognitive",
        "keywords": ["forgetful", "forgetting words", "memory lapses", "misplacing things", "losing train of thought", "short term memory"],
        "description": "Word-finding difficulties and working memory slips.",
    },
    "SYM_ANXIETY": {
        "name": "Anxiety & Nervous Tension",
        "domain": "psychological",
        "keywords": ["anxious", "anxiety", "nervous tension", "on edge", "feeling panicky", "racing thoughts", "jittery", "inner restlessness"],
        "description": "Heightened sympathetic worry, restlessness, or bodily tension.",
    },
    "SYM_LOW_MOOD": {
        "name": "Low Mood & Tearfulness",
        "domain": "psychological",
        "keywords": ["depressed", "feeling down", "tearful", "crying easily", "hopeless", "sad", "low mood", "lack of joy", "mood swings", "mood changes"],
        "description": "Persistent sadness, dysphoria, or unexplained emotional sensitivity.",
    },
    "SYM_IRRITABILITY": {
        "name": "Irritability & Short Temper",
        "domain": "psychological",
        "keywords": ["irritable", "short temper", "snapping at people", "rage", "anger", "impatient", "easily annoyed"],
        "description": "Quick-onset anger, sensory overload, or low frustration tolerance.",
    },
    "SYM_PANIC": {
        "name": "Panic Sensations",
        "domain": "psychological",
        "keywords": ["panic attack", "sudden terror", "feeling of doom", "hyperventilating", "heart racing panic"],
        "description": "Paroxysmal acute autonomic fear episodes.",
    },
    "SYM_OVERWHELM": {
        "name": "Loss of Confidence & Overwhelm",
        "domain": "psychological",
        "keywords": ["overwhelmed", "can't cope", "loss of confidence", "burnout", "everything is too much"],
        "description": "Diminished sense of agency, capacity, or acute burnout.",
    },
    # Somatic & Pain
    "SYM_FATIGUE": {
        "name": "Physical Fatigue & Exhaustion",
        "domain": "somatic",
        "keywords": ["fatigue", "exhausted", "drained", "no energy", "lethargic", "wiped out", "heavy body", "sluggish"],
        "description": "Pervasive physical exhaustion not relieved by ordinary rest.",
    },
    "SYM_JOINT_PAIN": {
        "name": "Joint Stiffness & Arthralgia",
        "domain": "musculoskeletal",
        "keywords": ["joint pain", "stiff joints", "aching fingers", "aching knees", "stiffness in morning", "joint aches", "arthralgia"],
        "description": "Aching, soreness, or morning stiffness in small or large joints.",
    },
    "SYM_MUSCLE_ACHES": {
        "name": "Muscle Aches & Soreness",
        "domain": "musculoskeletal",
        "keywords": ["muscle aches", "myalgia", "sore muscles", "body aches", "muscle tension", "shoulder tension"],
        "description": "Diffuse muscular soreness or postural stiffness.",
    },
    "SYM_HEADACHE": {
        "name": "Headaches & Hormonal Migraines",
        "domain": "neurological",
        "keywords": ["headache", "migraine", "throbbing head", "hormonal migraine", "sinus pressure", "temple pain"],
        "description": "Tension headaches or unilateral throbbing neurovascular migraines.",
    },
    "SYM_PALPITATIONS": {
        "name": "Heart Palpitations",
        "domain": "cardiac",
        "keywords": ["palpitations", "fluttering heart", "racing heart", "heart skipping a beat", "pounding chest", "arrhythmia sensation"],
        "description": "Awareness of rapid, bounding, or irregular cardiac rhythm.",
    },
    "SYM_DIZZINESS": {
        "name": "Dizziness & Lightheadedness",
        "domain": "neurological",
        "keywords": ["dizzy", "dizziness", "lightheaded", "woozy", "unsteady", "vertigo", "feeling faint"],
        "description": "Postural instability or momentary sensation of unsteadiness.",
    },
    "SYM_TINGLING": {
        "name": "Tingling & Paresthesia",
        "domain": "neurological",
        "keywords": ["tingling", "pins and needles", "paresthesia", "crawling skin", "formication", "numbness in fingers"],
        "description": "Abnormal tactile sensations including formication or acroparesthesia.",
    },
    # Urogenital & Sexual
    "SYM_VAGINAL_DRYNESS": {
        "name": "Vaginal Dryness & Itching",
        "domain": "urogenital",
        "keywords": ["vaginal dryness", "dry vagina", "vaginal itching", "burning vagina", "vulvar irritation", "atrophy symptoms"],
        "description": "Genitourinary tissue dryness, friction, or burning.",
    },
    "SYM_DYSPAREUNIA": {
        "name": "Painful Intimacy (Dyspareunia)",
        "domain": "urogenital",
        "keywords": ["painful sex", "pain during intimacy", "dyspareunia", "hurts during intercourse", "intimacy is painful"],
        "description": "Genital pain occurring immediately before, during, or after sexual intercourse.",
    },
    "SYM_URINARY_URGENCY": {
        "name": "Urinary Urgency & Frequency",
        "domain": "urogenital",
        "keywords": ["peeing all the time", "urinary urgency", "running to bathroom", "frequent urination", "bladder urgency"],
        "description": "Sudden compelling desire to pass urine that is difficult to defer.",
    },
    "SYM_BLADDER_DISCOMFORT": {
        "name": "Bladder Discomfort / Discomfort Urinating",
        "domain": "urogenital",
        "keywords": ["bladder pain", "burning when peeing", "dysuria", "uti feeling", "irritated bladder"],
        "description": "Suprapubic discomfort or burning sensation without verified bacterial infection.",
    },
    "SYM_LOW_LIBIDO": {
        "name": "Decreased Libido",
        "domain": "sexual_health",
        "keywords": ["low libido", "no sex drive", "loss of desire", "lack of interest in intimacy", "zero sex drive"],
        "description": "Marked reduction or absence of sexual interest, thoughts, or fantasies.",
    },
    # Bleeding & Metabolic
    "SYM_HEAVY_BLEEDING": {
        "name": "Heavy Menstrual Bleeding",
        "domain": "menstrual",
        "keywords": ["heavy bleeding", "flooding", "changing pads every hour", "soaking through tampon", "large blood clots", "menorrhagia"],
        "description": "Excessive uterine blood loss impacting daily physical and emotional activity.",
    },
    "SYM_IRREGULAR_BLEEDING": {
        "name": "Irregular Cycles / Spotting",
        "domain": "menstrual",
        "keywords": ["irregular periods", "spotting", "late period", "skipped period", "random bleeding", "unpredictable cycle"],
        "description": "Cycle length variation >=7 days or unexpected intermenstrual spotting.",
    },
    "SYM_BLOATING": {
        "name": "Abdominal Bloating & Water Retention",
        "domain": "gastrointestinal",
        "keywords": ["bloating", "bloated stomach", "water retention", "swollen belly", "tight waistband", "puffy fingers"],
        "description": "Subjective feeling of abdominal tightness, distension, or edema.",
    },
}

# Negation and uncertainty indicator cues
NEGATION_PATTERNS = [
    r"\bno\b", r"\bnot\b", r"\bdon't\b", r"\bdid not\b", r"\bdidn't\b",
    r"\bnever\b", r"\bwithout\b", r"\bdenies\b", r"\bfree of\b",
    r"\bstopped\b", r"\bresolved\b", r"\bnone\b", r"\bzero\b",
    r"\bno longer\b", r"\bhaven't\b", r"\bhasn't\b"
]

UNCERTAINTY_PATTERNS = [
    r"\bmaybe\b", r"\bpossibly\b", r"\bmight be\b", r"\bnot sure\b",
    r"\bunclear\b", r"\bperhaps\b", r"\bcould be\b", r"\bwondering if\b"
]

AMBIGUOUS_PATTERNS = [
    r"\bfeeling\s+(?:very\s+|really\s+|quite\s+)?(?:weird|off|strange|bad|uncomfortable)\b",
    r"\bsomething\s+is\s+wrong\b",
    r"\bnot\s+feeling\s+right\b",
    r"\bjust\s+(?:weird|off)\b",
]


class SymptomClassifierService:
    """Hybrid NLP symptom classification engine with patient confirmation safeguard."""

    MODEL_VERSION: str = "hybrid-nlp-v1"

    @classmethod
    def _is_negated_in_sentence(cls, sentence: str, keyword: str) -> bool:
        """Determines if a symptom keyword is negated within its clause/sentence."""
        kw_idx = sentence.find(keyword)
        if kw_idx == -1:
            return False
        # Window of text up to 80 characters preceding the keyword
        preceding = sentence[max(0, kw_idx - 80):kw_idx]
        for pat in NEGATION_PATTERNS:
            match = re.search(pat, preceding, re.IGNORECASE)
            if match:
                # Text between negation cue and keyword
                intervening = preceding[match.end():]
                # If an adversative conjunction intervened (e.g. "no hot flashes but anxiety"), negation doesn't cross "but"
                if re.search(r"\b(but|however|except|although)\b", intervening, re.IGNORECASE):
                    continue
                return True
        return False

    @classmethod
    def _is_uncertain(cls, sentence: str) -> bool:
        """Checks for uncertainty qualifiers within the sentence."""
        for pat in UNCERTAINTY_PATTERNS:
            if re.search(pat, sentence, re.IGNORECASE):
                return True
        return False

    @classmethod
    def classify_text(cls, text: str) -> Dict[str, Any]:
        """Classifies text into candidate symptom categories with negation and uncertainty flags."""
        cleaned = text.strip()
        if not cleaned:
            return {
                "candidates": [],
                "clarification_requested": False,
                "clarification_prompt": None,
                "raw_text": text,
            }

        lower_text = cleaned.lower()

        # Check for highly ambiguous statements lacking specific symptoms
        is_ambiguous = any(re.search(pat, lower_text) for pat in AMBIGUOUS_PATTERNS) and len(cleaned) < 100

        # Split into sentences for clause-level negation analysis
        sentences = re.split(r"[.!?;\n]+", lower_text)

        candidates: List[Dict[str, Any]] = []
        matched_codes = set()

        for category_code, meta in APPROVED_TAXONOMY.items():
            for kw in meta["keywords"]:
                for s in sentences:
                    if kw in s and category_code not in matched_codes:
                        is_neg = cls._is_negated_in_sentence(s, kw)
                        is_unc = cls._is_uncertain(s)

                        # Calculate confidence: 0.95 for direct positive assertion, 0.65 for uncertain
                        conf = 0.65 if is_unc else 0.95
                        if is_neg:
                            conf = 0.10  # Negated: marked explicitly as not present

                        candidates.append({
                            "category_code": category_code,
                            "category_name": meta["name"],
                            "domain": meta["domain"],
                            "matched_keyword": kw,
                            "is_negated": is_neg,
                            "is_uncertain": is_unc,
                            "confidence_score": conf,
                            "context_sentence": s.strip(),
                            "preselect": (not is_neg and not is_unc and conf >= 0.80),
                        })
                        matched_codes.add(category_code)
                        break

        # Check if clarification is required
        clarification_req = False
        clarification_prompt = None

        if not candidates and is_ambiguous:
            clarification_req = True
            clarification_prompt = (
                "You mentioned feeling off or strange today. Could you tell us more about "
                "whether you noticed physical sensations like warmth, tiredness, aches, or mood changes?"
            )
        elif all(c["is_uncertain"] for c in candidates) and len(candidates) > 0:
            clarification_req = True
            clarification_prompt = (
                "We noticed some uncertain descriptions. Please verify which of the suggested "
                "categories accurately match how you felt today."
            )

        return {
            "raw_text": cleaned,
            "candidates": candidates,
            "clarification_requested": clarification_req,
            "clarification_prompt": clarification_prompt,
            "model_version": cls.MODEL_VERSION,
        }

    @classmethod
    async def record_symptom_intake(
        cls,
        db: AsyncSession,
        patient_id: str,
        input_text: str,
        input_method: str = "text",
        reviewed_transcript: Optional[str] = None,
        assessment_id: Optional[str] = None,
    ) -> SymptomExtraction:
        """Parses description and records the draft extraction in database."""
        classification = cls.classify_text(reviewed_transcript or input_text)

        extraction = SymptomExtraction(
            patient_id=patient_id,
            assessment_id=assessment_id,
            input_method=input_method,
            raw_input_text=input_text,
            reviewed_transcript=reviewed_transcript,
            extracted_candidates=classification["candidates"],
            confirmed_categories=[],
            rejected_categories=[],
            added_manually_categories=[],
            clarification_requested=classification["clarification_requested"],
            clarification_prompt=classification["clarification_prompt"],
            model_version=cls.MODEL_VERSION,
        )
        db.add(extraction)
        await db.commit()
        return extraction

    @classmethod
    async def confirm_patient_symptoms(
        cls,
        db: AsyncSession,
        extraction_id: str,
        patient_id: str,
        confirmed_category_codes: List[str],
        rejected_category_codes: List[str],
        added_category_codes: List[str],
    ) -> SymptomExtraction:
        """Saves patient's explicit confirmation, maintaining full provenance and audit trail."""
        res = await db.execute(
            select(SymptomExtraction).where(
                SymptomExtraction.id == extraction_id,
                SymptomExtraction.patient_id == patient_id,
            )
        )
        extraction = res.scalar_one_or_none()
        if not extraction:
            raise ValueError(f"Symptom extraction record {extraction_id} not found.")

        # Build confirmed structured objects
        confirmed_records = []
        for code in confirmed_category_codes + added_category_codes:
            meta = APPROVED_TAXONOMY.get(code)
            if meta:
                confirmed_records.append({
                    "category_code": code,
                    "category_name": meta["name"],
                    "domain": meta["domain"],
                    "confirmed_at": datetime.now(timezone.utc).isoformat(),
                })

        extraction.confirmed_categories = confirmed_records
        extraction.rejected_categories = rejected_category_codes
        extraction.added_manually_categories = added_category_codes
        extraction.confirmed_at = datetime.now(timezone.utc)

        await db.commit()
        return extraction
