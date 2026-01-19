"""
Phase-4: Image upload endpoint.
Accepts multipart images, validates, and uploads to Supabase Storage.
Does NOT perform OCR, parsing, or any business logic.
"""

from typing import Annotated

from fastapi import APIRouter, File, HTTPException, UploadFile, status
from pydantic import BaseModel

from app.auth.dependencies import CurrentUser
from app.logging import logger
from app.storage import upload_file
from app.storage.supabase import StorageConfigError


router = APIRouter(prefix="/api/menus", tags=["images"])


# --- Constants (Phase-4 Validation Rules) ---

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5MB
MAX_FILE_COUNT = 5


# --- Pydantic Models ---

class ImageUploadResult(BaseModel):
    """Single uploaded image result."""
    path: str
    url: str


class ImageUploadResponse(BaseModel):
    """Response from image upload endpoint."""
    images: list[ImageUploadResult]


# --- Mock menu storage (reuse from menus.py until database is ready) ---
# TODO: This will be replaced with actual database queries in Phase-5+

_mock_menus: dict[str, dict] = {
    "menu-1": {
        "id": "menu-1",
        "owner_id": "placeholder-owner",
        "name": "Test Menu",
        "status": "draft",
    }
}


def _get_menu_or_404(menu_id: str) -> dict:
    """Get menu from mock storage or raise 404."""
    menu = _mock_menus.get(menu_id)
    if not menu:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu not found"
        )
    return menu


def _enforce_ownership(menu: dict, user_id: str) -> None:
    """
    Enforce that the current user owns the menu.
    
    Raises:
        HTTPException: 403 if user_id does not match menu.owner_id
    """
    # DEVELOPMENT ONLY: Auto-assign mock menu to current user
    if menu["owner_id"] == "placeholder-owner":
        menu["owner_id"] = user_id
        logger.info(f"DEVELOPMENT: Auto-assigned {menu['id']} ownership to {user_id}")
        return

    if menu["owner_id"] != user_id:
        logger.warning(
            f"Ownership violation: user {user_id[:8]}... attempted to upload to menu owned by {menu['owner_id'][:8]}..."
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to upload images to this menu"
        )


def _get_extension(filename: str | None, content_type: str | None) -> str | None:
    """Extract file extension from filename or content type."""
    if filename:
        parts = filename.rsplit(".", 1)
        if len(parts) == 2:
            return parts[1].lower()
    
    # Fallback to content type
    if content_type:
        type_to_ext = {
            "image/jpeg": "jpg",
            "image/png": "png",
            "image/webp": "webp",
        }
        return type_to_ext.get(content_type)
    
    return None


# --- Endpoint ---

@router.post("/{menu_id}/images", response_model=ImageUploadResponse)
async def upload_images(
    menu_id: str,
    user_id: CurrentUser,
    files: Annotated[list[UploadFile], File(description="Image files to upload")]
) -> ImageUploadResponse:
    """
    Upload images for a menu.
    
    Phase-4 validation order (mandatory):
    1. JWT authentication (handled by CurrentUser dependency)
    2. Menu ownership check
    3. File count check
    4. File type validation (MIME + extension)
    5. File size validation
    6. Upload to Supabase Storage
    
    Failure behavior: First invalid file rejects entire request.
    No partial uploads allowed.
    
    Args:
        menu_id: ID of the menu to upload images for
        user_id: Authenticated user ID (from JWT)
        files: List of image files to upload
        
    Returns:
        ImageUploadResponse with list of uploaded image paths and URLs
        
    Raises:
        HTTPException: 400 for validation errors
        HTTPException: 401 if not authenticated (handled by dependency)
        HTTPException: 403 if not owner
        HTTPException: 404 if menu not found
        HTTPException: 500 for storage errors
    """
    logger.info(f"Upload request: menu_id={menu_id}, user_id={user_id[:8]}..., file_count={len(files)}")
    
    # Step 2: Ownership check (Step 1 JWT is handled by CurrentUser dependency)
    menu = _get_menu_or_404(menu_id)
    _enforce_ownership(menu, user_id)
    
    # Step 3: File count validation
    if len(files) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No files provided"
        )
    
    if len(files) > MAX_FILE_COUNT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Too many files. Maximum allowed: {MAX_FILE_COUNT}"
        )
    
    # Pre-validate all files before uploading any (no partial uploads)
    validated_files: list[tuple[bytes, str]] = []
    
    for i, file in enumerate(files):
        file_label = file.filename or f"file[{i}]"
        
        # Step 4: MIME type validation
        if file.content_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type for '{file_label}': {file.content_type}. Allowed: {', '.join(ALLOWED_MIME_TYPES)}"
            )
        
        # Extract and validate extension
        extension = _get_extension(file.filename, file.content_type)
        if not extension or extension not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file extension for '{file_label}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
            )
        
        # Read file content
        content = await file.read()
        
        # Step 5: Size validation
        if len(content) > MAX_FILE_SIZE_BYTES:
            size_mb = len(content) / (1024 * 1024)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File '{file_label}' too large: {size_mb:.2f}MB. Maximum: 5MB"
            )
        
        if len(content) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File '{file_label}' is empty"
            )
        
        validated_files.append((content, extension))
    
    # Step 6: Upload all validated files
    results: list[ImageUploadResult] = []
    
    try:
        for content, extension in validated_files:
            result = upload_file(menu_id, content, extension)
            results.append(ImageUploadResult(path=result["path"], url=result["url"]))
    except StorageConfigError as e:
        logger.error(f"Storage configuration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Storage service is not configured. Please contact support."
        )
    except Exception as e:
        logger.error(f"Storage upload failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload images. Please try again."
        )
    
    logger.info(f"Upload successful: menu_id={menu_id}, uploaded={len(results)} images")
    
    return ImageUploadResponse(images=results)
