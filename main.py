from src.data_loader import load_connections

from src.graph import (
    build_graph,
    calculate_degrees,
    detect_communities,
    create_community_map,
)

from src.export import export_graph


def main():

    connections = load_connections(
        "data/connections.csv"
    )

    G = build_graph(connections)

    degrees = calculate_degrees(G)

    communities = detect_communities(G)

    community_map = create_community_map(
        communities
    )

    export_graph(
        G,
        degrees,
        community_map,
        "docs/graph.json"
    )

    print("Created doc/graph.json")


if __name__ == "__main__":
    main()