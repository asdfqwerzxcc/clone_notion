def test_api_endpoint(client):
    response = client.get('/api/chat')
    assert response.status_code == 200
    assert 'message' in response.json

def test_api_chat(client):
    response = client.post('/api/chat', json={'message': 'Hello'})
    assert response.status_code == 200
    assert 'response' in response.json

def test_api_invalid_input(client):
    response = client.post('/api/chat', json={'message': ''})
    assert response.status_code == 400
    assert 'error' in response.json