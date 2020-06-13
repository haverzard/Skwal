/* eslint-disable */
import React from 'react'
import './App.css'

export default class Home extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            enabled: false,
            choice: "",
        }
        this.dummyRef = [React.createRef(null), React.createRef(null), React.createRef(null), React.createRef(null)]
    }

    componentDidMount() {
        document.addEventListener("keydown", (e) => { if (e.keyCode === 40) this.setState({ enabled: true}) })
        return () => {
        document.removeEventListener("keydown", (e) => { if (e.keyCode === 40) this.setState({ enabled: true}) }, false);
        }
    }
    render() {
    return (
        <div>
        <header className="App-header">
            <p className="App-title">
                Skwal
            </p>
            <p className="App-link">
                collaboration & synchronization is the key of success
            </p>
        <div>
            <textarea className="hello">

            </textarea>
        </div>
        </header>
        </div>
    )}
}