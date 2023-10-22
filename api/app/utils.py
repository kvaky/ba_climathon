import requests
import json
from shapely.geometry import Point, Polygon
import geopandas as gpd
import numpy as np
from scipy.interpolate import griddata

# Bratislava bounding box
xmin = 16.96
ymin = 48.01
xmax = 17.34
ymax = 48.26

# Hardcoded time for testing
test_time = '2023-10-21T09:55:00Z'

# URLs and headers
collections = "https://climathon.iblsoft.com/data/netatmo/edr/collections"
netatmo_cube = (
    "https://climathon.iblsoft.com/data/netatmo/edr/collections/publicdata/cube"
)
headers = {"accept": "application/json"}


def interpolate_data(data, value, grid_x, grid_y):
    points = np.array([(geom.x, geom.y) for geom in data.geometry])
    values = data[value]
    grid_z = griddata(points, values, (grid_x, grid_y))
    return grid_z


def get_interpolated_data(grids):
    # Get last available time
    # collections_response = requests.get(collections, headers=headers).json()
    # last_time = collections_response["collections"][0]["extent"]["temporal"]["values"][
    #     -1
    # ]
    # For demo purposes, use hardcoded time
    last_time = test_time

    # Get cube data
    params = {
        "bbox": f"{xmin},{ymin},{xmax},{ymax}",
        "datetime": last_time,
    }
    cube_data = requests.get(netatmo_cube, params=params, headers=headers).json()

    # Create measurement GeoDataFrame
    measurement_gdf = gpd.GeoDataFrame(
        [
            {
                "geometry": Point(measurement["place"]["location"]),
                "temperature": measurement["measures"]["temperature"]["value"],
                "humidity": measurement["measures"]["humidity"]["value"],
                "interpolated": False,
            }
            for measurement in cube_data
        ],
        geometry="geometry",
    )

    # Interpolate data
    grid_temperature = interpolate_data(
        measurement_gdf, "temperature", grids["x"], grids["y"]
    )
    grid_humidity = interpolate_data(
        measurement_gdf, "humidity", grids["x"], grids["y"]
    )

    return grid_temperature, grid_humidity


def load_grids(path):
    with open(path, "r") as f:
        grids = json.load(f)
    grids["x"] = np.array(grids["x"])
    grids["y"] = np.array(grids["y"])
    grids["id"] = np.array(grids["id"]).astype(float)
    grids["terrain"] = np.array(grids["terrain"]).astype(float)
    grids["terrain"] /= np.nanmax(grids["terrain"])

    idx_to_row_col = {
        id_val: (row_idx, col_idx)
        for row_idx, row in enumerate(grids["id"])
        for col_idx, id_val in enumerate(row)
    }
    return grids, idx_to_row_col


def get_heat_index(t, r):
    # Constants
    c1 = -8.7846947556
    c2 = 1.61139411
    c3 = 2.3385488389
    c4 = -0.14611605
    c5 = -0.012308094
    c6 = -0.0164248277778
    c7 = 2.211732e-3
    c8 = 7.2546e-4
    c9 = -3.582e-6

    # Heat Index calculation
    hi = (
        c1
        + (c2 * t)
        + (c3 * r)
        + (c4 * t * r)
        + (c5 * t**2)
        + (c6 * r**2)
        + (c7 * t**2 * r)
        + (c8 * t * r**2)
        + (c9 * t**2 * r**2)
    )

    return hi


def adjust_heat_index(heat_index, terrain):
    new_data_array = heat_index.copy()
    new_data_array += 6 * terrain
    return new_data_array


def categorize_heat_index(heat_index):

    categories = {
        (0, 30): 0,
        (30, 35): 1,
        (35, 100): 2,
    }

    # Create an empty array for the new "heat_index_category" data
    categorized = np.zeros_like(heat_index, dtype=int)

    # Loop through the categories
    for (lower, upper), value in categories.items():
        # Create a boolean array for values in the category
        category_bool = (heat_index >= lower) & (heat_index < upper)
        # Set the values in the category to the category value
        categorized[category_bool] = value

    return categorized


def transform_polygons(polygons, grids):
    rows = []
    for _, row in polygons.iterrows():
        broken = False
        new_coords = []
        for point in row["geometry"].exterior.coords:
            x_index = int(point[0])
            y_index = int(point[1])
            if x_index >= len(grids["x"]) or y_index >= len(grids["y"]):
                broken = True
                break
            x_coord = grids["x"][x_index][y_index]
            y_coord = grids["y"][x_index][y_index]
            new_coords.append((x_coord, y_coord))
        if broken:
            continue
        rows.append({
            'class': row["class"],
            'geometry': Polygon(new_coords)
        })
    transformed_polygons = gpd.GeoDataFrame(rows, crs="EPSG:4326")
    return transformed_polygons