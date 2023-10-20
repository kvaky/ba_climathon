from flask import Flask
import geopandas as gpd

app = Flask(__name__)

gdf = gpd.read_file("data/Kriticke_zony_mock/Kriticke_zony.shp").rename(
    columns={"Index": "sensitivity_index"}
)

@app.route("/")
def hello():
    return gdf.to_json()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
