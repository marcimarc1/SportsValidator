import uuid
from unittest.mock import MagicMock

import pytest

from db.db_models.users import User
from logic.user_logic import create_user, get_user
from pydantic_models.user import CreateUserDto

@pytest.mark.asyncio
async def test_create_user():
    #Arrange
    mock = MagicMock()
    user_dto = CreateUserDto(username="test_user", email="test_email", password="pass")

    fake_user = User(
        id=uuid.uuid4(),
        username="test_user",
        email="test_email",
        password="pass",
    )
    mock.add.return_value = None
    mock.commit.return_value = None
    mock.refresh.side_effect = lambda user: setattr(user, "id", fake_user.id)

    #Act
    result = await create_user(user_dto,mock)
    assert result.username == "test_user"
    assert result.email == "test_email"
    assert result.id == fake_user.id




