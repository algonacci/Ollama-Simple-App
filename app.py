from flask import Flask, request, Response, stream_with_context
from flask_cors import CORS
import requests
import json

app = Flask(__name__)
CORS(app, resources={
    r"/*": {"origins": ["https://ollama-simple-app.netlify.app"]}
})


@app.route('/generate', methods=['POST'])
def generate():
    data = request.json
    url = "http://localhost:11434/api/chat"
    headers = {
        "Content-Type": "application/json"
    }

    response = requests.post(url, json=data, headers=headers, stream=True)

    def generate_stream():
        json_string = ''
        full_message = ''
        try:
            for chunk in response.iter_content(chunk_size=512):
                json_string += chunk.decode('utf-8')

                # Process complete JSON objects
                while True:
                    boundary = json_string.find('}\n')
                    if boundary == -1:
                        break
                    valid_json = json_string[:boundary + 1]
                    json_string = json_string[boundary + 1:]

                    try:
                        parsed_data = json.loads(valid_json)
                        full_message += parsed_data['message']['content']
                        yield parsed_data['message']['content']
                        if parsed_data.get('done'):
                            return
                    except json.JSONDecodeError as e:
                        print(f"Error parsing JSON: {e}")

            # Handle any remaining data
            if json_string.strip():
                try:
                    parsed_data = json.loads(json_string)
                    full_message += parsed_data['message']['content']
                    yield parsed_data['message']['content']
                except json.JSONDecodeError as e:
                    print(f"Error parsing JSON: {e}")

        except requests.exceptions.RequestException as e:
            yield f"Error during request to {url}: {str(e)}"

    return Response(stream_with_context(generate_stream()), content_type='text/plain')


if __name__ == '__main__':
    app.run(debug=True)
