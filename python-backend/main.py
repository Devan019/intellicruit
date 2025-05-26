from dotenv import load_dotenv
load_dotenv()
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
import os
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import re
import socket
import time
import random
import datetime
from fastapi import FastAPI, UploadFile, File, Body
from fastapi.responses import JSONResponse
from fastapi import FastAPI, UploadFile, File,Form, HTTPException
import shutil
import tempfile
import json     
from models.ResumeAgent import   resume_agent
from pydantic import BaseModel
import shutil
import tempfile
import json     
from models.ResumeAgent import resume_agent
from models.ScoringAgent import scoring_agent
from models.SchedulerCommAgent import schedule_interview, send_candidate_message
from pyngrok import ngrok
import nest_asyncio
import uvicorn
from pydantic import BaseModel
from utils.extractions import extract_text_from_pdf, extract_text_from_image, extract_skills_from_resume
from typing import List, Dict, Optional
from models.mock_interview import (
    generate_questions_groq, 
    transcribe_audio_whisper, 
    validate_answer_with_llm,
    analyze_video, 
    analyze_audio, 
    compute_final_score
)


course_df = pd.read_csv("./data/csvs/coursera_skill_clusters.csv")

roles = [
    {"title": "AI Engineer", "description": "Develops AI models and ML pipelines for automation and smart applications.",
     "skills": ["Python", "TensorFlow", "Machine Learning", "Deep Learning", "PyTorch", "Scikit-learn"]},

    {"title": "Data Scientist", "description": "Performs advanced statistical analysis and builds predictive models.",
     "skills": ["Python", "R", "Statistics", "Machine Learning", "Pandas", "Matplotlib", "SQL"]},

    {"title": "Data Analyst", "description": "Analyzes data trends, creates reports, and builds dashboards.",
     "skills": ["SQL", "Excel", "Tableau", "Statistics", "Power BI", "Python"]},

    {"title": "Web Developer", "description": "Builds and maintains websites and web apps using front and back-end tech.",
     "skills": ["HTML", "CSS", "JavaScript", "React", "Node.js", "Express.js", "MongoDB"]},

    {"title": "Frontend Developer", "description": "Creates interactive user interfaces and optimizes user experiences.",
     "skills": ["HTML", "CSS", "JavaScript", "React", "Vue.js", "TypeScript", "Figma"]},

    {"title": "Backend Developer", "description": "Develops server-side logic and integrates with databases.",
     "skills": ["Node.js", "Express", "Django", "Flask", "SQL", "MongoDB", "Python", "Java"]},

    {"title": "DevOps Engineer", "description": "Manages CI/CD pipelines, infrastructure automation, and deployments.",
     "skills": ["Docker", "Kubernetes", "CI/CD", "AWS", "Terraform", "Linux", "Jenkins"]},

    {"title": "Cloud Engineer", "description": "Designs and maintains cloud infrastructure and services.",
     "skills": ["AWS", "Azure", "Google Cloud", "Terraform", "CloudFormation", "Python"]},

    {"title": "Cybersecurity Analyst", "description": "Protects systems from attacks and monitors suspicious activity.",
     "skills": ["Networking", "Linux", "Python", "Security Tools", "Penetration Testing", "Firewalls"]},

    {"title": "Mobile App Developer", "description": "Builds apps for Android and iOS platforms.",
     "skills": ["Kotlin", "Swift", "React Native", "Flutter", "Java", "Dart", "Firebase"]},

    {"title": "Game Developer", "description": "Creates video games for different platforms.",
     "skills": ["Unity", "C#", "Unreal Engine", "C++", "3D Modeling", "Game Design"]},

    {"title": "Blockchain Developer", "description": "Develops decentralized applications and smart contracts.",
     "skills": ["Solidity", "Ethereum", "Web3.js", "Smart Contracts", "Cryptography", "Rust"]},

    {"title": "Machine Learning Engineer", "description": "Designs ML systems and productionizes models.",
     "skills": ["Scikit-learn", "TensorFlow", "Keras", "ML Ops", "Python", "Pandas", "Airflow"]},

    {"title": "NLP Engineer", "description": "Focuses on text-based AI like chatbots, translation, sentiment analysis.",
     "skills": ["SpaCy", "NLTK", "Hugging Face Transformers", "BERT", "Text Classification", "Python"]},

    {"title": "Robotics Engineer", "description": "Builds robotic systems using software and hardware integration.",
     "skills": ["ROS", "C++", "Python", "Sensors", "Actuators", "Embedded Systems"]},

    {"title": "Embedded Systems Engineer", "description": "Develops software for embedded devices like microcontrollers.",
     "skills": ["C", "C++", "Assembly", "RTOS", "Microcontrollers", "I2C", "SPI"]},

    {"title": "Systems Administrator", "description": "Maintains server infrastructure and IT systems.",
     "skills": ["Linux", "Bash", "Networking", "Firewalls", "System Monitoring", "VMware"]},

    {"title": "Database Administrator", "description": "Maintains and optimizes databases for performance and reliability.",
     "skills": ["SQL", "Oracle", "MySQL", "PostgreSQL", "Backup & Recovery", "Database Tuning"]},

    {"title": "Full Stack Developer", "description": "Works on both frontend and backend parts of applications.",
     "skills": ["JavaScript", "React", "Node.js", "MongoDB", "HTML", "CSS", "Python", "Express.js"]},

    {"title": "UI/UX Designer", "description": "Designs intuitive user interfaces and experiences.",
     "skills": ["Figma", "Adobe XD", "User Research", "Wireframing", "Prototyping", "Sketch"]}
]


class UserProfile(BaseModel):
    name: str
    current_skills: List[str]
    desired_skills: List[str]
    level: str  # Beginner | Intermediate | Advanced | Expert
    experience_years: float
    education: str
 

class RecommendedCourse(BaseModel):
    course: str
    skills: str
    rating: float
    reviewcount: str
    duration: str
    similarity: float

class CareerRecommendation(BaseModel):
    career_role: str
    match_score: float
    recommended_courses: List[RecommendedCourse]

class RecommendationResponse(BaseModel):
    recommended_careers: List[CareerRecommendation]
    
class VerificationResult(BaseModel):
    courses_found: List[Dict[str, str]]
    platform_verified: bool
    user_name_verified: bool
    valid_certificate: bool
    extracted_text: Optional[str] = None

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# nest_asyncio.apply()
# Endpoint for evaluation
from typing import Dict, Any, Optional, List
nest_asyncio.apply()

def find_free_port(start_port=8000, max_port=8100):
    """Find a free port starting from start_port"""
    for port in range(start_port, max_port):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('', port))
                return port
        except OSError:
            continue
    raise RuntimeError(f"No free port found between {start_port} and {max_port}")

# Existing code for resume processing
@app.post("/resume-agent/")
async def extract_resume_info(resume_file: UploadFile = File(...)):
    try:
        tmp_file_path = None
        # Write uploaded file to a temporary binary file
        suffix = os.path.splitext(resume_file.filename)[-1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            shutil.copyfileobj(resume_file.file, tmp)
            tmp_file_path = tmp.name

        # Get the result (it may be a string containing JSON in triple backticks)
        print(f"Temporary file created at: {tmp_file_path}")  # Log the temp file path for debugging
        result = resume_agent(tmp_file_path)
        print(f"Result from resume_agent: {result}")  # Log the result for debugging

        print(f"Resume agent result: {result}")  # Log the result for debugging
        # Extract JSON block from string if it's not directly a dict
        return json.loads(result)

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )
    finally:
        # Clean up temporary file
        if tmp_file_path and os.path.exists(tmp_file_path):
            os.unlink(tmp_file_path)

# Load the job description once at startup
with open("data/job_descriptions/extracted_text (3).txt", "r", encoding="utf-8") as f:
    JOB_DESCRIPTION = f.read()

