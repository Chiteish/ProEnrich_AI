from app.agents.product_understanding import ProductUnderstanding

class AttributeExtractor:

    def __init__(self):
        self.understanding_agent = ProductUnderstanding()

    def extract(self, input_data):
        if isinstance(input_data, str):
            understanding = self.understanding_agent.analyze(input_data)
        else:
            understanding = input_data

        attributes = []

        for dimension in understanding.get("dimensions", []):
            attributes.append({
                "label": "Dimension",
                "value": str(dimension),
                "confidence": 0.90,
                "source": "input"
            })

        quantity = understanding.get("quantity")

        if quantity is not None:
            attributes.append({
                "label": "Pack Quantity",
                "value": str(quantity),
                "confidence": 0.95,
                "source": "input"
            })

        grit = understanding.get("grit")

        if grit is not None:
            attributes.append({
                "label": "Grit",
                "value": str(grit),
                "confidence": 0.95,
                "source": "input"
            })

        return attributes