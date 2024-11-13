import React from 'react'

const TitleDetails = ({ text1, text2 }: { text1: string, text2: string }) => {
    return (
        <div className="flex flex-col my-8">
            <p className='font-bold'>{text1}</p>
            <p className='text-gray-700 text-sm'>{text2}</p>
        </div>
    )
}

export default TitleDetails
