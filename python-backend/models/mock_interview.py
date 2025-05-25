import os
import time
import cv2
import numpy as np
import sounddevice as sd
import scipy.io.wavfile as wav
import pyttsx3
import random
import string
import datetime
import json
import whisper
from langchain import PromptTemplate
from langchain_groq import ChatGroq
from langchain.schema import HumanMessage
import ast

# === CONFIG ===
os.environ["GROQ_API_KEY"] = "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"
llm = ChatGroq(model_name="llama3-70b-8192", api_key=os.environ["GROQ_API_KEY"])

# Load Whisper model ONCE (avoid reloading inside loops)
print("[INFO] Loading Whisper model...")
whisper_model = whisper.load_model("base")  # You can choose "small", "medium", etc.

# === CONFIG ===
MAX_QUESTIONS = 2
SILENCE_DURATION = 30  # seconds of silence to detect pause
fs = 44100  # audio sample rate
answer_output_dir = "answers"
os.makedirs(answer_output_dir, exist_ok=True)

# === Prompt template to generate interview questions ===
question_prompt_template = PromptTemplate.from_template("""
You have to ask technical questions only.

Given the following job description, generate exactly {n} unique, distinct, and non-repetitive mock interview questions.
Focus on relevant skills, experience, and responsibilities mentioned in the job description.

All the questions must be unique and non-repetitive.
The questions must be technical.

Format your output strictly as a Python list of strings, like this:

[
    "Can you describe your experience with managing cloud infrastructure?",
    "How do you approach debugging complex software issues?",
    ...
]

Job Description:
\"\"\"{job_desc}\"\"\"
""")

def generate_questions_groq(job_desc, n=2):
    print("[INFO] Generating questions using Groq LLaMA...")
    prompt = question_prompt_template.format(job_desc=job_desc, n=n)
    response = llm.invoke([HumanMessage(content=prompt)])
    generated_text = response.content.strip()

    try:
        start_idx = generated_text.find('[')
        if start_idx == -1:
            raise ValueError("No list found in output")

        list_text = generated_text[start_idx:]
        questions = ast.literal_eval(list_text)

        if isinstance(questions, list):
            unique_questions = []
            for q in questions:
                if q not in unique_questions:
                    unique_questions.append(q)
            if len(unique_questions) < n:
                print("[WARN] Less unique questions generated than requested.")
            return unique_questions[:n]
        else:
            print("[ERROR] Parsed output is not a list.")
            return ["Tell me about yourself."] * n

    except Exception as e:
        print("[ERROR] Parsing Groq LLaMA output failed:", e)
        print("[DEBUG] Raw output:", generated_text)

        fallback_questions = []
        lines = generated_text.split('\n')
        for line in lines:
            line = line.strip()
            if line and not line.startswith('Here are') and not line.startswith('['):
                fallback_questions.append(line)
        if not fallback_questions:
            fallback_questions = ["Tell me about yourself."]
        return fallback_questions[:n]

# === TEXT TO SPEECH ===
def speak(text):
    engine = pyttsx3.init()
    engine.say(text)
    engine.runAndWait()

# === RECORD AUDIO & VIDEO SEPARATELY UNTIL SILENCE DETECTED ===
def record_av_until_silence(output_filename_base, threshold=0.01, silence_sec=SILENCE_DURATION):
    print(f"[INFO] Recording audio and video until {silence_sec}s of silence is detected...")

    audio_filename = f"{output_filename_base}_audio.wav"
    video_filename = f"{output_filename_base}_video.avi"

    audio_buffer = []
    silence_counter = 0
    chunk_duration = 0.5  # seconds
    chunk_size = int(fs * chunk_duration)

    cap = cv2.VideoCapture(0)
    fourcc = cv2.VideoWriter_fourcc(*'XVID')
    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    out = cv2.VideoWriter(video_filename, fourcc, 20.0, (frame_width, frame_height))

    while True:
        ret, frame = cap.read()
        if not ret:
            print("[ERROR] Failed to capture video frame.")
            break
        out.write(frame)
        cv2.imshow('Recording (Press Q to quit)', frame)

        chunk = sd.rec(chunk_size, samplerate=fs, channels=1, dtype='float32')
        sd.wait()
        volume = np.linalg.norm(chunk) / chunk_size
        audio_buffer.append(chunk)

        if volume < threshold:
            silence_counter += chunk_duration
        else:
            silence_counter = 0

        if silence_counter >= silence_sec:
            print("[INFO] Detected long pause. Stopping recording.")
            break

        if cv2.waitKey(1) & 0xFF == ord('q'):
            print("[INFO] User requested to quit recording.")
            break

    cap.release()
    out.release()
    cv2.destroyAllWindows()

    full_audio = np.concatenate(audio_buffer, axis=0)
    full_audio_int16 = np.int16(full_audio * 32767)
    wav.write(audio_filename, fs, full_audio_int16)

    print(f"[INFO] Saved audio response to: {audio_filename}")
    print(f"[INFO] Saved video response to: {video_filename}")

    return audio_filename, video_filename

