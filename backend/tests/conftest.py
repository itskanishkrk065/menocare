import os
import pytest

# Ensure all tests run against an isolated test database
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test_menopause.db"
