import React, { useRef, useState } from "react";
import { scaleLinear } from "d3-scale";
import DeckGL from "@deck.gl/react";
import { GeoJsonLayer } from "@deck.gl/layers";
import { Tile3DLayer } from "@deck.gl/geo-layers";
import { TerrainLayer } from "@deck.gl/geo-layers";
import { _TerrainExtension as TerrainExtension } from "@deck.gl/extensions";
// import { path } from "./components/path";

const INITIAL_VIEW_STATE = {
  latitude: 42.3601,
  longitude: -71.0589,
  pitch: 0,
  maxPitch: 90,
  bearing: 0,
  zoom: 16,
};

const GOOGLE_MAPS_API_KEY = "AIzaSyBsntctk2YsoHxr_PeyfjeNhzbQZ_d4gsw"; // eslint-disable-line
const TILESET_URL = "https://tile.googleapis.com/v1/3dtiles/root.json";

// const PATH_DATA = [
//   {
//     path: path,
//     name: "Richmond - Millbrae",
//     color: [255, 0, 0],
//   },
// ];

export const COLORS = [
  [254, 235, 226],
  [251, 180, 185],
  [247, 104, 161],
  [197, 27, 138],
  [122, 1, 119],
];

const colorScale = scaleLinear()
  .clamp(true)
  .domain([0, 50, 100, 200, 300])
  .range(COLORS);

const App = () => {
  const deckRef = useRef(null);

  const onClick = (e) => {
    const pickInfo = deckRef.current.pickObject({
      x: e.x,
      y: e.y,
      radius: 1,
      unproject3D: true,
    });
    console.log(pickInfo);
  };

  const renderLayers = () => {
    const openstreet = [
      new Tile3DLayer({
        id: "google-3d-tiles",
        data: TILESET_URL,
        onTilesetLoad: (tileset3d) => {
          tileset3d.options.onTraversalComplete = (selectedTiles) => {
            const uniqueCredits = new Set();
            selectedTiles.forEach((tile) => {
              const { copyright } = tile.content.gltf.asset;
              copyright.split(";").forEach(uniqueCredits.add, uniqueCredits);
            });
            // setCredits([...uniqueCredits].join('; '));
            return selectedTiles;
          };
        },
        loadOptions: {
          fetch: { headers: { "X-GOOG-API-KEY": GOOGLE_MAPS_API_KEY } },
        },
        operation: "terrain+draw",
      }),

      new GeoJsonLayer({
        id: "polygon-layer",
        data: "https://storagefoldershazensa.blob.core.windows.net/lgvsdappfiles/boston.geojson",
        pickable: true,
        stroked: true,
        filled: true,
        wireframe: true,
        lineWidthMinPixels: 1,
        // getElevation: (d) => d.properties.ELEVATION,

        getLineColor: [0, 0, 128, 255],
        getLineWidth: 0.2,
        getPointRadius: 4,

        // getPosition: (d) => d.coordinate,
        getOffset: 0,

        getFillColor: (d) =>
          d.properties.MAXDEPTH < 0.5
            ? [135, 206, 235, 255]
            : d.properties.MAXDEPTH < 1.01
            ? [65, 105, 225, 255]
            : d.properties.MAXDEPTH < 2.51
            ? [15, 82, 186, 255]
            : [70, 130, 180, 255],

        extensions: [new TerrainExtension()],
        terrainDrawMode: "offset",
      }),
    ];

    return [openstreet];
  };

  return (
    <div className="App">
      <DeckGL
        ref={deckRef}
        layers={renderLayers()}
        controller={true}
        initialViewState={INITIAL_VIEW_STATE}
        onClick={onClick}
      />
    </div>
  );
};

export default App;