@app.post("/score-agent/")
async def evaluate_resume(file: UploadFile = File(...)):
    upload_path = None
    try:
        # Save uploaded file temporarily
        upload_path = f"temp_uploads/{file.filename}"
        os.makedirs("temp_uploads", exist_ok=True)

        with open(upload_path, "wb") as f_out:
            content = await file.read()
            f_out.write(content)

        # Parse resume using your existing resume_agent
        parsed_resume = resume_agent(upload_path)

        # Ensure parsed_resume is a Python dict
        if isinstance(parsed_resume, str):
            try:
                parsed_resume = json.loads(parsed_resume)
            except json.JSONDecodeError:
                return JSONResponse(status_code=400, content={"error": "Failed to parse resume JSON."})

        # Prepare input for scoring
        test_input = {
            "resume_json": parsed_resume,
            "job_description": JOB_DESCRIPTION
        }

        input_str = json.dumps(test_input)
        result = scoring_agent(input_str)

        return {
            "evaluation" : result,
            "resume" : parsed_resume
        }
    
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )
    finally:
        # Clean up temporary file
        if upload_path and os.path.exists(upload_path):
            os.unlink(upload_path)

# Updated request models for new scheduler agent
class Candidate(BaseModel):
    name: str
    email: str

class Job(BaseModel):
    company: str
    position: str
    tone: str = "professional"

class Availability(BaseModel):
    recruiter: str
    candidate: str

class ScheduleRequest(BaseModel):
    candidate: Candidate
    job: Job
    availability: Availability

class CommunicationRequest(BaseModel):
    type: str  # rejection, followup, reschedule
    candidate: Candidate
    job: Job

@app.post("/schedule-interview/")
async def schedule_interview_api(request: ScheduleRequest):
    """
    Find available interview slots - returns data for frontend to handle email/calendar
    """
    try:
        input_data = request.dict()
        input_str = json.dumps(input_data)
        
        result = schedule_interview(input_str)
        return json.loads(result)
            
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.post("/generate-communication/")
async def generate_communication_api(request: CommunicationRequest):
    """
    Generate email content - returns data for frontend to handle email sending
    """
    try:
        input_data = {
            "type": request.type,
            "candidate": request.candidate.dict(),
            "job": request.job.dict()
        }
        input_str = json.dumps(input_data)
        
        result = send_candidate_message(input_str)
        return json.loads(result)
            
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.post("/complete-hiring-workflow/")
async def complete_hiring_workflow(
    resume_file: UploadFile = File(...), 
    job_description: str = Body(...), 
    recruiter_availability: str = Body(...),
    company_name: str = Body(default="IntelliCruit"),
    position: str = Body(default="Software Developer"),
    score_threshold: int = Body(default=70)
):
    """
    Complete end-to-end hiring workflow with new scheduler agent:
    1. Parse resume
    2. Score against job description
    3. If score >= threshold, schedule interview
    4. If score < threshold, send rejection
    """
    tmp_file_path = None
    try:
        # Step 1: Parse the resume
        suffix = os.path.splitext(resume_file.filename)[-1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            shutil.copyfileobj(resume_file.file, tmp)
            tmp_file_path = tmp.name
            
        parsed_resume = resume_agent(tmp_file_path)
        if isinstance(parsed_resume, str):
            parsed_resume = json.loads(parsed_resume)
            
        # Step 2: Score the resume
        score_input = {
            "resume_json": parsed_resume,
            "job_description": job_description
        }
        score_result = scoring_agent(json.dumps(score_input))
        
        # Extract total score from scoring result
        score_match = re.search(r"Match Score:\s*(\d+)", score_result)
        total_score = int(score_match.group(1)) if score_match else 0
        
        # Get candidate info from parsed resume
        candidate_name = parsed_resume.get("name", "Candidate")
        candidate_email = parsed_resume.get("email", "")
        
        if not candidate_email:
            return JSONResponse(
                status_code=400,
                content={"error": "No email found in resume"}
            )
        
        # Step 3: Determine next action based on score
        if total_score >= score_threshold:
            # Schedule interview using new agent format
            schedule_data = {
                "candidate": {
                    "name": candidate_name,
                    "email": candidate_email
                },
                "job": {
                    "company": company_name,
                    "position": position,
                    "tone": "professional but friendly"
                },
                "availability": {
                    "recruiter": recruiter_availability,
                    "candidate": "Monday through Friday, 9am to 5pm"  # Default availability
                }
            }
            
            schedule_result = schedule_interview(json.dumps(schedule_data))
            schedule_result_json = json.loads(schedule_result)
            
            return {
                "resume_parsed": parsed_resume,
                "evaluation": score_result,
                "total_score": total_score,
                "threshold": score_threshold,
                "action_taken": "interview_scheduled",
                "schedule_result": schedule_result_json
            }
        else:
            # Send rejection using new agent format
            rejection_data = {
                "type": "rejection",
                "candidate": {
                    "name": candidate_name,
                    "email": candidate_email
                },
                "job": {
                    "company": company_name,
                    "position": position,
                    "tone": "professional and empathetic"
                }
            }
            
            rejection_result = send_candidate_message(json.dumps(rejection_data))
            rejection_result_json = json.loads(rejection_result)
            
            return {
                "resume_parsed": parsed_resume,
                "evaluation": score_result,
                "total_score": total_score,
                "threshold": score_threshold,
                "action_taken": "rejection_sent",
                "communication_result": rejection_result_json
            }
            
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )
    finally:
        # Clean up temporary file
        if tmp_file_path and os.path.exists(tmp_file_path):
            os.unlink(tmp_file_path)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "IntelliCruit API is running"}

# Get available endpoints
@app.get("/")
async def root():
    return {
        "message": "IntelliCruit API",
        "endpoints": {
            "resume_parsing": "/resume-agent/",
            "resume_scoring": "/score-agent/", 
            "interview_scheduling": "/schedule-interview/",
            "candidate_communication": "/send-communication/",
            "complete_workflow": "/complete-hiring-workflow/",
            "health_check": "/health",
            "job_analysis": "/job-analysis",
            "recommend_jobs": "/recommend-jobs",
            "verify_certificate": "/verify-certificate",
            "suggest_career": "/suggest-career",
            "mock_interview_start": "/mock-interview/start",
            "mock_interview_submit": "/mock-interview/submit-answer",
            "mock_interview_results": "/mock-interview/session/{session_id}",
            "mock_interview_analyze": "/mock-interview/analyze-files"
        }
    }

    

@app.post("/verify-certificate", response_model=VerificationResult)
async def verify_certificate(
    name: str = Form(...),
    certificate: UploadFile = File(...)
):
    # Check file type
    if certificate.content_type not in ["image/jpeg", "image/png", "application/pdf"]:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, or PDF files are supported.")

    # Read and process file
    contents = await certificate.read()
    
    if certificate.content_type == "application/pdf":
        text = extract_text_from_pdf(contents)
    else:
        text = extract_text_from_image(contents)
    
    # Match courses
    matched_courses = []
    for idx, row in course_df.iterrows():
        course_name = row["course"]
        if pd.notna(course_name) and course_name.lower() in text.lower():
            matched_courses.append({
                "course_name": course_name,
                "cluster": row.get("cluster", "Unknown")
            })

    # Check platform
    platform_found = any(
        p in text 
        for p in ["coursera", "udemy", "edx", "skillshare"]
    )
    
    # Check user name
    user_verified = name in text

    return {
        "courses_found": matched_courses,
        "platform_verified": platform_found,
        "user_name_verified": user_verified,
        "valid_certificate": bool(matched_courses and platform_found),
        "extracted_text": text
    }

@app.get("/job-analysis")
async def jobs_analysis():
    df=pd.read_csv("./data/csvs/ai_job_market_insights.csv")
    salary_by_title = df.groupby("Job_Title", as_index=False)["Salary_USD"].mean().sort_values(by="Salary_USD", ascending=False).to_dict('records')
    industry_distribution = df["Industry"].value_counts().reset_index().rename(columns={"count": "value"}).to_dict('records')
    
    return {
        "salary_by_title": salary_by_title,
        "industry_distribution": industry_distribution,
        "raw_data": df.to_dict('records')
    }

