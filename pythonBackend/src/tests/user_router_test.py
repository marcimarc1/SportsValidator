import pytest
from httpx import AsyncClient
from fastapi import FastAPI, Depends
from unittest.mock import MagicMock

import uuid

from db.database import get_db
from main import app


# Dummy User model (simulate DB model response)
class DummyUser:
    def __init__(self, username, email, password):
        self.id = uuid.uuid4()
        self.username = username
        self.email = email
        self.password = password  # Note: in production you would hash this!

    def __dict__(self):
        return {
            "id": str(self.id),
            "username": self.username,
            "email": self.email,
            "password": self.password
        }

# Dependency override for the DB session
@pytest.fixture
def override_get_db():
    mock_db = MagicMock()
    yield mock_db

app.dependency_overrides[get_db] = lambda: MagicMock()

@pytest.mark.asyncio
async def test_create_user(override_get_db):
    # Arrange
    user_payload = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "securepassword"
    }

    # Mock DB behavior
    mock_db = override_get_db
    mock_user = DummyUser(**user_payload)
    mock_db.add.return_value = None
    mock_db.commit.return_value = None
    mock_db.refresh.return_value = mock_user

    # Act
    async with AsyncClient(base_url="http://test") as ac:
        response = await ac.post("/user/", json=user_payload)

    # Assert
    assert response.status_code == 200
    response_data = response.json()
    assert response_data["username"] == "testuser"
    assert response_data["email"] == "test@example.com"
    assert "id" in response_data
