"""
Phase-2: Menu API routes with ownership enforcement.
All routes require authentication and enforce owner_id checks.
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.auth.dependencies import CurrentUser
from app.logging import logger


router = APIRouter(prefix="/api/menus", tags=["menus"])


# --- Pydantic Models ---

class MenuBase(BaseModel):
    """Base menu model for API responses."""
    id: str
    owner_id: str
    name: str
    status: str  # draft, published


class MenuUpdate(BaseModel):
    """Model for menu update requests."""
    name: str | None = None


# --- In-memory mock storage (placeholder until database is implemented) ---
# This simulates ownership for Phase-2 testing only

_mock_menus: dict[str, dict] = {
    "menu-1": {
        "id": "menu-1",
        "owner_id": "placeholder-owner",  # Will be replaced by real user_id in tests
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
            f"Ownership violation: user {user_id[:8]}... attempted to access menu owned by {menu['owner_id'][:8]}..."
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this menu"
        )


# --- Routes ---

@router.get("/{menu_id}", response_model=MenuBase)
async def get_menu(menu_id: str, user_id: CurrentUser) -> MenuBase:
    """
    Get a menu by ID.
    
    Requires authentication. Only the owner can access their menu.
    """
    menu = _get_menu_or_404(menu_id)
    _enforce_ownership(menu, user_id)
    
    return MenuBase(**menu)


@router.put("/{menu_id}", response_model=MenuBase)
async def update_menu(
    menu_id: str,
    update: MenuUpdate,
    user_id: CurrentUser
) -> MenuBase:
    """
    Update a menu.
    
    Requires authentication. Only the owner can update their menu.
    """
    menu = _get_menu_or_404(menu_id)
    _enforce_ownership(menu, user_id)
    
    # Apply updates
    if update.name is not None:
        menu["name"] = update.name
    
    logger.info(f"Menu {menu_id} updated by user {user_id[:8]}...")
    
    return MenuBase(**menu)


@router.get("/", response_model=list[MenuBase])
async def list_user_menus(user_id: CurrentUser) -> list[MenuBase]:
    """
    List all menus owned by the current user.
    
    Requires authentication. Returns only menus where owner_id matches user_id.
    """
    user_menus = [
        MenuBase(**menu)
        for menu in _mock_menus.values()
        if menu["owner_id"] == user_id
    ]
    
    return user_menus
