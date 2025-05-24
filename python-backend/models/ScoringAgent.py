# scoring_agent.py

import os
import json
from langchain.tools import tool
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_groq import ChatGroq
from ResumeAgent import resume_agent

os.environ["GROQ_API_KEY"] = "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"

# Set up LLM
llm = ChatGroq(
    model_name="llama3-70b-8192",
    api_key=os.environ["GROQ_API_KEY"]
)

# Prompt with contextual history (MCP)
prompt_template = PromptTemplate.from_template("""
You are a recruitment expert evaluating a candidate's resume for a specific job.

Resume text:
{resume_text}

Job description:
{job_description}

Here are 1–3 past candidate evaluations for similar roles (Model Context Protocol):
{previous_results}

Evaluate the current resume based on the following criteria:
- Technical Skills (30%)
- Experience (25%)
- Certifications (15%)
- Projects (15%)
- Soft Skills (15%)

🔻 **Scoring Guidelines**:
- Deduct points for any skill, experience, or certification missing.
- Only award high scores for direct, strong matches.
- Don't assume anything that's not clearly in the resume.
- Compare against past resumes if helpful for calibration.

Respond in this JSON:
{{
  "scores": {{
    "technical_skills": int,
    "experience": int,
    "certifications": int,
    "projects": int,
    "soft_skills": int
  }},
  "total_score": int,
  "strengths_summary": str,
  "improvement_areas": [str, str, str],
  "suggestions": [str, str, str]
}}
""")

# Load previous resume evaluations from MCP history
def load_resume_history(history_file="resume_history.json", limit=3):
    if not os.path.exists(history_file):
        return ""
    with open(history_file, "r") as f:
        history = json.load(f)
    recent = history[-limit:]  # Last N results
    return json.dumps(recent, indent=2)

# Save new evaluation result to MCP history
def save_to_history(new_result, history_file="resume_history.json"):
    history = []
    if os.path.exists(history_file):
        with open(history_file, "r") as f:
            history = json.load(f)
    history.append(new_result)
    with open(history_file, "w") as f:
        json.dump(history, f, indent=2)

# Function to run MCP evaluation
def run_mcp_resume_evaluation(resume_text, job_description):
    prior_context = load_resume_history()
    
    chain = prompt_template | llm | StrOutputParser()
    result = chain.invoke({
        "resume_text": resume_text,
        "job_description": job_description,
        "previous_results": prior_context
    })

    # Parse and generate feedback
    try:
        result_json = json.loads(result)

        # Save result to history
        save_to_history({
            "resume": resume_text[:500],  # store truncated resume
            "job_description": job_description[:500],
            "result": result_json
        })

        feedback = f"""
        === Candidate Feedback ===

        ✅ Match Score: {result_json['total_score']} / 100

        📊 Scores by Criteria:
        - Technical Skills: {result_json['scores']['technical_skills']}
        - Experience: {result_json['scores']['experience']}
        - Certifications: {result_json['scores']['certifications']}
        - Projects: {result_json['scores']['projects']}
        - Soft Skills: {result_json['scores']['soft_skills']}

        🌟 Strengths:
        {result_json['strengths_summary']}

        🔧 Top 3 Areas to Improve:
        1. {result_json['improvement_areas'][0]}
        2. {result_json['improvement_areas'][1]}
        3. {result_json['improvement_areas'][2]}

        📚 Suggestions and Resources:
        1. {result_json['suggestions'][0]}
        2. {result_json['suggestions'][1]}
        3. {result_json['suggestions'][2]}
        """
        return feedback.strip()

    except Exception as e:
        return f"Error parsing response: {e}\nRaw response:\n{result}"




@tool
def scoring_agent(input_str: str) -> str:
    """
    Evaluates a parsed resume against a job description and returns feedback.
    input_str: JSON string with keys 'resume_json' and 'job_description'
    """
    try:
        data = json.loads(input_str)
        resume_json = data.get("resume_json", {})
        job_description = data.get("job_description", "")
    except json.JSONDecodeError:
        return "Invalid input JSON. Expected keys: resume_json, job_description"

    # Build a resume string from structured fields
    resume_text = f"""
    Name: {resume_json.get('name')}
    Skills: {', '.join(resume_json.get('skills', []))}
    Experience: {resume_json.get('experience')}
    Certifications: {', '.join(resume_json.get('achievements_like_awards_and_certifications', []))}
    Projects: {', '.join(resume_json.get('projects_built', []))}
    """

    return run_mcp_resume_evaluation(resume_text, job_description)


if __name__ == "__main__":
    resume_file_path = "data/resumes/Manil Modi Resume 5.pdf"
    resume_agent_input = json.dumps({"resume_file_path": resume_file_path})
    parsed_resume = resume_agent.invoke(resume_file_path)


    # 🔧 Ensure parsed_resume is a Python dict
    # if isinstance(parsed_resume, str):
    #     parsed_resume = json.loads(parsed_resume)

    # Load job description
    job_description_path = "data/job_descriptions/extracted_text (3).txt"
    with open(job_description_path, "r", encoding="utf-8") as f:
        job_description_text = f.read()

    test_input = {
        "resume_json": parsed_resume,
        "job_description": job_description_text
    }

    input_str = json.dumps(test_input)
    output = scoring_agent.invoke(input_str)
    print(output)
