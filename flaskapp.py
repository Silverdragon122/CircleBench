from flask import Flask, request, jsonify, render_template, send_from_directory, make_response
import os
import random
import string
import time
from threading import Timer
import logging

app = Flask(__name__)


leaderboard_data = []
link_codes = {}

def generate_link_code():
    """Generate a random 5-digit link code"""
    return ''.join(random.choices(string.digits, k=5))

def invalidate_link_code(code):
    """Invalidate the link code after 10 minutes"""
    if code in link_codes:
        del link_codes[code]


logging.basicConfig(level=logging.INFO)

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



@app.route('/api/v1/link/generate', methods=['GET'])
def generate_link_endpoint():
    code = generate_link_code()
    while code in link_codes:
        code = generate_link_code()
    link_codes[code] = None
    logging.info(f"Generated new link code: {code}")
    
    Timer(600, invalidate_link_code, args=[code]).start()
    return jsonify({'code': code})

@app.route('/api/v1/link/submit', methods=['POST'])
def submit_link_code():
    data = request.json
    logging.info(f"Received POST data: {data}")
    code = data.get('code')
    
    if not code:
        logging.error("No code provided in the POST data.")
        return jsonify({'status': 'error', 'message': 'No code provided.'}), 400
    
    
    code = str(code)
    
    hardware_info = {
        'ram': data.get('ram'),
        'gpu': data.get('gpu'),
        'cpu': data.get('cpu'),
        'threads': data.get('threads')
    }
    
    if code in link_codes and code.isdigit():
        link_codes[code] = hardware_info
        logging.info(f"Hardware info stored for code {code}: {hardware_info}")
        return jsonify({'status': 'success', 'message': 'Hardware info received', 'hardware_info': hardware_info})
    
    logging.error(f"Invalid link code received: {code}")
    return jsonify({'status': 'error', 'message': 'Invalid link code, missing parameters or server error'}), 400


@app.route('/api/v1/link/status/<code>', methods=['GET'])
def link_status(code):
    if code in link_codes and link_codes[code] is not None:
        return jsonify({
            'status': 'success',
            'message': 'Hardware info received',
            'hardware_info': link_codes[code]
        })
    return jsonify({
        'status': 'pending',
        'message': 'Waiting for hardware info'
    })
@app.route('/api/v1/hwinfo.sh', methods=['GET'])
def download_hwinfo_sh_script():
    code = request.args.get('code')
    if not code:
        return jsonify({'status': 'error', 'message': 'Missing link code. This request has failed.'}), 400
    elif code not in link_codes:
        return jsonify({'status': 'error', 'message': 'Invalid code in arguments. This request has failed.'}), 400

    return send_from_directory(directory=os.path.join(app.root_path, 'src'), filename='hwinfo.sh', as_attachment=True)

@app.route('/api/v1/hwinfo.ps1', methods=['GET'])
def download_hwinfo_ps1_script():
    code = generate_link_code()
    link_codes[code] = None
    logging.info(f"Generated new link code: {code}")
    
    Timer(600, invalidate_link_code, args=[code]).start()
    
    return send_from_directory(directory=os.path.join(app.root_path, 'src'), filename='hwinfo.ps1', as_attachment=True)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=2077)