# Setting Up a Python Environment

To work with this project, it is recommended to create a dedicated Python environment. Follow the steps below to set up your environment:

1. **Install Python**  
    Ensure you have Python 3.10 or later installed. 

2. **Install `venv` (if not already installed)**  
    Most Python installations come with the `venv` module. You can verify by running:
    ```bash
    python -m ensurepip --upgrade
    ```

3. **Create a Virtual Environment**  
    Navigate to the project directory and create a virtual environment:
    ```bash
    python -m venv .venv
    ```

4. **Activate the Virtual Environment**  
    - On Windows:
      ```bash
      .venv\Scripts\activate
      ```
    - On macOS/Linux:
      ```bash
      source .venv/bin/activate
      ```

5. **Install Required Dependencies**  
    Once the environment is activated, install the project dependencies:
    ```bash
    pip install -r requirements.txt
    ```

Your Python environment is now ready for use.

## Generating Wheels for Faster Deployment

To optimize deployment, for example to an Azure Function, you can pre-build Python wheels for your dependencies. Follow these steps:

1. **Run `updateWheels` in the `backend` Folder**  
    Inside the `backend` folder, execute the `updateWheels` script. This script will:
    - Generate wheel files for the dependencies listed in `requirements_source.txt`.
    - Update `requirements.txt` to reference the generated wheel files.

    ```bash
    python updateWheels.py
    ```

2. **Purpose of Pre-Building Wheels**  
    By including wheel references in `requirements.txt`, the deployment process becomes faster as pre-built wheels are quicker to install compared to source distributions.

This step is particularly useful when deploying to environments like Azure Functions, where reducing deployment time is critical.

