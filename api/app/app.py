from flask import Flask
import geopandas as gpd
from utils import (
    load_grids,
    get_interpolated_data,
    get_heat_index,
    adjust_heat_index,
    categorize_heat_index,
    transform_polygons,
)
from rasterio.features import shapes
from shapely.geometry import shape
import geopandas as gpd


grids_path = "data/grids.json"
app = Flask(__name__)

# Calculate heat index
grids, idx_to_row_col = load_grids(grids_path)
grid_temperature, grid_humidity = get_interpolated_data(grids)
heat_index = get_heat_index(grid_temperature, grid_humidity)
adjusted_heat_index = adjust_heat_index(heat_index, grids["terrain"])
categorized_heat_index = categorize_heat_index(adjusted_heat_index)

# Create GeoDataFrame with polygons
# For some reason we need to transpose the array (to fix)
shape_gen = ((shape(s), v) for s, v in shapes(categorized_heat_index.T.astype("uint8")))
polygons = gpd.GeoDataFrame(
    dict(zip(["geometry", "class"], zip(*shape_gen))), crs="EPSG:4326"
)
transformed_polygons = transform_polygons(polygons, grids)


@app.route("/")
def hello():
    return transformed_polygons.to_json()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
