import React from 'react'

const Loading = ({content}:{content:string}) => {
  return (
    <div
    role="status"
    aria-live="polite"
    className="flex w-full h-full justify-center items-center"
  >
    <div className="text-center space-y-2">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]">
        <span className="sr-only">Loading...</span>
      </div>
      <p className="text-gray-600">Loading {content}...</p>
    </div>
  </div>
  )
}

export default Loading