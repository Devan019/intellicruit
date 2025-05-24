from langchain.tools import tool
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_groq import ChatGroq
import os
from .resume_parser import parse_document


llm = ChatGroq(
    model_name="llama3-70b-8192",  # or "llama3-8b-8192" for the smaller model
    api_key=os.environ["GROQ_API_KEY"]
)


@tool
def resume_agent(resume_file_path: str) -> dict:
    """Extracts structured info from a resume file path and returns a JSON object."""

    try:
        resume_text = parse_document(resume_file_path)
    except Exception as e:
        return {"error": f"Failed to parse document: {str(e)}"}

    prompt_template = PromptTemplate.from_template("""
    You are an expert at extracting information from resumes.

    Here is a raw text extracted from a resume:

    --- START OF RESUME ---
    {resume_text}
    --- END OF RESUME ---

    Please extract the following information in JSON format:

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

    Return JSON only.
    """)

    chain = prompt_template | llm | StrOutputParser()
    result = chain.invoke({"resume_text": resume_text})

    return result
    
