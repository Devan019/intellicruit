import os
import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from enum import Enum

from langchain.tools import tool
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_groq import ChatGroq

# Initialize LLM
llm = ChatGroq(
    model_name="llama3-70b-8192",
    api_key=os.getenv("GROQ_API_KEY")
)

class MessageType(Enum):
    INTERVIEW_INVITE = "interview_invite"
    REJECTION = "rejection"
    FOLLOWUP = "followup"
    RESCHEDULE = "reschedule"

class SchedulerAgent:
    """Simplified Scheduler Agent - Only handles scheduling logic"""
    
    def __init__(self):
        pass
    
    def parse_availability(self, availability_text: str) -> List[Dict]:
        """Parse natural language availability into structured time slots"""
        prompt = PromptTemplate.from_template("""
        Parse the following availability description into structured JSON time slots.
        Convert to 24-hour format and break into specific time periods.
        
        Input: {availability_text}
        
        Output format: [
            {{"day": "Monday", "start_time": "09:00", "end_time": "12:00"}},
            {{"day": "Tuesday", "start_time": "14:00", "end_time": "17:00"}}
        ]
        
        Return only valid JSON array:
        """)
        
        chain = prompt | llm | StrOutputParser()
        result = chain.invoke({"availability_text": availability_text})
        
        try:
            start_idx = result.find('[')
            end_idx = result.rfind(']') + 1
            if start_idx != -1 and end_idx != -1:
                json_str = result[start_idx:end_idx]
                return json.loads(json_str)
        except (json.JSONDecodeError, ValueError):
            pass
        
        return []
    
    def find_matching_slots(self, recruiter_slots: List[Dict], candidate_slots: List[Dict]) -> List[Dict]:
        """Find overlapping availability between recruiter and candidate"""
        matching_slots = []
        
        for r_slot in recruiter_slots:
            for c_slot in candidate_slots:
                if r_slot["day"] == c_slot["day"]:
                    r_start = datetime.strptime(r_slot["start_time"], "%H:%M").time()
                    r_end = datetime.strptime(r_slot["end_time"], "%H:%M").time()
                    c_start = datetime.strptime(c_slot["start_time"], "%H:%M").time()
                    c_end = datetime.strptime(c_slot["end_time"], "%H:%M").time()
                    
                    overlap_start = max(r_start, c_start)
                    overlap_end = min(r_end, c_end)
                    
                    overlap_duration = datetime.combine(datetime.today(), overlap_end) - datetime.combine(datetime.today(), overlap_start)
                    if overlap_duration >= timedelta(hours=1):
                        matching_slots.append({
                            "day": r_slot["day"],
                            "start_time": overlap_start.strftime("%H:%M"),
                            "end_time": (datetime.combine(datetime.today(), overlap_start) + timedelta(hours=1)).time().strftime("%H:%M")
                        })
        
        return matching_slots
    
    def calculate_next_dates(self, slots: List[Dict]) -> List[Dict]:
        """Calculate actual dates for the next occurrence of each day"""
        today = datetime.today()
        days_map = {'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 
                   'Friday': 4, 'Saturday': 5, 'Sunday': 6}
        
        dated_slots = []
        for slot in slots:
            days_ahead = days_map[slot["day"]] - today.weekday()
            if days_ahead <= 0:  # If it's today or already passed, get next week
                days_ahead += 7
                
            interview_date = today + timedelta(days=days_ahead)
            
            dated_slots.append({
                **slot,
                "date": interview_date.strftime("%Y-%m-%d"),
                "datetime_start": datetime.combine(
                    interview_date, 
                    datetime.strptime(slot["start_time"], "%H:%M").time()
                ).isoformat(),
                "datetime_end": datetime.combine(
                    interview_date, 
                    datetime.strptime(slot["end_time"], "%H:%M").time()
                ).isoformat()
            })
        
        return dated_slots

