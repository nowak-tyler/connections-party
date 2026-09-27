from src.data_loader import load_connections

from src.graph import (
    build_graph,
    calculate_degrees,
    detect_communities,
    create_community_map,
)


def main():

    connections = load_connections(
        "data/connections.csv"
    )

    G = build_graph(connections)

    degrees = calculate_degrees(G)

    communities = detect_communities(G)

    community_map = create_community_map(communities)

    print("Nodes:")
    print(G.nodes())

    print("\nEdges:")
    print(G.edges(data=True))

    print("\nDegrees:")
    print(degrees)

    print("\nCommunities:")
    print(communities)

    print("\nCommunity map:")
    print(community_map)


if __name__ == "__main__":
    main()