
from sentence_transformers import SentenceTransformer, util
import fitz  
import os
import re
import pandas as pd
from .image_parsing import image_resume_parsing

# Resume parser utility placeholder
MODEL_NAME = "all-MiniLM-L6-v2"

TARGET_HEADERS = {
    "Skills": "skills",
    "Projects": "projects",
    "Experience": "work experience",
    "Certifications": "certifications and courses",
    "Education": "educational background",
    "Designation": "designation",
    "Company": "company or organization",
    "Achievements": "key achievements or awards",
    "Personal Details": "personal information such as name, email, phone number, address"
}



OUTPUT_FOLDER = "segment_output"
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

has_image = False

# Load sentence transformer model
model = SentenceTransformer(MODEL_NAME)

header_embeddings = {
    k: model.encode(v, convert_to_tensor=True)
    for k, v in TARGET_HEADERS.items()
}

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

        with open(out_path, "w", encoding="utf8") as out:
            out.write(text)
        print(f"Text saved to: {out_path}")
        return text
    else:
        return None
