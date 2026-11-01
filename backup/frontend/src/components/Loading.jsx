import React from 'react'
import { FaSpinner } from "react-icons/fa";

export default function Loading() {
    return (
        <div className="loadin-style">
            <FaSpinner className="animate-spin" size={28} />
        </div>
    )
}
