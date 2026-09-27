import json


def export_graph(G, degrees, community_map, output_path):
    nodes = []
    links = []

    # Build node data
    for person in G.nodes():
        node = {
            "id": person,
            "degree": degrees[person],
            "community": community_map[person],
        }

        nodes.append(node)

    # Build edge data
    for person1, person2, edge_data in G.edges(data=True):
        link = {
            "source": person1,
            "target": person2,
            "reason": edge_data["reason"],
        }

        links.append(link)

    # Final structure D3 will receive
    graph_data = {
        "nodes": nodes,
        "links": links,
    }

    with open(output_path, "w") as file:
        json.dump(
            graph_data,
            file,
            indent=4
        )