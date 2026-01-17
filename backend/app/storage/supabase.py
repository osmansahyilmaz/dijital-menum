"""
Phase-4: Supabase Storage client.
Reads configuration from environment variables directly (Phase-4 scoped).
Does NOT modify Phase-1 config.py.
"""

import os
import uuid
from typing import TypedDict

import httpx

from app.logging import logger


class StorageResult(TypedDict):
    """Result from a successful upload."""
    path: str
    url: str


class StorageConfigError(Exception):
    """Raised when required storage configuration is missing."""
    pass


def _get_storage_config() -> tuple[str, str, str]:
    """
    Get storage configuration from environment variables.
    
    Returns:
        Tuple of (supabase_url, service_role_key, bucket_name)
        
    Raises:
        StorageConfigError: If any required env var is missing
    """
    supabase_url = os.environ.get("SUPABASE_URL")
    service_role_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    bucket_name = os.environ.get("SUPABASE_STORAGE_BUCKET")
    
    missing = []
    if not supabase_url:
        missing.append("SUPABASE_URL")
    if not service_role_key:
        missing.append("SUPABASE_SERVICE_ROLE_KEY")
    if not bucket_name:
        missing.append("SUPABASE_STORAGE_BUCKET")
    
    if missing:
        raise StorageConfigError(
            f"Missing required environment variables: {', '.join(missing)}. "
            "Please configure these before using storage features."
        )
    
    return supabase_url, service_role_key, bucket_name


def upload_file(menu_id: str, file_bytes: bytes, extension: str) -> StorageResult:
    """
    Upload a file to Supabase Storage.
    
    Args:
        menu_id: The menu ID to associate this image with
        file_bytes: Raw bytes of the file
        extension: File extension without dot (e.g., 'jpg', 'png', 'webp')
        
    Returns:
        StorageResult with 'path' and 'url' keys
        
    Raises:
        StorageConfigError: If storage is not configured
        httpx.HTTPStatusError: If upload fails
    """
    supabase_url, service_role_key, bucket_name = _get_storage_config()
    
    # Generate deterministic path: menus/{menu_id}/{uuid}.{ext}
    file_uuid = str(uuid.uuid4())
    storage_path = f"menus/{menu_id}/{file_uuid}.{extension}"
    
    # Supabase Storage upload endpoint
    upload_url = f"{supabase_url}/storage/v1/object/{bucket_name}/{storage_path}"
    
    # Determine content type from extension
    content_types = {
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "png": "image/png",
        "webp": "image/webp",
    }
    content_type = content_types.get(extension.lower(), "application/octet-stream")
    
    headers = {
        "Authorization": f"Bearer {service_role_key}",
        "Content-Type": content_type,
    }
    
    logger.info(f"Uploading file to storage: {storage_path}")
    
    with httpx.Client() as client:
        response = client.post(
            upload_url,
            content=file_bytes,
            headers=headers,
        )
        response.raise_for_status()
    
    # Construct public URL
    public_url = f"{supabase_url}/storage/v1/object/public/{bucket_name}/{storage_path}"
    
    logger.info(f"Upload successful: {storage_path}")
    
    return StorageResult(path=storage_path, url=public_url)
