import { Link } from 'react-router-dom'

// no imports needed for this file

export default function Credits() {
  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Credits</h1>

      <div className="bg-gray-800 rounded-lg p-4 space-y-2">
        <p className="text-gray-200"><span className="font-semibold">App:</span> Athan PWA</p>
        <p className="text-gray-200"><span className="font-semibold">Version:</span> v1.0 (PWA V1)</p>
        <p className="text-gray-200"><span className="font-semibold">Company:</span> Your Company Name</p>
        <p className="text-gray-200"><span className="font-semibold">Copyright:</span> © {new Date().getFullYear()} All rights reserved.</p>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 space-y-3">
        <h2 className="text-xl font-semibold">Support the Creator</h2>
        <p className="text-gray-300">If this app helps you, consider supporting the project.</p>
        <div className="flex gap-3">
          <a className="px-3 py-2 rounded bg-teal-600 hover:bg-teal-500" href="https://www.buymeacoffee.com/" target="_blank" rel="noreferrer">Buy Me a Coffee</a>
          <a className="px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-500" href="https://www.patreon.com/" target="_blank" rel="noreferrer">Patreon</a>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 space-y-2">
        <h2 className="text-xl font-semibold">More</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li><Link className="text-teal-300 underline" to="/vision">Our Vision</Link></li>
          <li><Link className="text-teal-300 underline" to="/privacy">Privacy Policy</Link></li>
        </ul>
      </div>
    </div>
  )
}