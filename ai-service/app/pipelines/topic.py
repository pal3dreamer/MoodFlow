import os
import re
import logging
from typing import Optional
from google import genai

logger = logging.getLogger(__name__)


TOPIC_KEYWORDS = {
    "Algorithms study": ["algorithm", "coding", "programming", "code", "study", "leetcode", "data structure"],
    "Math work": ["math", "mathematics", "calculus", "algebra", "equation", "homework", "problem set"],
    "Reading": ["reading", "book", "chapter", "article", "paper", "read"],
    "Writing": ["writing", "essay", "paper", "report", "thesis", "document", "write"],
    "Meeting": ["meeting", "sync", "standup", "discussion", "call", "zoom", "teams"],
    "Research": ["research", "experiment", "study", "analysis", "findings", "paper"],
    "Exercise": ["exercise", "workout", "gym", "running", "yoga", "fitness"],
    "Work": ["work", "task", "project", "deadline", "deadlines", "job", "office"],
    "Class": ["class", "lecture", "seminar", "course", "lesson", "professor", "teacher"],
    "Programming": ["programming", "coding", "debug", "bug", "feature", "developer"],
}


def extract_topic_with_gemini(transcription: str) -> Optional[str]:
    """Extract topic using Gemini API.
    
    Args:
        transcription: The transcribed text
    
    Returns:
        Topic string or None if API call fails
    """
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key or api_key == "PLACEHOLDER_API_KEY":
        logger.warning("GEMINI_API_KEY not set, falling back to keyword matching")
        return None
    
    try:
        logger.info("Calling Gemini API for topic extraction...")
        
        client = genai.Client(api_key=api_key)
        
        prompt = f"""Given this voice transcription, identify what the person is doing or the topic of their session.

Transcription: "{transcription}"

Respond with just 2-4 words describing the topic or activity (e.g., "Algorithms Study", "Math Homework", "Team Meeting", "General Conversation", "Reading Aloud")."""

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
        
        topic = response.text.strip()
        logger.info(f"Gemini returned topic: {topic}")
        
        return topic
        
    except Exception as e:
        logger.error(f"Gemini API error: {e}")
        return None


def extract_topic(transcription: str) -> str:
    """Extract topic from transcription text.
    
    Args:
        transcription: The transcribed text
    
    Returns:
        Detected topic string or "General"
    """
    if not transcription:
        return "General"
    
    # Try Gemini first
    gemini_topic = extract_topic_with_gemini(transcription)
    if gemini_topic:
        return gemini_topic
    
    # Fallback to keyword matching
    text_lower = transcription.lower()
    
    # Check for explicit session type keywords
    session_keywords = {
        "study session": "Study",
        "work session": "Work",
        "focus session": "Focus",
        "break": "Break",
        "started working": "Work",
        "starting work": "Work",
        "done": "Completed",
        "finished": "Completed",
        "finished working": "Completed",
    }
    
    for pattern, topic in session_keywords.items():
        if pattern in text_lower:
            # Try to find more specific topic
            for topic_name, keywords in TOPIC_KEYWORDS.items():
                if any(kw in text_lower for kw in keywords):
                    return topic_name
            return topic
    
    # Check topic keywords
    for topic_name, keywords in TOPIC_KEYWORDS.items():
        matches = sum(1 for kw in keywords if kw in text_lower)
        if matches >= 1:
            return topic_name
    
    # Extract any mentioned proper nouns (capitalized words)
    proper_nouns = re.findall(r'\b[A-Z][a-z]+\b', transcription)
    if proper_nouns:
        # Filter out common words
        skip = {"I", "I'm", "I'm", "Starting", "Okay", "Alright", "Sure", "Yes", "No"}
        filtered = [n for n in proper_nouns if n not in skip]
        if filtered:
            return f"{filtered[0]} session"
    
    return "General"


def format_topic_for_response(topic: str) -> str:
    """Format topic for API response."""
    if topic == "General":
        return "General"
    
    # Title case for display
    return topic.title()
