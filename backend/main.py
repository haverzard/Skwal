import asyncio
import json
import logging
import random
import websockets

#logging.basicConfig()

animals = list(map(lambda x: x.replace('\n','').strip(), open("animals.txt").readlines()))
users = {}
state = {"content": {"ops": []}, "text": ""}

def state_event():
    return json.dumps({"type": "text", **state})

def users_event(websocket):
    res = []
    for i in users.keys():
        if (i != websocket):
            res.append(users[i])
    return json.dumps({"type": "users", "users": res, "mydata": users[websocket]})

def handle_cursors(websocket, data):
    for i in users.keys():
        if (i != websocket):
            # If writer position is behind me
            if users[i]['position']['index'] > data['position']['index']:
                # Take length into account
                delta = (data['position']['index']+data['position']['length']) - users[i]['position']['index']
                users[i]['position']['index'] += len(data["text"]) - len(state["text"])
                # If writer position + length involve my selection and if I have a selection length,
                # decrease the ones that got involved and increase my delta
                if delta > 0 and users[i]['position']['length']:
                    users[i]['position']['length'] -= delta
                    users[i]['position']['index'] += delta
            else:
                if (users[i]['position']['length']+users[i]['position']['index']) > (data['position']['index']+data['position']['length']):
                    users[i]['position']['length'] += len(data["text"]) - len(state["text"])
                elif (users[i]['position']['length']+users[i]['position']['index']) < (data['position']['index']+data['position']['length']):
                    t = (users[i]['position']['length']+users[i]['position']['index']) - data['position']['index']
                    if t > 0:
                        users[i]['position']['length'] -= t
                else:
                    t = len(data["text"]) - len(state["text"])
                    if t < 0:
                        users[i]['position']['length'] += t
            # Just in case
            if users[i]['position']['index'] < 0:
                users[i]['position']['index'] = 0

async def broadcast_state():
    if users:
        message = state_event()
        await asyncio.wait([user.send(message) for user in users.keys()])

async def broadcast_users(websocket):
    if users:
        await asyncio.wait([user.send(users_event(user)) for user in users.keys()])

async def register(websocket):
    users[websocket] = {
        'name': 'Anonymous {}'.format(random.choice(animals)),
        'position': { 'index': 0, 'length': 0 },
        'color': '#{:2x}{:2x}{:2x}'.format(random.randint(0, 255), random.randint(0, 255), random.randint(0, 255)).replace(' ', '0')
    }

async def unregister(websocket):
    users.pop(websocket, None)
    await broadcast_users(websocket)

async def texteditor(websocket, path):
    await register(websocket)
    try:
        await websocket.send(state_event())
        await broadcast_users(websocket)
        async for message in websocket:
            data = json.loads(message)
            if data["action"] == "move":
                # Updating cursor position and tell others about it
                users[websocket]['position'] = data["position"]
                await broadcast_users(websocket)
            elif data["action"] == "write":
                # Handling cursor movement because of write
                handle_cursors(websocket, data)
                # Updating data
                state["text"] = data["text"]
                state["content"] = data["content"]
                # Tell users
                await broadcast_state()
                await broadcast_users(websocket)
            # else:
            #     logging.error("unsupported event: {}", data)
    finally:
        await unregister(websocket)

server = websockets.serve(texteditor, "localhost", 6789)

asyncio.get_event_loop().run_until_complete(server)
asyncio.get_event_loop().run_forever()