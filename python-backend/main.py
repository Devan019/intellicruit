import os
print("Starting the FastAPI application...")
import re
print("Importing necessary libraries...")
from fastapi import FastAPI
print("Importing FastAPI and related libraries...")
from fastapi.responses import JSONResponse
print("Importing JSONResponse from FastAPI...")
from fastapi import FastAPI, UploadFile, File
print("Importing UploadFile and File from FastAPI...")
import shutil
print("Importing shutil for file operations...")
import tempfile
print("Importing tempfile for temporary file handling...")
import json
print("Importing json for JSON handling...")
from models.ResumeAgent import parse_document, resume_agent
print("Importing parse_document and resume_agent from models.ResumeAgent...")
from pyngrok import ngrok
import nest_asyncio
import uvicorn

app = FastAPI()
nest_asyncio.apply()
# Endpoint for evaluation
@app.post("/extract_resume")
async def extract_resume_info(resume_file: UploadFile = File(...)):
    try:
        # Write uploaded file to a temporary binary file
        suffix = os.path.splitext(resume_file.filename)[-1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            shutil.copyfileobj(resume_file.file, tmp)
            temp_file_path = tmp.name

        # Pass it to your parser
        resume_text = parse_document(temp_file_path)

        if resume_text is None:
            return JSONResponse(content={"error": "Failed to extract text"}, status_code=500)

        # Get the result (it may be a string containing JSON in triple backticks)
        result = resume_agent(resume_text)

        # Extract JSON block from string if it's not directly a dict
        if isinstance(result, str):
            match = re.search(r"```([\s\S]*?)```", result)
            if match:
                json_str = match.group(1).strip()
                try:
                    data = json.loads(json_str)
                    return JSONResponse(content=data)
                except json.JSONDecodeError as e:
                    return JSONResponse(
                        status_code=500,
                        content={"error": "Failed to parse extracted JSON", "details": str(e)}
                    )
            else:
                return JSONResponse(
                    status_code=500,
                    content={"error": "No JSON block found in resume_agent output"}
                )

        # If result is already a dict (no triple backtick wrapping)
        elif isinstance(result, dict):
            return JSONResponse(content=result)

        # Fallback
        return JSONResponse(content={"error": "Unexpected resume_agent return type"})

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )



ngrok.set_auth_token("2xVJEPtRoeIWmpNPfnG5u1PjLk3_5iW4mZrUSjkDV42YM3Lfe")
public_url = ngrok.connect(8000)
print(f"🔗 Public URL: {public_url}")
uvicorn.run(app, host="0.0.0.0", port=8000)