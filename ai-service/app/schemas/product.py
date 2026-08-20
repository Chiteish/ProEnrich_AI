from pydantic import BaseModel, Field
from typing import Optional


class ProductRequest(BaseModel):
    mfg_part_num: str
    part_desc: str

    e1_brand: Optional[str] = None
    unilog_brand: Optional[str] = None
    dib_brand: Optional[str] = None

    part_manuf: Optional[str] = None