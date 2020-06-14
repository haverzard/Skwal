# Skwal
![Websocket CI](https://github.com/haverzard/Skwal/workflows/Websocket%20CI/badge.svg)
![Node.js CI](https://github.com/haverzard/Skwal/workflows/Node.js%20CI/badge.svg)

![View](view.gif)

A simple collaborative text editor using Websocket, React, and Quill

## Prerequisites
### Docker
- Docker
### Non-Docker
#### Frontend
- Node.js: https://nodejs.org/en/
- Serve: `npm install -g serve`
#### Backend
- Python: https://www.python.org/
- Websocket: `pip -r requirement.txt` on backend folder

## Usage
### Use docker (Skip this step for non-docker)
- Setup Dockerfile on frontend folder by changing the `ENV REACT_APP_SKWAL_WEBSOCKET_HOST=ws://127.0.0.1:8001/` into `ENV REACT_APP_SKWAL_WEBSOCKET_HOST=ws://<my_domain>:<my_port>/` (or external ip address)
- Run `docker-compose up` and everything is done. (by default port 8001 for backend and 5000 for frontend)

### Setup the back-end
- Move to backend folder
- Run `python main.py`
- Websocket is listening on port `6789`

### Setup the front-end
#### Run front-end
- Move to frontend folder
- Run `npm install`
- Run `npm run build`
- Run `serve -s build`

### Using my own port
#### Docker
- Configure docker-compose.yml by replacing ports on skwal_frontend (into `<my_frontend_port>:5000`)
- Configure docker-compose.yml by replacing ports on skwal_backend (into `<my_backend_port>:6789`)
- Configure Dockerfile on frontend folder by changing `ENV REACT_APP_SKWAL_WEBSOCKET_HOST=ws://127.0.0.1:8001/` into `ENV REACT_APP_SKWAL_WEBSOCKET_HOST=ws://127.0.0.1:<my_backend_port>/`

#### Non-docker
- Replace port on `main.py` file on backend folder and `Home.js` file on frontend/src/container/Home folder (for backend)

## Front-end
### Available Scripts

In the project directory, you can run:

#### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

#### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

#### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

#### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

# References
- React: https://reactjs.org/docs
- Python Websocket: https://websockets.readthedocs.io/en/stable/intro.html
- Quill: https://quilljs.com/