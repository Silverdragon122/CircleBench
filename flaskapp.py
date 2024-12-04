from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_socketio import SocketIO, emit, join_room, leave_room
import os
import random
import string

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# In-memory storage
leaderboard_data = []
active_connections = {}
link_codes = {}

def generate_link_code():
    """Generate a random 5-digit link code"""
    return ''.join(random.choices(string.digits, k=5))

@app.route("/")
def index():
    return render_template("index.html")

@app.route('/test')
def test():
    return render_template("test.html")

@app.route('/api/v1/leaderboard/upload', methods=['POST'])
def upload_leaderboard():
    data = request.json
    required_fields = ['username', 'cpu', 'gpu', 'ram', 'browser', 'averageFps']
    missing_fields = [field for field in required_fields if field not in data]
    
    if not missing_fields:
        leaderboard_data.append(data)
        return jsonify({'status': 'success', 'message': 'Data uploaded successfully'}), 200
    else:
        return jsonify({
            'status': 'error', 
            'message': f'Missing required fields: {", ".join(missing_fields)}'
        }), 400

@app.route('/api/v1/leaderboard/fetch', methods=['GET'])
def fetch_leaderboard():
    return jsonify(leaderboard_data), 200

@app.route('/src/<path:filename>', methods=['GET'])
def download_file(filename):
    src_directory = os.path.join(app.root_path, 'src')
    return send_from_directory(src_directory, filename)

# New link system routes
@app.route('/api/v1/link', methods=['GET', 'POST'])
def link_endpoint():
    if request.method == 'GET':
        code = generate_link_code()
        while code in link_codes:
            code = generate_link_code()
        link_codes[code] = None
        return jsonify({'code': code})
    
    elif request.method == 'POST':
        data = request.json
        code = data.get('code')
        hardware_info = {
            'ram': data.get('ram'),
            'gpu': data.get('gpu'),
            'cpu': data.get('cpu'),
            'threads': data.get('threads')
        }
        
        if code in link_codes:
            if code in active_connections:
                socketio.emit('hardware_info', hardware_info, room=active_connections[code])
                return jsonify({'status': 'success', 'message': 'Hardware info sent'})
            return jsonify({'status': 'error', 'message': 'No active connection for this code'})
        return jsonify({'status': 'error', 'message': 'Invalid link code'})

@socketio.on('connect')
def handle_connect():
    print(f'Client connected: {request.sid}')

@socketio.on('register_code')
def handle_register(data):
    code = data['code']
    if code in link_codes:
        active_connections[code] = request.sid
        join_room(request.sid)
        emit('registration_success', {'message': 'Waiting for hardware info'})
    else:
        emit('registration_error', {'message': 'Invalid link code'})

@socketio.on('disconnect')
def handle_disconnect():
    for code, sid in list(active_connections.items()):
        if sid == request.sid:
            del active_connections[code]
            if code in link_codes:
                del link_codes[code]

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0')