@app.post("/recommend-jobs")
async def recommend_jobs(skills: List[str]):
    df = pd.read_csv("./data/csvs/ai_job_market_insights.csv")

    try:
        if df.empty:
            return JSONResponse(
                status_code=404,
                content={"error": "Job dataset not found. Please ensure ai_job_market_insights.csv exists."}
            )

        # Vectorize job required skills
        vectorizer = TfidfVectorizer(stop_words='english')
        X = vectorizer.fit_transform(df['Required_Skills'].fillna(""))

        # Prepare user input
        user_input = ', '.join(skills)
        user_vec = vectorizer.transform([user_input])

        # Compute cosine similarity
        similarities = cosine_similarity(user_vec, X).flatten()
        top_indices = similarities.argsort()[-5:][::-1]
        recommended_jobs = df.iloc[top_indices]

        return {
            "recommended_jobs": recommended_jobs.to_dict(orient="records")
        }

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})



@app.post("/recommend-career-path", response_model=RecommendationResponse)
def recommend_career_path(desired_skils : List[str]):
        # Step 1: Recommend career roles based on desired skills
        model = SentenceTransformer('all-MiniLM-L6-v2')
        coursera_df = pd.read_csv("./data/csvs/Coursera.csv")
        user_input = desired_skils
        role_texts = [role['title'] + " " + role['description'] + " " + " ".join(role['skills']) for role in roles]
        role_embeddings = model.encode(role_texts)
        user_embedding = model.encode([user_input])
        similarities = cosine_similarity(user_embedding, role_embeddings)[0]
        df_roles = pd.DataFrame(roles)
        df_roles["match_score"] = similarities
        df_roles_sorted = df_roles.sort_values(by="match_score", ascending=False).reset_index(drop=True)
        df_rec_course = df_roles_sorted.head(5)  # Get top 5 roles
        
        # Step 2: Get course recommendations for each role
        recommendations = []
        for _, role in df_rec_course.iterrows():
            role_skills = [s.strip() for s in role["skills"]]
            role_skill_embeddings = model.encode(role_skills)
            
            recommended_courses = []
            for _, course in coursera_df.iterrows():
                course_skills = str(course["skills"]).split(",")
                course_skills_cleaned = [s.strip() for s in course_skills]
                
                if not course_skills_cleaned:
                    continue
                
                course_skill_embeddings = model.encode(course_skills_cleaned)
                sim_matrix = cosine_similarity(role_skill_embeddings, course_skill_embeddings)
                max_sim = sim_matrix.max()
                
                if max_sim >= 0.5:  # similarity threshold
                    try:
                        course_rating = float(course["rating"])
                    except:
                        course_rating = 0.0
                    
                    recommended_courses.append({
                        "course": course["course"],
                        "skills": course["skills"],
                        "rating": course_rating,
                        "reviewcount": course.get("reviewcount", "N/A"),
                        "duration": course.get("duration", "N/A"),
                        "similarity": round(float(max_sim), 3)
                    })
            
            # Sort and get top 5 courses
            sorted_courses = sorted(recommended_courses, 
                                  key=lambda x: (x["similarity"], x["rating"]), 
                                  reverse=True)[:5]
            
            recommendations.append({
                "career_role": role["title"],
                "match_score": float(role["match_score"]),
                "recommended_courses": sorted_courses
            })
        
        return {"recommended_careers": recommendations}


@app.post("/suggest-career")
async def suggest_career(files: List[UploadFile] = File(...)):
    all_skills_per_resume = []
    file_names = []

    for file in files:
        if file.content_type != "application/pdf":
            return JSONResponse(status_code=400, content={"error": f"{file.filename} is not a PDF."})

        file_bytes = await file.read()
        resume_text = extract_text_from_pdf(file_bytes)
        skills = extract_skills_from_resume(resume_text)
        all_skills_per_resume.append(skills)
        file_names.append(file.filename)

    all_skills = list(set([skill.lower() for resume in all_skills_per_resume for skill in resume]))

    def build_skill_matrix(resumes, all_skills):
        matrix = []
        for skills in resumes:
            row = [1 if skill in skills else 0 for skill in all_skills]
            matrix.append(row)
        return pd.DataFrame(matrix, columns=all_skills)

    skill_df = build_skill_matrix(all_skills_per_resume, all_skills)

    k = min(6, len(files))
    kmeans = KMeans(n_clusters=k, random_state=42)
    skill_df["cluster"] = kmeans.fit_predict(skill_df)

    cluster_to_top_skills = {}
    for cluster_num in range(k):
        cluster_skills = skill_df[skill_df["cluster"] == cluster_num].drop(columns=["cluster"]).sum()
        top_skills = cluster_skills.sort_values(ascending=False).head(5).index.tolist()
        cluster_to_top_skills[cluster_num] = top_skills

    cluster_to_career = {}
    for cluster_num, skills in cluster_to_top_skills.items():
        if "machine learning" in skills or "pytorch" in skills or "tensorflow" in skills:
            cluster_to_career[cluster_num] = "Machine Learning"
        elif "html" in skills or "css" in skills or "javascript" in skills:
            cluster_to_career[cluster_num] = "Frontend Developer"
        elif "django" in skills or "flask" in skills or "sql" in skills:
            cluster_to_career[cluster_num] = "Backend Developer"
        elif "flutter" in skills or "android" in skills:
            cluster_to_career[cluster_num] = "App Developer"
        elif "docker" in skills or "linux" in skills or "aws" in skills:
            cluster_to_career[cluster_num] = "Cloud Engineer"
        else:
            cluster_to_career[cluster_num] = "Generalist / Software Engineer"

    results = []
    for idx, skills in enumerate(all_skills_per_resume):
        cluster = skill_df.iloc[idx]["cluster"]
        results.append({
            "file": file_names[idx],
            "skills": skills,
            "cluster": int(cluster),
            "career_suggestion": cluster_to_career[int(cluster)]
        })

    return {"results": results}

model = SentenceTransformer('all-MiniLM-L6-v2')    
class SkillInput(BaseModel):
    skills: str  # e.g. "Machine Learning, Deep Learning, Data Science"

@app.post("/recommend-roles")
def recommend_roles(user_input: SkillInput):
    df_roles = pd.DataFrame(roles)

    # Create embeddings
    role_texts = [
        f"{role['title']} {role['description']} {' '.join(role['skills'])}" for role in roles
    ]
    role_embeddings = model.encode(role_texts)
    user_embedding = model.encode([user_input.skills])

    # Compute similarity
    similarities = cosine_similarity(user_embedding, role_embeddings)[0]
    df_roles["match_score"] = similarities
    df_roles_sorted = df_roles.sort_values(by="match_score", ascending=False).reset_index(drop=True)
    top_roles = df_roles_sorted.head(5).to_dict(orient="records")

class MockInterviewStart(BaseModel):
    job_description: str
    num_questions: int = 2

class MockInterviewQuestion(BaseModel):
    questions: List[str]
    session_id: str

class MockInterviewAnswer(BaseModel):
    session_id: str
    question_index: int
    question: str

class MockInterviewResult(BaseModel):
    transcription: str
    feedback: str
    video_analysis: Dict[str, float]
    audio_analysis: Dict[str, float]
    scores: Dict[str, float]

# Mock Interview Endpoints
@app.post("/mock-interview/start", response_model=MockInterviewQuestion)
async def start_mock_interview(request: MockInterviewStart):
    """
    Start a mock interview session by generating questions from job description
    """
    try:
        # Generate questions using the existing function
        questions = generate_questions_groq(request.job_description, n=request.num_questions)
        
        # Generate a unique session ID
        session_id = f"session_{int(time.time())}_{random.randint(1000, 9999)}"
        
        # Store session data (you might want to use a database or cache in production)
        session_data = {
            "questions": questions,
            "job_description": request.job_description,
            "current_question": 0,
            "answers": []
        }
        
        # For now, we'll store in a simple dict (consider using Redis or database)
        if not hasattr(app.state, 'mock_sessions'):
            app.state.mock_sessions = {}
        app.state.mock_sessions[session_id] = session_data
        
        return MockInterviewQuestion(
            questions=questions,
            session_id=session_id
        )
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to start mock interview: {str(e)}"}
        )

