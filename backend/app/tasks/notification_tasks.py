from app.tasks.celery_app import celery_app
from app.core.logger import logger


@celery_app.task(name="tasks.send_async_notification")
def send_async_notification_task(session_id: str, channel: str, recipient: str, content: str):
    logger.info("Executing Celery asynchronous notification task", session_id=session_id, channel=channel)
    # Background execution logic for Twilio / SendGrid calls
    return {"status": "SUCCESS", "session_id": session_id, "channel": channel}
