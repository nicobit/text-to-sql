import subprocess
import os
import re

# Step 1: Ensure Poetry Export Plugin is Installed
try:
    subprocess.run(["poetry", "self", "add", "poetry-plugin-export"], check=True)
    print("✅ Poetry export plugin installed successfully!")
except subprocess.CalledProcessError:
    print("⚠️ Failed to install the Poetry export plugin.")
    exit(1)

# Step 2: Export requirements.txt from Poetry
try:
    subprocess.run(["poetry", "export", "-f", "requirements.txt", "--output", "requirements_source.txt"], check=True)
    print("✅ requirements_source.txt exported successfully!")
except subprocess.CalledProcessError:
    print("⚠️ Failed to export requirements.txt from Poetry.")
    exit(1)

# Step 3: Generate wheels from exported requirements
os.makedirs("wheels", exist_ok=True)
try:
    subprocess.run(["pip", "wheel", "-r", "requirements_source.txt", "--wheel-dir", "wheels"], check=True)
    print("✅ Wheel files generated successfully!")
except subprocess.CalledProcessError:
    print("⚠️ Failed to generate wheel files.")
    exit(1)

# Step 4: Rewrite requirements.txt explicitly referencing wheels
wheel_files = os.listdir("wheels")
pkg_pattern = re.compile(r"^([^-]+)-.*\.whl$")

wheel_mapping = {}
for wheel in wheel_files:
    match = pkg_pattern.match(wheel)
    if match:
        pkg_name = match.group(1).replace("_", "-").lower()
        wheel_mapping[pkg_name] = wheel

new_requirements = []
with open("requirements_source.txt", "r") as src_req:
    for line in src_req:
        original_line = line.strip()
        if original_line and not original_line.startswith("#"):
            pkg = re.split(r"[=<>!~]", original_line)[0].strip().lower()
            wheel_file = wheel_mapping.get(pkg)
            if wheel_file:
                if "win_" in wheel_file.lower():
                    print(f"⚠️ Windows-specific wheel detected ({wheel_file}). Keeping original requirement: {original_line}")
                    new_requirements.append(original_line)
                else:
                    new_requirements.append(f"./wheels/{wheel_file}")
                    print(f"Added wheel for package: {pkg}")
            else:
                print(f"⚠️ Wheel not found for package: {pkg}. Keeping original requirement: {original_line}")
                new_requirements.append(original_line)

with open("requirements.txt", "w") as tgt_req:
    tgt_req.write("\n".join(new_requirements))

print("✅ Wheel-based requirements.txt created with Windows-specific wheels excluded!")
