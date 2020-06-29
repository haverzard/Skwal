/* eslint-disable */
import React from 'react'
import Quill from 'quill'
import QuillCursors from 'quill-cursors'
import Delta from 'quill-delta'
import 'quill/dist/quill.snow.css'
import logo from './doc.svg'
import './App.css'

const host = process.env.REACT_APP_SKWAL_WEBSOCKET_HOST || 'ws://127.0.0.1:6789/'
export default class Home extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            pos: { index: 0, length: 0 },
            old: "",
            writing: false,
            delta: false
        }
    }

    componentDidMount() {
        Quill.register('modules/cursors', QuillCursors)
        const quill = new Quill('#editor', {
            theme: 'snow',
            modules: {
                cursors: {
                    hideDelayMs: 5000,
                    hideSpeedMs: 0,
                    selectionChangeSource: null,
                    transformOnTextChange: true,
                },
            }
        })
        const cursors = quill.getModule('cursors')
        this.state.old = quill.getContents()
        let websocket = new WebSocket(host)
        let myCallback = (pos, args) => {
            if (this.state.old != quill.getContents()) {
                this.setState({ old : quill.getContents() })
                websocket.send(JSON.stringify({'action': 'write', 'delta': args[0], 'real': args[1], 'content': quill.getContents(), 'position': pos }))
            }
        }
        let tempPos = {...this.state.pos}
        quill.on('editor-change',  (eventName, ...args) => {
            if (eventName === 'text-change') {
                if (!this.state.writing && !this.state.delta) {
                    myCallback(tempPos, args)
                }
            } else if (eventName === 'selection-change') {
                if (!this.state.writing && args[0] || this.state.delta) {
                    tempPos = {...this.state.pos}
                    this.setState({ pos : args[0] })
                    websocket.send(JSON.stringify({'action': 'move', 'position': this.state.pos}))
                }
            }
          })
        websocket.onmessage = (e) => {
            let data = JSON.parse(e.data)
            if (data.type == 'text') {
                this.setState({ writing: true })
                quill.setContents(data.content, 'silent')
                quill.setSelection(this.state.pos)
                this.setState({ writing: false })
            } else if (data.type == 'delta') {
                this.setState({ writing: true })
                this.setState({ delta: true })
                const delta = new Delta(data.real)
                let diff = delta.diff(quill.getContents())
                if (diff.ops.length && diff.ops[0].retain && data.content.ops[0].retain && diff.ops[0].retain < data.content.ops[0].retain) {
                    let old = data.content.ops[0].retain
                    let move = diff.transformPosition(data.content.ops[0].retain)
                    while (move != old) {
                        let diff = delta.diff(quill.getContents())
                        old = move
                        move = diff.transformPosition(data.content.ops[0].retain)
                    }
                    data.content.ops[0].retain = move
                }
                quill.updateContents(data.content, 'api')
                this.setState({ delta: false })
                this.setState({ writing: false })
            } else if (data.type == 'users') {
                cursors.clearCursors()
                for (let i = 0; i < data.users.length; i++) {
                    cursors.createCursor(i, data.users[i].name, data.users[i].color)
                    cursors.moveCursor(i, data.users[i].position)
                }
            }
        }
    }
    render() {
    return (
        <div>
            <header className="App-header">
                <div className="App-header-top">
                    <img id="logo" src={logo} className="App-logo" alt="logo" />
                    <div className="App-title">
                        Skwal
                    </div>
                </div>
            </header>
            <div id="text-box">
                <div id="editor">
                    <p>Hello World!</p>
                    <p>Some initial <strong>bold</strong> text</p>
                    <p><br/></p>
                </div>
            </div>
        </div>
    )}
}