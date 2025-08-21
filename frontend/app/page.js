"use client"
import Form from 'next/form'
import './global.css'
import Uploader from './components/uploader/page'
export default function Page() {
    return(
        <>
            <h2>Welcome to Log Analytics App</h2>
            <Uploader />
        </>
    )
}