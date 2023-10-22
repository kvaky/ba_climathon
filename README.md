# ba_climathon

## Notebook demo

Best way to try this is looking at `notebooks/demo.ipynb`. The concrete thresholds for each heat index category can be adjusted in `api/app/utils.py`. For demo purposes, we only fetch data from a fixed timestamp. This can be also edited in `utils.py`

## Run backend

```bash
cd api
docker compose up -d
```

This will run a docker container with api listening on port `8000`. Querying this endpoint (`localhost:8000/`) will return geoJSON with all polygons with increased danger. The severity is one of `[0, 1, 2]`.

Sample response:
```json
{"type": "FeatureCollection", "features": [{"id": "0", "type": "Feature", "properties": {"class": 1.0}, "geometry": {"type": "Polygon", "coordinates": [[[17.119294588471178, 48.093382541353385], [17.119294588471178, 48.09398455388471], [17.120187185213034, 48.09398455388471], [17.120187185213034, 48.093382541353385], [17.119294588471178, 48.093382541353385]]]}}, {"id": "1", "type": "Feature", "properties": {"class": 1.0}, "geometry": {"type": "Polygon", "coordinates": [[[17.114831604761903, 48.09819864160401], [17.114831604761903, 48.09880065413534], [17.11572420150376, 48.09880065413534], [17.11572420150376, 48.09819864160401], [17.114831604761903, 48.09819864160401]]]}},]}
```