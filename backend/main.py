'''
Skwal websocket application backend
'''
import asyncio
import json
import random
import websockets

ANIMALS = list(map(lambda x: x.replace('\n', '').strip(), open("animals.txt").readlines()))
USERS = {}
DOC_STATE = {"content": {"ops": []}, "text": ""}

def state_event():
    '''
    Preparing document state
    '''
    return json.dumps({"type": "text", **DOC_STATE})

def users_event(websocket):
    '''
    Preparing users' status
    '''
    res = []
    for i in USERS:
        if i != websocket:
            res.append(USERS[i])
    return json.dumps({"type": "users", "users": res, "mydata": USERS[websocket]})

def handle_cursors(websocket, data):
    '''
    Handling cursors' movement because of write
    '''
    for i in USERS:
        if i != websocket:
            # If writer position is behind me
            if USERS[i]['position']['index'] > data['position']['index']:
                # Take length into account
                delta = (data['position']['index']+data['position']['length'])
                delta -= USERS[i]['position']['index']
                USERS[i]['position']['index'] += len(data["text"]) - len(DOC_STATE["text"])
                # If writer position + length involve my selection and if I have a selection length,
                # decrease the ones that got involved and increase my delta
                if delta > 0 and USERS[i]['position']['length']:
                    USERS[i]['position']['length'] -= delta
                    USERS[i]['position']['index'] += delta
            else:
                if ((USERS[i]['position']['length']+USERS[i]['position']['index'])
                        > (data['position']['index']+data['position']['length'])):
                    USERS[i]['position']['length'] += len(data["text"]) - len(DOC_STATE["text"])
                elif ((USERS[i]['position']['length']+USERS[i]['position']['index'])
                      < (data['position']['index']+data['position']['length'])):
                    delta = (USERS[i]['position']['length']+USERS[i]['position']['index'])
                    delta -= data['position']['index']
                    if delta > 0:
                        USERS[i]['position']['length'] -= delta
                else:
                    delta = len(data["text"]) - len(DOC_STATE["text"])
                    if delta < 0:
                        USERS[i]['position']['length'] += delta
            # Just in case
            if USERS[i]['position']['index'] < 0:
                USERS[i]['position']['index'] = 0

async def broadcast_state():
    '''
    Broadcast document state
    '''
    if USERS:
        message = state_event()
        await asyncio.wait([user.send(message) for user in USERS])

async def broadcast_users():
    '''
    Broadcast users' status
    '''
    if USERS:
        await asyncio.wait([user.send(users_event(user)) for user in USERS])

async def broadcast_delta(delta, websocket):
    '''
    Broadcast delta information
    '''
    info = json.dumps({"type": "delta", "content": delta})
    loader = []
    for user in USERS:
        if user != websocket:
            loader += [user.send(info)]
    if loader:
        await asyncio.wait(loader)

async def register(websocket):
    '''
    Add a user when he/she joins
    '''
    USERS[websocket] = {
        'name': 'Anonymous {}'.format(random.choice(ANIMALS)),
        'position': {'index': 0, 'length': 0},
        'color': '#{:2x}{:2x}{:2x}'.format(
            random.randint(0, 255),
            random.randint(0, 255),
            random.randint(0, 255)
        ).replace(' ', '0')
    }

async def unregister(websocket):
    '''
    Remove a user when he/she leaves
    '''
    USERS.pop(websocket, None)
    await broadcast_users()

async def texteditor(websocket, _):
    '''
    A text editor websocket application
    '''
    print('A user has connected to the server')
    await register(websocket)
    try:
        await websocket.send(state_event())
        await broadcast_users()
        async for message in websocket:
            data = json.loads(message)
            if data["action"] == "move":
                # Updating cursor position and tell others about it
                USERS[websocket]['position'] = data["position"]
                await broadcast_users()
            elif data["action"] == "write":
                # Handling cursor movement because of write
                #handle_cursors(websocket, data)
                # Updating data
                DOC_STATE["text"] = data["text"]
                DOC_STATE["content"] = data["content"]
                # Tell USERS
                # await broadcast_state()
                await broadcast_delta(data["delta"], websocket)
                await broadcast_users()
    finally:
        print('A user has left the server')
        await unregister(websocket)

SERVER = websockets.serve(texteditor, "0.0.0.0", 6789)

asyncio.get_event_loop().run_until_complete(SERVER)
asyncio.get_event_loop().run_forever()
