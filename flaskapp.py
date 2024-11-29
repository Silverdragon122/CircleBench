from flask import Flask, request, jsonify, render_template, send_from_directory
import os

app = Flask(__name__)

# In-memory storage for leaderboard data
leaderboard_data = []

@app.route("/")
def index():
    return render_template("index.html")

@app.route('/test')
def test():
    return render_template("test.html")

@app.route('/api/v1/leaderboard/upload', methods=['POST'])
def upload_leaderboard():
    data = request.json
    if 'username' in data and 'cpu' in data and 'gpu' in data and 'ram' in data and 'sides' in data:
        leaderboard_data.append(data)
        return jsonify({'status': 'success', 'message': 'Data uploaded successfully'}), 200
    else:
        return jsonify({'status': 'error', 'message': 'Invalid data'}), 400

@app.route('/api/v1/leaderboard/fetch', methods=['GET'])
def fetch_leaderboard():
    return jsonify(leaderboard_data), 200

@app.route('/src/<path:filename>', methods=['GET'])
def download_file(filename):
    src_directory = os.path.join(app.root_path, 'src')
    return send_from_directory(src_directory, filename)

if __name__ == '__main__':
    app.run(debug=True)