@app.post("/mock-interview/submit-answer")
async def submit_answer(
    session_id: str = Form(...),
    question_index: int = Form(...),
    question: str = Form(...),
    audio_file: UploadFile = File(...),
    video_file: UploadFile = File(...)
):
    """
    Submit audio and video answer for a specific question
    """
    audio_path = None
    video_path = None
    
    try:
        # Check if session exists
        if not hasattr(app.state, 'mock_sessions') or session_id not in app.state.mock_sessions:
            return JSONResponse(
                status_code=404,
                content={"error": "Session not found"}
            )
        
        # Create temporary directory for this answer
        answer_dir = f"answers/{session_id}"
        os.makedirs(answer_dir, exist_ok=True)
        
        # Save uploaded files
        audio_path = f"{answer_dir}/answer_{question_index}_audio.wav"
        video_path = f"{answer_dir}/answer_{question_index}_video.avi"
        
        with open(audio_path, "wb") as audio_buffer:
            shutil.copyfileobj(audio_file.file, audio_buffer)
            
        with open(video_path, "wb") as video_buffer:
            shutil.copyfileobj(video_file.file, video_buffer)
        
        # Process the answer
        # 1. Transcribe audio
        transcribed_text = transcribe_audio_whisper(audio_path)
        
        # 2. Get LLM feedback
        feedback = validate_answer_with_llm(question, transcribed_text)
        
        # 3. Analyze video and audio
        video_results = analyze_video(video_path)
        audio_results = analyze_audio(audio_path)
        
        # 4. Compute scores
        scores = compute_final_score(video_results, audio_results)
        
        # Store answer in session
        answer_data = {
            "question": question,
            "transcription": transcribed_text,
            "feedback": feedback,
            "video_analysis": video_results,
            "audio_analysis": audio_results,
            "scores": scores,
            "timestamp": datetime.datetime.now().isoformat()
        }
        
        app.state.mock_sessions[session_id]["answers"].append(answer_data)
        
        return {
            "transcription": transcribed_text,
            "feedback": feedback,
            "video_analysis": video_results,
            "audio_analysis": audio_results,
            "scores": scores,
            "status": "success"
        }
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to process answer: {str(e)}"}
        )
    finally:
        # Clean up temporary files
        try:
            if audio_path and os.path.exists(audio_path):
                os.remove(audio_path)
            if video_path and os.path.exists(video_path):
                os.remove(video_path)
        except:
            pass

@app.get("/mock-interview/session/{session_id}")
async def get_session_results(session_id: str):
    """
    Get complete results for a mock interview session
    """
    try:
        if not hasattr(app.state, 'mock_sessions') or session_id not in app.state.mock_sessions:
            return JSONResponse(
                status_code=404,
                content={"error": "Session not found"}
            )
        
        session_data = app.state.mock_sessions[session_id]
        
        # Calculate overall session statistics
        if session_data["answers"]:
            total_questions = len(session_data["questions"])
            answered_questions = len(session_data["answers"])
            
            # Calculate average scores
            avg_video_score = sum(answer["scores"]["video_score"] for answer in session_data["answers"]) / answered_questions
            avg_audio_score = sum(answer["scores"]["audio_fluency_score"] for answer in session_data["answers"]) / answered_questions
            avg_final_score = sum(answer["scores"]["final_score_out_of_5"] for answer in session_data["answers"]) / answered_questions
            
            overall_stats = {
                "total_questions": total_questions,
                "answered_questions": answered_questions,
                "completion_rate": (answered_questions / total_questions) * 100,
                "average_video_score": round(avg_video_score, 2),
                "average_audio_score": round(avg_audio_score, 2),
                "average_final_score": round(avg_final_score, 2)
            }
        else:
            overall_stats = {
                "total_questions": len(session_data["questions"]),
                "answered_questions": 0,
                "completion_rate": 0,
                "average_video_score": 0,
                "average_audio_score": 0,
                "average_final_score": 0
            }
        
        return {
            "session_id": session_id,
            "questions": session_data["questions"],
            "answers": session_data["answers"],
            "overall_stats": overall_stats,
            "job_description": session_data["job_description"]
        }
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to get session results: {str(e)}"}
        )

@app.delete("/mock-interview/session/{session_id}")
async def delete_session(session_id: str):
    """
    Delete a mock interview session and clean up associated files
    """
    try:
        if hasattr(app.state, 'mock_sessions') and session_id in app.state.mock_sessions:
            del app.state.mock_sessions[session_id]
        
        # Clean up answer directory
        answer_dir = f"answers/{session_id}"
        if os.path.exists(answer_dir):
            shutil.rmtree(answer_dir)
        
        return {"message": "Session deleted successfully"}
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to delete session: {str(e)}"}
        )

@app.post("/mock-interview/analyze-files")
async def analyze_uploaded_files(
    question: str = Form(...),
    audio_file: UploadFile = File(...),
    video_file: UploadFile = File(...)
):
    """
    Standalone endpoint to analyze uploaded audio/video files without session management
    """
    audio_path = None
    video_path = None
    
    try:
        # Create temporary files
        audio_suffix = os.path.splitext(audio_file.filename)[-1]
        video_suffix = os.path.splitext(video_file.filename)[-1]
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=audio_suffix) as audio_tmp:
            shutil.copyfileobj(audio_file.file, audio_tmp)
            audio_path = audio_tmp.name
            
        with tempfile.NamedTemporaryFile(delete=False, suffix=video_suffix) as video_tmp:
            shutil.copyfileobj(video_file.file, video_tmp)
            video_path = video_tmp.name
        
        # Process the files
        transcribed_text = transcribe_audio_whisper(audio_path)
        feedback = validate_answer_with_llm(question, transcribed_text)
        video_results = analyze_video(video_path)
        audio_results = analyze_audio(audio_path)
        scores = compute_final_score(video_results, audio_results)
        
        return {
            "transcription": transcribed_text,
            "feedback": feedback,
            "video_analysis": video_results,
            "audio_analysis": audio_results,
            "scores": scores
        }
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to analyze files: {str(e)}"}
        )
    finally:
        # Clean up temporary files
        try:
            if audio_path and os.path.exists(audio_path):
                os.unlink(audio_path)
            if video_path and os.path.exists(video_path):
                os.unlink(video_path)
        except:
            pass


ngrok.set_auth_token(os.getenv("NGROK_AUTH_TOKEN"))
public_url = ngrok.connect(8000)
print(f"🔗 Public URL: {public_url}")
uvicorn.run(app, host="0.0.0.0", port=8000)
# Start the server
# if __name__ == "__main__":
#     try:
#         # Find an available port
#         port = find_free_port(8000, 8100)
#         print(f"🚀 Starting server on port {port}")
        
#         # Set up ngrok tunnel
#         ngrok.set_auth_token("NGROK_AUTH_TOKEN")
#         public_url = ngrok.connect(port)
#         print(f"🔗 Public URL: {public_url}")
#         print(f"📋 API Documentation: {public_url}/docs")
#         print(f"🏥 Health Check: {public_url}/health")
        
#         uvicorn.run(app, host="0.0.0.0", port=port)
        