@tool
def schedule_interview(input_json: str) -> str:
    """
    Find available interview slots based on recruiter and candidate availability.
    Returns structured data for frontend to handle email/calendar integration.
    
    Input format:
    {
        "candidate": {"name": "str", "email": "str"},
        "job": {"company": "str", "position": "str", "tone": "str"},
        "availability": {"recruiter": "str", "candidate": "str"}
    }
    """
    try:
        data = json.loads(input_json)
        agent = SchedulerAgent()
        
        # Parse availability
        recruiter_slots = agent.parse_availability(data["availability"]["recruiter"])
        candidate_slots = agent.parse_availability(data["availability"]["candidate"])
        
        # Find matching slots
        matching_slots = agent.find_matching_slots(recruiter_slots, candidate_slots)
        
        if not matching_slots:
            return json.dumps({
                "success": False, 
                "message": "No matching availability found",
                "available_slots": [],
                "candidate": data["candidate"],
                "job": data["job"]
            })
        
        # Calculate actual dates for all matching slots
        dated_slots = agent.calculate_next_dates(matching_slots)
        
        # Return the first available slot as recommended, but include all options
        recommended_slot = dated_slots[0] if dated_slots else None
        
        return json.dumps({
            "success": True,
            "message": "Interview slots found",
            "recommended_slot": recommended_slot,
            "available_slots": dated_slots,
            "candidate": data["candidate"],
            "job": data["job"],
            "recruiter_parsed_availability": recruiter_slots,
            "candidate_parsed_availability": candidate_slots
        })
        
    except Exception as e:
        return json.dumps({
            "success": False, 
            "message": f"Error: {str(e)}",
            "available_slots": []
        })

@tool
def send_candidate_message(input_json: str) -> str:
    """
    Generate message content for candidate communication.
    Returns structured data for frontend to handle email sending.
    
    Input format:
    {
        "type": "rejection|followup|reschedule",
        "candidate": {"name": "str", "email": "str"},
        "job": {"company": "str", "position": "str", "tone": "str"},
        "interview_details": {"date": "str", "start_time": "str", "end_time": "str"} // optional
    }
    """
    try:
        data = json.loads(input_json)
        
        interview_info = ""
        if data.get("interview_details"):
            details = data["interview_details"]
            interview_info = f"Date: {details.get('date', '')}\nTime: {details.get('start_time', '')} - {details.get('end_time', '')}"
        
        prompt = PromptTemplate.from_template("""
        Generate a {message_type} email for a job candidate.
        
        Details:
        - Candidate: {candidate_name}
        - Company: {company_name}
        - Position: {position}
        - Company Tone: {company_tone}
        - Interview Details: {interview_info}
        
        Requirements:
        - Match the company's tone ({company_tone})
        - Be professional and respectful
        - Include specific next steps if applicable
        - Keep it concise but warm
        
        Generate only the email body content:
        """)
        
        chain = prompt | llm | StrOutputParser()
        message_body = chain.invoke({
            "message_type": data["type"].replace('_', ' '),
            "candidate_name": data['candidate']['name'],
            "company_name": data['job']['company'],
            "position": data['job']['position'],
            "company_tone": data['job'].get('tone', 'professional'),
            "interview_info": interview_info
        })
        
        # Generate subject line
        subjects = {
            "interview_invite": f"Interview Invitation - {data['job']['position']} at {data['job']['company']}",
            "rejection": f"Update on Your {data['job']['position']} Application - {data['job']['company']}",
            "followup": f"Follow-up: {data['job']['position']} Application at {data['job']['company']}",
            "reschedule": f"Interview Reschedule - {data['job']['position']} at {data['job']['company']}"
        }
        
        subject = subjects.get(data["type"], f"Regarding Your Application - {data['job']['company']}")
        
        return json.dumps({
            "success": True,
            "message": "Email content generated successfully",
            "email_data": {
                "to_email": data['candidate']['email'],
                "subject": subject,
                "body": message_body,
                "candidate": data['candidate'],
                "job": data['job'],
                "message_type": data["type"]
            }
        })
        
    except Exception as e:
        return json.dumps({
            "success": False, 
            "message": f"Error: {str(e)}"
        })

# Example usage for testing
if __name__ == "__main__":
    # Test scheduling
    schedule_data = {
        "candidate": {"name": "Jane Smith", "email": "jane@example.com"},
        "job": {"company": "TechCorp", "position": "Python Developer", "tone": "casual"},
        "availability": {
            "recruiter": "Monday 10am-4pm, Wednesday 1pm-5pm",
            "candidate": "Monday afternoons, Wednesday all day"
        }
    }
    
    result = schedule_interview(json.dumps(schedule_data))
    print("Schedule Result:", result)