from pydantic import BaseModel

class ProductRequest(BaseModel):

    mfg_part_num: str
    part_desc: str
    e1_brand: str | None = None
    unilog_brand: str | None = None
    dib_brand: str | None = None
    part_manuf: str | None = None