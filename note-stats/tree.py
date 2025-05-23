import os
import sys
import argparse

# --- Force UTF‑8 on Windows consoles and redirected output ---
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
else:
    # Fallback for older Pythons
    import io

    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")


def tree(dir_path, prefix=""):
    """Recursively prints a Unicode‑style tree of dir_path."""
    try:
        entries = sorted(os.listdir(dir_path))
    except PermissionError:
        return  # skip folders we can't access

    for index, entry in enumerate(entries):
        connector = "└── " if index == len(entries) - 1 else "├── "
        print(prefix + connector + entry)
        path = os.path.join(dir_path, entry)
        if os.path.isdir(path):
            extension = "    " if index == len(entries) - 1 else "│   "
            tree(path, prefix + extension)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Generate a Unicode‑style directory tree."
    )
    parser.add_argument(
        "path", nargs="?", default=".", help="Root directory (relative or absolute)."
    )
    args = parser.parse_args()

    root = os.path.abspath(args.path)
    print(root)
    tree(root)
