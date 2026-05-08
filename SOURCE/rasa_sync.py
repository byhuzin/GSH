import os
import re
import glob
import time
import subprocess
import threading
import requests


PROJECT_DIR = os.path.dirname(__file__)

RASA_BOT_DIR = os.path.join(PROJECT_DIR, "rasa_bot")
NLU_PATH = os.path.join(RASA_BOT_DIR, "data", "nlu.yml")
DOMAIN_PATH = os.path.join(RASA_BOT_DIR, "domain.yml")
MODELS_DIR = os.path.join(RASA_BOT_DIR, "models")

RASA_URL = "http://localhost:5005"

BASE_DIR = os.path.dirname(PROJECT_DIR)
RASA_EXE = os.path.join(BASE_DIR, "rasa_env", "Scripts", "rasa.exe")


def read_file(path):
    with open(path, "r", encoding="utf-8") as file:
        return file.read()


def write_file(path, content):
    with open(path, "w", encoding="utf-8") as file:
        file.write(content)


def create_nlu_block(intent, keywords):
    keyword_list = re.split(r"[,،\n]", keywords)
    keyword_list = [word.strip() for word in keyword_list if word.strip()]

    examples = ""
    for word in keyword_list:
        examples += f"    - {word}\n"

    return f"- intent: {intent}\n  examples: |\n{examples}"


def add_or_update_nlu_intent(intent, keywords):
    content = read_file(NLU_PATH)
    new_block = create_nlu_block(intent, keywords)

    pattern = rf"(?ms)^- intent: {re.escape(intent)}\s+examples: \|.*?(?=^- intent: |\Z)"

    if re.search(pattern, content):
        content = re.sub(pattern, new_block, content)
    else:
        content = content.rstrip() + "\n\n" + new_block + "\n"

    write_file(NLU_PATH, content)


def remove_nlu_intent(intent):
    content = read_file(NLU_PATH)

    pattern = rf"(?ms)^- intent: {re.escape(intent)}\s+examples: \|.*?(?=^- intent: |\Z)"
    content = re.sub(pattern, "", content)
    content = content.rstrip() + "\n"

    write_file(NLU_PATH, content)


def add_domain_intent(intent):
    content = read_file(DOMAIN_PATH)

    if f"  - {intent}" in content:
        return

    content = re.sub(
        r"(intents:\s*\n)",
        rf"\1  - {intent}\n",
        content
    )

    write_file(DOMAIN_PATH, content)


def remove_domain_intent(intent):
    content = read_file(DOMAIN_PATH)
    content = re.sub(rf"\n  - {re.escape(intent)}", "", content)
    write_file(DOMAIN_PATH, content)


def get_latest_model():
    models = glob.glob(os.path.join(MODELS_DIR, "*.tar.gz"))

    if not models:
        return None

    return max(models, key=os.path.getmtime)


def reload_rasa_model():
    latest_model = get_latest_model()

    if not latest_model:
        print("[rasa_sync] No model found in models/")
        return

    print(f"[rasa_sync] Loading model: {os.path.basename(latest_model)}")

    try:
        response = requests.put(
            f"{RASA_URL}/model",
            json={"model_file": latest_model},
            timeout=30
        )

        if response.status_code == 204:
            print("[rasa_sync] The new model loaded successfully")
        else:
            print(f"[rasa_sync] Unexpected response: {response.status_code} - {response.text}")

    except Exception as error:
        print(f"[rasa_sync] Failed to connect with Rasa server: {error}")


def train_rasa():
    try:
        result = subprocess.run(
            [RASA_EXE, "train"],
            cwd=RASA_BOT_DIR,
            capture_output=True,
            text=True
        )

        if result.returncode == 0:
            print("[rasa_sync] Training completed")
            time.sleep(1)
            reload_rasa_model()
            delete_old_models()
        else:
            print("[rasa_sync] Training failed:\n", result.stderr)

    except FileNotFoundError:
        print(f"[rasa_sync] Rasa.exe was not found: {RASA_EXE}")


def train_rasa_in_background():
    thread = threading.Thread(target=train_rasa, daemon=True)
    thread.start()


def sync_service_to_rasa(intent, keywords, action="add"):
    if action == "add":
        add_or_update_nlu_intent(intent, keywords)
        add_domain_intent(intent)

    elif action == "update":
        add_or_update_nlu_intent(intent, keywords)
        add_domain_intent(intent)

    elif action == "delete":
        remove_nlu_intent(intent)
        remove_domain_intent(intent)

    train_rasa_in_background()


def delete_old_models():
    models = glob.glob(os.path.join(MODELS_DIR, "*.tar.gz"))

    if len(models) <= 1:
        return

    models.sort(key=os.path.getmtime)

    old_models = models[:-1]

    for model in old_models:
        os.remove(model)
        print(f"[rasa_sync] Deleted old model: {os.path.basename(model)}")