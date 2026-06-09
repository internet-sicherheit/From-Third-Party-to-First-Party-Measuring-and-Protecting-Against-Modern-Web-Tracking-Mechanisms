import os



INPUT_FILE = os.path.join(os.getcwd(), 'rules_abp_500.txt')
OUTPUT_FILE = os.path.join(os.getcwd(), 'rules_.txt')
SPLIT_SIZE = 15 * 1024 * 1024


if __name__ == '__main__':
    with open(INPUT_FILE, "rb") as f:
        part = 1
        while True:
            chunk = f.read(SPLIT_SIZE)
            if not chunk:
                break

            output_file = f"{OUTPUT_FILE}{part}.txt"
            with open(output_file, "wb") as out:
                out.write(chunk)

            print(f"Created {output_file} ({len(chunk)} bytes)")
            part += 1