#     except Exception as e:
#         print(f"❌ Failed to start server: {e}")
#         print("\n🔧 Alternative solutions:")
#         print("1. Kill existing process on port 8000:")
#         print("   Windows: netstat -ano | findstr :8000")
#         print("   Then: taskkill /PID <PID> /F")
#         print("2. Or use a different port manually:")
#         print("   uvicorn main:app --host 0.0.0.0 --port 8001")from dotenv import load_dotenv
load_dotenv()
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
import os
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import re
import socket
import time
import random
import datetime
from fastapi import FastAPI, UploadFile, File, Body
from fastapi.responses import JSONResponse
from fastapi import FastAPI, UploadFile, File,Form, HTTPException
import shutil
import tempfile
import json     
from models.ResumeAgent import   resume_agent
from pydantic import BaseModel
import shutil
import tempfile
import json     
from models.ResumeAgent import resume_agent
from models.ScoringAgent import scoring_agent
from models.SchedulerCommAgent import schedule_interview, send_candidate_message
from pyngrok import ngrok
import nest_asyncio
import uvicorn
from pydantic import BaseModel
from utils.extractions import extract_text_from_pdf, extract_text_from_image, extract_skills_from_resume
from typing import List, Dict, Optional
from models.mock_interview import (
    generate_questions_groq, 
    transcribe_audio_whisper, 
    validate_answer_with_llm,
    analyze_video, 
    analyze_audio, 
    compute_final_score
)


course_df = pd.read_csv("./data/csvs/coursera_skill_clusters.csv")

roles = [
    {"title": "AI Engineer", "description": "Develops AI models and ML pipelines for automation and smart applications.",
     "skills": ["Python", "TensorFlow", "Machine Learning", "Deep Learning", "PyTorch", "Scikit-learn"]},

    {"title": "Data Scientist", "description": "Performs advanced statistical analysis and builds predictive models.",
     "skills": ["Python", "R", "Statistics", "Machine Learning", "Pandas", "Matplotlib", "SQL"]},

    {"title": "Data Analyst", "description": "Analyzes data trends, creates reports, and builds dashboards.",
     "skills": ["SQL", "Excel", "Tableau", "Statistics", "Power BI", "Python"]},

    {"title": "Web Developer", "description": "Builds and maintains websites and web apps using front and back-end tech.",
     "skills": ["HTML", "CSS", "JavaScript", "React", "Node.js", "Express.js", "MongoDB"]},

    {"title": "Frontend Developer", "description": "Creates interactive user interfaces and optimizes user experiences.",
     "skills": ["HTML", "CSS", "JavaScript", "React", "Vue.js", "TypeScript", "Figma"]},

    {"title": "Backend Developer", "description": "Develops server-side logic and integrates with databases.",
     "skills": ["Node.js", "Express", "Django", "Flask", "SQL", "MongoDB", "Python", "Java"]},

    {"title": "DevOps Engineer", "description": "Manages CI/CD pipelines, infrastructure automation, and deployments.",
     "skills": ["Docker", "Kubernetes", "CI/CD", "AWS", "Terraform", "Linux", "Jenkins"]},

    {"title": "Cloud Engineer", "description": "Designs and maintains cloud infrastructure and services.",
     "skills": ["AWS", "Azure", "Google Cloud", "Terraform", "CloudFormation", "Python"]},

    {"title": "Cybersecurity Analyst", "description": "Protects systems from attacks and monitors suspicious activity.",
     "skills": ["Networking", "Linux", "Python", "Security Tools", "Penetration Testing", "Firewalls"]},

    {"title": "Mobile App Developer", "description": "Builds apps for Android and iOS platforms.",
     "skills": ["Kotlin", "Swift", "React Native", "Flutter", "Java", "Dart", "Firebase"]},

    {"title": "Game Developer", "description": "Creates video games for different platforms.",
     "skills": ["Unity", "C#", "Unreal Engine", "C++", "3D Modeling", "Game Design"]},

    {"title": "Blockchain Developer", "description": "Develops decentralized applications and smart contracts.",
     "skills": ["Solidity", "Ethereum", "Web3.js", "Smart Contracts", "Cryptography", "Rust"]},

    {"title": "Machine Learning Engineer", "description": "Designs ML systems and productionizes models.",
     "skills": ["Scikit-learn", "TensorFlow", "Keras", "ML Ops", "Python", "Pandas", "Airflow"]},

    {"title": "NLP Engineer", "description": "Focuses on text-based AI like chatbots, translation, sentiment analysis.",
     "skills": ["SpaCy", "NLTK", "Hugging Face Transformers", "BERT", "Text Classification", "Python"]},

    {"title": "Robotics Engineer", "description": "Builds robotic systems using software and hardware integration.",
     "skills": ["ROS", "C++", "Python", "Sensors", "Actuators", "Embedded Systems"]},

    {"title": "Embedded Systems Engineer", "description": "Develops software for embedded devices like microcontrollers.",
     "skills": ["C", "C++", "Assembly", "RTOS", "Microcontrollers", "I2C", "SPI"]},

    {"title": "Systems Administrator", "description": "Maintains server infrastructure and IT systems.",
     "skills": ["Linux", "Bash", "Networking", "Firewalls", "System Monitoring", "VMware"]},

    {"title": "Database Administrator", "description": "Maintains and optimizes databases for performance and reliability.",
     "skills": ["SQL", "Oracle", "MySQL", "PostgreSQL", "Backup & Recovery", "Database Tuning"]},

    {"title": "Full Stack Developer", "description": "Works on both frontend and backend parts of applications.",
     "skills": ["JavaScript", "React", "Node.js", "MongoDB", "HTML", "CSS", "Python", "Express.js"]},

    {"title": "UI/UX Designer", "description": "Designs intuitive user interfaces and experiences.",
     "skills": ["Figma", "Adobe XD", "User Research", "Wireframing", "Prototyping", "Sketch"]}
]


class UserProfile(BaseModel):
    name: str
    current_skills: List[str]
    desired_skills: List[str]
    level: str  # Beginner | Intermediate | Advanced | Expert
    experience_years: float
    education: str
 

class RecommendedCourse(BaseModel):
    course: str
    skills: str
    rating: float
    reviewcount: str
    duration: str
    similarity: float

class CareerRecommendation(BaseModel):
    career_role: str
    match_score: float
    recommended_courses: List[RecommendedCourse]

class RecommendationResponse(BaseModel):
    recommended_careers: List[CareerRecommendation]
    
class VerificationResult(BaseModel):
    courses_found: List[Dict[str, str]]
    platform_verified: bool
    user_name_verified: bool
    valid_certificate: bool
    extracted_text: Optional[str] = None

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# nest_asyncio.apply()
# Endpoint for evaluation
from typing import Dict, Any, Optional, List
nest_asyncio.apply()

def find_free_port(start_port=8000, max_port=8100):
    """Find a free port starting from start_port"""
    for port in range(start_port, max_port):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('', port))
                return port
        except OSError:
            continue
    raise RuntimeError(f"No free port found between {start_port} and {max_port}")

# Existing code for resume processing
@app.post("/resume-agent/")
async def extract_resume_info(resume_file: UploadFile = File(...)):
    try:
        tmp_file_path = None
        # Write uploaded file to a temporary binary file
        suffix = os.path.splitext(resume_file.filename)[-1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            shutil.copyfileobj(resume_file.file, tmp)
            tmp_file_path = tmp.name

        # Get the result (it may be a string containing JSON in triple backticks)
        print(f"Temporary file created at: {tmp_file_path}")  # Log the temp file path for debugging
        result = resume_agent(tmp_file_path)
        print(f"Result from resume_agent: {result}")  # Log the result for debugging

        print(f"Resume agent result: {result}")  # Log the result for debugging
        # Extract JSON block from string if it's not directly a dict
        return json.loads(result)

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )
    finally:
        # Clean up temporary file
        if tmp_file_path and os.path.exists(tmp_file_path):
            os.unlink(tmp_file_path)

# Load the job description once at startup
with open("data/job_descriptions/extracted_text (3).txt", "r", encoding="utf-8") as f:
    JOB_DESCRIPTION = f.read()

