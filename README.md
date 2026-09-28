# Connections Party

An interactive visualization of the social connections between people at a party.

The project takes relationship data from a CSV, builds an undirected graph using NetworkX, detects communities, and exports the graph to an interactive D3.js webpage.

## Features

- Interactive social network graph
- Community detection and color-coded clusters
- Node size based on number of connections
- Click a person to see their connections
- Filter connections by relationship type
- Graph automatically reorganizes based on active filters
- Drag, zoom, and pan around the network

## Tech Stack

- Python
- NetworkX
- D3.js
- HTML/CSS/JavaScript
- GitHub Pages

## Data

Connections are stored as:

```csv
person1,person2,reason
Tyler,Alex,College
Alex,Ben,Roommates
Tyler,Emma,