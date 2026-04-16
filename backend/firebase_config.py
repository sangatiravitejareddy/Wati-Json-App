"""
Firebase Admin SDK initialization.
"""
import firebase_admin
from firebase_admin import credentials, firestore, auth as firebase_auth
import json
from config import FIREBASE_SERVICE_ACCOUNT_PATH, FIREBASE_SERVICE_ACCOUNT_JSON

if FIREBASE_SERVICE_ACCOUNT_JSON:
    cred_dict = json.loads(FIREBASE_SERVICE_ACCOUNT_JSON)
    cred = credentials.Certificate(cred_dict)
else:
    cred = credentials.Certificate(FIREBASE_SERVICE_ACCOUNT_PATH)

firebase_admin.initialize_app(cred)

db = firestore.client()
auth = firebase_auth
