import os
import re
from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.responses import JSONResponse
import uvicorn
from fastapi import FastAPI, UploadFile, File
import shutil
import tempfile
import json

from utils.resume_parser import parse_document
from utils.tools import resume_agent


app = FastAPI()

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