@app.post("/score-agent/")
async def evaluate_resume(file: UploadFile = File(...)):
    upload_path = None
    try:
        # Save uploaded file temporarily
        upload_path = f"temp_uploads/{file.filename}"
        os.makedirs("temp_uploads", exist_ok=True)

        with open(upload_path, "wb") as f_out:
            content = await file.read()
            f_out.write(content)

        # Parse resume using your existing resume_agent
        parsed_resume = resume_agent(upload_path)

        # Ensure parsed_resume is a Python dict
        if isinstance(parsed_resume, str):
            try:
                parsed_resume = json.loads(parsed_resume)
            except json.JSONDecodeError:
                return JSONResponse(status_code=400, content={"error": "Failed to parse resume JSON."})

        # Prepare input for scoring
        test_input = {
            "resume_json": parsed_resume,
            "job_description": JOB_DESCRIPTION
        }

        input_str = json.dumps(test_input)
        result = scoring_agent(input_str)

        return {"evaluation": result}
    
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )
    finally:
        # Clean up temporary file
        if upload_path and os.path.exists(upload_path):
            os.unlink(upload_path)

# Updated request models for new scheduler agent
class Candidate(BaseModel):
    name: str
    email: str

class Job(BaseModel):
    company: str
    position: str
    tone: str = "professional"

class Availability(BaseModel):
    recruiter: str
    candidate: str

class ScheduleRequest(BaseModel):
    candidate: Candidate
    job: Job
    availability: Availability

class CommunicationRequest(BaseModel):
    type: str  # rejection, followup, reschedule
    candidate: Candidate
    job: Job

@app.post("/schedule-interview/")
async def schedule_interview_api(request: ScheduleRequest):
    """
    Find available interview slots - returns data for frontend to handle email/calendar
    """
    try:
        input_data = request.dict()
        input_str = json.dumps(input_data)
        
        result = schedule_interview(input_str)
        return json.loads(result)
            
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.post("/generate-communication/")
async def generate_communication_api(request: CommunicationRequest):
    """
    Generate email content - returns data for frontend to handle email sending
    """
    try:
        input_data = {
            "type": request.type,
            "candidate": request.candidate.dict(),
            "job": request.job.dict()
        }
        input_str = json.dumps(input_data)
        
        result = send_candidate_message(input_str)
        return json.loads(result)
            
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.post("/complete-hiring-workflow/")
async def complete_hiring_workflow(
    resume_file: UploadFile = File(...), 
    job_description: str = Body(...), 
    recruiter_availability: str = Body(...),
    company_name: str = Body(default="IntelliCruit"),
    position: str = Body(default="Software Developer"),
    score_threshold: int = Body(default=70)
):
    """
    Complete end-to-end hiring workflow with new scheduler agent:
    1. Parse resume
    2. Score against job description
    3. If score >= threshold, schedule interview
    4. If score < threshold, send rejection
    """
    tmp_file_path = None
    try:
        # Step 1: Parse the resume
        suffix = os.path.splitext(resume_file.filename)[-1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            shutil.copyfileobj(resume_file.file, tmp)
            tmp_file_path = tmp.name
            
        parsed_resume = resume_agent(tmp_file_path)
        if isinstance(parsed_resume, str):
            parsed_resume = json.loads(parsed_resume)
            
        # Step 2: Score the resume
        score_input = {
            "resume_json": parsed_resume,
            "job_description": job_description
        }
        score_result = scoring_agent(json.dumps(score_input))
        
        # Extract total score from scoring result
        score_match = re.search(r"Match Score:\s*(\d+)", score_result)
        total_score = int(score_match.group(1)) if score_match else 0
        
        # Get candidate info from parsed resume
        candidate_name = parsed_resume.get("name", "Candidate")
        candidate_email = parsed_resume.get("email", "")
        
        if not candidate_email:
            return JSONResponse(
                status_code=400,
                content={"error": "No email found in resume"}
            )
        
        # Step 3: Determine next action based on score
        if total_score >= score_threshold:
            # Schedule interview using new agent format
            schedule_data = {
                "candidate": {
                    "name": candidate_name,
                    "email": candidate_email
                },
                "job": {
                    "company": company_name,
                    "position": position,
                    "tone": "professional but friendly"
                },
                "availability": {
                    "recruiter": recruiter_availability,
                    "candidate": "Monday through Friday, 9am to 5pm"  # Default availability
                }
            }
            
            schedule_result = schedule_interview(json.dumps(schedule_data))
            schedule_result_json = json.loads(schedule_result)
            
            return {
                "resume_parsed": parsed_resume,
                "evaluation": score_result,
                "total_score": total_score,
                "threshold": score_threshold,
                "action_taken": "interview_scheduled",
                "schedule_result": schedule_result_json
            }
        else:
            # Send rejection using new agent format
            rejection_data = {
                "type": "rejection",
                "candidate": {
                    "name": candidate_name,
                    "email": candidate_email
                },
                "job": {
                    "company": company_name,
                    "position": position,
                    "tone": "professional and empathetic"
                }
            }
            
            rejection_result = send_candidate_message(json.dumps(rejection_data))
            rejection_result_json = json.loads(rejection_result)
            
            return {
                "resume_parsed": parsed_resume,
                "evaluation": score_result,
                "total_score": total_score,
                "threshold": score_threshold,
                "action_taken": "rejection_sent",
                "communication_result": rejection_result_json
            }
            
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )
    finally:
        # Clean up temporary file
        if tmp_file_path and os.path.exists(tmp_file_path):
            os.unlink(tmp_file_path)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "IntelliCruit API is running"}

# Get available endpoints
@app.get("/")
async def root():
    return {
        "message": "IntelliCruit API",
        "endpoints": {
            "resume_parsing": "/resume-agent/",
            "resume_scoring": "/score-agent/", 
            "interview_scheduling": "/schedule-interview/",
            "candidate_communication": "/send-communication/",
            "complete_workflow": "/complete-hiring-workflow/",
            "health_check": "/health",
            "job_analysis": "/job-analysis",
            "recommend_jobs": "/recommend-jobs",
            "verify_certificate": "/verify-certificate",
            "suggest_career": "/suggest-career",
            "mock_interview_start": "/mock-interview/start",
            "mock_interview_submit": "/mock-interview/submit-answer",
            "mock_interview_results": "/mock-interview/session/{session_id}",
            "mock_interview_analyze": "/mock-interview/analyze-files"
        }
    }

    

@app.post("/verify-certificate", response_model=VerificationResult)
async def verify_certificate(
    name: str = Form(...),
    certificate: UploadFile = File(...)
):
    # Check file type
    if certificate.content_type not in ["image/jpeg", "image/png", "application/pdf"]:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, or PDF files are supported.")

    # Read and process file
    contents = await certificate.read()
    
    if certificate.content_type == "application/pdf":
        text = extract_text_from_pdf(contents)
    else:
        text = extract_text_from_image(contents)
    
    # Match courses
    matched_courses = []
    for idx, row in course_df.iterrows():
        course_name = row["course"]
        if pd.notna(course_name) and course_name.lower() in text.lower():
            matched_courses.append({
                "course_name": course_name,
                "cluster": row.get("cluster", "Unknown")
            })

    # Check platform
    platform_found = any(
        p in text 
        for p in ["coursera", "udemy", "edx", "skillshare"]
    )
    
    # Check user name
    user_verified = name in text

    return {
        "courses_found": matched_courses,
        "platform_verified": platform_found,
        "user_name_verified": user_verified,
        "valid_certificate": bool(matched_courses and platform_found),
        "extracted_text": text
    }

@app.get("/job-analysis")
async def jobs_analysis():
    df=pd.read_csv("./data/csvs/ai_job_market_insights.csv")
    salary_by_title = df.groupby("Job_Title", as_index=False)["Salary_USD"].mean().sort_values(by="Salary_USD", ascending=False).to_dict('records')
    industry_distribution = df["Industry"].value_counts().reset_index().rename(columns={"count": "value"}).to_dict('records')
    
    return {
        "salary_by_title": salary_by_title,
        "industry_distribution": industry_distribution,
        "raw_data": df.to_dict('records')
    }

