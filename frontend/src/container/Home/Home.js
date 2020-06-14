/* eslint-disable */
import React from 'react'
import Quill from 'quill'
import QuillCursors from 'quill-cursors'
import 'quill/dist/quill.snow.css'
import logo from './doc.svg'
import './App.css'

export default class Home extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            pos: { index: 0, length: 0 },
            old: "",
            writing: false
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
        let websocket = new WebSocket("ws://127.0.0.1:6789/")
        let myCallback = () => {
            if (this.state.old != quill.getContents()) {
                this.setState({ old : quill.getContents() })
                websocket.send(JSON.stringify({'action': 'write', 'content': quill.getContents(), 'text': quill.getText() }))
            }
        }
        quill.on('editor-change',  (eventName, ...args) => {
            if (eventName === 'text-change') {
                if (!this.state.writing) {
                    myCallback()
                }
            } else if (eventName === 'selection-change') {
                if (!this.state.writing && args[0]) {
                    console.log(args[0])
                    this.setState({ pos : args[0] })
                    websocket.send(JSON.stringify({'action': 'move', 'position': this.state.pos}))
                }
            }
          })
        //H<span style={{borderLeft: "1px solid red"}}></span>i
        websocket.onmessage = (e) => {
            let data = JSON.parse(e.data)
            if (data.type == 'text') {
                this.setState({ writing: true })
                quill.setContents(data.content, 'silent')
                console.log(this.state.pos)
                quill.setSelection(this.state.pos)
                this.setState({ writing: false })
            } else if (data.type == 'users') {
                cursors.clearCursors()
                for (let i = 0; i < data.users.length; i++) {
                    cursors.createCursor(i, data.users[i].name, 'red')
                    cursors.moveCursor(i, data.users[i].position)
                }
                this.setState({ writing: true })
                quill.setSelection(data.mydata.position)
                this.setState({ writing: false })           
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