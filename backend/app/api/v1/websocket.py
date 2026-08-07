from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket.manager import ws_manager
from app.core.logger import logger

router = APIRouter()


@router.websocket("/live-session")
async def websocket_live_session(websocket: WebSocket, session_id: str = "default"):
    await ws_manager.connect(session_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            logger.info("Received WebSocket frame", session_id=session_id, data=data)
            # Echo back real-time risk status update
            response = {
                "status": "PROCESSING",
                "session_id": session_id,
                "server_ack": True
            }
            await ws_manager.send_personal_message(response, websocket)
    except WebSocketDisconnect:
        ws_manager.disconnect(session_id, websocket)