@app.post("/recommend-jobs")
async def recommend_jobs(skills: List[str]):
    df = pd.read_csv("ai_job_market_insights.csv")

    try:
        if df.empty:
            return JSONResponse(
                status_code=404,
                content={"error": "Job dataset not found. Please ensure ai_job_market_insights.csv exists."}
            )

        # Vectorize job required skills
        vectorizer = TfidfVectorizer(stop_words='english')
        X = vectorizer.fit_transform(df['Required_Skills'].fillna(""))

        # Prepare user input
        user_input = ', '.join(skills)
        user_vec = vectorizer.transform([user_input])

        # Compute cosine similarity
        similarities = cosine_similarity(user_vec, X).flatten()
        top_indices = similarities.argsort()[-5:][::-1]
        recommended_jobs = df.iloc[top_indices]

        return {
            "recommended_jobs": recommended_jobs.to_dict(orient="records")
        }

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})



@app.post("/recommend-career-path", response_model=RecommendationResponse)
def recommend_career_path(desired_skils : List[str]):
        # Step 1: Recommend career roles based on desired skills
        model = SentenceTransformer('all-MiniLM-L6-v2')
        coursera_df = pd.read_csv("./data/csvs/Coursera.csv")
        user_input = desired_skils
        role_texts = [role['title'] + " " + role['description'] + " " + " ".join(role['skills']) for role in roles]
        role_embeddings = model.encode(role_texts)
        user_embedding = model.encode([user_input])
        similarities = cosine_similarity(user_embedding, role_embeddings)[0]
        df_roles = pd.DataFrame(roles)
        df_roles["match_score"] = similarities
        df_roles_sorted = df_roles.sort_values(by="match_score", ascending=False).reset_index(drop=True)
        df_rec_course = df_roles_sorted.head(5)  # Get top 5 roles
        
        # Step 2: Get course recommendations for each role
        recommendations = []
        for _, role in df_rec_course.iterrows():
            role_skills = [s.strip() for s in role["skills"]]
            role_skill_embeddings = model.encode(role_skills)
            
            recommended_courses = []
            for _, course in coursera_df.iterrows():
                course_skills = str(course["skills"]).split(",")
                course_skills_cleaned = [s.strip() for s in course_skills]
                
                if not course_skills_cleaned:
                    continue
                
                course_skill_embeddings = model.encode(course_skills_cleaned)
                sim_matrix = cosine_similarity(role_skill_embeddings, course_skill_embeddings)
                max_sim = sim_matrix.max()
                
                if max_sim >= 0.5:  # similarity threshold
                    try:
                        course_rating = float(course["rating"])
                    except:
                        course_rating = 0.0
                    
                    recommended_courses.append({
                        "course": course["course"],
                        "skills": course["skills"],
                        "rating": course_rating,
                        "reviewcount": course.get("reviewcount", "N/A"),
                        "duration": course.get("duration", "N/A"),
                        "similarity": round(float(max_sim), 3)
                    })
            
            # Sort and get top 5 courses
            sorted_courses = sorted(recommended_courses, 
                                  key=lambda x: (x["similarity"], x["rating"]), 
                                  reverse=True)[:5]
            
            recommendations.append({
                "career_role": role["title"],
                "match_score": float(role["match_score"]),
                "recommended_courses": sorted_courses
            })
        
        return {"recommended_careers": recommendations}


@app.post("/suggest-career")
async def suggest_career(files: List[UploadFile] = File(...)):
    all_skills_per_resume = []
    file_names = []

    for file in files:
        if file.content_type != "application/pdf":
            return JSONResponse(status_code=400, content={"error": f"{file.filename} is not a PDF."})

        file_bytes = await file.read()
        resume_text = extract_text_from_pdf(file_bytes)
        skills = extract_skills_from_resume(resume_text)
        all_skills_per_resume.append(skills)
        file_names.append(file.filename)

    all_skills = list(set([skill.lower() for resume in all_skills_per_resume for skill in resume]))

    def build_skill_matrix(resumes, all_skills):
        matrix = []
        for skills in resumes:
            row = [1 if skill in skills else 0 for skill in all_skills]
            matrix.append(row)
        return pd.DataFrame(matrix, columns=all_skills)

    skill_df = build_skill_matrix(all_skills_per_resume, all_skills)

    k = min(6, len(files))
    kmeans = KMeans(n_clusters=k, random_state=42)
    skill_df["cluster"] = kmeans.fit_predict(skill_df)

    cluster_to_top_skills = {}
    for cluster_num in range(k):
        cluster_skills = skill_df[skill_df["cluster"] == cluster_num].drop(columns=["cluster"]).sum()
        top_skills = cluster_skills.sort_values(ascending=False).head(5).index.tolist()
        cluster_to_top_skills[cluster_num] = top_skills

    cluster_to_career = {}
    for cluster_num, skills in cluster_to_top_skills.items():
        if "machine learning" in skills or "pytorch" in skills or "tensorflow" in skills:
            cluster_to_career[cluster_num] = "Machine Learning"
        elif "html" in skills or "css" in skills or "javascript" in skills:
            cluster_to_career[cluster_num] = "Frontend Developer"
        elif "django" in skills or "flask" in skills or "sql" in skills:
            cluster_to_career[cluster_num] = "Backend Developer"
        elif "flutter" in skills or "android" in skills:
            cluster_to_career[cluster_num] = "App Developer"
        elif "docker" in skills or "linux" in skills or "aws" in skills:
            cluster_to_career[cluster_num] = "Cloud Engineer"
        else:
            cluster_to_career[cluster_num] = "Generalist / Software Engineer"

    results = []
    for idx, skills in enumerate(all_skills_per_resume):
        cluster = skill_df.iloc[idx]["cluster"]
        results.append({
            "file": file_names[idx],
            "skills": skills,
            "cluster": int(cluster),
            "career_suggestion": cluster_to_career[int(cluster)]
        })

    return {"results": results}

model = SentenceTransformer('all-MiniLM-L6-v2')    
class SkillInput(BaseModel):
    skills: str  # e.g. "Machine Learning, Deep Learning, Data Science"

@app.post("/recommend-roles")
def recommend_roles(user_input: SkillInput):
    df_roles = pd.DataFrame(roles)

    # Create embeddings
    role_texts = [
        f"{role['title']} {role['description']} {' '.join(role['skills'])}" for role in roles
    ]
    role_embeddings = model.encode(role_texts)
    user_embedding = model.encode([user_input.skills])

    # Compute similarity
    similarities = cosine_similarity(user_embedding, role_embeddings)[0]
    df_roles["match_score"] = similarities
    df_roles_sorted = df_roles.sort_values(by="match_score", ascending=False).reset_index(drop=True)
    top_roles = df_roles_sorted.head(5).to_dict(orient="records")

class MockInterviewStart(BaseModel):
    job_description: str
    num_questions: int = 2

class MockInterviewQuestion(BaseModel):
    questions: List[str]
    session_id: str

class MockInterviewAnswer(BaseModel):
    session_id: str
    question_index: int
    question: str

class MockInterviewResult(BaseModel):
    transcription: str
    feedback: str
    video_analysis: Dict[str, float]
    audio_analysis: Dict[str, float]
    scores: Dict[str, float]

# Mock Interview Endpoints
@app.post("/mock-interview/start", response_model=MockInterviewQuestion)
async def start_mock_interview(request: MockInterviewStart):
    """
    Start a mock interview session by generating questions from job description
    """
    try:
        # Generate questions using the existing function
        questions = generate_questions_groq(request.job_description, n=request.num_questions)
        
        # Generate a unique session ID
        session_id = f"session_{int(time.time())}_{random.randint(1000, 9999)}"
        
        # Store session data (you might want to use a database or cache in production)
        session_data = {
            "questions": questions,
            "job_description": request.job_description,
            "current_question": 0,
            "answers": []
        }
        
        # For now, we'll store in a simple dict (consider using Redis or database)
        if not hasattr(app.state, 'mock_sessions'):
            app.state.mock_sessions = {}
        app.state.mock_sessions[session_id] = session_data
        
        return MockInterviewQuestion(
            questions=questions,
            session_id=session_id
        )
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to start mock interview: {str(e)}"}
        )

