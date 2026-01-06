# resume-screening-app

1. Create a new conda environment 
```bash
conda create -n env_name python=3.12 -y
```

2. clone this git repo, copy env_example.txt as .env and update the OpenAI API Key

3. Install the requirments 
```bash
pip install -r requirements.txt
```

4. start the application by running from terminal
```bash
python -m src.main
```

5. Navigate to http://0.0.0.0:8000 and it will load the landing page

6. We need to upload an excel file with JD in the predefined format and a .zip containing resume in .pdf and/or .docx formats

7. Upon submit, the application will do the processing, show the results on the screen along with an option to download as .pdf and .xlsx. PDF is optimized currently.

8. Workflow:
    1. Resumes are parsed to extract the skills and they are uploaded to FAISS database locally - a sample resumes.zip is attached
    2. JD format in the code can be adjusted to your pre-defined template - note currently only 10 JD are processed as OpenAI token is involved
    3. There will be a RAG kind of match before the results are given to the user.