from flask import Flask, request, jsonify
from model.predict import get_response  # Assuming you have a function to get responses from the model

app = Flask(__name__)

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message')
    
    if not user_message:
        return jsonify({'error': 'No message provided'}), 400

    bot_response = get_response(user_message)  # Call your prediction function here
    return jsonify({'message': bot_response})

if __name__ == '__main__':
    app.run(debug=True)