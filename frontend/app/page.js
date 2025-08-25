"use client"
import Form from 'next/form'
import './global.css'
import Uploader from './components/uploader/page'
import SceneManager from './components/three/sceneManager'

export default function Page() {
    return(
        console.log("First page loaded"),
        <>
            <h2>Welcome to Log Analytics App</h2>
            <Uploader />
            <SceneManager />
        </>
    )
}