@app.post("/mock-interview/submit-answer")
async def submit_answer(
    session_id: str = Form(...),
    question_index: int = Form(...),
    question: str = Form(...),
    audio_file: UploadFile = File(...),
    video_file: UploadFile = File(...)
):
    """
    Submit audio and video answer for a specific question
    """
    audio_path = None
    video_path = None
    
    try:
        # Check if session exists
        if not hasattr(app.state, 'mock_sessions') or session_id not in app.state.mock_sessions:
            return JSONResponse(
                status_code=404,
                content={"error": "Session not found"}
            )
        
        # Create temporary directory for this answer
        answer_dir = f"answers/{session_id}"
        os.makedirs(answer_dir, exist_ok=True)
        
        # Save uploaded files
        audio_path = f"{answer_dir}/answer_{question_index}_audio.wav"
        video_path = f"{answer_dir}/answer_{question_index}_video.avi"
        
        with open(audio_path, "wb") as audio_buffer:
            shutil.copyfileobj(audio_file.file, audio_buffer)
            
        with open(video_path, "wb") as video_buffer:
            shutil.copyfileobj(video_file.file, video_buffer)
        
        # Process the answer
        # 1. Transcribe audio
        transcribed_text = transcribe_audio_whisper(audio_path)
        
        # 2. Get LLM feedback
        feedback = validate_answer_with_llm(question, transcribed_text)
        
        # 3. Analyze video and audio
        video_results = analyze_video(video_path)
        audio_results = analyze_audio(audio_path)
        
        # 4. Compute scores
        scores = compute_final_score(video_results, audio_results)
        
        # Store answer in session
        answer_data = {
            "question": question,
            "transcription": transcribed_text,
            "feedback": feedback,
            "video_analysis": video_results,
            "audio_analysis": audio_results,
            "scores": scores,
            "timestamp": datetime.datetime.now().isoformat()
        }
        
        app.state.mock_sessions[session_id]["answers"].append(answer_data)
        
        return {
            "transcription": transcribed_text,
            "feedback": feedback,
            "video_analysis": video_results,
            "audio_analysis": audio_results,
            "scores": scores,
            "status": "success"
        }
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to process answer: {str(e)}"}
        )
    finally:
        # Clean up temporary files
        try:
            if audio_path and os.path.exists(audio_path):
                os.remove(audio_path)
            if video_path and os.path.exists(video_path):
                os.remove(video_path)
        except:
            pass

@app.get("/mock-interview/session/{session_id}")
async def get_session_results(session_id: str):
    """
    Get complete results for a mock interview session
    """
    try:
        if not hasattr(app.state, 'mock_sessions') or session_id not in app.state.mock_sessions:
            return JSONResponse(
                status_code=404,
                content={"error": "Session not found"}
            )
        
        session_data = app.state.mock_sessions[session_id]
        
        # Calculate overall session statistics
        if session_data["answers"]:
            total_questions = len(session_data["questions"])
            answered_questions = len(session_data["answers"])
            
            # Calculate average scores
            avg_video_score = sum(answer["scores"]["video_score"] for answer in session_data["answers"]) / answered_questions
            avg_audio_score = sum(answer["scores"]["audio_fluency_score"] for answer in session_data["answers"]) / answered_questions
            avg_final_score = sum(answer["scores"]["final_score_out_of_5"] for answer in session_data["answers"]) / answered_questions
            
            overall_stats = {
                "total_questions": total_questions,
                "answered_questions": answered_questions,
                "completion_rate": (answered_questions / total_questions) * 100,
                "average_video_score": round(avg_video_score, 2),
                "average_audio_score": round(avg_audio_score, 2),
                "average_final_score": round(avg_final_score, 2)
            }
        else:
            overall_stats = {
                "total_questions": len(session_data["questions"]),
                "answered_questions": 0,
                "completion_rate": 0,
                "average_video_score": 0,
                "average_audio_score": 0,
                "average_final_score": 0
            }
        
        return {
            "session_id": session_id,
            "questions": session_data["questions"],
            "answers": session_data["answers"],
            "overall_stats": overall_stats,
            "job_description": session_data["job_description"]
        }
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to get session results: {str(e)}"}
        )

@app.delete("/mock-interview/session/{session_id}")
async def delete_session(session_id: str):
    """
    Delete a mock interview session and clean up associated files
    """
    try:
        if hasattr(app.state, 'mock_sessions') and session_id in app.state.mock_sessions:
            del app.state.mock_sessions[session_id]
        
        # Clean up answer directory
        answer_dir = f"answers/{session_id}"
        if os.path.exists(answer_dir):
            shutil.rmtree(answer_dir)
        
        return {"message": "Session deleted successfully"}
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to delete session: {str(e)}"}
        )

@app.post("/mock-interview/analyze-files")
async def analyze_uploaded_files(
    question: str = Form(...),
    audio_file: UploadFile = File(...),
    video_file: UploadFile = File(...)
):
    """
    Standalone endpoint to analyze uploaded audio/video files without session management
    """
    audio_path = None
    video_path = None
    
    try:
        # Create temporary files
        audio_suffix = os.path.splitext(audio_file.filename)[-1]
        video_suffix = os.path.splitext(video_file.filename)[-1]
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=audio_suffix) as audio_tmp:
            shutil.copyfileobj(audio_file.file, audio_tmp)
            audio_path = audio_tmp.name
            
        with tempfile.NamedTemporaryFile(delete=False, suffix=video_suffix) as video_tmp:
            shutil.copyfileobj(video_file.file, video_tmp)
            video_path = video_tmp.name
        
        # Process the files
        transcribed_text = transcribe_audio_whisper(audio_path)
        feedback = validate_answer_with_llm(question, transcribed_text)
        video_results = analyze_video(video_path)
        audio_results = analyze_audio(audio_path)
        scores = compute_final_score(video_results, audio_results)
        
        return {
            "transcription": transcribed_text,
            "feedback": feedback,
            "video_analysis": video_results,
            "audio_analysis": audio_results,
            "scores": scores
        }
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to analyze files: {str(e)}"}
        )
    finally:
        # Clean up temporary files
        try:
            if audio_path and os.path.exists(audio_path):
                os.unlink(audio_path)
            if video_path and os.path.exists(video_path):
                os.unlink(video_path)
        except:
            pass

    return {"recommended_roles": top_roles}
# ngrok.set_auth_token("2rG09L0V1BME0VvZHKdsrKjtFHR_2ZvkN5sJHSkMscctvUBLE")
# public_url = ngrok.connect(8000)
# print(f"🔗 Public URL: {public_url}")
# uvicorn.run(app, host="0.0.0.0", port=8000)
# Start the server
# if __name__ == "__main__":
#     try:
#         # Find an available port
#         port = find_free_port(8000, 8100)
#         print(f"🚀 Starting server on port {port}")
        
#         # Set up ngrok tunnel
#         ngrok.set_auth_token("NGROK_AUTH_TOKEN")
#         public_url = ngrok.connect(port)
#         print(f"🔗 Public URL: {public_url}")
#         print(f"📋 API Documentation: {public_url}/docs")
#         print(f"🏥 Health Check: {public_url}/health")
        
#         uvicorn.run(app, host="0.0.0.0", port=port)
        
#     except Exception as e:
#         print(f"❌ Failed to start server: {e}")
#         print("\n🔧 Alternative solutions:")
#         print("1. Kill existing process on port 8000:")
#         print("   Windows: netstat -ano | findstr :8000")
#         print("   Then: taskkill /PID <PID> /F")
#         print("2. Or use a different port manually:")
#         print("   uvicorn main:app --host 0.0.0.0 --port 8001")
