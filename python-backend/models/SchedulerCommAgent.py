import os
import json
import smtplib
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from enum import Enum
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from langchain.tools import tool
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_groq import ChatGroq

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
import pickle

# Environment setup
os.environ["GROQ_API_KEY"] = "GROQ_API_KEY"
os.environ["EMAIL_ADDRESS"] = "EMAIL_ADDRESS"
os.environ["EMAIL_PASSWORD"] = "EMAIL_PASSWORD"

# Initialize LLM
llm = ChatGroq(
    model_name="llama3-70b-8192",
    api_key=os.environ["GROQ_API_KEY"]
)

class MessageType(Enum):
    INTERVIEW_INVITE = "interview_invite"
    REJECTION = "rejection"
    FOLLOWUP = "followup"
    RESCHEDULE = "reschedule"

class SchedulerCommAgent:
    """Combined Scheduler and Communication Agent"""
    
    def __init__(self):
        self.email_address = os.environ.get("EMAIL_ADDRESS")
        self.email_password = os.environ.get("EMAIL_PASSWORD")
        self.calendar_service = None
    
    # =================== SCHEDULING FUNCTIONALITY ===================
    
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
            # Extract JSON from the response
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
                    # Parse times
                    r_start = datetime.strptime(r_slot["start_time"], "%H:%M").time()
                    r_end = datetime.strptime(r_slot["end_time"], "%H:%M").time()
                    c_start = datetime.strptime(c_slot["start_time"], "%H:%M").time()
                    c_end = datetime.strptime(c_slot["end_time"], "%H:%M").time()
                    
                    # Find overlap
                    overlap_start = max(r_start, c_start)
                    overlap_end = min(r_end, c_end)
                    
                    # If there's at least 1 hour overlap
                    overlap_duration = datetime.combine(datetime.today(), overlap_end) - datetime.combine(datetime.today(), overlap_start)
                    if overlap_duration >= timedelta(hours=1):
                        matching_slots.append({
                            "day": r_slot["day"],
                            "start_time": overlap_start.strftime("%H:%M"),
                            "end_time": (datetime.combine(datetime.today(), overlap_start) + timedelta(hours=1)).time().strftime("%H:%M")
                        })
        
        return matching_slots
    
    def setup_google_calendar(self):
        """Set up Google Calendar API"""
        if self.calendar_service:
            return self.calendar_service
            
        SCOPES = ['https://www.googleapis.com/auth/calendar']
        creds = None
        
        if os.path.exists('token.pickle'):
            with open('token.pickle', 'rb') as token:
                creds = pickle.load(token)
                
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
                creds = flow.run_local_server(port=0)
            with open('token.pickle', 'wb') as token:
                pickle.dump(creds, token)
                
        self.calendar_service = build('calendar', 'v3', credentials=creds)
        return self.calendar_service
    
    def check_calendar_availability(self, start_datetime: datetime, end_datetime: datetime) -> bool:
        """Check if time slot is available in calendar"""
        try:
            service = self.setup_google_calendar()
            
            events_result = service.events().list(
                calendarId='primary',
                timeMin=start_datetime.isoformat() + 'Z',
                timeMax=end_datetime.isoformat() + 'Z',
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            events = events_result.get('items', [])
            return len(events) == 0
            
        except Exception as e:
            print(f"Calendar check error: {e}")
            return True  # Assume available if can't check
    
    def create_calendar_event(self, summary: str, description: str, 
                            start_datetime: datetime, end_datetime: datetime,
                            attendee_emails: List[str]) -> Optional[str]:
        """Create calendar event and return event link"""
        try:
            service = self.setup_google_calendar()
            
            event_body = {
                'summary': summary,
                'description': description,
                'start': {'dateTime': start_datetime.isoformat(), 'timeZone': 'UTC'},
                'end': {'dateTime': end_datetime.isoformat(), 'timeZone': 'UTC'},
                'attendees': [{'email': email} for email in attendee_emails],
                'reminders': {
                    'useDefault': False,
                    'overrides': [
                        {'method': 'email', 'minutes': 24 * 60},
                        {'method': 'popup', 'minutes': 30},
                    ],
                },
            }
            
            event = service.events().insert(
                calendarId='primary',
                body=event_body,
                sendUpdates='all'
            ).execute()
            
            return event.get('htmlLink')
            
        except Exception as e:
            print(f"Calendar event creation error: {e}")
            return None
    
    # =================== COMMUNICATION FUNCTIONALITY ===================
    
    def generate_message(self, message_type: MessageType, candidate_name: str,
                        company_name: str, position: str, company_tone: str = "professional",
                        interview_details: Optional[Dict] = None) -> str:
        """Generate email message based on type and company tone"""
        
        interview_info = ""
        if interview_details:
            interview_info = f"Date: {interview_details.get('date', '')}\nTime: {interview_details.get('start_time', '')} - {interview_details.get('end_time', '')}"
        
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
        return chain.invoke({
            "message_type": message_type.value.replace('_', ' '),
            "candidate_name": candidate_name,
            "company_name": company_name,
            "position": position,
            "company_tone": company_tone,
            "interview_info": interview_info
        })
    
    def get_email_subject(self, message_type: MessageType, company_name: str, position: str) -> str:
        """Generate email subject line"""
        subjects = {
            MessageType.INTERVIEW_INVITE: f"Interview Invitation - {position} at {company_name}",
            MessageType.REJECTION: f"Update on Your {position} Application - {company_name}",
            MessageType.FOLLOWUP: f"Follow-up: {position} Application at {company_name}",
            MessageType.RESCHEDULE: f"Interview Reschedule - {position} at {company_name}"
        }
        return subjects.get(message_type, f"Regarding Your Application - {company_name}")
    
    def send_email(self, to_email: str, subject: str, body: str) -> bool:
        """Send email via SMTP"""
        try:
            msg = MIMEMultipart()
            msg['From'] = self.email_address
            msg['To'] = to_email
            msg['Subject'] = subject
            
            msg.attach(MIMEText(body, 'plain'))
            
            server = smtplib.SMTP('smtp.gmail.com', 587)
            server.starttls()
            server.login(self.email_address, self.email_password)
            server.send_message(msg)
            server.quit()
            return True
        except Exception as e:
            print(f"Email sending failed: {e}")
            return False

# =================== TOOLS ===================

@tool
def schedule_interview(input_json: str) -> str:
    """
    Schedule interview based on availability and send invitation.
    
    Input format:
    {
        "candidate": {"name": "str", "email": "str"},
        "job": {"company": "str", "position": "str", "tone": "str"},
        "availability": {"recruiter": "str", "candidate": "str"}
    }
    """
    try:
        data = json.loads(input_json)
        agent = SchedulerCommAgent()
        
        # Parse availability
        recruiter_slots = agent.parse_availability(data["availability"]["recruiter"])
        candidate_slots = agent.parse_availability(data["availability"]["candidate"])
        
        # Find matching slots
        matching_slots = agent.find_matching_slots(recruiter_slots, candidate_slots)
        
        if not matching_slots:
            return json.dumps({"success": False, "message": "No matching availability found"})
        
        # Find available slot
        available_slot = None
        for slot in matching_slots:
            # Calculate actual datetime
            today = datetime.today()
            days_map = {'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 
                       'Friday': 4, 'Saturday': 5, 'Sunday': 6}
            
            days_ahead = days_map[slot["day"]] - today.weekday()
            if days_ahead < 0:
                days_ahead += 7
                
            interview_date = today + timedelta(days=days_ahead)
            start_time = datetime.strptime(slot["start_time"], "%H:%M").time()
            end_time = datetime.strptime(slot["end_time"], "%H:%M").time()
            
            start_datetime = datetime.combine(interview_date, start_time)
            end_datetime = datetime.combine(interview_date, end_time)
            
            # Check calendar availability
            if agent.check_calendar_availability(start_datetime, end_datetime):
                available_slot = {
                    "day": slot["day"],
                    "date": interview_date.strftime("%Y-%m-%d"),
                    "start_time": slot["start_time"],
                    "end_time": slot["end_time"]
                }
                
                # Create calendar event
                summary = f"Interview: {data['candidate']['name']} - {data['job']['position']}"
                description = f"Interview for {data['job']['position']} position at {data['job']['company']}"
                attendees = [data['candidate']['email']]
                
                calendar_link = agent.create_calendar_event(
                    summary, description, start_datetime, end_datetime, attendees
                )
                
                # Generate and send invitation email
                message = agent.generate_message(
                    MessageType.INTERVIEW_INVITE,
                    data['candidate']['name'],
                    data['job']['company'],
                    data['job']['position'],
                    data['job'].get('tone', 'professional'),
                    available_slot
                )
                
                subject = agent.get_email_subject(
                    MessageType.INTERVIEW_INVITE,
                    data['job']['company'],
                    data['job']['position']
                )
                
                email_sent = agent.send_email(data['candidate']['email'], subject, message)
                
                return json.dumps({
                    "success": True,
                    "scheduled_time": available_slot,
                    "calendar_link": calendar_link,
                    "email_sent": email_sent,
                    "message": "Interview scheduled successfully"
                })
                
        return json.dumps({"success": False, "message": "All slots are booked"})
        
    except Exception as e:
        return json.dumps({"success": False, "message": f"Error: {str(e)}"})

@tool
def send_candidate_message(input_json: str) -> str:
    """
    Send communication to candidate (rejection, followup, etc.)
    
    Input format:
    {
        "type": "rejection|followup|reschedule",
        "candidate": {"name": "str", "email": "str"},
        "job": {"company": "str", "position": "str", "tone": "str"}
    }
    """
    try:
        data = json.loads(input_json)
        agent = SchedulerCommAgent()
        
        message_type = MessageType(data["type"])
        
        # Generate message
        message = agent.generate_message(
            message_type,
            data['candidate']['name'],
            data['job']['company'],
            data['job']['position'],
            data['job'].get('tone', 'professional')
        )
        
        subject = agent.get_email_subject(
            message_type,
            data['job']['company'],
            data['job']['position']
        )
        
        # Send email
        email_sent = agent.send_email(data['candidate']['email'], subject, message)
        
        return json.dumps({
            "success": email_sent,
            "message": "Email sent successfully" if email_sent else "Email sending failed",
            "email_preview": message
        })
        
    except Exception as e:
        return json.dumps({"success": False, "message": f"Error: {str(e)}"})

# Example usage
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
    
    # Test communication
    comm_data = {
        "type": "rejection",
        "candidate": {"name": "John Doe", "email": "john@example.com"},
        "job": {"company": "TechCorp", "position": "Python Developer", "tone": "empathetic"}
    }
    
    result = send_candidate_message(json.dumps(comm_data))
    print("Communication Result:", result)