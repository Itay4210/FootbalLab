import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-5">
      
      <div className="text-center mb-10">
        <h1 className="text-6xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-lab-accent to-blue-500">
          FootballLab 🧪
        </h1>
        <p className="text-xl text-slate-400 mt-2">
          The Ultimate Football Simulation Engine
        </p>
      </div>

      <div className="bg-lab-card p-8 rounded-2xl shadow-2xl border border-slate-700 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4 text-white">System Status</h2>
        
        <div className="flex justify-between items-center py-2 border-b border-slate-700">
          <span>Backend Connection</span>
          <span className="text-lab-accent font-mono">Checking...</span>
        </div>
        
        <div className="mt-6">
          <button className="w-full bg-lab-accent hover:bg-emerald-400 text-lab-dark font-bold py-3 px-6 rounded-lg transition-all">
            Enter the Lab
          </button>
        </div>
      </div>

    </div>
  )
}



export default App
