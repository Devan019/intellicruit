import os
import json
from langchain.tools import tool
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_groq import ChatGroq
# from utils import resume_parser

from unstructured.partition.pdf import partition_pdf

os.environ["GROQ_API_KEY"] = "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"

def image_resume_parsing(pdf_path):
    elements = partition_pdf(
        filename=pdf_path,
        extract_images_in_pdf=True,
        ocr_languages="eng",
        strategy="hi_res"
    )

    full_text = "\n".join([str(element) for element in elements])

    full_text = full_text.replace(")", "S")


    print(full_text)

    output_dir = "output"
    os.makedirs(output_dir, exist_ok=True)

    base_filename = os.path.basename(pdf_path)
    output_filename = os.path.splitext(base_filename)[0] + "_output.txt"
    output_path = os.path.join(output_dir, output_filename)

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(full_text)

    print(f"Text extracted and saved to: {output_path}")
    return full_text



from sentence_transformers import SentenceTransformer, util

import fitz  # PyMuPDF
import os
import re
import pandas as pd

OUTPUT_FOLDER = "segment_output"
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

has_image = False



def extract_text_from_pdf(path):
    try:
        doc = fitz.open(path)
        text = ""
        for page in doc:
            text += page.get_text() + "\n"
        return text
    except Exception as e:
        print(f"Failed to read PDF {path}: {e}")
        return None

def contains_image(pdf_path):
    try:
        doc = fitz.open(pdf_path)
        for page_num in range(len(doc)):
            images = doc[page_num].get_images(full=True)
            if images:  # If there's at least one image on the page
                return True
        return False
    except Exception as e:
        print(f"Failed to check images in {pdf_path}: {e}")
        return False

def parse_document(file_path):
    filename = os.path.basename(file_path)

    if not (filename.endswith(".pdf") or filename.endswith(".docx")):
        print(f"Unsupported file type: {filename}")
        return None

    # Check for image-based resume
    if filename.endswith(".pdf") and contains_image(file_path):
        print(f"Image data found in resume: {filename}. Using image parser.")
        return image_resume_parsing(file_path)

    # Otherwise proceed with text extraction
    text = extract_text_from_pdf(file_path)

    if text:
        output_filename = f"{os.path.splitext(filename)[0]}_output.txt"
        out_path = os.path.join(OUTPUT_FOLDER, output_filename)

        with open(out_path, "w", encoding="utf-8") as out:
            out.write(text)
        print(f"Text saved to: {out_path}")
        return text
    else:
        return None

llm = ChatGroq(
    model_name="llama3-70b-8192",
    api_key=os.environ["GROQ_API_KEY"]
)


@tool
def resume_agent(resume_file_path: str) -> dict:
    """Extract structured info from resume file path and return JSON object."""

    if not os.path.isfile(resume_file_path):
        return {"error": f"File not found: {resume_file_path}"}

    resume_text = parse_document(resume_file_path)

    if not resume_text:
        return {"error": "No text extracted from resume."}

    prompt_template = PromptTemplate.from_template("""
You are an expert at extracting structured JSON from resumes.

ONLY RETURN VALID JSON. Do not include any explanation or text outside of JSON.

Extract the following details:

{{
  "name": "string",
  "contact_no": "string",
  "email": "string",
  "linkedin_profile_link": "string",
  "skills": ["skill1", "skill2"],
  "experience": "string",
  "total_experience_years": float,
  "projects_built": ["project1", "project2"],
  "achievements_like_awards_and_certifications": ["achievement1"]
}}

--- START OF RESUME ---
{resume_text}
--- END OF RESUME ---
""")


    chain = prompt_template | llm | StrOutputParser()
    result = chain.invoke({"resume_text": resume_text})

    try:
        return json.loads(result)
    except json.JSONDecodeError:
        return {"error": "Failed to parse resume JSON", "raw_output": result}


