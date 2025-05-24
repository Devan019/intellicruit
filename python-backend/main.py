import os
import re
import socket
from fastapi import FastAPI, UploadFile, File, Body
from fastapi.responses import JSONResponse
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
from typing import Dict, Any, Optional, List
from dotenv import load_dotenv

load_dotenv() 

app = FastAPI()
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
    Schedule an interview based on recruiter and candidate availability using new agent
    
    - candidate: Candidate information (name, email)
    - job: Job information (company, position, tone)
    - availability: Recruiter and candidate availability descriptions
    """
    try:
        # Convert to the format expected by new schedule_interview function
        input_data = request.dict()
        input_str = json.dumps(input_data)
        
        result = schedule_interview(input_str)
        
        # Parse the result back to JSON
        try:
            return json.loads(result)
        except json.JSONDecodeError:
            return {"raw_result": result}
            
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.post("/send-communication/")
async def send_communication_api(request: CommunicationRequest):
    try:
        # Convert to the format expected by send_candidate_message function
        input_data = {
            "type": request.type,
            "candidate": request.candidate.dict(),
            "job": request.job.dict()
        }
        input_str = json.dumps(input_data)
        
        result = send_candidate_message(input_str)
        
        # Parse the result back to JSON
        try:
            return json.loads(result)
        except json.JSONDecodeError:
            return {"raw_result": result}
            
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
            "health_check": "/health"
        }
    }

# Start the server
if __name__ == "__main__":
    try:
        # Find an available port
        port = find_free_port(8000, 8100)
        print(f"🚀 Starting server on port {port}")
        
        # Set up ngrok tunnel
        ngrok.set_auth_token("NGROK_AUTH_TOKEN")
        public_url = ngrok.connect(port)
        print(f"🔗 Public URL: {public_url}")
        print(f"📋 API Documentation: {public_url}/docs")
        print(f"🏥 Health Check: {public_url}/health")
        
        uvicorn.run(app, host="0.0.0.0", port=port)
        
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        print("\n🔧 Alternative solutions:")
        print("1. Kill existing process on port 8000:")
        print("   Windows: netstat -ano | findstr :8000")
        print("   Then: taskkill /PID <PID> /F")
        print("2. Or use a different port manually:")
        print("   uvicorn main:app --host 0.0.0.0 --port 8001")