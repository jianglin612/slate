from cryptography.fernet import Fernet
import base64
from config import get_settings


def _get_fernet() -> Fernet:
    settings = get_settings()
    # Convert hex key to base64 for Fernet
    key_bytes = bytes.fromhex(settings.ENCRYPTION_KEY)
    key_b64 = base64.urlsafe_b64encode(key_bytes)
    return Fernet(key_b64)


def encrypt_token(token: str) -> str:
    """Encrypt an OAuth token for storage."""
    fernet = _get_fernet()
    return fernet.encrypt(token.encode()).decode()


def decrypt_token(encrypted: str) -> str:
    """Decrypt a stored OAuth token."""
    fernet = _get_fernet()
    return fernet.decrypt(encrypted.encode()).decode()
