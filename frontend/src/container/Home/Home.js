/* eslint-disable */
import React from 'react'
import Quill from 'quill'
import QuillCursors from 'quill-cursors'
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
                cursors: true,
            }
        })
        const cursors = quill.getModule('cursors')
        this.state.old = quill.getContents()
        let websocket = new WebSocket(host)
        let myCallback = (pos, delta) => {
            if (this.state.old != quill.getContents()) {
                this.setState({ old : quill.getContents() })
                websocket.send(JSON.stringify({'action': 'write', 'delta': delta, 'content': quill.getContents(), 'text': quill.getText(), 'position': pos }))
            }
        }
        let tempPos = {...this.state.pos}
        quill.on('editor-change',  (eventName, ...args) => {
            if (eventName === 'text-change') {
                if (!this.state.writing) {
                    myCallback(tempPos, args[0])
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
                quill.updateContents(data.content, 'silent')
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