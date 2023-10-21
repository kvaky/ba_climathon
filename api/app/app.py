from flask import Flask
import geopandas as gpd
from shapely.geometry import Polygon

app = Flask(__name__)

# Create a GeoDataFrame with two polygons
gdf = gpd.GeoDataFrame(
    {
        "geometry": [
            Polygon([(16.95, 48.0), (16.95, 48.02), (16.97, 48.02), (16.97, 48.0)]),
            Polygon([(16.955, 47.99), (16.955, 48.01), (16.965, 48.01), (16.965, 47.99)]),
        ]
    },
    crs="EPSG:4326"
)


@app.route("/")
def hello():
    return gdf.to_json()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
