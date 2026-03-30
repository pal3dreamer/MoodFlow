"""Job queue configuration for MoodFlow AI service."""

import os
from typing import Optional

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", None)

QUEUE_NAMES = {
    "checkin": "moodflow:checkin",
    "analyze": "moodflow:analyze",
    "priority": "moodflow:priority",
}

DEFAULT_JOB_OPTIONS = {
    "attempts": 3,
    "backoff": {
        "type": "exponential",
        "delay": 1000,
    },
    "removeOnComplete": 100,
    "removeOnFail": 50,
}

CHECKIN_JOB_OPTIONS = {
    "attempts": 3,
    "backoff": {
        "type": "exponential",
        "delay": 500,
    },
    "removeOnComplete": 50,
    "removeOnFail": 20,
}

ANALYZE_JOB_OPTIONS = {
    "attempts": 3,
    "backoff": {
        "type": "exponential",
        "delay": 2000,
    },
    "removeOnComplete": 100,
    "removeOnFail": 50,
}
