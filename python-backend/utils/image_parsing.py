from unstructured.partition.pdf import partition_pdf
import os
import re
import pandas as pd

def fix_malformed_headers(text):
    def normalize_headers(match):
        return match.group(0).replace(" ", "")

    pattern = r'\b(?:[A-Z]\s+){1,5}[A-Z]\b'
    return re.sub(pattern, normalize_headers, text)

def image_resume_parsing(pdf_path):
    elements = partition_pdf(
        filename=pdf_path,
        extract_images_in_pdf=True,
        ocr_languages="eng",
        strategy="hi_res"
    )

    full_text = "\n".join([str(element) for element in elements])

    full_text = full_text.replace(")", "S")

    full_text = fix_malformed_headers(full_text)

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
