"""
app/utils.py — Small shared helpers.
"""
from bson import ObjectId


def oid(id_str: str) -> ObjectId:
    return ObjectId(id_str)


def serialize_doc(doc: dict) -> dict:
    """Convert a MongoDB document into a JSON-serializable dict with `id` field."""
    if not doc:
        return doc
    doc = dict(doc)
    if "_id" in doc:
        doc["id"] = str(doc.pop("_id"))
    for key, value in list(doc.items()):
        if isinstance(value, ObjectId):
            doc[key] = str(value)
    return doc
