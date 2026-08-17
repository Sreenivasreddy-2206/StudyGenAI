import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)


def generate_answer(prompt, response_schema=None):

    kwargs = {
        "model": "openai/gpt-oss-20b",
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ]
    }

    if response_schema:
        kwargs["response_format"] = {
            "type": "json_object"
        }

    response = client.chat.completions.create(**kwargs)

    return response.choices[0].message.content