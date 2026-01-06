import os
import zipfile
from docx import Document
from PyPDF2 import PdfReader

def extract_text_from_pdf(pdf_path):
    try:
        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text
    except:
        return ""


def extract_text_from_docx(docx_path):
    try:
        doc = Document(docx_path)
        return "\n".join([p.text for p in doc.paragraphs])
    except:
        return ""


def extract_text_from_txt(txt_path):
    try:
        with open(txt_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    except:
        return ""


def unzip_resumes(zip_file, extract_to="./tmp_resumes"):
    if not os.path.exists(extract_to):
        os.makedirs(extract_to)

    with zipfile.ZipFile(zip_file, "r") as z:
        z.extractall(extract_to)

    return extract_to


def load_resumes_from_folder(folder_path):
    resume_texts = {}

    for root, _, files in os.walk(folder_path):
        for f in files:
            file_path = os.path.join(root, f)
            ext = f.lower().split(".")[-1]

            text = ""
            if ext == "pdf":
                text = extract_text_from_pdf(file_path)
            elif ext == "docx":
                text = extract_text_from_docx(file_path)
            elif ext == "txt":
                text = extract_text_from_txt(file_path)
            else:
                continue  # skip unsupported files

            resume_id = os.path.splitext(f)[0]
            resume_texts[resume_id] = text

    return resume_texts