# === Transcribe audio using Whisper ===
def transcribe_audio_whisper(audio_path):
    print(f"[INFO] Transcribing audio with Whisper: {audio_path}")
    result = whisper_model.transcribe(audio_path)
    text = result["text"].strip()
    print(f"[INFO] Transcription result: {text}")
    return text

# === Generate validation prompt and get feedback from Groq LLaMA ===
def validate_answer_with_llm(question, answer):
    prompt = f"""
You are an expert technical interviewer.

Question:
{question}

Candidate's answer:
{answer}

Please provide a concise, constructive evaluation of this answer focusing on accuracy, completeness, and relevance.
"""
    response = llm.invoke([HumanMessage(content=prompt)])
    feedback = response.content.strip()
    return feedback

# === MOCK ANALYSIS FUNCTIONS ===
def analyze_video(video_path):
    return {
        "eye_contact_ratio": round(random.uniform(0.5, 1.0), 2),
        "facial_expression_score": round(random.uniform(0.5, 1.0), 2),
        "confidence_score": round(random.uniform(0.5, 1.0), 2),
    }


def analyze_audio(audio_path):
    return {
        "average_energy": round(random.uniform(0.3, 1.0), 2),
        "pitch_estimate": round(random.uniform(100, 300), 2),
        "silence_ratio": round(random.uniform(0, 0.3), 2),
        "speaking_rate_bpm": round(random.uniform(90, 160), 2),
    }


# === SCORING FUNCTION ===
def compute_final_score(video_results, audio_results):
    eye = video_results.get("eye_contact_ratio", 0)
    exp = video_results.get("facial_expression_score", 0)
    conf = video_results.get("confidence_score", 0)

    energy = audio_results.get("average_energy", 0)
    silence = audio_results.get("silence_ratio", 1)
    bpm = audio_results.get("speaking_rate_bpm", 0)

    video_score = (eye + exp + conf) / 3
    audio_fluency = (energy * 0.4 + (1 - silence) * 0.3 + (bpm / 160) * 0.3)
    audio_fluency = min(max(audio_fluency, 0), 1)

    final_normalized_score = (video_score * 0.6) + (audio_fluency * 0.4)
    final_score_out_of_5 = round(final_normalized_score * 5, 2)

    return {
        "video_score": round(video_score, 2),
        "audio_fluency_score": round(audio_fluency, 2),
        "final_score_out_of_5": final_score_out_of_5
    }

# === MAIN INTERVIEW LOOP ===
def run_mock_interview():
    job_description_path = "data/job_descriptions/extracted_text (3).txt"
    with open(job_description_path, "r", encoding="utf-8") as f:
        job_description = f.read()

    questions = generate_questions_groq(job_description, n=MAX_QUESTIONS)
    print(f"\n=== Mock Interview Started: {len(questions)} Questions ===\n")

    for i, question in enumerate(questions, 1):
        print(f"\n🎤 Question {i}: {question}")
        speak(f"Question {i}. {question}")

        answer_base = os.path.join(answer_output_dir, f"answer_{i}")
        audio_path, video_path = record_av_until_silence(answer_base)

        # Transcribe answer audio using Whisper  # NEW
        transcribed_text = transcribe_audio_whisper(audio_path)

        # Validate candidate's answer with LLM   # NEW
        feedback = validate_answer_with_llm(question, transcribed_text)

        print(f"\n[TRANSCRIPTION] Candidate's Answer:\n{transcribed_text}")
        print(f"\n[FEEDBACK] LLM Evaluation:\n{feedback}")

        video_results = analyze_video(video_path)
        audio_results = analyze_audio(audio_path)
        scores = compute_final_score(video_results, audio_results)

        print(f"\n[RESULTS] Analysis for Answer {i}:")
        print(f"  Eye Contact Ratio: {video_results['eye_contact_ratio']}")
        print(f"  Facial Expression Score: {video_results['facial_expression_score']}")
        print(f"  Confidence Score: {video_results['confidence_score']}")
        print(f"  Average Energy: {audio_results['average_energy']}")
        print(f"  Pitch Estimate: {audio_results['pitch_estimate']}")
        print(f"  Silence Ratio: {audio_results['silence_ratio']}")
        print(f"  Speaking Rate (BPM): {audio_results['speaking_rate_bpm']}")
        print(f"  Final Score (out of 5): {scores['final_score_out_of_5']}")

    print("\n=== Mock Interview Completed ===")

if __name__ == "__main__":
    run_mock_interview()
