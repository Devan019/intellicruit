from sentence_transformers import SentenceTransformer, util
import io
import numpy as np
from PIL import Image
import cv2
import re
from paddleocr import PaddleOCR



ocr = PaddleOCR(use_angle_cls=True, lang='en')

model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

known_skills = list(set([
    "python", "numpy", "pandas", "matplotlib", "seaborn", "plotly", "cufflinks", "geoplotting",
    "machine learning", "deep learning", "cnn", "ann", "supervised learning", "unsupervised learning",
    "php", "django", "html", "css", "sql", "javascript", "c", "c++",
    "data structures", "algorithms", "xgboost", "k-means", "transformers", "llms",
    "hugging face", "t5", "wav2vec2", "google colab", "flask", "streamlit", "react",
    "pytorch", "tensorflow", "linux", "git", "docker", "mysql", "postgresql"
]))
skill_embeddings = model.encode(known_skills, convert_to_tensor=True)



def clean_resume_text(text):
    text = re.sub(r'[•|]', '\n', text)
    text = re.sub(r'\s+', ' ', text)
    return text.lower()
def extract_skills_from_resume(resume_text, similarity_threshold=0.4):
    resume_text = clean_resume_text(resume_text)
    phrases = re.split(r'[\n,.;:]', resume_text)
    phrases = [phrase.strip() for phrase in phrases if len(phrase.strip()) >= 2]
    phrase_embeddings = model.encode(phrases, convert_to_tensor=True)

    extracted_skills = set()
    for i, phrase in enumerate(phrases):
        sim = util.cos_sim(phrase_embeddings[i], skill_embeddings)
        top_idx = sim.argmax().item()
        top_score = sim[0][top_idx].item()
        if top_score >= similarity_threshold:
            extracted_skills.add(known_skills[top_idx])

    return sorted(extracted_skills)

def extract_text_from_pdf(file_bytes):
    full_text = ""
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                full_text += text + "\n"
    return full_text.strip()

def extract_text_from_image(image_bytes):
    image = Image.open(io.BytesIO(image_bytes))
    image_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    results = ocr.ocr(image_cv)
    text = "\n".join([line[1][0] for line in results[0]])
    return text
