import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "HEALTHY"


@pytest.mark.asyncio
async def test_record_session_event(client: AsyncClient):
    payload = {
        "session_id": "test_session_123",
        "event_type": "CHECKOUT_START",
        "page_url": "/checkout",
        "payload": {"cart_amount": 1250.0}
    }
    response = await client.post("/api/v1/session/event", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["session_id"] == "test_session_123"
    assert data["event_type"] == "CHECKOUT_START"
