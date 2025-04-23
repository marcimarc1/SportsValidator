from ..tests.db_mock_client import client

def test_app_is_running():
    response = client.get("/")
    assert response.status_code == 200, response.text
    data = response.json()
    assert data == "App Running!"

def test_annotation():
    assert True == True