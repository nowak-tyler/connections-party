import csv


def load_connections(file_path):
    connections = []

    with open(file_path, "r") as file:
        reader = csv.DictReader(file)

        for row in reader:
            person1 = row["person1"].strip()
            person2 = row["person2"].strip()
            reason = row["reason"].strip()

            if reason == "":
                reason = None

            connection = {
                "person1": person1,
                "person2": person2,
                "reason": reason,
            }

            connections.append(connection)

    return connections