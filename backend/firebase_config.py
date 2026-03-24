"""
Firebase Admin SDK initialization.
"""
import firebase_admin
from firebase_admin import credentials, firestore, auth as firebase_auth
from config import FIREBASE_SERVICE_ACCOUNT_PATH

cred = credentials.Certificate(FIREBASE_SERVICE_ACCOUNT_PATH)
firebase_admin.initialize_app(cred)

db = firestore.client()
auth = firebase_auth
