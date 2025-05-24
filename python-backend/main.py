import os
import re
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi import FastAPI, UploadFile, File
import shutil
import tempfile
import json     
from models.ResumeAgent import  resume_agent
from models.ScoringAgent import scoring_agent
from pyngrok import ngrok
import nest_asyncio
import uvicorn

app = FastAPI()
# nest_asyncio.apply()
# Endpoint for evaluation
@app.post("/resume-agent/")
async def extract_resume_info(resume_file: UploadFile = File(...)):
    try:
        tmp_file_path = None
        # Write uploaded file to a temporary binary file
        suffix = os.path.splitext(resume_file.filename)[-1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            shutil.copyfileobj(resume_file.file, tmp)
            tmp_file_path = tmp.name

        # Pass it to your parser
        # resume_text = parse_document(temp_file_path)
        # print(f"Extracted resume text: {resume_text[:100]}...")  # Log first 100 chars for debugging

        # if resume_text is None:
        #     return JSONResponse(content={"error": "Failed to extract text"}, status_code=500)
        

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
    

# Load the job description once at startup
with open("data/job_descriptions/extracted_text (3).txt", "r", encoding="utf-8") as f:
    JOB_DESCRIPTION = f.read()


@app.post("/score-agent/")
async def evaluate_resume(file: UploadFile = File(...)):
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

    match = re.search(r"```(?:json)?\n({.*?})\n```", result, re.DOTALL)
    if match:
        json_str = match.group(1)
        try:
            return json.loads(json_str)
        except json.JSONDecodeError as e:
            print("JSON decoding error:", e)
            return None

    return {"evaluation": result}




# ngrok.set_auth_token("2xVJEPtRoeIWmpNPfnG5u1PjLk3_5iW4mZrUSjkDV42YM3Lfe")
# public_url = ngrok.connect(8000)
# print(f"🔗 Public URL: {public_url}")
# uvicorn.run(app, host="0.0.0.0", port=8000)